import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, TextInput, ScrollView, Platform, Image, Modal, Animated } from 'react-native';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from 'react-native-screens/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { FishingSessionsService, FishingSession, FishingSessionUpdate, CatchesService } from '../../services';
import { theme } from '../../theme';
import { useTimer, formatTime, useLocationTracking } from '../../hooks';
import MapView, { Polyline } from "react-native-maps";
import { calculateTotalDistance } from '../../lib/geolocation';
import { RootStackParamList } from "../../navigation/types";
import { Database } from '../../lib/types';
import { Swipeable } from 'react-native-gesture-handler';

type ActiveSessionRouteProp = RouteProp<RootStackParamList, 'ActiveSession'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'ActiveSession'>;

type Catch = Database['public']['Tables']['catches']['Row'];
type Visibility = 'public' | 'region' | 'private';
type WindStrength = 'calm' | 'light' | 'moderate' | 'strong';
type WaterClarity = 'clear' | 'slightly_murky' | 'murky' | 'very_murky';
type WaterCurrent = 'none' | 'light' | 'moderate' | 'strong';
type WaterLevel = 'low' | 'normal' | 'high';

const visibilityOptions: { key: Visibility; label: string }[] = [
    { key: 'private', label: 'Privé' },
    { key: 'region', label: 'Région' },
    { key: 'public', label: 'Public' },
];

const windStrengthOptions: { key: WindStrength; label: string }[] = [
    { key: 'calm', label: 'Calme' },
    { key: 'light', label: 'Léger' },
    { key: 'moderate', label: 'Modéré' },
    { key: 'strong', label: 'Fort' },
];

const waterClarityOptions: { key: WaterClarity; label: string }[] = [
    { key: 'clear', label: 'Clair' },
    { key: 'slightly_murky', label: 'Peu trouble' },
    { key: 'murky', label: 'Trouble' },
    { key: 'very_murky', label: 'Très trouble' },
];

const waterCurrentOptions: { key: WaterCurrent; label: string }[] = [
    { key: 'none', label: 'Nul' },
    { key: 'light', label: 'Léger' },
    { key: 'moderate', label: 'Modéré' },
    { key: 'strong', label: 'Fort' },
];

const waterLevelOptions: { key: WaterLevel; label: string }[] = [
    { key: 'low', label: 'Bas' },
    { key: 'normal', label: 'Normal' },
    { key: 'high', label: 'Haut' },
];

const visibilityInfo = `
• Privé : Personne ne peut voir la localisation de votre session.\n
• Région : Seule la région (ex: "Haute-Savoie") est visible, pas le point GPS exact.\n
• Public : La localisation GPS exacte de votre session est visible par les autres utilisateurs.
`;

const INPUT_HEIGHT = 50;

const renderRightActions = (progress: Animated.AnimatedInterpolation<number>, dragX: Animated.AnimatedInterpolation<number>, onPress: () => void) => {
    const trans = dragX.interpolate({
        inputRange: [-80, 0],
        outputRange: [0, 80],
        extrapolate: 'clamp',
    });
    return (
        <TouchableOpacity onPress={onPress} style={styles.deleteButtonContainer}>
            <Animated.View style={[styles.deleteButton, { transform: [{ translateX: trans }] }]}>
                <Ionicons name="trash-outline" size={theme.iconSizes.lg} color={theme.colors.error.main} />
            </Animated.View>
        </TouchableOpacity>
    );
};

