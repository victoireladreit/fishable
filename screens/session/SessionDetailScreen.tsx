import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, Alert, ScrollView, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { theme } from '../../theme';
import {
    FishingSessionsService,
    FishingSessionUpdate,
    SpeciesService,
    TargetSpeciesService
} from '../../services';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../navigation/types';
import MapView, { Region, Marker } from 'react-native-maps';
import { NativeStackNavigationProp } from 'react-native-screens/native-stack';
import { useCatchManagement, useSession } from '../../hooks';
import { SessionForm } from '../../components/session/SessionForm';
import { CatchList } from '../../components/catch/CatchList';
import { SpeciesSelector } from '../../components/session/SpeciesSelector';
import { Card } from '../../components/common';
import { SessionMap } from '../../components/session/SessionMap';

const INPUT_HEIGHT = 50;
type SessionDetailRouteProp = RouteProp<RootStackParamList, 'SessionDetail'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'SessionDetail'>;

type WindStrength = 'calm' | 'light' | 'moderate' | 'strong';
type WaterLevel = 'normal' | 'high' | 'flood';
type LocationVisibility = 'public' | 'region' | 'private';

const windStrengthOptions: { key: WindStrength; label: string }[] = [
    { key: 'calm', label: 'Calme' },
    { key: 'light', label: 'Léger' },
    { key: 'moderate', label: 'Modéré' },
    { key: 'strong', label: 'Fort' },
];

const locationVisibilityOptions: { key: LocationVisibility; label: string }[] = [
    { key: 'private', label: 'Privé' },
    { key: 'region', label: 'Région' },
    { key: 'public', label: 'Public' },
];

