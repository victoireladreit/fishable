import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, Alert, ScrollView, Image,
    Platform, Modal, Dimensions, RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { theme } from '../../theme';
import {ProfileService, Profile, ProfileUpdate, ProfileStats} from '../../services';
import { Ionicons } from '@expo/vector-icons';
import { useImagePicker } from '../../hooks';
import { useActionSheet } from '@expo/react-native-action-sheet';
import { Card } from '../../components/common';
import { useNavigation, NavigationProp, useFocusEffect } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/types';

const INPUT_HEIGHT = 50;
const screenWidth = Dimensions.get('window').width;

// Helper component for displaying a single stat item
interface StatItemProps {
    iconName: keyof typeof Ionicons.glyphMap;
    label: string;
    value: string | number; // Value is now strictly string or number, null handled by parent
    unit?: string;
}

const StatItem: React.FC<StatItemProps> = ({ iconName, label, value, unit }) => {
    // value is guaranteed to be string or number here
    const displayValue = String(value);
    const displayUnit = unit ? String(unit) : '';

    return (
        <View style={styles.statItemVisual}>
            <Ionicons name={iconName} size={theme.iconSizes.sm} color={theme.colors.primary[500]} style={styles.statIcon} />
            <View style={styles.statTextContainer}>
                <Text style={styles.statLabelVisual}>{label}</Text>
                <Text style={styles.statValueVisual}>{displayValue}{displayUnit}</Text>
            </View>
        </View>
    );
};

