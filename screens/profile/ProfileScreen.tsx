import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, TextInput, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { theme } from '../../theme';
import { ProfileService, Profile } from '../../services/profile.service';
import { Ionicons } from '@expo/vector-icons';

const INPUT_HEIGHT = 50;

export const ProfileScreen = () => {
    const { user, signOut } = useAuth();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);

    const [fullName, setFullName] = useState('');
    const [bio, setBio] = useState('');

    const loadProfile = useCallback(async () => {
        if (!user) return;
        try {
            const userProfile = await ProfileService.getProfile(user.id);
            if (userProfile) {
                setProfile(userProfile);
                setFullName(userProfile.full_name || '');
                setBio(userProfile.bio || '');
            }
        } catch (error) {
            console.error("Erreur chargement profil:", error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        loadProfile();
    }, [loadProfile]);

    const handleSave = async () => {
        if (!user) return;
        setLoading(true);
        try {
            await ProfileService.updateProfile(user.id, { full_name: fullName, bio });
            await loadProfile();
            setIsEditing(false);
            Alert.alert("Succès", "Votre profil a été mis à jour.");
        } catch (error) {
            Alert.alert("Erreur", "Impossible de mettre à jour le profil.");
        } finally {
            setLoading(false);
        }
    };

    const handleSignOut = () => {
        Alert.alert(
            "Se déconnecter",
            "Êtes-vous sûr de vouloir vous déconnecter ?",
            [
                { text: "Annuler", style: "cancel" },
                { text: "Se déconnecter", style: "destructive", onPress: signOut },
            ]
        );
    };

    if (loading && !profile) { // Afficher le loader uniquement au premier chargement
        return <View style={styles.center}><ActivityIndicator size="large" color={theme.colors.primary[500]} /></View>;
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={handleSignOut} disabled={isEditing}>
                    <Ionicons name={"log-out-outline"} size={theme.iconSizes.lg} color={isEditing ? theme.colors.text.disabled : theme.colors.error.main} />
                </TouchableOpacity>
                <Text style={styles.title}>Mon Profil</Text>
                <TouchableOpacity onPress={() => isEditing ? setIsEditing(false) : setIsEditing(true)}>
                    <Ionicons name={isEditing ? "close-outline" : "create-outline"} size={theme.iconSizes.lg} color={theme.colors.primary[500]} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContentContainer} keyboardShouldPersistTaps="handled">
                {isEditing ? (
                    <>
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Nom complet</Text>
                            <TextInput style={styles.input} value={fullName} onChangeText={setFullName} placeholder="Votre nom et prénom" placeholderTextColor={theme.colors.text.disabled} />
                        </View>
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Biographie</Text>
                            <TextInput style={[styles.input, styles.textArea]} value={bio} onChangeText={setBio} placeholder="Parlez un peu de vous..." multiline placeholderTextColor={theme.colors.text.disabled} />
                        </View>
                    </>
                ) : (
                    <View style={styles.infoCard}>
                        <View style={styles.infoRow}><Text style={styles.label}>Nom d'utilisateur</Text><Text style={styles.info}>{profile?.username}</Text></View>
                        <View style={styles.infoRow}><Text style={styles.label}>Nom complet</Text><Text style={styles.info}>{profile?.full_name || '-'}</Text></View>
                        <View style={styles.infoRow}><Text style={styles.label}>Email</Text><Text style={styles.info}>{user?.email}</Text></View>
                        <View style={[styles.infoRow, { borderBottomWidth: 0 }]}><Text style={styles.label}>Bio</Text><Text style={styles.info}>{profile?.bio || '-'}</Text></View>
                    </View>
                )}
            </ScrollView>

            {isEditing && (
                <View style={styles.footer}>
                    <TouchableOpacity style={[styles.button, styles.saveButton, loading && styles.buttonDisabled]} onPress={handleSave} disabled={loading}>
                        {loading ? <ActivityIndicator color={theme.colors.white} /> : <Text style={styles.buttonText}>Enregistrer les modifications</Text>}
                    </TouchableOpacity>
                </View>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background.default },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: theme.layout.screenPadding,
        paddingVertical: theme.spacing[3],
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border.light,
    },
    title: {
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: theme.typography.fontSize['xl'],
        color: theme.colors.text.primary,
    },
    scrollContentContainer: { flexGrow: 1, padding: theme.layout.containerPadding },
    infoCard: { backgroundColor: theme.colors.background.paper, borderRadius: theme.borderRadius.md, paddingHorizontal: theme.spacing[5], ...theme.shadows.sm, borderWidth: 1, borderColor: theme.colors.border.light },
    infoRow: { paddingVertical: theme.spacing[4], borderBottomWidth: 1, borderBottomColor: theme.colors.border.light },
    label: { fontFamily: theme.typography.fontFamily.regular, fontSize: theme.typography.fontSize.sm, color: theme.colors.text.secondary, marginBottom: theme.spacing[2] },
    info: { fontFamily: theme.typography.fontFamily.medium, fontSize: theme.typography.fontSize.lg, color: theme.colors.text.primary, fontWeight: theme.typography.fontWeight.medium },
    formGroup: { marginBottom: theme.spacing[5] },
    input: { backgroundColor: theme.colors.background.paper, color: theme.colors.text.primary, height: INPUT_HEIGHT, borderWidth: 1, borderColor: theme.colors.border.main, borderRadius: theme.borderRadius.base, paddingHorizontal: theme.spacing[4], fontSize: theme.typography.fontSize.base },
    textArea: { height: 100, textAlignVertical: 'top', paddingTop: theme.spacing[3] },
    footer: { padding: theme.layout.containerPadding },
    button: { height: INPUT_HEIGHT, justifyContent: 'center', alignItems: 'center', borderRadius: theme.borderRadius.base, width: '100%', ...theme.shadows.base },
    saveButton: { backgroundColor: theme.colors.primary[500] },
    buttonDisabled: { backgroundColor: theme.colors.gray[400], ...theme.shadows.none },
    buttonText: { fontFamily: theme.typography.fontFamily.bold, fontSize: theme.typography.fontSize.base, color: theme.colors.text.inverse, fontWeight: theme.typography.fontWeight.bold },
});
