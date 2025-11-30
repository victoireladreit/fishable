import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, Alert, ScrollView, Image,
    Platform, Modal, Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { theme } from '../../theme';
import { ProfileService, Profile, ProfileUpdate, ProfileStats, ContributionChartData, HeatmapPoint } from '../../services';
import { Ionicons } from '@expo/vector-icons';
import { useImagePicker } from '../../hooks';
import { useActionSheet } from '@expo/react-native-action-sheet';
import { Card } from '../../components/common';
import { useNavigation, NavigationProp, useFocusEffect, useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/types';
import { ContributionGraph } from 'react-native-chart-kit';
import MapView, { Heatmap, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';

const INPUT_HEIGHT = 50;
const screenWidth = Dimensions.get('window').width;
const SESSION_BASE_VALUE = 10;

type ProfileScreenRouteProp = RouteProp<{ Profile: { userId?: string } }, 'Profile'>;

const defaultRegion = {
    latitude: 46.2276, // Center of France
    longitude: 2.2137,
    latitudeDelta: 12,
    longitudeDelta: 12,
};

interface StatItemProps {
    iconName: keyof typeof Ionicons.glyphMap;
    label: string;
    value: string | number;
    unit?: string;
}

const StatItem: React.FC<StatItemProps> = ({ iconName, label, value, unit }) => {
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
    const { user: loggedInUser, refreshUser } = useAuth();
    const route = useRoute<ProfileScreenRouteProp>();
    
    const profileUserId = route.params?.userId || loggedInUser?.id;
    const isMyProfile = profileUserId === loggedInUser?.id;

    const [profile, setProfile] = useState<Profile | null>(null);
    const [profileStats, setProfileStats] = useState<ProfileStats | null>(null);
    const [chartData, setChartData] = useState<ContributionChartData[] | null>(null);
    const [heatmapData, setHeatmapData] = useState<HeatmapPoint[]>([]);
    const [loading, setLoading] = useState(true);
    const [isYearlyDataLoading, setIsYearlyDataLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [showFullSizeAvatar, setShowFullSizeAvatar] = useState(false);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [initialMapRegion, setInitialMapRegion] = useState(defaultRegion);

    const [fullName, setFullName] = useState('');
    const [bio, setBio] = useState('');
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [newUsername, setNewUsername] = useState('');
    const [debouncedUsername, setDebouncedUsername] = useState('');
    const [isCheckingUsername, setIsCheckingUsername] = useState(false);
    const [isUsernameAvailable, setIsUsernameAvailable] = useState<boolean | null>(null);

    const [hasLoadedProfile, setHasLoadedProfile] = useState(false);

    const { pickImage, takePhoto } = useImagePicker();
    const { showActionSheetWithOptions } = useActionSheet();
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const mapRef = useRef<MapView>(null);

    const loadProfileAndStats = useCallback(async () => {
        if (!profileUserId) return;
        setLoading(true);
        try {
            const userProfile = await ProfileService.getProfile(profileUserId);
            if (userProfile) {
                setProfile(userProfile);
                setFullName(userProfile.full_name || '');
                setBio(userProfile.bio || '');
                setAvatarUrl(userProfile.avatar_url);
                setNewUsername(userProfile.username || '');
                setDebouncedUsername(userProfile.username || '');
            }
            const stats = await ProfileService.getProfileStats(profileUserId);
            setProfileStats(stats);
            setHasLoadedProfile(true); // Set to true after successful load
        } catch (error) {
            console.error("Erreur chargement du profil et des stats:", error);
        } finally {
            setLoading(false);
        }
    }, [profileUserId]);

    const loadYearlyData = useCallback(async (year: number) => {
        if (!profileUserId) return;
        setIsYearlyDataLoading(true);
        try {
            const [chart, heatmap] = await Promise.all([
                ProfileService.getContributionDataForYear(profileUserId, year),
                isMyProfile ? ProfileService.getHeatmapDataForYear(profileUserId, year) : Promise.resolve([])
            ]);
            setChartData(chart);
            setHeatmapData(heatmap);
        } catch (error) {
            console.error(`Erreur chargement des données pour l'année ${year}:`, error);
        } finally {
            setIsYearlyDataLoading(false);
        }
    }, [profileUserId, isMyProfile]);

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status === 'granted') {
                let location = await Location.getCurrentPositionAsync({});
                setInitialMapRegion({
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                    latitudeDelta: 12,
                    longitudeDelta: 12,
                });
            }
        })();
    }, []);

    useFocusEffect(
        useCallback(() => {
            // Always load profile data and yearly data when the screen is focused
            if (profileUserId) {
                loadProfileAndStats();
                loadYearlyData(selectedYear); 
            }
        }, [loadProfileAndStats, loadYearlyData, profileUserId, selectedYear])
    );

    useEffect(() => {
        // Load yearly data when selectedYear or profileUserId changes
        loadYearlyData(selectedYear);
    }, [selectedYear, loadYearlyData, profileUserId]);

    useEffect(() => {
        const handler = setTimeout(() => { setDebouncedUsername(newUsername.trim()); }, 500);
        return () => { clearTimeout(handler); };
    }, [newUsername]);

    useEffect(() => {
        const checkAvailability = async () => {
            if (!profileUserId || !profile || debouncedUsername === profile.username.trim() || debouncedUsername.trim() === '') {
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
    }, [debouncedUsername, profileUserId, profile]);

    const handleSave = async () => {
        if (!profileUserId || !profile) return;
        if (isCheckingUsername) { Alert.alert("Vérification en cours", "Veuillez attendre la vérification du nom d'utilisateur."); return; }
        if (newUsername.trim() !== profile.username.trim() && isUsernameAvailable === false) { Alert.alert("Erreur", "Le nom d'utilisateur n'est pas disponible."); return; }
        if (newUsername.trim() === '') { Alert.alert("Erreur", "Le nom d'utilisateur ne peut pas être vide."); return; }

        setLoading(true);
        try {
            const updates: ProfileUpdate = { full_name: fullName, bio };
            if (newUsername.trim() !== profile.username.trim()) {
                updates.username = newUsername.trim();
            }
            await ProfileService.updateProfile(profileUserId, updates);
            await refreshUser();
            await loadProfileAndStats();
            setIsEditing(false);
            Alert.alert("Succès", "Votre profil a été mis à jour.");
        } catch (error) {
            Alert.alert("Erreur", "Impossible de mettre à jour le profil.");
        } finally {
            setLoading(false);
        }
    };

    const handleAvatarChange = async (imageAsset: { uri: string } | null) => {
        if (!profileUserId || !imageAsset || !imageAsset.uri) return;
        setLoading(true);
        try {
            const newAvatarUrl = await ProfileService.uploadAvatar(profileUserId, imageAsset.uri);
            await ProfileService.updateProfile(profileUserId, { avatar_url: newAvatarUrl });
            setAvatarUrl(newAvatarUrl);
            Alert.alert("Succès", "Votre photo de profil a été mise à jour.");
        } catch (error) {
            Alert.alert("Erreur", "Impossible de changer la photo de profil.");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAvatar = () => {
        if (!avatarUrl || !profileUserId) return;
        Alert.alert("Supprimer la photo", "Êtes-vous sûr de vouloir supprimer votre photo de profil ?", [
            { text: "Annuler", style: "cancel" },
            { text: "Supprimer", style: "destructive", onPress: async () => {
                setLoading(true);
                try {
                    await ProfileService.deleteAvatar(avatarUrl);
                    await ProfileService.updateProfile(profileUserId, { avatar_url: null });
                    setAvatarUrl(null);
                    Alert.alert("Succès", "Votre photo de profil a été supprimée.");
                } catch (error) {
                    Alert.alert("Erreur", "Impossible de supprimer la photo de profil.");
                } finally {
                    setLoading(false);
                }
            }},
        ]);
    };

    const showAvatarOptions = () => {
        const options = ["Prendre une photo", "Choisir depuis la photothèque"];
        let destructiveButtonIndex: number | undefined = avatarUrl ? 2 : undefined;
        if (avatarUrl) options.push("Supprimer la photo");
        options.push("Annuler");
        const cancelButtonIndex = options.length - 1;

        showActionSheetWithOptions({ options, cancelButtonIndex, destructiveButtonIndex, destructiveColor: theme.colors.error.main }, async (buttonIndex) => {
            if (buttonIndex === 0) { const photo = await takePhoto(); await handleAvatarChange(photo); }
            else if (buttonIndex === 1) { const image = await pickImage(); await handleAvatarChange(image); }
            else if (buttonIndex === destructiveButtonIndex) { handleDeleteAvatar(); }
        });
    };

    const showContributionInfo = () => {
        Alert.alert(
            "Calcul des contributions",
            "L'intensité de la couleur de chaque case est calculée ainsi :\n\n- Une session de pêche augmente significativement l'intensité.\n- Chaque prise ajoute une légère intensité supplémentaire.\n\nUne case plus foncée signifie donc une journée plus active !"
        );
    };

    const recenterMap = () => {
        mapRef.current?.animateToRegion(initialMapRegion, 1000);
    };

    if (loading && !hasLoadedProfile) { // Only show full loading if profile hasn't been loaded yet
        return <View style={styles.center}><ActivityIndicator size="large" color={theme.colors.primary[500]} /></View>;
    }

    const isSaveButtonDisabled = loading || isCheckingUsername || (newUsername.trim() !== profile?.username?.trim() && isUsernameAvailable === false) || newUsername.trim() === '';
    const isUsernameError = newUsername.trim() !== profile?.username?.trim() && isUsernameAvailable === false;

    const chartConfig = {
        backgroundGradientFrom: theme.colors.background.paper,
        backgroundGradientTo: theme.colors.background.paper,
        color: (opacity = 1) => {
            if (opacity === 0.15) return theme.colors.gray[200]; // Empty
            if (opacity < 0.4) return theme.colors.primary[200];
            if (opacity < 0.6) return theme.colors.primary[400];
            if (opacity < 0.8) return theme.colors.primary[600];
            return theme.colors.primary[800];
        },
    };
    
    const isLeap = (selectedYear % 4 === 0 && selectedYear % 100 !== 0) || selectedYear % 400 === 0;
    const numDaysInYear = isLeap ? 366 : 365;
    const endDateForChart = new Date(selectedYear, 11, 31);

    const handleDayPress = (day: { date: string; count: number }) => {
        if (!day.count) return;

        const date = new Date(day.date);
        const formattedDate = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
        
        const hasSession = day.count >= SESSION_BASE_VALUE;
        const catchCount = hasSession ? day.count - SESSION_BASE_VALUE : day.count;

        let message = '';
        if (hasSession) {
            message += 'Session de pêche';
            if (catchCount > 0) {
                message += `\n${catchCount} prise(s)`;
            }
        } else {
            message = `${catchCount} prise(s)`;
        }

        Alert.alert(`Détail du ${formattedDate}`, message);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>{isMyProfile ? "Mon Profil" : (profile?.username || 'Profil')}</Text>
                {isMyProfile && (
                    <View style={styles.headerActions}>
                        <TouchableOpacity onPress={() => setIsEditing(!isEditing)}><Ionicons name={isEditing ? "close-outline" : "create-outline"} size={theme.iconSizes.lg} color={theme.colors.primary[500]} /></TouchableOpacity>
                        {!isEditing && <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={{ marginLeft: theme.spacing[4] }}><Ionicons name="settings-outline" size={theme.iconSizes.lg} color={theme.colors.primary[500]} /></TouchableOpacity>}
                    </View>
                )}
            </View>

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContentContainer} keyboardShouldPersistTaps="handled">
                {isEditing && isMyProfile ? (
                    <>
                        <View style={styles.avatarContainerEditable}><Image source={avatarUrl ? { uri: avatarUrl } : require('../../assets/default-avatar.jpg')} style={styles.avatar} /></View>
                        <TouchableOpacity onPress={showAvatarOptions} style={styles.changePhotoButton}><Text style={styles.changePhotoButtonText}>Modifier la photo</Text></TouchableOpacity>
                        <View style={{marginTop: theme.spacing[6]}}>
                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Nom d'utilisateur</Text>
                                <TextInput style={[styles.input, isUsernameError && styles.inputError]} value={newUsername} onChangeText={setNewUsername} placeholder="Votre nom d'utilisateur" autoCapitalize="none" />
                                {newUsername.trim() !== profile?.username?.trim() && newUsername.trim() !== '' && (
                                    <View style={styles.usernameStatusContainer}>{isUsernameAvailable === false && <Text style={[styles.usernameStatusText, styles.usernameUnavailable]}>Non disponible</Text>}</View>
                                )}
                            </View>
                            <View style={styles.formGroup}><Text style={styles.label}>Nom complet</Text><TextInput style={styles.input} value={fullName} onChangeText={setFullName} placeholder="Votre nom et prénom" /></View>
                            <View style={styles.formGroup}><Text style={styles.label}>Biographie</Text><TextInput style={[styles.input, styles.textArea]} value={bio} onChangeText={setBio} placeholder="Parlez un peu de vous..." multiline /></View>
                        </View>
                    </>
                ) : (
                    <Card style={{ marginTop: theme.spacing[4] }}>
                        <View style={styles.profileSummary}>
                            <TouchableOpacity onPress={() => avatarUrl && setShowFullSizeAvatar(true)} style={styles.avatarContainerDisplay}><Image source={avatarUrl ? { uri: avatarUrl } : require('../../assets/default-avatar.jpg')} style={styles.avatarDisplay} /></TouchableOpacity>
                            <View style={styles.profileTextContainer}>
                                <Text style={styles.usernameText}>{profile?.username}</Text>
                                {profile?.full_name && <Text style={styles.fullNameText}>{profile.full_name}</Text>}
                            </View>
                        </View>
                        <View style={styles.bioContainer}><Text style={styles.label}>Biographie</Text><Text style={styles.info}>{profile?.bio || '-'}</Text></View>
                        {profileStats && (
                            <View style={styles.statsContainer}>
                                <Text style={styles.statsTitle}>Statistiques de pêche</Text>
                                <View style={styles.statsGrid}>
                                    <StatItem iconName="fish-outline" label="Prises" value={profileStats.totalCaught} />
                                <StatItem iconName="leaf-outline" label="Esp. uniques" value={profileStats.uniqueSpeciesCount} />
                                    <StatItem iconName="scale-outline" label="Max poids" value={profileStats.biggestWeightKg || 0} unit=" kg" />
                                    <StatItem iconName="resize-outline" label="Max taille" value={profileStats.biggestSizeCm || 0} unit=" cm" />
                                    <StatItem iconName="arrow-undo-outline" label="Relâché %" value={(profileStats.releaseRate || 0).toFixed(0)} unit="%" />
                                    <StatItem iconName="trophy-outline" label="Esp. la + pêchée" value={profileStats.mostCaughtSpecies || '-'} />
                                    <StatItem iconName="hammer-outline" label="Technique fav." value={profileStats.favoriteTechnique || '-'} />
                                    <StatItem iconName="calendar-outline" label="Sessions" value={profileStats.totalSessions} />
                                </View>
                            </View>
                        )}
                        <View style={styles.statsContainer}>
                            <View style={styles.yearSelectorContainer}>
                                <TouchableOpacity onPress={() => setSelectedYear(selectedYear - 1)}><Ionicons name="chevron-back-outline" size={20} color={theme.colors.primary[500]} /></TouchableOpacity>
                                <Text style={styles.chartTitle}>Activité en {selectedYear}</Text>
                                <TouchableOpacity onPress={() => setSelectedYear(selectedYear + 1)} disabled={selectedYear === new Date().getFullYear()}><Ionicons name="chevron-forward-outline" size={20} color={selectedYear === new Date().getFullYear() ? theme.colors.gray[400] : theme.colors.primary[500]} /></TouchableOpacity>
                            </View>
                            {/* Removed isYearlyDataLoading conditional rendering for the chart */}
                            <>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                    <ContributionGraph
                                        values={chartData || []}
                                        endDate={endDateForChart}
                                        numDays={numDaysInYear}
                                        width={1200}
                                        height={220}
                                        chartConfig={chartConfig}
                                        tooltipDataAttrs={() => ({})}
                                        onDayPress={handleDayPress}
                                    />
                                </ScrollView>
                                <View style={styles.legendContainer}>
                                    <Text style={styles.legendText}>Moins</Text>
                                    <View style={[styles.legendBox, { backgroundColor: theme.colors.gray[200] }]} />
                                    <View style={[styles.legendBox, { backgroundColor: theme.colors.primary[200] }]} />
                                    <View style={[styles.legendBox, { backgroundColor: theme.colors.primary[400] }]} />
                                    <View style={[styles.legendBox, { backgroundColor: theme.colors.primary[600] }]} />
                                    <View style={[styles.legendBox, { backgroundColor: theme.colors.primary[800] }]} />
                                    <Text style={styles.legendText}>Plus</Text>
                                </View>
                                <TouchableOpacity onPress={showContributionInfo} style={styles.infoLink}>
                                    <Text style={styles.infoLinkText}>En savoir plus sur le calcul des contributions</Text>
                                </TouchableOpacity>
                            </>
                        </View>
                        {isMyProfile && (
                            <View style={styles.statsContainer}>
                                <Text style={styles.chartTitle}>Points chauds de {selectedYear}</Text>
                                <View style={styles.mapContainer}>
                                    <MapView
                                        ref={mapRef}
                                        provider={PROVIDER_GOOGLE}
                                        style={styles.map}
                                        initialRegion={initialMapRegion}
                                        scrollEnabled={heatmapData.length > 0}
                                        zoomEnabled={heatmapData.length > 0}
                                        pitchEnabled={heatmapData.length > 0}
                                        rotateEnabled={heatmapData.length > 0}
                                    >
                                        {heatmapData.length > 0 && <Heatmap points={heatmapData} radius={40} opacity={0.7} />}
                                    </MapView>
                                    {heatmapData.length === 0 && !isYearlyDataLoading && (
                                        <View style={styles.mapOverlay}>
                                            <Text style={styles.mapOverlayText}>Aucune prise avec localisation pour cette année.</Text>
                                        </View>
                                    )}
                                </View>
                            </View>
                        )}
                    </Card>
                )}
            </ScrollView>
            {isEditing && isMyProfile && (
                <View style={styles.footer}>
                    <TouchableOpacity style={[styles.button, styles.saveButton, isSaveButtonDisabled && styles.buttonDisabled]} onPress={handleSave} disabled={isSaveButtonDisabled}>
                        {loading ? <ActivityIndicator color={theme.colors.white} /> : <Text style={styles.buttonText}>Enregistrer les modifications</Text>}
                    </TouchableOpacity>
                </View>
            )}
            <Modal visible={showFullSizeAvatar} transparent={true} animationType="fade" statusBarTranslucent onRequestClose={() => setShowFullSizeAvatar(false)}>
                <TouchableOpacity style={styles.fullSizeAvatarOverlay} activeOpacity={1} onPress={() => setShowFullSizeAvatar(false)}>
                    {avatarUrl ? <Image source={{ uri: avatarUrl }} style={styles.fullSizeAvatar} resizeMode="cover" /> : <Image source={require('../../assets/default-avatar.jpg')} style={styles.fullSizeAvatar} resizeMode="cover" />}
                </TouchableOpacity>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background.default },
    scrollView: { flex: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: theme.layout.screenPadding, marginTop: theme.spacing[4], marginBottom: theme.spacing[4], paddingTop: Platform.OS === 'android' ? theme.spacing[12] : 0 },
    headerActions: { flexDirection: 'row', alignItems: 'center' },
    title: { fontFamily: theme.typography.fontFamily.bold, fontSize: theme.typography.fontSize['4xl'], color: theme.colors.text.primary },
    scrollContentContainer: { flexGrow: 1, paddingHorizontal: theme.layout.containerPadding, paddingBottom: theme.spacing[6] },
    avatarContainerEditable: { alignSelf: 'center', marginBottom: theme.spacing[2], position: 'relative' },
    avatar: { width: 120, height: 120, borderRadius: 60, borderWidth: 3, borderColor: theme.colors.primary[200] },
    changePhotoButton: { alignSelf: 'center' },
    changePhotoButtonText: { fontFamily: theme.typography.fontFamily.medium, fontSize: theme.typography.fontSize.base, color: theme.colors.primary[500], fontWeight: theme.typography.fontWeight.medium },
    profileSummary: { flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing[4] },
    avatarContainerDisplay: { marginRight: theme.spacing[4] },
    avatarDisplay: { width: 80, height: 80, borderRadius: 40, borderWidth: 2, borderColor: theme.colors.primary[200] },
    profileTextContainer: { flex: 1 },
    usernameText: { fontFamily: theme.typography.fontFamily.bold, fontSize: theme.typography.fontSize['xl'], color: theme.colors.text.primary },
    fullNameText: { fontFamily: theme.typography.fontFamily.medium, fontSize: theme.typography.fontSize.base, color: theme.colors.text.secondary, marginTop: theme.spacing[1] },
    bioContainer: { paddingTop: theme.spacing[4], borderTopWidth: 1, borderTopColor: theme.colors.border.light },
    label: { fontFamily: theme.typography.fontFamily.regular, fontSize: theme.typography.fontSize.sm, color: theme.colors.text.secondary, marginBottom: theme.spacing[1] },
    info: { fontFamily: theme.typography.fontFamily.medium, fontSize: theme.typography.fontSize.base, color: theme.colors.text.primary, fontWeight: theme.typography.fontWeight.medium },
    formGroup: { marginBottom: theme.spacing[4] },
    input: { backgroundColor: theme.colors.background.paper, color: theme.colors.text.primary, height: INPUT_HEIGHT, borderWidth: 1, borderColor: theme.colors.border.main, borderRadius: theme.borderRadius.base, paddingHorizontal: theme.spacing[4], fontSize: theme.typography.fontSize.base },
    inputError: { borderColor: theme.colors.error.main },
    textArea: { height: 100, textAlignVertical: 'top', paddingTop: theme.spacing[3] },
    footer: { padding: theme.layout.containerPadding },
    button: { height: INPUT_HEIGHT, justifyContent: 'center', alignItems: 'center', borderRadius: theme.borderRadius.base, width: '100%', ...theme.shadows.base },
    saveButton: { backgroundColor: theme.colors.primary[500] },
    buttonDisabled: { backgroundColor: theme.colors.gray[400], ...theme.shadows.none },
    buttonText: { fontFamily: theme.typography.fontFamily.bold, fontSize: theme.typography.fontSize.base, color: theme.colors.text.inverse, fontWeight: theme.typography.fontWeight.bold },
    usernameStatusContainer: { marginTop: theme.spacing[2], alignItems: 'flex-start' },
    usernameStatusText: { fontFamily: theme.typography.fontFamily.medium, fontSize: theme.typography.fontSize.sm },
    usernameAvailable: { color: theme.colors.success.main },
    usernameUnavailable: { color: theme.colors.error.main },
    statsContainer: { marginTop: theme.spacing[4], paddingTop: theme.spacing[4], borderTopWidth: 1, borderTopColor: theme.colors.border.light },
    statsTitle: { fontFamily: theme.typography.fontFamily.bold, fontSize: theme.typography.fontSize.lg, color: theme.colors.text.primary, marginBottom: theme.spacing[3], textAlign: 'center' },
    chartTitle: { fontFamily: theme.typography.fontFamily.bold, fontSize: theme.typography.fontSize.lg, color: theme.colors.text.primary, textAlign: 'center' },
    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    statItemVisual: { width: '48%', backgroundColor: theme.colors.background.default, borderRadius: theme.borderRadius.md, padding: theme.spacing[2], marginBottom: theme.spacing[2], alignItems: 'center', borderWidth: 1, borderColor: theme.colors.border.light },
    statIcon: { marginBottom: theme.spacing[0] },
    statTextContainer: { alignItems: 'center' },
    statLabelVisual: { fontFamily: theme.typography.fontFamily.regular, fontSize: theme.typography.fontSize.sm, color: theme.colors.text.secondary, textAlign: 'center' },
    statValueVisual: { fontFamily: theme.typography.fontFamily.bold, fontSize: theme.typography.fontSize.base, color: theme.colors.text.primary, fontWeight: theme.typography.fontWeight.bold, textAlign: 'center' },
    fullSizeAvatarOverlay: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' },
    fullSizeAvatar: { width: screenWidth * 0.8, height: screenWidth * 0.8, borderRadius: (screenWidth * 0.8) / 2, borderWidth: 3, borderColor: theme.colors.white },
    legendContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: theme.spacing[2] },
    legendText: { fontFamily: theme.typography.fontFamily.regular, fontSize: theme.typography.fontSize.xs, color: theme.colors.text.secondary, marginHorizontal: theme.spacing[1] },
    legendBox: { width: 15, height: 15, marginHorizontal: 2 },
    yearSelectorContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: theme.spacing[2], marginBottom: theme.spacing[3] },
    chartLoader: { height: 220, justifyContent: 'center', alignItems: 'center' },
    infoLink: { marginTop: theme.spacing[3], alignItems: 'center' },
    infoLinkText: { fontSize: theme.typography.fontSize.sm, color: theme.colors.primary[500], textDecorationLine: 'underline' },
    mapContainer: {
        height: 300,
        marginTop: theme.spacing[4],
        borderRadius: theme.borderRadius.lg,
        overflow: 'hidden',
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    mapOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    mapOverlayText: {
        fontFamily: theme.typography.fontFamily.medium,
        fontSize: theme.typography.fontSize.base,
        color: theme.colors.text.secondary,
        textAlign: 'center',
        padding: theme.spacing[4],
    },
    recenterButton: {
        position: 'absolute',
        top: theme.spacing[2],
        right: theme.spacing[2],
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        padding: theme.spacing[1],
        borderRadius: 20,
        ...theme.shadows.base,
    },
});