export const ActiveSessionScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const routeParams = useRoute<ActiveSessionRouteProp>();
    const { sessionId } = routeParams.params;
    const mapViewRef = useRef<MapView>(null);

    const [session, setSession] = useState<FishingSession | null>(null);
    const [catches, setCatches] = useState<Catch[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [userInteractingWithMap, setUserInteractingWithMap] = useState(false);
    const [mapInteractionEnabled, setMapInteractionEnabled] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    // Editable fields
    const [locationName, setLocationName] = useState('');
    const [region, setRegion] = useState('');
    const [locationVisibility, setLocationVisibility] = useState<Visibility>('region');
    const [waterClarity, setWaterClarity] = useState<WaterClarity | null>(null);
    const [waterCurrent, setWaterCurrent] = useState<WaterCurrent | null>(null);
    const [waterLevel, setWaterLevel] = useState<WaterLevel | null>(null);

    const { seconds, start, stop } = useTimer();
    const { route, stopLocationTracking, errorMsg, location } = useLocationTracking();

    const hasUnsavedChanges = session?.location_name !== locationName ||
        session?.location_visibility !== locationVisibility ||
        session?.water_clarity !== waterClarity ||
        session?.water_current !== waterCurrent ||
        session?.water_level !== waterLevel;

    useFocusEffect(
        useCallback(() => {
            const fetchCatches = async () => {
                try {
                    const sessionCatches = await CatchesService.getCatchesBySession(sessionId);
                    setCatches(sessionCatches);
                } catch (error) {
                    console.error('Erreur récupération des prises:', error);
                }
            };
            fetchCatches();
        }, [sessionId])
    );

    useEffect(() => {
        if (errorMsg) {
            Alert.alert('Erreur de localisation', errorMsg);
        }
    }, [errorMsg]);

    useEffect(() => {
        let isActive = true;
        const fetchSession = async () => {
            try {
                const fetchedSession = await FishingSessionsService.getSessionById(sessionId);
                if (isActive) {
                    if (fetchedSession) {
                        setSession(fetchedSession);
                        setLocationName(fetchedSession.location_name || '');
                        setRegion(fetchedSession.region || '');
                        setLocationVisibility(fetchedSession.location_visibility || 'region');
                        setWaterClarity(fetchedSession.water_clarity || null);
                        setWaterCurrent(fetchedSession.water_current || null);
                        setWaterLevel(fetchedSession.water_level || null);
                    } else {
                        Alert.alert('Erreur', 'Session invalide ou introuvable.');
                        navigation.goBack();
                    }
                }
            } catch (error) {
                if (isActive) console.error('Erreur chargement session:', error);
            } finally {
                if (isActive) setLoading(false);
            }
        };
        fetchSession();
        return () => { isActive = false; };
    }, [sessionId, navigation]);

    useEffect(() => {
        if (session && session.started_at) {
            const initialSeconds = Math.floor((Date.now() - new Date(session.started_at).getTime()) / 1000);
            start(initialSeconds);
        }
        return () => stop();
    }, [session, start, stop]);

    useEffect(() => {
        if (location && mapViewRef.current && !userInteractingWithMap && !mapInteractionEnabled) {
            mapViewRef.current.animateCamera({ 
                center: location.coords,
                zoom: 16,
             });
        }
    }, [location, userInteractingWithMap, mapInteractionEnabled]);

    const handleSaveChanges = async () => {
        setIsSaving(true);
        const updates: FishingSessionUpdate = { 
            location_name: locationName, 
            location_visibility: locationVisibility,
            water_clarity: waterClarity,
            water_current: waterCurrent,
            water_level: waterLevel,
        };
        try {
            await FishingSessionsService.updateSession(sessionId, updates);
            setSession(prev => prev ? { ...prev, ...updates } : null);
            Alert.alert('Succès', 'Les informations ont été mises à jour.');
            return true;
        } catch (error) {
            console.error('Erreur sauvegarde session:', error);
            Alert.alert('Erreur', 'Impossible de sauvegarder.');
            return false;
        } finally {
            setIsSaving(false);
        }
    };

    const proceedToEndSession = async () => {
        if (!session?.started_at) return;

        stop();
        stopLocationTracking();

        const startTime = new Date(session.started_at).getTime();
        const endTime = Date.now();
        const durationMinutes = Math.round((endTime - startTime) / (1000 * 60));
        const distanceKm = calculateTotalDistance(route);

        try {
            await FishingSessionsService.updateSession(sessionId, { 
                status: 'completed', 
                ended_at: new Date(endTime).toISOString(),
                duration_minutes: durationMinutes,
                route: route as any,
                distance_km: distanceKm,
            });
            navigation.popToTop();
        } catch (error) {
            console.error('Erreur fin de session:', error);
            Alert.alert('Erreur', 'Une erreur est survenue lors de la finalisation de la session.');
        }
    };

    const handleEndSession = () => {
        if (hasUnsavedChanges) {
            Alert.alert(
                'Changements non enregistrés',
                'Voulez-vous enregistrer vos modifications avant de terminer ?',
                [
                    {
                        text: 'Annuler',
                        style: 'cancel',
                    },
                    {
                        text: 'Terminer sans enregistrer',
                        style: 'destructive',
                        onPress: proceedToEndSession,
                    },
                    {
                        text: 'Enregistrer et Terminer',
                        onPress: async () => {
                            const success = await handleSaveChanges();
                            if (success) {
                                proceedToEndSession();
                            }
                        },
                    },
                ]
            );
        } else {
            Alert.alert('Terminer la session', 'Êtes-vous sûr ?', [
                { text: 'Annuler', style: 'cancel' },
                {
                    text: 'Terminer',
                    style: 'destructive',
                    onPress: proceedToEndSession,
                },
            ]);
        }
    };

    const handleAddCatch = () => {
        navigation.navigate('AddCatch', { sessionId });
    };

    const handleEditCatch = (catchId: string) => {
        navigation.navigate('EditCatch', { catchId });
    };

    const handleDeleteCatch = (catchId: string) => {
        Alert.alert(
            "Supprimer la prise",
            "Êtes-vous sûr de vouloir supprimer cette prise ?",
            [
                { text: "Annuler", style: "cancel" },
                {
                    text: "Supprimer",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await CatchesService.deleteCatch(catchId);
                            setCatches(prevCatches => prevCatches.filter(c => c.id !== catchId));
                        } catch (error) {
                            console.error("Erreur suppression de la prise:", error);
                            Alert.alert("Erreur", "Impossible de supprimer la prise.");
                        }
                    },
                },
            ]
        );
    };

    const openImageModal = (imageUrl: string) => {
        setSelectedImage(imageUrl);
        setModalVisible(true);
    };

    const recenterMap = () => {
        if (!mapViewRef.current) return;

        if (route && route.length > 1) {
            const latitudes = route.map(p => p.latitude);
            const longitudes = route.map(p => p.longitude);
            const minLat = Math.min(...latitudes);
            const maxLat = Math.max(...latitudes);
            const minLng = Math.min(...longitudes);
            const maxLng = Math.max(...longitudes);

            const region = {
                latitude: (minLat + maxLat) / 2,
                longitude: (minLng + maxLng) / 2,
                latitudeDelta: (maxLat - minLat) * 1.5,
                longitudeDelta: (maxLng - minLng) * 1.5,
            };
            mapViewRef.current.animateToRegion(region, 500);
        } else if (location) {
            mapViewRef.current.animateCamera({ center: location.coords, zoom: 16 });
        }
    };

    const renderCatchItem = (item: Catch) => (
        <View key={item.id} style={styles.catchItemWrapper}>
            <Swipeable renderRightActions={(progress, dragX) => renderRightActions(progress, dragX, () => handleDeleteCatch(item.id))}>
                <TouchableOpacity onPress={() => handleEditCatch(item.id)}>
                    <View style={styles.catchItem}>
                        {item.photo_url && (
                            <TouchableOpacity onPress={() => openImageModal(item.photo_url!)}>
                                <Image source={{ uri: item.photo_url }} style={styles.catchImage} />
                            </TouchableOpacity>
                        )}
                        <View style={styles.catchInfo}>
                            <Text style={styles.catchSpecies}>{item.species_name}</Text>
                            <View style={styles.catchDetails}>
                                {item.size_cm && <Text style={styles.catchDetailText}>{item.size_cm} cm</Text>}
                                {item.weight_kg && <Text style={styles.catchDetailText}>{item.weight_kg} kg</Text>}
                            </View>
                        </View>
                    </View>
                </TouchableOpacity>
            </Swipeable>
        </View>
    );

    if (loading || !session) {
        return <View style={styles.center}><ActivityIndicator size="large" color={theme.colors.primary[500]} /></View>;
    }

    const initialMapRegion = route.length > 0 ? {
        latitude: route[route.length - 1].latitude,
        longitude: route[route.length - 1].longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
    } : (session?.location_lat && session?.location_lng ? {
        latitude: session.location_lat,
        longitude: session.location_lng,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
    } : undefined);

    const windStrengthLabel = windStrengthOptions.find(opt => opt.key === session.wind_strength)?.label || '-';
    const currentDistance = calculateTotalDistance(route);

    return (
        <ScrollView 
            style={styles.scrollContainer} 
            contentContainerStyle={styles.container}
            keyboardShouldPersistTaps="handled"
            scrollEnabled={!mapInteractionEnabled}
        >
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
                        <Ionicons name="close" size={30} color={theme.colors.white} />
                    </TouchableOpacity>
                    <Image source={{ uri: selectedImage || '' }} style={styles.fullScreenImage} resizeMode="contain" />
                </View>
            </Modal>

            <View style={styles.headerContainer}>
                <TextInput
                    style={styles.titleInput}
                    value={locationName}
                    onChangeText={setLocationName}
                    placeholder="Nom du spot"
                    placeholderTextColor={theme.colors.text.disabled}
                />
                {region ? <Text style={styles.regionText}>{region}</Text> : null}
            </View>

            <View style={styles.topStatsContainer}>
                <View style={styles.timerAndDistanceContainer}>
                    <View style={styles.timerContainer}>
                        <Text style={styles.distanceLabel}>Temps</Text>
                        <Text style={styles.timerText}>{formatTime(seconds)}</Text>
                    </View>
                    <View style={styles.distanceContainer}>
                        <Text style={styles.distanceLabel}>Distance</Text>
                        <Text style={styles.distanceText}>{currentDistance.toFixed(2)} km</Text>
                    </View>
                </View>

                <View style={styles.weatherContainer}>
                    <View style={styles.weatherRow}>
                        <Text style={styles.weatherTemp}>{session.weather_temp ? `${Math.round(session.weather_temp)}°C` : '-'}</Text>
                    </View>
                    <Text style={styles.weatherConditions}>{`Temps ${session.weather_conditions}` || '-'}</Text>
                    <Text style={styles.windInfo}>
                        Vent: {windStrengthLabel} ({session.wind_speed_kmh ? `${session.wind_speed_kmh.toFixed(1)} km/h` : '-'})
                    </Text>
                </View>
            </View>

            <View style={styles.formGroup}>
                <View style={styles.labelContainer}>
                    <Text style={styles.label}>Visibilité de la localisation</Text>
                    <TouchableOpacity onPress={() => Alert.alert('Niveaux de visibilité', visibilityInfo)}>
                        <Ionicons name="information-circle-outline" size={theme.iconSizes.sm} color={theme.colors.primary[500]} />
                    </TouchableOpacity>
                </View>
                <View style={styles.selectorContainer}>
                    {visibilityOptions.map(opt => (
                        <TouchableOpacity
                            key={opt.key}
                            style={[styles.selectorOption, locationVisibility === opt.key && styles.selectorOptionSelected]}
                            onPress={() => setLocationVisibility(opt.key)}
                        >
                            <Text style={[styles.selectorText, locationVisibility === opt.key && styles.selectorTextSelected]}>{opt.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
            
            <View style={styles.mapContainer}>
                <MapView
                    ref={mapViewRef}
                    style={styles.map}
                    initialRegion={initialMapRegion}
                    showsUserLocation
                    onPanDrag={() => setUserInteractingWithMap(true)}
                    scrollEnabled={mapInteractionEnabled}
                    zoomEnabled={mapInteractionEnabled}
                >
                    {route.length > 1 && (
                        <Polyline
                            coordinates={route}
                            strokeColor={theme.colors.primary[500]}
                            strokeWidth={4}
                        />
                    )}
                </MapView>

                <View style={styles.mapButtonsContainer}>
                    <TouchableOpacity 
                        style={styles.mapButton} 
                        onPress={() => {
                            if (mapInteractionEnabled) {
                                recenterMap(); // Recenter map when locking it
                            }
                            setMapInteractionEnabled(prev => !prev);
                        }}
                    >
                        <Ionicons name={mapInteractionEnabled ? "lock-open-outline" : "lock-closed-outline"} size={theme.iconSizes.xs} color={theme.colors.text.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.mapButton} onPress={recenterMap}>
                        <Ionicons name="locate-outline" size={theme.iconSizes.xs} color={theme.colors.text.primary} />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.label}>Clarté de l'eau</Text>
                <View style={styles.selectorContainer}>
                    {waterClarityOptions.map(opt => (
                        <TouchableOpacity
                            key={opt.key}
                            style={[styles.selectorOption, waterClarity === opt.key && styles.selectorOptionSelected]}
                            onPress={() => setWaterClarity(prev => prev === opt.key ? null : opt.key)}
                        >
                            <Text style={[styles.selectorText, waterClarity === opt.key && styles.selectorTextSelected]}>{opt.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.label}>Courant de l'eau</Text>
                <View style={styles.selectorContainer}>
                    {waterCurrentOptions.map(opt => (
                        <TouchableOpacity
                            key={opt.key}
                            style={[styles.selectorOption, waterCurrent === opt.key && styles.selectorOptionSelected]}
                            onPress={() => setWaterCurrent(prev => prev === opt.key ? null : opt.key)}
                        >
                            <Text style={[styles.selectorText, waterCurrent === opt.key && styles.selectorTextSelected]}>{opt.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.label}>Niveau d'eau</Text>
                <View style={styles.selectorContainer}>
                    {waterLevelOptions.map(opt => (
                        <TouchableOpacity
                            key={opt.key}
                            style={[styles.selectorOption, waterLevel === opt.key && styles.selectorOptionSelected]}
                            onPress={() => setWaterLevel(prev => prev === opt.key ? null : opt.key)}
                        >
                            <Text style={[styles.selectorText, waterLevel === opt.key && styles.selectorTextSelected]}>{opt.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <View style={{width: '100%', marginTop: theme.spacing[4]}}>
                <TouchableOpacity style={[styles.button, styles.addCatchButton]} onPress={handleAddCatch}>
                    <Text style={styles.buttonText}>Ajouter une prise</Text>
                </TouchableOpacity>

                <View>
                    {catches.length > 0 ? (
                        <>
                            <Text style={styles.catchesTitle}>Prises ({catches.length})</Text>
                            {catches.map(item => renderCatchItem(item))}
                        </>
                    ) : (
                        <Text style={styles.noCatchesText}>Aucune prise pour le moment.</Text>
                    )}
                </View>

                <TouchableOpacity style={[styles.button, styles.saveButton, isSaving && styles.buttonDisabled, !hasUnsavedChanges && styles.buttonDisabled]} onPress={handleSaveChanges} disabled={isSaving || !hasUnsavedChanges}>
                    {isSaving ? <ActivityIndicator color={theme.colors.white} /> : <Text style={styles.buttonText}>Enregistrer les modifications</Text>}
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button, styles.endButton]} onPress={handleEndSession}>
                    <Text style={styles.buttonText}>Terminer la session</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    scrollContainer: { flex: 1, backgroundColor: theme.colors.background.default },
    container: { 
        flexGrow: 1, 
        alignItems: 'center',
        padding: theme.layout.containerPadding 
    },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background.default },
    headerContainer: {
        width: '100%',
        padding: theme.spacing[4],
        backgroundColor: theme.colors.background.paper,
        borderRadius: theme.borderRadius.lg,
        marginBottom: theme.spacing[6],
        ...theme.shadows.sm,
        borderWidth: 1,
        borderColor: theme.colors.border.light,
    },
    titleInput: {
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: theme.typography.fontSize['2xl'],
        color: theme.colors.text.primary,
        paddingBottom: theme.spacing[1],
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border.main,
    },
    regionText: {
        fontFamily: theme.typography.fontFamily.regular,
        fontSize: theme.typography.fontSize.lg,
        color: theme.colors.text.secondary,
        marginTop: theme.spacing[2],
    },
    topStatsContainer: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-between',
        alignItems: 'stretch',
        marginBottom: theme.spacing[6],
    },
    timerAndDistanceContainer: {
        flex: 2,
        flexDirection: 'column',
        borderRadius: theme.borderRadius.lg,
        borderWidth: 1,
        borderColor: theme.colors.primary[200],
        marginRight: theme.spacing[2],
        overflow: 'hidden',
    },
    timerContainer: {
        flex: 1,
        paddingVertical: theme.spacing[2],
        paddingHorizontal: theme.spacing[2],
        backgroundColor: theme.colors.primary[50],
        justifyContent: 'center',
        alignItems: 'center',
        borderBottomColor: theme.colors.primary[200],
    },
    timerText: {
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: theme.typography.fontSize.lg,
        color: theme.colors.primary[700],
        textAlign: 'center',
    },
    distanceContainer: {
        flex: 1,
        paddingVertical: theme.spacing[2],
        paddingHorizontal: theme.spacing[2],
        backgroundColor: theme.colors.primary[50],
        justifyContent: 'center',
        alignItems: 'center',
    },
    distanceLabel: {
        fontFamily: theme.typography.fontFamily.medium,
        fontSize: theme.typography.fontSize.sm,
        color: theme.colors.primary[600],
        marginBottom: theme.spacing[1],
    },
    distanceText: {
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: theme.typography.fontSize.lg,
        color: theme.colors.primary[700],
        textAlign: 'center',
    },
    weatherContainer: {
        flex: 2,
        alignItems: 'center',
        padding: theme.spacing[4],
        backgroundColor: theme.colors.background.paper,
        borderRadius: theme.borderRadius.lg,
        borderWidth: 1,
        borderColor: theme.colors.border.light,
        marginLeft: theme.spacing[2],
        justifyContent: 'center',
    },
    weatherRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    weatherTemp: {
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: theme.typography.fontSize['2xl'],
        color: theme.colors.text.primary,
    },
    weatherConditions: {
        fontFamily: theme.typography.fontFamily.regular,
        fontSize: theme.typography.fontSize.base,
        color: theme.colors.text.secondary,
        textAlign: 'center',
    },
    windInfo: {
        fontFamily: theme.typography.fontFamily.regular,
        fontSize: theme.typography.fontSize.sm,
        color: theme.colors.text.secondary,
        marginTop: theme.spacing[2],
        textAlign: 'center',
    },
    formGroup: { width: '100%', marginBottom: theme.spacing[5] },
    labelContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    label: {
        fontFamily: theme.typography.fontFamily.medium,
        fontSize: theme.typography.fontSize.base,
        color: theme.colors.text.secondary,
        fontWeight: theme.typography.fontWeight.medium,
        marginBottom: theme.spacing[3],
    },
    input: {
        backgroundColor: theme.colors.background.paper,
        color: theme.colors.text.primary,
        height: INPUT_HEIGHT,
        borderWidth: 1,
        borderColor: theme.colors.border.main,
        borderRadius: theme.borderRadius.base,
        paddingHorizontal: theme.spacing[4],
        fontSize: theme.typography.fontSize.base,
    },
    selectorContainer: {
        flexDirection: 'row',
        width: '100%',
        backgroundColor: theme.colors.gray[100],
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing[1],
    },
    selectorOption: { flex: 1, paddingVertical: theme.spacing[2], borderRadius: theme.borderRadius.base, alignItems: 'center' },
    selectorOptionSelected: {
        backgroundColor: theme.colors.white,
        ...theme.shadows.sm,
    },
    selectorText: {
        fontFamily: theme.typography.fontFamily.medium,
        fontSize: theme.typography.fontSize.sm,
        color: theme.colors.text.secondary,
        fontWeight: theme.typography.fontWeight.medium,
        textAlign: 'center',
    },
    selectorTextSelected: { color: theme.colors.primary[600] },
    button: {
        height: INPUT_HEIGHT,
        justifyContent: 'center',
        borderRadius: theme.borderRadius.base,
        alignItems: 'center',
        width: '100%',
        marginBottom: theme.spacing[3],
        ...theme.shadows.base,
    },
    addCatchButton: {
        backgroundColor: theme.colors.success.main,
    },
    saveButton: { backgroundColor: theme.colors.primary[500] },
    endButton: { backgroundColor: theme.colors.error.main, ...theme.shadows.none },
    buttonDisabled: { backgroundColor: theme.colors.primary[300] },
    buttonText: {
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: theme.typography.fontSize.base,
        color: theme.colors.text.inverse,
        fontWeight: theme.typography.fontWeight.bold,
    },
    mapContainer: {
        position: 'relative',
        width: '100%',
        height: 300,
        borderRadius: theme.borderRadius.lg,
        marginVertical: theme.spacing[4],
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: theme.colors.border.light,
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    mapButtonsContainer: {
        position: 'absolute',
        top: theme.spacing[2],
        right: theme.spacing[2],
        flexDirection: 'row',
        backgroundColor: theme.colors.white,
        borderRadius: theme.borderRadius.full,
        ...theme.shadows.md,
        padding: theme.spacing[1],
    },
    mapButton: {
        padding: theme.spacing[1],
    },
    catchesTitle: {
        fontSize: theme.typography.fontSize.lg,
        fontFamily: theme.typography.fontFamily.bold,
        color: theme.colors.text.primary,
        marginTop: theme.spacing[6],
        marginBottom: theme.spacing[3],
    },
    catchItemWrapper: {
        marginBottom: theme.spacing[3],
    },
    catchItem: {
        backgroundColor: theme.colors.background.paper,
        padding: theme.spacing[2],
        borderRadius: theme.borderRadius.md,
        flexDirection: 'row',
        alignItems: 'center',
    },
    catchImage: {
        width: 60,
        height: 60,
        borderRadius: theme.borderRadius.sm,
        marginRight: theme.spacing[4],
    },
    catchInfo: {
        flex: 1,
    },
    catchSpecies: {
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: theme.typography.fontSize.base,
        color: theme.colors.text.primary,
    },
    catchDetails: {
        flexDirection: 'row',
        marginTop: theme.spacing[1],
    },
    catchDetailText: {
        marginRight: theme.spacing[4],
        fontFamily: theme.typography.fontFamily.regular,
        fontSize: theme.typography.fontSize.sm,
        color: theme.colors.text.secondary,
    },
    noCatchesText: {
        textAlign: 'center',
        color: theme.colors.text.secondary,
        marginVertical: theme.spacing[4],
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.9)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    fullScreenImage: {
        width: '100%',
        height: '80%',
    },
    closeButton: {
        position: 'absolute',
        top: 50,
        right: 20,
        zIndex: 1,
    },
    deleteButtonContainer: {
        width: 80,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: theme.spacing[2],
    },
    deleteButton: {
        justifyContent: 'center',
        alignItems: 'center',
        width: 80,
        height: '100%',
        borderRadius: theme.borderRadius.md,
        borderColor: theme.colors.error.main,
    },
});
