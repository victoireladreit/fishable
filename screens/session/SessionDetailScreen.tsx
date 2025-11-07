import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, Alert, ScrollView, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { theme } from '../../theme';
import { FishingSessionsService, FishingSession, FishingSessionUpdate } from '../../services';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../navigation/types';
import MapView, { Polyline, Region, Marker } from 'react-native-maps';

const INPUT_HEIGHT = 50;
type SessionDetailRouteProp = RouteProp<RootStackParamList, 'SessionDetail'>;

type WaterClarity = 'clear' | 'slightly_murky' | 'murky' | 'very_murky';
type WaterCurrent = 'none' | 'light' | 'moderate' | 'strong';
type WindStrength = 'calm' | 'light' | 'moderate' | 'strong';
type WaterLevel = 'low' | 'normal' | 'high';
type LocationVisibility = 'public' | 'region' | 'private';

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

const windStrengthOptions: { key: WindStrength; label: string }[] = [
    { key: 'calm', label: 'Calme' },
    { key: 'light', label: 'Léger' },
    { key: 'moderate', label: 'Modéré' },
    { key: 'strong', label: 'Fort' },
];

const waterLevelOptions: { key: WaterLevel; label: string }[] = [
    { key: 'low', label: 'Bas' },
    { key: 'normal', label: 'Normal' },
    { key: 'high', label: 'Haut' },
];

const locationVisibilityOptions: { key: LocationVisibility; label: string }[] = [
    { key: 'private', label: 'Privé' },
    { key: 'region', label: 'Région' },
    { key: 'public', label: 'Public' },
];

const locationVisibilityInfo = `
• Privé : Personne ne peut voir la localisation de votre session.\n
• Région : Seule la région (ex: "Haute-Savoie") est visible, pas le point GPS exact.\n
• Public : La localisation GPS exacte de votre session est visible par les autres utilisateurs.
`;

