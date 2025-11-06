import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, TextInput, ScrollView, Platform } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from 'react-native-screens/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { FishingSessionsService, FishingSession, FishingSessionUpdate } from '../../services';
import { theme } from '../../theme';
import { RootStackParamList } from '../../navigation/types';
import { useTimer, formatTime, useLocationTracking } from '../../hooks';
import MapView, { Polyline } from "react-native-maps";
import { calculateTotalDistance } from '../../lib/geolocation';

type ActiveSessionRouteProp = RouteProp<RootStackParamList, 'ActiveSession'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'ActiveSession'>;

type Visibility = 'public' | 'region' | 'private';
type WindStrength = 'calm' | 'light' | 'moderate' | 'strong';

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

const visibilityInfo = `
• Privé : Personne ne peut voir la localisation de votre session.\n
• Région : Seule la région (ex: "Haute-Savoie") est visible, pas le point GPS exact.\n
• Public : La localisation GPS exacte de votre session est visible par les autres utilisateurs.
`;

const INPUT_HEIGHT = 50;

export const ActiveSessionScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const routeParams = useRoute<ActiveSessionRouteProp>();
    const { sessionId } = routeParams.params;
    const mapViewRef = useRef<MapView>(null);

    const [session, setSession] = useState<FishingSession | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [userInteractingWithMap, setUserInteractingWithMap] = useState(false);

    const [locationName, setLocationName] = useState('');
    const [region, setRegion] = useState('');
    const [locationVisibility, setLocationVisibility] = useState<Visibility>('region');

    const { seconds, start, stop } = useTimer();
    const { route, stopLocationTracking, errorMsg, location } = useLocationTracking();

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
        if (location && mapViewRef.current && !userInteractingWithMap) {
            mapViewRef.current.animateCamera({ 
                center: location.coords,
                zoom: 16,
             });
        }
    }, [location, userInteractingWithMap]);

    const handleSaveChanges = async () => {
        setIsSaving(true);
        const updates: FishingSessionUpdate = { location_name: locationName, region, location_visibility: locationVisibility };
        try {
            await FishingSessionsService.updateSession(sessionId, updates);
            Alert.alert('Succès', 'Les informations ont été mises à jour.');
        } catch (error) {
            console.error('Erreur sauvegarde session:', error);
            Alert.alert('Erreur', 'Impossible de sauvegarder.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleEndSession = () => {
        if (!session?.started_at) return;

        Alert.alert('Terminer la session', 'Êtes-vous sûr ?', [
            { text: 'Annuler', style: 'cancel' },
            {
                text: 'Terminer',
                style: 'destructive',
                onPress: async () => {
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
                    }
                },
            },
        ]);
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

    return (
        <ScrollView 
            style={styles.scrollContainer} 
            contentContainerStyle={styles.container}
            keyboardShouldPersistTaps="handled"
        >
            <View style={styles.timerContainer}>
                <Text style={styles.timerText}>{formatTime(seconds)}</Text>
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

            <View style={styles.formGroup}>
                <Text style={styles.label}>Nom du Spot</Text>
                <TextInput style={styles.input} value={locationName} onChangeText={setLocationName} placeholder="Ex: Ponton du lac" placeholderTextColor={theme.colors.text.disabled} />
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.label}>Région / Ville</Text>
                <TextInput style={styles.input} value={region} onChangeText={setRegion} placeholder="Ex: Annecy, Haute-Savoie" placeholderTextColor={theme.colors.text.disabled} />
            </View>

            <View style={styles.formGroup}>
                <View style={styles.labelContainer}>
                    <Text style={styles.label}>Visibilité de la localisation</Text>
                    <TouchableOpacity onPress={() => Alert.alert('Niveaux de visibilité', visibilityInfo)}>
                        <Ionicons name="information-circle-outline" size={theme.iconSizes.sm} color={theme.colors.primary[500]} />
                    </TouchableOpacity>
                </View>
                <View style={styles.visibilitySelector}>
                    {visibilityOptions.map(opt => (
                        <TouchableOpacity
                            key={opt.key}
                            style={[styles.visibilityOption, locationVisibility === opt.key && styles.visibilityOptionSelected]}
                            onPress={() => setLocationVisibility(opt.key)}
                        >
                            <Text style={[styles.visibilityText, locationVisibility === opt.key && styles.visibilityTextSelected]}>{opt.label}</Text>
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
                >
                    {route.length > 1 && (
                        <Polyline
                            coordinates={route}
                            strokeColor={theme.colors.primary[500]}
                            strokeWidth={4}
                        />
                    )}
                </MapView>
                {Platform.OS === 'ios' && (
                    <TouchableOpacity style={styles.recenterButton} onPress={recenterMap}>
                        <Ionicons name="locate-outline" size={theme.iconSizes.xs} color={theme.colors.text.primary} />
                    </TouchableOpacity>
                )}
            </View>

            <View style={{width: '100%', marginTop: theme.spacing[4]}}>
                <TouchableOpacity style={[styles.button, styles.saveButton, isSaving && styles.buttonDisabled]} onPress={handleSaveChanges} disabled={isSaving}>
                    {isSaving ? <ActivityIndicator color={theme.colors.white} /> : <Text style={styles.buttonText}>Enregistrer</Text>}
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
        justifyContent: 'center', 
        padding: theme.layout.containerPadding 
    },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background.default },
    timerContainer: {
        paddingVertical: theme.spacing[4],
        paddingHorizontal: theme.spacing[6],
        backgroundColor: theme.colors.primary[50],
        borderRadius: theme.borderRadius.lg,
        borderWidth: 1,
        borderColor: theme.colors.primary[200],
        marginBottom: theme.spacing[4],
        alignSelf: 'center',
    },
    timerText: {
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: theme.typography.fontSize['4xl'],
        color: theme.colors.primary[700],
        textAlign: 'center',
    },
    weatherContainer: {
        alignItems: 'center',
        marginBottom: theme.spacing[8],
        padding: theme.spacing[4],
        backgroundColor: theme.colors.background.paper,
        borderRadius: theme.borderRadius.md,
        borderWidth: 1,
        borderColor: theme.colors.border.light,
    },
    weatherRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    weatherTemp: {
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: theme.typography.fontSize['3xl'],
        color: theme.colors.text.primary,
        marginRight: theme.spacing[3],
    },
    weatherConditions: {
        fontFamily: theme.typography.fontFamily.regular,
        fontSize: theme.typography.fontSize.lg,
        color: theme.colors.text.secondary,
    },
    windInfo: {
        fontFamily: theme.typography.fontFamily.regular,
        fontSize: theme.typography.fontSize.base,
        color: theme.colors.text.secondary,
        marginTop: theme.spacing[2],
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
    visibilitySelector: {
        flexDirection: 'row',
        width: '100%',
        backgroundColor: theme.colors.gray[100],
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing[1],
    },
    visibilityOption: { flex: 1, paddingVertical: theme.spacing[2], borderRadius: theme.borderRadius.base, alignItems: 'center' },
    visibilityOptionSelected: {
        backgroundColor: theme.colors.white,
        ...theme.shadows.sm,
    },
    visibilityText: {
        fontFamily: theme.typography.fontFamily.medium,
        fontSize: theme.typography.fontSize.sm,
        color: theme.colors.text.secondary,
        fontWeight: theme.typography.fontWeight.medium,
    },
    visibilityTextSelected: { color: theme.colors.primary[600] },
    button: {
        height: INPUT_HEIGHT,
        justifyContent: 'center',
        borderRadius: theme.borderRadius.base,
        alignItems: 'center',
        width: '100%',
        marginBottom: theme.spacing[3],
        ...theme.shadows.base,
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
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    recenterButton: {
        position: 'absolute',
        top: theme.spacing[2],
        right: theme.spacing[2],
        backgroundColor: theme.colors.white,
        borderRadius: theme.borderRadius.full,
        padding: theme.spacing[2],
        ...theme.shadows.md,
    },
});
