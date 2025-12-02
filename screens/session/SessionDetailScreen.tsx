import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
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
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCatchManagement, useSession } from '../../hooks';
import { SessionForm } from '../../components/session/SessionForm';
import { CatchList } from '../../components/catch/CatchList';
import { SpeciesSelector } from '../../components/session/SpeciesSelector';
import { Card, InfoRow} from '../../components/common';
import { SessionMap } from '../../components/session/SessionMap';
import { TargetSpeciesList } from '../../components/session/TargetSpeciesList';
import { windStrengthOptions, waterLevelOptions, WindStrength } from '../../lib/constants';
import { formatDuration } from '../../lib/formatters';
import { SessionHeader } from '../../components/session/SessionHeader';

type SessionDetailRouteProp = RouteProp<RootStackParamList, 'SessionDetail'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'SessionDetail' | 'SessionPublication'>;

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

    // Use the custom hook for catch management
    const { handleAddCatch, handleDeleteCatch } = useCatchManagement(sessionId, setCatches);

    const handleCatchDetail = (catchId: string) => {
        navigation.navigate('CatchDetail', { catchId });
    };

    const handlePublish = () => {
        navigation.navigate('SessionPublication', { sessionId });
    };

    useEffect(() => {
        if (session) {
            setWeatherTemp(session.weather_temp?.toString() || '');
            setWeatherConditions(session.weather_conditions || '');
            setWindStrength(session.wind_strength || null);
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

    const sessionRoute = useMemo(() => session?.route ? (session.route as unknown as { latitude: number; longitude: number }[]) : [], [session?.route]);

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
    }, [session?.location_lat, session?.location_lng, sessionRoute]);


    const handleSave = useCallback(async () => {
        const success = await saveChanges();
        if (success) {
            const updates: FishingSessionUpdate = {
                weather_temp: weatherTemp ? parseFloat(weatherTemp) : null,
                weather_conditions: weatherConditions,
                wind_strength: windStrength
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
    }, [saveChanges, weatherTemp, weatherConditions, windStrength, selectedTargetSpeciesNames, sessionId, reload, onGoBack]);

    const recenterMap = () => {
        if (mapViewRef.current && mapRegion) {
            mapViewRef.current.animateToRegion(mapRegion, 500);
        }
    };

    useEffect(() => {
        const canPublish = session?.ended_at && !session.published_at;

        navigation.setOptions({
            headerRight: () => (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {!isEditing && canPublish && (
                        <TouchableOpacity onPress={handlePublish} style={{ marginRight: theme.spacing[4] }}>
                            <Ionicons name="paper-plane-outline" size={theme.iconSizes.lg} color={theme.colors.primary[500]} />
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity onPress={() => isEditing ? handleSave() : setIsEditing(true)} disabled={loading || isSaving}>
                        <Ionicons name={isEditing ? "save-outline" : "create-outline"} size={theme.iconSizes.lg} color={theme.colors.primary[500]} />
                    </TouchableOpacity>
                </View>
            ),
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
    }, [navigation, isEditing, loading, isSaving, handleSave, reload, onGoBack, session]);

    if (loading && !session) {
        return <View style={styles.center}><ActivityIndicator size="large" color={theme.colors.primary[500]} /></View>;
    }

    if (!session) {
        return <View style={styles.center}><Text>Session introuvable.</Text></View>;
    }

    const formattedDuration = formatDuration(session.duration_minutes);
    const hasRouteData = sessionRoute && sessionRoute.length > 1;

    const renderNonEditingHeader = () => (
        <View style={[styles.scrollContentContainer, { paddingBottom: 0 }]}>
            <SessionHeader
                isEditing={isEditing}
                locationName={locationName}
                onLocationNameChange={setLocationName}
                region={session.region}
            />
            <TargetSpeciesList species={targetSpecies} />
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
                {!hasRouteData && session?.location_lat && session?.location_lng && (
                    <Marker
                        coordinate={{
                            latitude: session.location_lat,
                            longitude: session.location_lng,
                        }}
                        title="Départ"
                        anchor={{ x: 0.5, y: 0.5 }}
                    >
                        <View style={styles.startMarker} />
                    </Marker>
                )}
            </SessionMap>
        </View>
    );

    const renderNonEditingFooter = () => (
        <View style={[styles.scrollContentContainer, { paddingTop: 0 }]}>
            <Card style={{ marginTop: theme.spacing[4] }}>
                <InfoRow iconName="thermometer-outline" label="Température" value={session.weather_temp} unit="°C" />
                <InfoRow iconName="partly-sunny-outline" label="Conditions météo" value={session.weather_conditions} />
                <InfoRow iconName="flag-outline" label="Vent" value={`${windStrengthOptions.find(o => o.key === session.wind_strength)?.label || ''}${session.wind_speed_kmh ? ` (${session.wind_speed_kmh} km/h)` : ''}`} />
                <InfoRow iconName="color-palette-outline" label="Couleur de l'eau" value={session.water_color} />
                <InfoRow iconName="swap-vertical-outline" label="Courant" value={session.water_current} />
                <InfoRow iconName="pulse-outline" label="Niveau d'eau" value={waterLevelOptions.find(o => o.key === session.water_level)?.label} />
            </Card>
        </View>
    );

    return (
        <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
            {isEditing ? (
                <ScrollView 
                    contentContainerStyle={styles.scrollContentContainer}
                >
                    <SessionHeader
                        isEditing={isEditing}
                        locationName={locationName}
                        onLocationNameChange={setLocationName}
                        region={session.region}
                    />
                    <SpeciesSelector
                        allSpecies={allSpecies}
                        selectedSpecies={selectedTargetSpeciesNames}
                        onSelectSpecies={handleSelectSpecies}
                        onRemoveSpecies={handleRemoveSpecies}
                    />
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
                </ScrollView>
            ) : (
                <CatchList
                    catches={catches}
                    onCatchDetail={handleCatchDetail}
                    onDeleteCatch={handleDeleteCatch}
                    isRefreshing={loading}
                    onRefresh={reload}
                    ListHeaderComponent={renderNonEditingHeader()}
                    ListFooterComponent={renderNonEditingFooter()}
                    onAddCatch={handleAddCatch}
                    showTitleHeader={true}
                    contentContainerStyle={{ paddingTop: 0 }}
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: theme.colors.background.default },
    container: { flex: 1, backgroundColor: theme.colors.background.default },
    scrollContentContainer: { padding: theme.layout.containerPadding, paddingBottom: theme.spacing[10] },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    sessionDate: { fontFamily: theme.typography.fontFamily.regular, fontSize: theme.typography.fontSize.sm, color: theme.colors.text.secondary, marginBottom: theme.spacing[2] },
    statsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: theme.spacing[2] },
    label: { fontFamily: theme.typography.fontFamily.medium, fontSize: theme.typography.fontSize.base, color: theme.colors.text.secondary, marginBottom: theme.spacing[3] },
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
});