export const ProfileScreen = () => {
    const { user, refreshUser } = useAuth();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [profileStats, setProfileStats] = useState<ProfileStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [showFullSizeAvatar, setShowFullSizeAvatar] = useState(false);

    const [fullName, setFullName] = useState('');
    const [bio, setBio] = useState('');
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [newUsername, setNewUsername] = useState('');
    const [debouncedUsername, setDebouncedUsername] = useState('');
    const [isCheckingUsername, setIsCheckingUsername] = useState(false);
    const [isUsernameAvailable, setIsUsernameAvailable] = useState<boolean | null>(null);

    const { pickImage, takePhoto } = useImagePicker();
    const { showActionSheetWithOptions } = useActionSheet();
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();

    const loadProfile = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const userProfile = await ProfileService.getProfile(user.id);
            if (userProfile) {
                setProfile(userProfile);
                setFullName(userProfile.full_name || '');
                setBio(userProfile.bio || '');
                setAvatarUrl(userProfile.avatar_url);
                setNewUsername(userProfile.username || '');
                setDebouncedUsername(userProfile.username || '');
            }

            const stats = await ProfileService.getProfileStats(user.id);
            setProfileStats(stats);

        } catch (error) {
            console.error("Erreur chargement profil ou stats:", error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useFocusEffect(
        useCallback(() => {
            loadProfile();
        }, [loadProfile])
    );

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedUsername(newUsername.trim());
        }, 500);

        return () => {
            clearTimeout(handler);
        };
    }, [newUsername]);

    useEffect(() => {
        const checkAvailability = async () => {
            if (!user || !profile || debouncedUsername === profile.username.trim() || debouncedUsername.trim() === '') {
                setIsUsernameAvailable(null);
                return;
            }

            setIsCheckingUsername(true);
            try {
                const available = await ProfileService.checkUsernameAvailability(debouncedUsername);
                setIsUsernameAvailable(available);
            } catch (error) {
                console.error("Erreur vérification nom d'utilisateur:", error);
                setIsUsernameAvailable(false);
            } finally {
                setIsCheckingUsername(false);
            }
        };

        checkAvailability();
    }, [debouncedUsername, user, profile]);

    const handleSave = async () => {
        if (!user || !profile) return;

        if (isCheckingUsername) {
            Alert.alert("Vérification en cours", "Veuillez attendre la vérification du nom d'utilisateur.");
            return;
        }
        if (newUsername.trim() !== profile.username.trim() && isUsernameAvailable === false) {
            Alert.alert("Erreur", "Le nom d'utilisateur n'est pas disponible.");
            return;
        }
        if (newUsername.trim() === '') {
            Alert.alert("Erreur", "Le nom d'utilisateur ne peut pas être vide.");
            return;
        }

        setLoading(true);
        try {
            const updates: ProfileUpdate = { full_name: fullName, bio };
            if (newUsername.trim() !== profile.username.trim()) {
                updates.username = newUsername.trim();
            }
            
            await ProfileService.updateProfile(user.id, updates);
            
            // Refresh user data from auth context
            await refreshUser();
            
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
                    await handleAvatarChange(photo);
                } else if (buttonIndex === 1) {
                    const image = await pickImage();
                    await handleAvatarChange(image);
                } else if (buttonIndex === destructiveButtonIndex) {
                    handleDeleteAvatar();
                }
            }
        );
    };

    if (loading && (!profile || !profileStats)) {
        return <View style={styles.center}><ActivityIndicator size="large" color={theme.colors.primary[500]} /></View>;
    }

    const isSaveButtonDisabled = loading || isCheckingUsername || (newUsername.trim() !== profile?.username?.trim() && isUsernameAvailable === false) || newUsername.trim() === '';

    const isUsernameError = newUsername.trim() !== profile?.username?.trim() && isUsernameAvailable === false;

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Mon Profil</Text>
                <View style={styles.headerActions}>
                    <TouchableOpacity onPress={() => isEditing ? setIsEditing(false) : setIsEditing(true)}>
                        <Ionicons name={isEditing ? "close-outline" : "create-outline"} size={theme.iconSizes.lg} color={theme.colors.primary[500]} />
                    </TouchableOpacity>
                    {!isEditing && (
                        <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={{ marginLeft: theme.spacing[4] }}>
                            <Ionicons name="settings-outline" size={theme.iconSizes.lg} color={theme.colors.primary[500]} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContentContainer}
                keyboardShouldPersistTaps="handled"
            >
                {isEditing ? (
                    <>
                        <View style={styles.avatarContainerEditable}>
                            <Image source={avatarUrl ? { uri: avatarUrl } : require('../../assets/default-avatar.jpg')} style={styles.avatar} />                            
                        </View>
                        <TouchableOpacity onPress={showAvatarOptions} style={styles.changePhotoButton}>
                            <Text style={styles.changePhotoButtonText}>Modifier la photo</Text>
                        </TouchableOpacity>

                        <View style={{marginTop: theme.spacing[6]}}>
                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Nom d'utilisateur</Text>
                                <TextInput
                                    style={[styles.input, isUsernameError && styles.inputError]}
                                    value={newUsername}
                                    onChangeText={setNewUsername}
                                    placeholder="Votre nom d'utilisateur"
                                    autoCapitalize="none"
                                />
                                {newUsername.trim() !== profile?.username?.trim() && newUsername.trim() !== '' && (
                                    <View style={styles.usernameStatusContainer}>
                                        {isUsernameAvailable === false && (
                                            <Text style={[
                                                styles.usernameStatusText,
                                                styles.usernameUnavailable
                                            ]}>
                                                Non disponible
                                            </Text>
                                        )}
                                    </View>
                                )}
                            </View>
                            <View style={styles.formGroup}><Text style={styles.label}>Nom complet</Text><TextInput style={styles.input} value={fullName} onChangeText={setFullName} placeholder="Votre nom et prénom" /></View>
                            <View style={styles.formGroup}><Text style={styles.label}>Biographie</Text><TextInput style={[styles.input, styles.textArea]} value={bio} onChangeText={setBio} placeholder="Parlez un peu de vous..." multiline /></View>
                        </View>
                    </>
                ) : (
                    <Card style={{ marginTop: theme.spacing[4] }}>
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

                        {/* Profile Stats Section */}
                        {profileStats && (
                            <View style={styles.statsContainer}>
                                <Text style={styles.statsTitle}>Statistiques de pêche</Text>
                                <View style={styles.statsGrid}>
                                    {profileStats.totalCaught !== null && <StatItem iconName="fish-outline" label="Prises" value={profileStats.totalCaught} />}
                                    {profileStats.uniqueSpeciesCount !== null && <StatItem iconName="leaf-outline" label="Esp. uniques" value={profileStats.uniqueSpeciesCount} />}
                                    {profileStats.biggestWeightKg !== null && <StatItem iconName="scale-outline" label="Max poids" value={profileStats.biggestWeightKg} unit=" kg" />}
                                    {profileStats.biggestSizeCm !== null && <StatItem iconName="resize-outline" label="Max taille" value={profileStats.biggestSizeCm} unit=" cm" />}
                                    {profileStats.releaseRate !== null && <StatItem iconName="arrow-undo-outline" label="Relâché %" value={profileStats.releaseRate.toFixed(0)} unit="%" />}
                                    {profileStats.mostCaughtSpecies !== null && <StatItem iconName="trophy-outline" label="Esp. la + pêchée" value={profileStats.mostCaughtSpecies} />}
                                    {profileStats.favoriteTechnique !== null && <StatItem iconName="hammer-outline" label="Technique fav." value={profileStats.favoriteTechnique} />}
                                    {profileStats.totalSessions !== null && <StatItem iconName="calendar-outline" label="Sessions" value={profileStats.totalSessions} />}
                                </View>
                            </View>
                        )}
                         {/* Activity Stats Section */}
                         {profileStats && (
                            <View style={styles.statsContainer}>
                                <Text style={styles.statsTitle}>Activité récente</Text>
                                <View style={styles.statsGrid}>
                                    {profileStats.totalSessionsLastMonth !== null && <StatItem iconName="calendar-outline" label="Sessions (30j)" value={profileStats.totalSessionsLastMonth} />}
                                    {profileStats.totalCaughtLastMonth !== null && <StatItem iconName="fish-outline" label="Prises (30j)" value={profileStats.totalCaughtLastMonth} />}
                                    {profileStats.averageCatchesPerSession !== null && <StatItem iconName="stats-chart-outline" label="Moy. par session" value={profileStats.averageCatchesPerSession.toFixed(1)} />}
                                </View>
                            </View>
                        )}
                    </Card>
                )}
            </ScrollView>

            {isEditing && (
                <View style={styles.footer}>
                    <TouchableOpacity style={[styles.button, styles.saveButton, isSaveButtonDisabled && styles.buttonDisabled]} onPress={handleSave} disabled={isSaveButtonDisabled}>
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
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
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
    profileSummary: { flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing[4] },
    avatarContainerDisplay: { marginRight: theme.spacing[4] },
    avatarDisplay: { width: 80, height: 80, borderRadius: 40, borderWidth: 2, borderColor: theme.colors.primary[200] },
    profileTextContainer: { flex: 1 },
    usernameText: { fontFamily: theme.typography.fontFamily.bold, fontSize: theme.typography.fontSize['xl'], color: theme.colors.text.primary },
    fullNameText: { fontFamily: theme.typography.fontFamily.medium, fontSize: theme.typography.fontSize.base, color: theme.colors.text.secondary, marginTop: theme.spacing[1] },
    bioContainer: { paddingTop: theme.spacing[4], borderTopWidth: 1, borderTopColor: theme.colors.border.light },
    label: { fontFamily: theme.typography.fontFamily.regular, fontSize: theme.typography.fontSize.sm, color: theme.colors.text.secondary, marginBottom: theme.spacing[1] },
    info: { fontFamily: theme.typography.fontFamily.medium, fontSize: theme.typography.fontSize.base, color: theme.colors.text.primary, fontWeight: theme.typography.fontWeight.medium },
    formGroup: { marginBottom: theme.spacing[4] }, // Reduced from 5 to 4
    input: { backgroundColor: theme.colors.background.paper, color: theme.colors.text.primary, height: INPUT_HEIGHT, borderWidth: 1, borderColor: theme.colors.border.main, borderRadius: theme.borderRadius.base, paddingHorizontal: theme.spacing[4], fontSize: theme.typography.fontSize.base },
    inputError: {
        borderColor: theme.colors.error.main,
    },
    textArea: { height: 100, textAlignVertical: 'top', paddingTop: theme.spacing[3] },
    footer: { padding: theme.layout.containerPadding },
    button: { height: INPUT_HEIGHT, justifyContent: 'center', alignItems: 'center', borderRadius: theme.borderRadius.base, width: '100%', ...theme.shadows.base },
    saveButton: { backgroundColor: theme.colors.primary[500] },
    buttonDisabled: { backgroundColor: theme.colors.gray[400], ...theme.shadows.none },
    buttonText: { fontFamily: theme.typography.fontFamily.bold, fontSize: theme.typography.fontSize.base, color: theme.colors.text.inverse, fontWeight: theme.typography.fontWeight.bold },
    usernameStatusContainer: {
        marginTop: theme.spacing[2],
        alignItems: 'flex-start',
    },
    usernameStatusText: {
        fontFamily: theme.typography.fontFamily.medium,
        fontSize: theme.typography.fontSize.sm,
    },
    usernameAvailable: {
        color: theme.colors.success.main,
    },
    usernameUnavailable: {
        color: theme.colors.error.main,
    },
    statsContainer: {
        marginTop: theme.spacing[4],
        paddingTop: theme.spacing[4],
        borderTopWidth: 1,
        borderTopColor: theme.colors.border.light,
    },
    statsTitle: {
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: theme.typography.fontSize.lg,
        color: theme.colors.text.primary,
        marginBottom: theme.spacing[3],
        textAlign: 'center',
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    statItemVisual: {
        width: '48%',
        backgroundColor: theme.colors.background.default,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing[2],
        marginBottom: theme.spacing[2],
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.colors.border.light,
    },
    statIcon: {
        marginBottom: theme.spacing[0],
    },
    statTextContainer: {
        alignItems: 'center',
    },
    statLabelVisual: {
        fontFamily: theme.typography.fontFamily.regular,
        fontSize: theme.typography.fontSize.sm,
        color: theme.colors.text.secondary,
        textAlign: 'center',
    },
    statValueVisual: {
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: theme.typography.fontSize.base,
        color: theme.colors.text.primary,
        fontWeight: theme.typography.fontWeight.bold,
        textAlign: 'center',
    },
    // Styles for full-size avatar modal
    fullSizeAvatarOverlay: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    fullSizeAvatar: {
        width: screenWidth * 0.8,
        height: screenWidth * 0.8,
        borderRadius: (screenWidth * 0.8) / 2,
        borderWidth: 3,
        borderColor: theme.colors.white,
    },
});