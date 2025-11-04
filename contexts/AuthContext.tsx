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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Récupérer la session actuelle
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        });

        // Écouter les changements d'authentification
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
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: 'fishable://reset-password',
            });

            return { error };
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