const formatDuration = (totalMinutes: number | null) => {
    if (totalMinutes === null || totalMinutes < 0) return null;
    if (totalMinutes < 60) {
        return `${totalMinutes}min`;
    }
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${minutes > 0 ? `${minutes}min` : ''}`.trim();
};

export const SessionDetailScreen = () => {
    const route = useRoute<SessionDetailRouteProp>();
    const navigation = useNavigation();
    const { sessionId, onGoBack } = route.params;
    const mapViewRef = useRef<MapView>(null);

    const [session, setSession] = useState<FishingSession | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [mapRegion, setMapRegion] = useState<Region | undefined>(undefined);
    const [mapInteractionEnabled, setMapInteractionEnabled] = useState(false);


    // États pour les champs modifiables
    const [locationName, setLocationName] = useState('');
    const [region, setRegion] = useState('');
    const [caption, setCaption] = useState('');
    const [weatherTemp, setWeatherTemp] = useState<string>(''); // Stocké en string pour TextInput
    const [weatherConditions, setWeatherConditions] = useState('');
    const [waterClarity, setWaterClarity] = useState<WaterClarity | null>(null);
    const [waterCurrent, setWaterCurrent] = useState<WaterCurrent | null>(null);
    const [windStrength, setWindStrength] = useState<WindStrength | null>(null);
    const [waterLevel, setWaterLevel] = useState<WaterLevel | null>(null);
    const [isPublished, setIsPublished] = useState(false);
    const [locationVisibility, setLocationVisibility] = useState<LocationVisibility>('private');

    const loadSession = useCallback(async () => {
        try {
            const fetchedSession = await FishingSessionsService.getSessionById(sessionId);
            if (fetchedSession) {
                setSession(fetchedSession);
                setLocationName(fetchedSession.location_name || '');
                setRegion(fetchedSession.region || '');
                setCaption(fetchedSession.caption || '');
                setWeatherTemp(fetchedSession.weather_temp?.toString() || '');
                setWeatherConditions(fetchedSession.weather_conditions || '');
                setWaterClarity(fetchedSession.water_clarity || null);
                setWaterCurrent(fetchedSession.water_current || null);
                setWindStrength(fetchedSession.wind_strength || null);
                setWaterLevel(fetchedSession.water_level || null);
                setIsPublished(fetchedSession.is_published || false);
                setLocationVisibility(fetchedSession.location_visibility || 'private');
            }
        } catch (error) {
            console.error("Erreur chargement session:", error);
            Alert.alert("Erreur", "Impossible de charger les détails de la session.");
        } finally {
            setLoading(false);
        }
    }, [sessionId]);

    useEffect(() => {
        loadSession();
    }, [loadSession]);

    const sessionRoute = session?.route ? (session.route as unknown as { latitude: number; longitude: number }[]) : [];

    useEffect(() => {
        if (sessionRoute && sessionRoute.length > 1) {
            const latitudes = sessionRoute.map(p => p.latitude);
            const longitudes = sessionRoute.map(p => p.longitude);

            const minLat = Math.min(...latitudes);
            const maxLat = Math.max(...latitudes);
            const minLng = Math.min(...longitudes);
            const maxLng = Math.max(...longitudes);

            const midLat = (minLat + maxLat) / 2;
            const midLng = (minLng + maxLng) / 2;

            const deltaLat = (maxLat - minLat) * 1.4; // Add padding
            const deltaLng = (maxLng - minLng) * 1.4; // Add padding

            setMapRegion({
                latitude: midLat,
                longitude: midLng,
                latitudeDelta: deltaLat > 0 ? deltaLat : 0.02,
                longitudeDelta: deltaLng > 0 ? deltaLng : 0.02,
            });
        } else if (session?.location_lat && session?.location_lng) {
            setMapRegion({
                latitude: session.location_lat,
                longitude: session.location_lng,
                latitudeDelta: 0.02,
                longitudeDelta: 0.02,
            });
        } else {
            setMapRegion(undefined);
        }
    }, [session, sessionRoute]);


    const handleSave = async () => {
        setLoading(true);
        const updates: FishingSessionUpdate = {
            location_name: locationName,
            region: region,
            caption: caption,
            weather_temp: weatherTemp ? parseFloat(weatherTemp) : null,
            weather_conditions: weatherConditions,
            water_clarity: waterClarity,
            water_current: waterCurrent,
            wind_strength: windStrength,
            water_level: waterLevel,
            is_published: isPublished,
            location_visibility: locationVisibility,
        };
        try {
            await FishingSessionsService.updateSession(sessionId, updates);
            await loadSession();
            setIsEditing(false);
            Alert.alert("Succès", "La session a été mise à jour.");
            if (onGoBack) onGoBack(true); // Signaler la modification
        } catch (error) {
            Alert.alert("Erreur", "Impossible de sauvegarder les modifications.");
        } finally {
            setLoading(false);
        }
    };

    const recenterMap = () => {
        if (mapViewRef.current && mapRegion) {
            mapViewRef.current.animateToRegion(mapRegion, 500);
        }
    };

    useEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <TouchableOpacity onPress={() => isEditing ? handleSave() : setIsEditing(true)} disabled={loading}>
                    <Ionicons name={isEditing ? "save-outline" : "create-outline"} size={theme.iconSizes.lg} color={theme.colors.primary[500]} />
                </TouchableOpacity>
            ),
            headerLeft: () => (
                isEditing ? (
                    <TouchableOpacity onPress={() => { 
                        setIsEditing(false); 
                        loadSession();
                        if (onGoBack) onGoBack(false); // Signaler qu'aucune modification n'a été enregistrée
                    }}>
                        <Ionicons name={"close-outline"} size={theme.iconSizes.lg} color={theme.colors.error.main} />
                    </TouchableOpacity>
                ) : undefined
            ),
        });
    }, [navigation, isEditing, loading, locationName, region, caption, weatherTemp, weatherConditions, waterClarity, waterCurrent, windStrength, waterLevel, isPublished, locationVisibility, loadSession, handleSave, onGoBack]);

    if (loading) {
        return <View style={styles.center}><ActivityIndicator size="large" color={theme.colors.primary[500]} /></View>;
    }

    if (!session) {
        return <View style={styles.center}><Text>Session introuvable.</Text></View>;
    }

    const formattedDuration = formatDuration(session.duration_minutes);

    return (
        <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
            <ScrollView 
                contentContainerStyle={styles.scrollContentContainer}
                scrollEnabled={!mapInteractionEnabled}
            >
                {isEditing ? (
                    <>
                        <TextInput
                            style={styles.titleInput}
                            value={locationName}
                            onChangeText={setLocationName}
                            placeholder="Nom du spot"
                            placeholderTextColor={theme.colors.text.disabled}
                        />
                        {session.region && <Text style={styles.regionText}>{session.region}</Text>}
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Légende / Notes</Text>
                            <TextInput style={[styles.input, styles.textArea]} value={caption} onChangeText={setCaption} multiline placeholder="Ajoutez une description..." placeholderTextColor={theme.colors.text.disabled} />
                        </View>

                        {/* Sélecteur Clarté de l'eau */}
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Clarté de l'eau</Text>
                            <View style={styles.selectorContainer}>
                                {waterClarityOptions.map(opt => (
                                    <TouchableOpacity key={opt.key} style={[styles.selectorOption, waterClarity === opt.key && styles.selectorOptionSelected]} onPress={() => setWaterClarity(prev => prev === opt.key ? null : opt.key)}>
                                        <Text style={[styles.selectorText, waterClarity === opt.key && styles.selectorTextSelected]}>{opt.label}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Sélecteur Courant de l'eau */}
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Courant de l'eau</Text>
                            <View style={styles.selectorContainer}>
                                {waterCurrentOptions.map(opt => (
                                    <TouchableOpacity key={opt.key} style={[styles.selectorOption, waterCurrent === opt.key && styles.selectorOptionSelected]} onPress={() => setWaterCurrent(prev => prev === opt.key ? null : opt.key)}>
                                        <Text style={[styles.selectorText, waterCurrent === opt.key && styles.selectorTextSelected]}>{opt.label}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Sélecteur Niveau d'eau */}
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Niveau d'eau</Text>
                            <View style={styles.selectorContainer}>
                                {waterLevelOptions.map(opt => (
                                    <TouchableOpacity key={opt.key} style={[styles.selectorOption, waterLevel === opt.key && styles.selectorOptionSelected]} onPress={() => setWaterLevel(prev => prev === opt.key ? null : opt.key)}>
                                        <Text style={[styles.selectorText, waterLevel === opt.key && styles.selectorTextSelected]}>{opt.label}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Sélecteur Visibilité de la localisation */}
                        <View style={styles.formGroup}>
                            <View style={styles.labelContainer}>
                                <Text style={styles.label}>Visibilité de la localisation</Text>
                                <TouchableOpacity onPress={() => Alert.alert('Niveaux de visibilité', locationVisibilityInfo)}>
                                    <Ionicons name="information-circle-outline" size={theme.iconSizes.sm} color={theme.colors.primary[500]} />
                                </TouchableOpacity>
                            </View>
                            <View style={styles.selectorContainer}>
                                {locationVisibilityOptions.map(opt => (
                                    <TouchableOpacity key={opt.key} style={[styles.selectorOption, locationVisibility === opt.key && styles.selectorOptionSelected]} onPress={() => setLocationVisibility(opt.key)}>
                                        <Text style={[styles.selectorText, locationVisibility === opt.key && styles.selectorTextSelected]}>{opt.label}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Switch Publier la session */}
                        <View style={styles.switchGroup}>
                            <Text style={styles.label}>Publier la session</Text>
                            <Switch
                                trackColor={{ false: theme.colors.gray[400], true: theme.colors.primary[300] }}
                                thumbColor={isPublished ? theme.colors.primary[500] : theme.colors.gray[200]}
                                onValueChange={setIsPublished}
                                value={isPublished}
                            />
                        </View>
                    </>
                ) : (
                    <>
                        <Text style={styles.infoTitle}>{session.location_name || 'Session sans nom'}</Text>
                        {session.region && <Text style={styles.regionText}>{session.region}</Text>}
                        <Text style={styles.sessionDate}>Début: {new Date(session.started_at).toLocaleString('fr-FR')}</Text>
                        {session.ended_at && <Text style={styles.sessionDate}>Fin: {new Date(session.ended_at).toLocaleString('fr-FR')}</Text>}
                        <View style={styles.statsContainer}>
                            {formattedDuration && <Text style={styles.sessionDate}>Durée: {formattedDuration}</Text>}
                            <Text style={styles.sessionDate}>
                                Distance: {session.distance_km !== null ? `${session.distance_km.toFixed(2)} km` : '-'}
                            </Text>
                        </View>

                        <View style={styles.infoCard}>
                            <View style={styles.infoRow}><Text style={styles.infoLabel}>Température</Text><Text style={styles.infoValue}>{session.weather_temp ? `${session.weather_temp}°C` : '-'}</Text></View>
                            <View style={styles.infoRow}><Text style={styles.infoLabel}>Conditions météo</Text><Text style={styles.infoValue}>{session.weather_conditions || '-'}</Text></View>
                            <View style={styles.infoRow}><Text style={styles.infoLabel}>Vent</Text><Text style={styles.infoValue}>{`${windStrengthOptions.find(o => o.key === session.wind_strength)?.label || '-'}${session.wind_speed_kmh ? ` (${session.wind_speed_kmh} km/h)` : ''}`}</Text></View>
                            <View style={styles.infoRow}><Text style={styles.infoLabel}>Clarté de l'eau</Text><Text style={styles.infoValue}>{waterClarityOptions.find(o => o.key === session.water_clarity)?.label || '-'}</Text></View>
                            <View style={styles.infoRow}><Text style={styles.infoLabel}>Courant</Text><Text style={styles.infoValue}>{waterCurrentOptions.find(o => o.key === session.water_current)?.label || '-'}</Text></View>
                            <View style={styles.infoRow}><Text style={styles.infoLabel}>Niveau d'eau</Text><Text style={styles.infoValue}>{waterLevelOptions.find(o => o.key === session.water_level)?.label || '-'}</Text></View>
                            <View style={styles.infoRow}><Text style={styles.infoLabel}>Visibilité Loc.</Text><Text style={styles.infoValue}>{locationVisibilityOptions.find(o => o.key === session.location_visibility)?.label || '-'}</Text></View>
                            <View style={styles.infoRow}><Text style={styles.infoLabel}>Publiée</Text><Text style={styles.infoValue}>{session.is_published ? 'Oui' : 'Non'}</Text></View>

                            <Text style={styles.infoDate}>Créée le: {new Date(session.created_at!).toLocaleDateString('fr-FR')}</Text>
                            {session.updated_at && <Text style={styles.infoDate}>Mise à jour le: {new Date(session.updated_at!).toLocaleDateString('fr-FR')}</Text>}
                        </View>

                        <View style={styles.mapContainer}>
                            {mapRegion ? (
                                <>
                                    <MapView
                                        ref={mapViewRef}
                                        style={styles.map}
                                        initialRegion={mapRegion}
                                        showsCompass={true}
                                        scrollEnabled={mapInteractionEnabled}
                                        zoomEnabled={mapInteractionEnabled}
                                    >
                                        {sessionRoute && sessionRoute.length > 1 && (
                                            <>
                                                <Polyline
                                                    coordinates={sessionRoute}
                                                    strokeColor={theme.colors.primary[500]}
                                                    strokeWidth={4}
                                                />
                                                <Marker coordinate={sessionRoute[0]} title="Départ" anchor={{ x: 0.5, y: 0.5 }}>
                                                    <View style={styles.startMarker} />
                                                </Marker>
                                                <Marker coordinate={sessionRoute[sessionRoute.length - 1]} title="Arrivée" anchor={{ x: 0.5, y: 1 }}>
                                                    <View style={styles.calloutContainer}>
                                                        <View style={styles.calloutBubble}>
                                                            <Text style={styles.calloutText}>🏁</Text>
                                                        </View>
                                                        <View style={styles.calloutPointer} />
                                                    </View>
                                                </Marker>
                                            </>
                                        )}
                                    </MapView>
                                    <View style={styles.mapButtonsContainer}>
                                        <TouchableOpacity 
                                            style={styles.mapButton} 
                                            onPress={() => {
                                                if (mapInteractionEnabled) {
                                                    recenterMap();
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
                                </> 
                            ) : (
                                <View style={styles.mapFallback}>
                                    <Text style={styles.mapFallbackText}>Aucune donnée de parcours disponible.</Text>
                                </View>
                            )}
                        </View>
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: theme.colors.background.default },
    container: { flex: 1, backgroundColor: theme.colors.background.default },
    scrollContentContainer: { padding: theme.layout.containerPadding, paddingBottom: theme.spacing[10] },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    infoTitle: { fontFamily: theme.typography.fontFamily.bold, fontSize: theme.typography.fontSize['2xl'], color: theme.colors.text.primary, marginBottom: theme.spacing[1] },
    titleInput: {
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: theme.typography.fontSize['2xl'],
        color: theme.colors.text.primary,
        marginBottom: theme.spacing[1],
        backgroundColor: theme.colors.background.paper,
        borderWidth: 1,
        borderColor: theme.colors.border.main,
        borderRadius: theme.borderRadius.base,
        paddingHorizontal: theme.spacing[4],
        paddingVertical: theme.spacing[2],
    },
    regionText: { fontFamily: theme.typography.fontFamily.regular, fontSize: theme.typography.fontSize.lg, color: theme.colors.text.secondary, marginBottom: theme.spacing[4] },
    sessionDate: { fontFamily: theme.typography.fontFamily.regular, fontSize: theme.typography.fontSize.sm, color: theme.colors.text.secondary, marginBottom: theme.spacing[2] },
    statsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: theme.spacing[2] },
    infoCard: { backgroundColor: theme.colors.background.paper, borderRadius: theme.borderRadius.md, padding: theme.spacing[5], ...theme.shadows.sm, borderWidth: 1, borderColor: theme.colors.border.light, marginTop: theme.spacing[4] },
    infoText: { fontFamily: theme.typography.fontFamily.regular, fontSize: theme.typography.fontSize.base, color: theme.colors.text.primary, lineHeight: theme.typography.lineHeight.relaxed, marginBottom: theme.spacing[6] },
    infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: theme.spacing[2], borderBottomWidth: 1, borderBottomColor: theme.colors.border.light },
    infoLabel: { fontFamily: theme.typography.fontFamily.medium, fontSize: theme.typography.fontSize.base, color: theme.colors.text.secondary },
    infoValue: { fontFamily: theme.typography.fontFamily.regular, fontSize: theme.typography.fontSize.base, color: theme.colors.text.primary },
    infoDate: { fontFamily: theme.typography.fontFamily.regular, fontSize: theme.typography.fontSize.xs, color: theme.colors.text.disabled, marginTop: theme.spacing[2], textAlign: 'right' },
    formGroup: { marginBottom: theme.spacing[5] },
    labelContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing[3] },
    label: { fontFamily: theme.typography.fontFamily.medium, fontSize: theme.typography.fontSize.base, color: theme.colors.text.secondary, marginBottom: theme.spacing[3] },
    input: { backgroundColor: theme.colors.background.paper, color: theme.colors.text.primary, height: INPUT_HEIGHT, borderWidth: 1, borderColor: theme.colors.border.main, borderRadius: theme.borderRadius.base, paddingHorizontal: theme.spacing[4], fontSize: theme.typography.fontSize.base },
    textArea: { height: 120, textAlignVertical: 'top', paddingTop: theme.spacing[3] },
    selectorContainer: { flexDirection: 'row', width: '100%', backgroundColor: theme.colors.gray[100], borderRadius: theme.borderRadius.md, padding: theme.spacing[1] },
    selectorOption: { flex: 1, paddingVertical: theme.spacing[2], borderRadius: theme.borderRadius.base, alignItems: 'center' },
    selectorOptionSelected: { backgroundColor: theme.colors.white, ...theme.shadows.sm },
    selectorText: { fontFamily: theme.typography.fontFamily.medium, fontSize: theme.typography.fontSize.sm, color: theme.colors.text.secondary, fontWeight: theme.typography.fontWeight.medium },
    selectorTextSelected: { color: theme.colors.primary[600] },
    switchGroup: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing[5], paddingVertical: theme.spacing[2] },
    mapContainer: {
        position: 'relative',
        height: 300,
        borderRadius: theme.borderRadius.lg,
        overflow: 'hidden',
        marginTop: theme.spacing[6],
        ...theme.shadows.sm,
        borderWidth: 1,
        borderColor: theme.colors.border.light,
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    mapFallback: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.gray[100],
    },
    mapFallbackText: {
        fontFamily: theme.typography.fontFamily.regular,
        fontSize: theme.typography.fontSize.base,
        color: theme.colors.text.secondary,
    },
    startMarker: {
        height: 14,
        width: 14,
        borderRadius: 7,
        backgroundColor: theme.colors.success.main,
        borderColor: theme.colors.white,
        borderWidth: 2,
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
    calloutContainer: {
        alignItems: 'center',
    },
    calloutBubble: {
        padding: theme.spacing[2],
        backgroundColor: theme.colors.white,
        borderRadius: theme.borderRadius.md,
        ...theme.shadows.sm,
        borderWidth: 1,
        borderColor: theme.colors.border.light,
    },
    calloutText: {
        fontSize: theme.typography.fontSize.xl,
    },
    calloutPointer: {
        width: 0,
        height: 0,
        backgroundColor: 'transparent',
        borderStyle: 'solid',
        borderLeftWidth: 8,
        borderRightWidth: 8,
        borderTopWidth: 10,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderTopColor: theme.colors.border.light,
        alignSelf: 'center',
        marginTop: -1.5,
    },
});
