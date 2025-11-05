import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, SafeAreaView, ScrollView,
    Platform
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { theme } from '../../theme';
import { Ionicons } from '@expo/vector-icons';

const INPUT_HEIGHT = 50;

export const SettingsScreen = () => {
    const { user, updateUserEmail, updateUserPassword, signOut, deleteAccount } = useAuth();
    const [loading, setLoading] = useState(false);

    const [email, setEmail] = useState(user?.email || '');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleUpdateEmail = async () => {
        // ... (votre code existant)
    };

    const handleUpdatePassword = async () => {
        // ... (votre code existant)
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
                        // Étape 2: Demander la saisie de l'e-mail
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
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Réglages</Text>
                <TouchableOpacity onPress={handleSignOut}>
                    <Ionicons name="log-out-outline" size={theme.iconSizes.lg} color={theme.colors.error.main} />
                </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.scrollContentContainer}>
                {/* Section Email */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Changer l'adresse e-mail</Text>
                    <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholderTextColor={theme.colors.text.disabled} keyboardType="email-address" autoCapitalize="none" />
                    <TouchableOpacity style={[styles.button, styles.actionButton]} onPress={handleUpdateEmail} disabled={loading}>
                        <Text style={styles.buttonText}>Mettre à jour l'e-mail</Text>
                    </TouchableOpacity>
                </View>

                {/* Section Mot de passe */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Changer le mot de passe</Text>
                    <TextInput style={styles.input} placeholder="Nouveau mot de passe" value={newPassword} onChangeText={setNewPassword} placeholderTextColor={theme.colors.text.disabled} secureTextEntry />
                    <TextInput style={styles.input} placeholder="Confirmer le nouveau mot de passe" value={confirmPassword} onChangeText={setConfirmPassword} placeholderTextColor={theme.colors.text.disabled} secureTextEntry />
                    <TouchableOpacity style={[styles.button, styles.actionButton]} onPress={handleUpdatePassword} disabled={loading}>
                        <Text style={styles.buttonText}>Mettre à jour le mot de passe</Text>
                    </TouchableOpacity>
                </View>

                {/* Section Suppression */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Zone de danger</Text>
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
    container: { flex: 1, backgroundColor: theme.colors.background.default, paddingTop: Platform.OS === 'android' ? theme.spacing[12] : 0 },
    scrollContentContainer: { padding: theme.layout.containerPadding, flexGrow: 1 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: theme.layout.screenPadding, marginTop: theme.spacing[4], marginBottom: theme.spacing[4] },
    title: { fontFamily: theme.typography.fontFamily.bold, fontSize: theme.typography.fontSize['4xl'], color: theme.colors.text.primary },
    section: { marginBottom: theme.spacing[8] },
    sectionTitle: { fontFamily: theme.typography.fontFamily.bold, fontSize: theme.typography.fontSize.xl, color: theme.colors.text.primary, marginBottom: theme.spacing[4] },
    input: { backgroundColor: theme.colors.background.paper, color: theme.colors.text.primary, height: INPUT_HEIGHT, borderWidth: 1, borderColor: theme.colors.border.main, borderRadius: theme.borderRadius.base, paddingHorizontal: theme.spacing[4], fontSize: theme.typography.fontSize.base, marginBottom: theme.spacing[4] },
    button: { height: INPUT_HEIGHT, justifyContent: 'center', alignItems: 'center', borderRadius: theme.borderRadius.base, ...theme.shadows.base },
    actionButton: { backgroundColor: theme.colors.primary[500] },
    deleteButton: { backgroundColor: theme.colors.error.dark },
    buttonText: { fontFamily: theme.typography.fontFamily.bold, fontSize: theme.typography.fontSize.base, color: theme.colors.text.inverse, fontWeight: theme.typography.fontWeight.bold },
});
