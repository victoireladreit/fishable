import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, SafeAreaView, TextInput, ActivityIndicator, Alert, ScrollView, Image,
    Platform, Modal, Dimensions
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { theme } from '../../theme';
import { ProfileService, Profile } from '../../services';
import { Ionicons } from '@expo/vector-icons';
import { useImagePicker } from '../../hooks';
import { useActionSheet } from '@expo/react-native-action-sheet';

const INPUT_HEIGHT = 50;
const screenWidth = Dimensions.get('window').width;

export const ProfileScreen = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [showFullSizeAvatar, setShowFullSizeAvatar] = useState(false); // New state for full-size avatar

    const [fullName, setFullName] = useState('');
    const [bio, setBio] = useState('');
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

    const { pickImage, takePhoto } = useImagePicker();
    const { showActionSheetWithOptions } = useActionSheet();

    const loadProfile = useCallback(async () => {
        if (!user) return;
        try {
            const userProfile = await ProfileService.getProfile(user.id);
            if (userProfile) {
                setProfile(userProfile);
                setFullName(userProfile.full_name || '');
                setBio(userProfile.bio || '');
                setAvatarUrl(userProfile.avatar_url);
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

    const handleAvatarChange = async (imageAsset: { uri: string } | null) => {
        if (!user || !imageAsset || !imageAsset.uri) return;
        setLoading(true);
        try {
            const newAvatarUrl = await ProfileService.uploadAvatar(user.id, imageAsset.uri);
            await ProfileService.updateProfile(user.id, { avatar_url: newAvatarUrl });
            setAvatarUrl(newAvatarUrl);
            Alert.alert("Succès", "Votre photo de profil a été mise à jour.");
        } catch (error) {
            Alert.alert("Erreur", "Impossible de changer la photo de profil.");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAvatar = () => {
        if (!avatarUrl || !user) return;
        Alert.alert("Supprimer la photo", "Êtes-vous sûr de vouloir supprimer votre photo de profil ?", [
            { text: "Annuler", style: "cancel" },
            {
                text: "Supprimer", style: "destructive",
                onPress: async () => {
                    setLoading(true);
                    try {
                        await ProfileService.deleteAvatar(avatarUrl);
                        await ProfileService.updateProfile(user.id, { avatar_url: null });
                        setAvatarUrl(null);
                        Alert.alert("Succès", "Votre photo de profil a été supprimée.");
                    } catch (error) {
                        Alert.alert("Erreur", "Impossible de supprimer la photo de profil.");
                    } finally {
                        setLoading(false);
                    }
                },
            },
        ]);
    };

    const showAvatarOptions = () => {
        const options = ["Prendre une photo", "Choisir depuis la photothèque"];
        let destructiveButtonIndex: number | undefined = undefined;

        if (avatarUrl) {
            options.push("Supprimer la photo");
            destructiveButtonIndex = options.length - 1;
        }

        options.push("Annuler");
        const cancelButtonIndex = options.length - 1;

        showActionSheetWithOptions(
            {
                options,
                cancelButtonIndex,
                destructiveButtonIndex,
                destructiveColor: theme.colors.error.main,
            },
            async (buttonIndex) => {
                if (buttonIndex === 0) {
                    const photo = await takePhoto();
                    handleAvatarChange(photo);
                } else if (buttonIndex === 1) {
                    const image = await pickImage();
                    handleAvatarChange(image);
                } else if (buttonIndex === destructiveButtonIndex) {
                    handleDeleteAvatar();
                }
            }
        );
    };

    if (loading && !profile) {
        return <View style={styles.center}><ActivityIndicator size="large" color={theme.colors.primary[500]} /></View>;
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Mon Profil</Text>
                <TouchableOpacity onPress={() => isEditing ? setIsEditing(false) : setIsEditing(true)}>
                    <Ionicons name={isEditing ? "close-outline" : "create-outline"} size={theme.iconSizes.lg} color={theme.colors.primary[500]} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContentContainer} keyboardShouldPersistTaps="handled">
                {isEditing ? (
                    <>
                        <View style={styles.avatarContainerEditable}>
                            <Image source={avatarUrl ? { uri: avatarUrl } : require('../../assets/default-avatar.jpg')} style={styles.avatar} />                            
                        </View>
                        {/* Nouveau bouton de texte pour modifier la photo */}
                        <TouchableOpacity onPress={showAvatarOptions} style={styles.changePhotoButton}>
                            <Text style={styles.changePhotoButtonText}>Modifier la photo</Text>
                        </TouchableOpacity>

                        <View style={{marginTop: theme.spacing[6]}}>
                            <View style={styles.formGroup}><Text style={styles.label}>Nom complet</Text><TextInput style={styles.input} value={fullName} onChangeText={setFullName} placeholder="Votre nom et prénom" /></View>
                            <View style={styles.formGroup}><Text style={styles.label}>Biographie</Text><TextInput style={[styles.input, styles.textArea]} value={bio} onChangeText={setBio} placeholder="Parlez un peu de vous..." multiline /></View>
                        </View>
                    </>
                ) : (
                    <View style={styles.infoCard}>
                        <View style={styles.profileSummary}>
                            <TouchableOpacity onPress={() => avatarUrl && setShowFullSizeAvatar(true)} style={styles.avatarContainerDisplay}>
                                <Image source={avatarUrl ? { uri: avatarUrl } : require('../../assets/default-avatar.jpg')} style={styles.avatarDisplay} />
                            </TouchableOpacity>
                            <View style={styles.profileTextContainer}>
                                <Text style={styles.usernameText}>{profile?.username}</Text>
                                {profile?.full_name && <Text style={styles.fullNameText}>{profile.full_name}</Text>}
                            </View>
                        </View>
                        <View style={styles.bioContainer}>
                            <Text style={styles.label}>Biographie</Text>
                            <Text style={styles.info}>{profile?.bio || '-'}</Text>
                        </View>
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

            {/* Full-size avatar modal */}
            <Modal
                visible={showFullSizeAvatar}
                transparent={true}
                animationType="fade"
                statusBarTranslucent
                navigationBarTranslucent
                onRequestClose={() => setShowFullSizeAvatar(false)}
            >
                <TouchableOpacity
                    style={styles.fullSizeAvatarOverlay}
                    activeOpacity={1}
                    onPress={() => setShowFullSizeAvatar(false)}
                >
                    {avatarUrl ? (
                        <Image source={{ uri: avatarUrl }} style={styles.fullSizeAvatar} resizeMode="cover" />
                    ) : (
                        <Image source={require('../../assets/default-avatar.jpg')} style={styles.fullSizeAvatar} resizeMode="cover" />
                    )}
                </TouchableOpacity>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background.default, paddingTop: Platform.OS === 'android' ? theme.spacing[12] : 0 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: theme.layout.screenPadding,
        marginTop: theme.spacing[4],
        marginBottom: theme.spacing[4],
    },
    title: {
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: theme.typography.fontSize['4xl'],
        color: theme.colors.text.primary,
    },
    scrollContentContainer: { flexGrow: 1, paddingHorizontal: theme.layout.containerPadding },
    avatarContainerEditable: { alignSelf: 'center', marginBottom: theme.spacing[2], position: 'relative' },
    avatar: { width: 120, height: 120, borderRadius: 60, borderWidth: 3, borderColor: theme.colors.primary[200] },
    changePhotoButton: {
        alignSelf: 'center',
    },
    changePhotoButtonText: {
        fontFamily: theme.typography.fontFamily.medium,
        fontSize: theme.typography.fontSize.base,
        color: theme.colors.primary[500],
        fontWeight: theme.typography.fontWeight.medium,
    },
    infoCard: { backgroundColor: theme.colors.background.paper, borderRadius: theme.borderRadius.md, padding: theme.spacing[5], ...theme.shadows.sm, borderWidth: 1, borderColor: theme.colors.border.light, marginTop: theme.spacing[4] },
    profileSummary: { flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing[4] },
    avatarContainerDisplay: { marginRight: theme.spacing[4] },
    avatarDisplay: { width: 80, height: 80, borderRadius: 40, borderWidth: 2, borderColor: theme.colors.primary[200] },
    profileTextContainer: { flex: 1 },
    usernameText: { fontFamily: theme.typography.fontFamily.bold, fontSize: theme.typography.fontSize['xl'], color: theme.colors.text.primary },
    fullNameText: { fontFamily: theme.typography.fontFamily.medium, fontSize: theme.typography.fontSize.base, color: theme.colors.text.secondary, marginTop: theme.spacing[1] },
    bioContainer: { paddingTop: theme.spacing[4], borderTopWidth: 1, borderTopColor: theme.colors.border.light },
    label: { fontFamily: theme.typography.fontFamily.regular, fontSize: theme.typography.fontSize.sm, color: theme.colors.text.secondary, marginBottom: theme.spacing[1] },
    info: { fontFamily: theme.typography.fontFamily.medium, fontSize: theme.typography.fontSize.base, color: theme.colors.text.primary, fontWeight: theme.typography.fontWeight.medium },
    formGroup: { marginBottom: theme.spacing[5] },
    input: { backgroundColor: theme.colors.background.paper, color: theme.colors.text.primary, height: INPUT_HEIGHT, borderWidth: 1, borderColor: theme.colors.border.main, borderRadius: theme.borderRadius.base, paddingHorizontal: theme.spacing[4], fontSize: theme.typography.fontSize.base },
    textArea: { height: 100, textAlignVertical: 'top', paddingTop: theme.spacing[3] },
    footer: { padding: theme.layout.containerPadding },
    button: { height: INPUT_HEIGHT, justifyContent: 'center', alignItems: 'center', borderRadius: theme.borderRadius.base, width: '100%', ...theme.shadows.base },
    saveButton: { backgroundColor: theme.colors.primary[500] },
    buttonDisabled: { backgroundColor: theme.colors.gray[400], ...theme.shadows.none },
    buttonText: { fontFamily: theme.typography.fontFamily.bold, fontSize: theme.typography.fontSize.base, color: theme.colors.text.inverse, fontWeight: theme.typography.fontWeight.bold },
    // Styles for full-size avatar modal
    fullSizeAvatarOverlay: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.8)', // Semi-transparent background for blur effect
        justifyContent: 'center',
        alignItems: 'center',
    },
    fullSizeAvatar: {
        width: screenWidth * 0.8, // 80% of screen width
        height: screenWidth * 0.8, // Make it square
        borderRadius: (screenWidth * 0.8) / 2, // Make it circular
        borderWidth: 3,
        borderColor: theme.colors.white,
    },
});