const waterLevelOptions: { key: WaterLevel; label: string }[] = [
    { key: 'normal', label: 'Normal' },
    { key: 'high', label: 'Haut' },
    { key: 'flood', label: 'Crue' },
];

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
    const navigation = useNavigation<NavigationProp>();
    const { sessionId, onGoBack } = route.params;
    const mapViewRef = useRef<MapView>(null);

    const {
        session,
        catches,
        setCatches,
        targetSpecies,
        loading,
        isSaving,
        locationName,
        setLocationName,
        caption,
        setCaption,
        locationVisibility,
        setLocationVisibility,
        waterColor,
        setWaterColor,
        waterCurrent,
        setWaterCurrent,
        waterLevel,
        setWaterLevel,
        reload,
        saveChanges,
    } = useSession(sessionId);

    const [isEditing, setIsEditing] = useState(false);
    const [mapRegion, setMapRegion] = useState<Region | undefined>(undefined);
    const [mapInteractionEnabled, setMapInteractionEnabled] = useState(false);

    const [allSpecies, setAllSpecies] = useState<{ id: string; name: string }[]>([]);
    const [selectedTargetSpeciesNames, setSelectedTargetSpeciesNames] = useState<string[]>([]);

    // States for fields not in useSession
    const [weatherTemp, setWeatherTemp] = useState<string>('');
    const [weatherConditions, setWeatherConditions] = useState('');
    const [windStrength, setWindStrength] = useState<WindStrength | null>(null);
    const [isPublished, setIsPublished] = useState(false);

    // Use the custom hook for catch management
    const { handleAddCatch, handleEditCatch, handleDeleteCatch } = useCatchManagement(sessionId, setCatches);

    useEffect(() => {
        if (session) {
            setWeatherTemp(session.weather_temp?.toString() || '');
            setWeatherConditions(session.weather_conditions || '');
            setWindStrength(session.wind_strength || null);
            setIsPublished(session.is_published || false);
            setSelectedTargetSpeciesNames(targetSpecies);
        }
    }, [session, targetSpecies]);

    useEffect(() => {
        const fetchSpecies = async () => {
            try {
                const species = await SpeciesService.getAllSpecies();
                setAllSpecies(species);
            } catch (error) {
                console.error('Error fetching species:', error);
            }
        };

        fetchSpecies();
    }, []);

    const handleSelectSpecies = (species: { id: string; name: string }) => {
        if (!selectedTargetSpeciesNames.includes(species.name)) {
            setSelectedTargetSpeciesNames([...selectedTargetSpeciesNames, species.name]);
        }
    };

    const handleRemoveSpecies = (speciesToRemove: string) => {
        setSelectedTargetSpeciesNames(selectedTargetSpeciesNames.filter(s => s !== speciesToRemove));
    };

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
        const success = await saveChanges();
        if (success) {
            const updates: FishingSessionUpdate = {
                weather_temp: weatherTemp ? parseFloat(weatherTemp) : null,
                weather_conditions: weatherConditions,
                wind_strength: windStrength,
                is_published: isPublished,
            };
            try {
                await FishingSessionsService.updateSession(sessionId, updates);
                
                // Update target species
                await TargetSpeciesService.deleteTargetSpeciesBySessionId(sessionId);
                const targetSpeciesToInsert = selectedTargetSpeciesNames.map(name => ({ session_id: sessionId, species_name: name }));
                if (targetSpeciesToInsert.length > 0) await TargetSpeciesService.createTargetSpecies(targetSpeciesToInsert);

                await reload(); // Re-fetch all session data
                setIsEditing(false);
                Alert.alert("Succès", "La session a été mise à jour.");
                if (onGoBack) onGoBack(true);
            } catch (error) {
                Alert.alert("Erreur", "Impossible de sauvegarder les modifications supplémentaires.");
            }
        }
    };

    const recenterMap = () => {
        if (mapViewRef.current && mapRegion) {
            mapViewRef.current.animateToRegion(mapRegion, 500);
        }
    };

    useEffect(() => {
        navigation.setOptions({
            // @ts-ignore
            headerRight: () => (
                <TouchableOpacity onPress={() => isEditing ? handleSave() : setIsEditing(true)} disabled={loading || isSaving}>
                    <Ionicons name={isEditing ? "save-outline" : "create-outline"} size={theme.iconSizes.lg} color={theme.colors.primary[500]} />
                </TouchableOpacity>
            ),
            // @ts-ignore
            headerLeft: () => (
                isEditing ? (
                    <TouchableOpacity onPress={async () => { 
                        setIsEditing(false); 
                        await reload();
                        if (onGoBack) onGoBack(false);
                    }}>
                        <Ionicons name={"close-outline"} size={theme.iconSizes.lg} color={theme.colors.error.main} />
                    </TouchableOpacity>
                ) : undefined
            ),
        });
    }, [navigation, isEditing, loading, isSaving, handleSave, reload, onGoBack]);

    if (loading && !session) {
        return <View style={styles.center}><ActivityIndicator size="large" color={theme.colors.primary[500]} /></View>;
    }

    if (!session) {
        return <View style={styles.center}><Text>Session introuvable.</Text></View>;
    }

    const formattedDuration = formatDuration(session.duration_minutes);
    const hasRouteData = sessionRoute && sessionRoute.length > 1;

    return (
        <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
            <ScrollView 
                contentContainerStyle={styles.scrollContentContainer}
            >
                {isEditing ? (
                    <>
                        <TextInput
                            style={styles.titleInput}
                            value={locationName ?? ''}
                            onChangeText={setLocationName}
                            placeholder="Nom du spot"
                            placeholderTextColor={theme.colors.text.disabled}
                        />
                        {session.region && <Text style={styles.regionText}>{session.region}</Text>}
                        <SpeciesSelector
                            allSpecies={allSpecies}
                            selectedSpecies={selectedTargetSpeciesNames}
                            onSelectSpecies={handleSelectSpecies}
                            onRemoveSpecies={handleRemoveSpecies}
                        />
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Notes de session</Text>
                            <TextInput style={[styles.input, styles.textArea]} value={caption ?? ''} onChangeText={setCaption} multiline placeholder="Ajoutez une description..." placeholderTextColor={theme.colors.text.disabled} />
                        </View>

                        <SessionForm
                            waterColor={waterColor}
                            setWaterColor={setWaterColor}
                            waterCurrent={waterCurrent}
                            setWaterCurrent={setWaterCurrent}
                            waterLevel={waterLevel}
                            setWaterLevel={setWaterLevel}
                            locationVisibility={locationVisibility}
                            setLocationVisibility={setLocationVisibility}
                        />

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
                        
                        {targetSpecies.length > 0 && (
                            <View style={styles.targetSpeciesContainer}>
                                <Text style={styles.targetSpeciesLabel}>Espèces ciblées :</Text>
                                <View style={styles.targetSpeciesList}>
                                    {targetSpecies.map((species, index) => (
                                        <View key={index} style={styles.speciesTag}>
                                            <Text style={styles.speciesTagText}>{species}</Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        )}

                        <Text style={styles.sessionDate}>Début: {new Date(session.started_at).toLocaleString('fr-FR')}</Text>
                        {session.ended_at && <Text style={styles.sessionDate}>Fin: {new Date(session.ended_at).toLocaleString('fr-FR')}</Text>}
                        <View style={styles.statsContainer}>
                            {formattedDuration && <Text style={styles.sessionDate}>Durée: {formattedDuration}</Text>}
                            <Text style={styles.sessionDate}>
                                Distance: {session.distance_km !== null ? `${session.distance_km.toFixed(2)} km` : '-'}
                            </Text>
                        </View>

                        <SessionMap
                            mapRef={mapViewRef}
                            initialRegion={mapRegion}
                            route={sessionRoute}
                            isMapInteractionEnabled={mapInteractionEnabled}
                            setMapInteractionEnabled={setMapInteractionEnabled}
                            recenterMap={recenterMap}
                        >
                            {hasRouteData && (
                                <>
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
                        </SessionMap>

                        <CatchList
                            catches={catches}
                            onAddCatch={handleAddCatch}
                            onEditCatch={handleEditCatch}
                            onDeleteCatch={handleDeleteCatch}
                        />

                        {/* Separate Card for Notes/Caption */}
                        <Card style={styles.notesCard}>
                            <Text style={[styles.infoLabel, styles.notesCardLabel]}>Notes de session</Text>
                            {session.caption ? (
                                <Text style={styles.captionText}>{session.caption}</Text>
                            ) : (
                                <Text style={styles.noCaptionText}>Pas de notes pour cette session.</Text>
                            )}
                        </Card>

                        <View style={styles.infoCard}>
                            <View style={styles.infoRow}><Text style={styles.infoLabel}>Température</Text><Text style={styles.infoValue}>{session.weather_temp ? `${session.weather_temp}°C` : '-'}</Text></View>
                            <View style={styles.infoRow}><Text style={styles.infoLabel}>Conditions météo</Text><Text style={styles.infoValue}>{session.weather_conditions || '-'}</Text></View>
                            <View style={styles.infoRow}><Text style={styles.infoLabel}>Vent</Text><Text style={styles.infoValue}>{`${windStrengthOptions.find(o => o.key === session.wind_strength)?.label || '-'}${session.wind_speed_kmh ? ` (${session.wind_speed_kmh} km/h)` : ''}`}</Text></View>
                            <View style={styles.infoRow}><Text style={styles.infoLabel}>Couleur de l'eau</Text><Text style={styles.infoValue}>{session.water_color || '-'}</Text></View>
                            <View style={styles.infoRow}><Text style={styles.infoLabel}>Courant</Text><Text style={styles.infoValue}>{session.water_current || '-'}</Text></View>
                            <View style={styles.infoRow}><Text style={styles.infoLabel}>Niveau d'eau</Text><Text style={styles.infoValue}>{waterLevelOptions.find(o => o.key === session.water_level)?.label || '-'}</Text></View>
                            <View style={styles.infoRow}><Text style={styles.infoLabel}>Visibilité Loc.</Text><Text style={styles.infoValue}>{locationVisibilityOptions.find(o => o.key === session.location_visibility)?.label || '-'}</Text></View>
                            <View style={styles.infoRow}><Text style={styles.infoLabel}>Publiée</Text><Text style={styles.infoValue}>{session.is_published ? 'Oui' : 'Non'}</Text></View>

                            <Text style={styles.infoDate}>Créée le: {new Date(session.created_at!).toLocaleDateString('fr-FR')}</Text>
                            {session.updated_at && <Text style={styles.infoDate}>Mise à jour le: {new Date(session.updated_at!).toLocaleDateString('fr-FR')}</Text>}
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
    captionText: { fontFamily: theme.typography.fontFamily.regular, fontSize: theme.typography.fontSize.base, color: theme.colors.text.primary, fontStyle: 'italic' },
    noCaptionText: { fontFamily: theme.typography.fontFamily.regular, fontSize: theme.typography.fontSize.base, color: theme.colors.text.primary, fontStyle: 'italic' },
    sessionDate: { fontFamily: theme.typography.fontFamily.regular, fontSize: theme.typography.fontSize.sm, color: theme.colors.text.secondary, marginBottom: theme.spacing[2] },
    statsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: theme.spacing[2] },
    infoCard: { backgroundColor: theme.colors.background.paper, borderRadius: theme.borderRadius.md, padding: theme.spacing[5], ...theme.shadows.sm, borderWidth: 1, borderColor: theme.colors.border.light, marginTop: theme.spacing[4] },
    infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: theme.spacing[2], borderBottomWidth: 1, borderBottomColor: theme.colors.border.light },
    infoLabel: { fontFamily: theme.typography.fontFamily.medium, fontSize: theme.typography.fontSize.base, color: theme.colors.text.secondary },
    infoValue: { fontFamily: theme.typography.fontFamily.regular, fontSize: theme.typography.fontSize.base, color: theme.colors.text.primary },
    infoDate: { fontFamily: 'Inter-Regular', fontSize: 10, color: '#a0aec0', marginTop: 8, textAlign: 'right' },
    formGroup: { marginBottom: theme.spacing[5] },
    label: { fontFamily: theme.typography.fontFamily.medium, fontSize: theme.typography.fontSize.base, color: theme.colors.text.secondary, marginBottom: theme.spacing[3] },
    input: { backgroundColor: theme.colors.background.paper, color: theme.colors.text.primary, height: INPUT_HEIGHT, borderWidth: 1, borderColor: theme.colors.border.main, borderRadius: theme.borderRadius.base, paddingHorizontal: theme.spacing[4], fontSize: theme.typography.fontSize.base },
    textArea: { height: 120, textAlignVertical: 'top', paddingTop: theme.spacing[3] },
    switchGroup: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing[5], paddingVertical: theme.spacing[2] },
    startMarker: {
        height: 14,
        width: 14,
        borderRadius: 7,
        backgroundColor: theme.colors.success.main,
        borderColor: theme.colors.white,
        borderWidth: 2,
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
    infoSection: { // New style for grouping label and value in infoCard
        paddingBottom: theme.spacing[2],
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border.light,
    },
    notesCard: {
        marginTop: theme.spacing[4],
        marginBottom: theme.spacing[4], // Add margin to separate from infoCard
        paddingBottom: theme.spacing[2], // Reduce padding at the bottom of the card content
    },
    notesCardLabel: {
        marginBottom: theme.spacing[2], // Add spacing below the label
    },
    targetSpeciesContainer: {
        width: '100%',
        backgroundColor: theme.colors.background.paper,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing[4],
        marginBottom: theme.spacing[6],
        borderWidth: 1,
        borderColor: theme.colors.border.light,
        ...theme.shadows.sm,
    },
    targetSpeciesLabel: {
        fontFamily: theme.typography.fontFamily.medium,
        fontSize: theme.typography.fontSize.base,
        color: theme.colors.text.secondary,
        marginBottom: theme.spacing[2],
    },
    targetSpeciesList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    speciesTag: {
        backgroundColor: theme.colors.primary[100],
        borderRadius: theme.borderRadius.full,
        paddingVertical: theme.spacing[2],
        paddingHorizontal: theme.spacing[3],
        marginRight: theme.spacing[2],
        marginBottom: theme.spacing[2],
        flexDirection: 'row',
    },
    speciesTagText: {
        color: theme.colors.primary[700],
        fontSize: theme.typography.fontSize.sm,
        fontFamily: theme.typography.fontFamily.medium,
    },
});
