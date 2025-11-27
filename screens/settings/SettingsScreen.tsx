import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, SafeAreaView, ScrollView,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { theme } from '../../theme';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const BUTTON_HEIGHT = 44; // Slightly reduced height for buttons

export const SettingsScreen = () => {
    const { user, updateUserEmail, updateUserPassword, signOut, deleteAccount } = useAuth();
    const [loading, setLoading] = useState(false);
    const navigation = useNavigation();

    const [email, setEmail] = useState(user?.email || '');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleUpdateEmail = async () => {
        setLoading(true);
        const { error } = await updateUserEmail(email);
        setLoading(false);
        if (error) {
            Alert.alert("Erreur", error.message);
        } else {
            Alert.alert("Succès", "Votre adresse e-mail a été mise à jour.");
        }
    };

    const handleUpdatePassword = async () => {
        if (newPassword !== confirmPassword) {
            Alert.alert("Erreur", "Les mots de passe ne correspondent pas.");
            return;
        }
        if (!newPassword) {
            Alert.alert("Erreur", "Le nouveau mot de passe ne peut pas être vide.");
            return;
        }

        setLoading(true);
        const { error } = await updateUserPassword(newPassword);
        setLoading(false);
        if (error) {
            Alert.alert("Erreur", error.message);
        } else {
            Alert.alert("Succès", "Votre mot de passe a été mis à jour.");
            setNewPassword('');
            setConfirmPassword('');
        }
    };

    const handleSignOut = () => {
        Alert.alert("Se déconnecter", "Êtes-vous sûr de vouloir vous déconnecter ?", [
            { text: "Annuler", style: "cancel" },
            { text: "Se déconnecter", style: "destructive", onPress: signOut },
        ]);
    };

    const handleDeleteAccount = () => {
        Alert.alert(
            "Supprimer le compte",
            "Cette action est irréversible. Toutes vos données seront définitivement perdues.",
            [
                { text: "Annuler", style: "cancel" },
                {
                    text: "Continuer",
                    style: "destructive",
                    onPress: () => {
                        Alert.prompt(
                            "Confirmation finale",
                            `Pour confirmer, veuillez saisir votre adresse e-mail :\n${user?.email}`,
                            [
                                { text: "Annuler", style: "cancel" },
                                {
                                    text: "Supprimer définitivement",
                                    style: "destructive",
                                    onPress: async (typedEmail: any) => {
                                        if (typedEmail?.trim().toLowerCase() === user?.email?.toLowerCase()) {
                                            setLoading(true);
                                            const { error } = await deleteAccount();
                                            setLoading(false);
                                            if (error) {
                                                Alert.alert("Erreur", "Impossible de supprimer le compte. Veuillez réessayer.");
                                            }
                                        } else {
                                            Alert.alert("Action annulée", "L'adresse e-mail ne correspond pas. La suppression a été annulée.");
                                        }
                                    },
                                },
                            ],
                            'plain-text',
                            '',
                            'email-address'
                        );
                    },
                },
            ]
        );
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={theme.iconSizes.lg} color={theme.colors.primary[500]} />
                </TouchableOpacity>
                <Text style={styles.title} numberOfLines={1}>Réglages</Text>
                <TouchableOpacity onPress={handleSignOut} style={styles.logoutButton}>
                    <Ionicons name="log-out-outline" size={theme.iconSizes.lg} color={theme.colors.error.main} />
                </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.scrollContentContainer}>
                {/* Section Email */}
                <View style={styles.infoCard}>
                    <Text style={styles.cardTitle}>Changer l'adresse e-mail</Text>
                    <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholderTextColor={theme.colors.text.disabled} keyboardType="email-address" autoCapitalize="none" />
                    <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={handleUpdateEmail} disabled={loading}>
                        <Text style={styles.secondaryButtonText}>Mettre à jour l'e-mail</Text>
                    </TouchableOpacity>
                </View>

                {/* Section Mot de passe */}
                <View style={styles.infoCard}>
                    <Text style={styles.cardTitle}>Changer le mot de passe</Text>
                    <TextInput style={styles.input} placeholder="Nouveau mot de passe" value={newPassword} onChangeText={setNewPassword} placeholderTextColor={theme.colors.text.disabled} secureTextEntry />
                    <TextInput style={styles.input} placeholder="Confirmer le nouveau mot de passe" value={confirmPassword} onChangeText={setConfirmPassword} placeholderTextColor={theme.colors.text.disabled} secureTextEntry />
                    <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={handleUpdatePassword} disabled={loading}>
                        <Text style={styles.secondaryButtonText}>Mettre à jour le mot de passe</Text>
                    </TouchableOpacity>
                </View>

                {/* Section Suppression */}
                <View style={styles.infoCard}>
                    <Text style={styles.cardTitle}>Zone de danger</Text>
                    <TouchableOpacity style={[styles.button, styles.deleteButton]} onPress={handleDeleteAccount} disabled={loading}>
                        <Text style={styles.buttonText}>Supprimer mon compte</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
            {loading && <ActivityIndicator style={StyleSheet.absoluteFill} size="large" color={theme.colors.primary[500]} />}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: theme.colors.background.default },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: theme.layout.screenPadding,
        paddingVertical: theme.spacing[2],
    },
    backButton: { padding: theme.spacing[1] },
    title: {
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: theme.typography.fontSize['2xl'],
        color: theme.colors.text.primary,
        textAlign: 'center',
        flex: 1,
    },
    logoutButton: { padding: theme.spacing[1] },
    scrollContentContainer: {
        paddingBottom: theme.spacing[8],
        paddingTop: theme.spacing[4],
        paddingHorizontal: theme.layout.containerPadding,
    },
    infoCard: {
        backgroundColor: theme.colors.background.paper,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing[4],
        marginBottom: theme.spacing[4],
        ...theme.shadows.sm,
        borderWidth: 1,
        borderColor: theme.colors.border.light,
    },
    cardTitle: {
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: theme.typography.fontSize.xl,
        color: theme.colors.text.primary,
        marginBottom: theme.spacing[4],
    },
    input: {
        backgroundColor: theme.colors.background.default,
        color: theme.colors.text.primary,
        height: 50, // Keep input height consistent
        borderWidth: 1,
        borderColor: theme.colors.border.main,
        borderRadius: theme.borderRadius.base,
        paddingHorizontal: theme.spacing[4],
        fontSize: theme.typography.fontSize.base,
        marginBottom: theme.spacing[4],
    },
    button: {
        height: BUTTON_HEIGHT,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: theme.borderRadius.base,
        marginTop: theme.spacing[2],
        // Removed shadow for a flatter look
    },
    // Solid button for destructive actions
    deleteButton: {
        backgroundColor: theme.colors.error.dark,
    },
    // Outline button for secondary actions
    secondaryButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: theme.colors.primary[500],
    },
    buttonText: {
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: theme.typography.fontSize.base,
        color: theme.colors.text.inverse, // Default for solid buttons
        fontWeight: theme.typography.fontWeight.bold,
    },
    secondaryButtonText: {
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: theme.typography.fontSize.base,
        color: theme.colors.primary[500], // Text color for outline buttons
        fontWeight: theme.typography.fontWeight.bold,
    },
});
