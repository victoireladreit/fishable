import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../config/supabase';

interface AuthContextType {
    user: User | null;
    session: Session | null;
    loading: boolean;
    signUp: (email: string, password: string, username: string) => Promise<{ error: any }>;
    signIn: (emailOrUsername: string, password: string) => Promise<{ error: any }>;
    signOut: () => Promise<void>;
    resetPassword: (email: string) => Promise<{ error: any }>;
    updateUserEmail: (newEmail: string) => Promise<{ error: any }>;
    updateUserPassword: (newPassword: string) => Promise<{ error: any }>;
    deleteAccount: () => Promise<{ error: any }>; // Nouvelle fonction
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const signUp = async (email: string, password: string, username: string) => {
        try {
            // Vérifier si le username existe déjà
            const { data: existingProfile } = await supabase
                .from('profiles')
                .select('username')
                .eq('username', username)
                .single();

            if (existingProfile) {
                return { error: { message: 'Ce nom d\'utilisateur est déjà pris' } };
            }

            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        username,
                    },
                },
            });

            if (error) return { error };

            // Créer le profil utilisateur
            if (data.user) {
                const { error: profileError } = await supabase
                    .from('profiles')
                    .insert({
                        id: data.user.id,
                        username,
                    });

                if (profileError) return { error: profileError };
            }

            return { error: null };
        } catch (error) {
            return { error };
        }
    };

    const signIn = async (emailOrUsername: string, password: string) => {
        try {
            let email = emailOrUsername;

            // Vérifier si c'est un email ou un username
            if (!emailOrUsername.includes('@')) {
                // C'est un username, récupérer l'email associé
                const { data: profile, error: profileError } = await supabase
                    .from('profiles')
                    .select('id')
                    .eq('username', emailOrUsername)
                    .single();

                if (profileError || !profile) {
                    return { error: { message: 'Nom d\'utilisateur ou mot de passe incorrect' } };
                }

                // Récupérer l'email depuis auth.users via l'ID
                const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(profile.id);

                if (userError || !user) {
                    // Fallback: utiliser une fonction RPC côté serveur
                    const { data: emailData, error: emailError } = await supabase
                        .rpc('get_email_by_username', { username_input: emailOrUsername });

                    if (emailError || !emailData) {
                        return { error: { message: 'Nom d\'utilisateur ou mot de passe incorrect' } };
                    }

                    email = emailData;
                } else {
                    email = user.email!;
                }
            }

            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                return { error: { message: 'Email/nom d\'utilisateur ou mot de passe incorrect' } };
            }

            return { error: null };
        } catch (error) {
            return { error };
        }
    };

    const signOut = async () => {
        await supabase.auth.signOut();
    };

    const resetPassword = async (email: string) => {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: 'fishable://reset-password',
        });
        return { error };
    };

    const updateUserEmail = async (newEmail: string) => {
        const { error } = await supabase.auth.updateUser({ email: newEmail });
        return { error };
    };

    const updateUserPassword = async (newPassword: string) => {
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        return { error };
    };

    // Nouvelle fonction pour appeler la Edge Function
    const deleteAccount = async () => {
        try {
            const { error } = await supabase.functions.invoke('delete-user', {
                method: 'POST',
            });
            if (error) throw error;
            await signOut(); // Forcer la déconnexion
            return { error: null };
        } catch (error) {
            return { error };
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                session,
                loading,
                signUp,
                signIn,
                signOut,
                resetPassword,
                updateUserEmail,
                updateUserPassword,
                deleteAccount,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
