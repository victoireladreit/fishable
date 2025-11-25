import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from 'react-native-screens/native-stack';
import {
    FishingSessionsService,
} from '../../services';
import { theme } from '../../theme';
import { useTimer, formatTime, useLocationTracking, useCatchManagement, useSession } from '../../hooks';
import MapView from "react-native-maps";
import { calculateTotalDistance } from '../../lib/geolocation';
import { RootStackParamList } from "../../navigation/types";
import { SessionForm } from '../../components/session/SessionForm';
import { CatchList } from '../../components/catch/CatchList';
import { SessionMap } from '../../components/session/SessionMap';
import { TargetSpeciesList } from '../../components/session/TargetSpeciesList';
import { windStrengthOptions } from '../../lib/constants';
import { SessionHeader } from '../../components/session/SessionHeader';
import { SessionNotes } from '../../components/session/SessionNotes';

type ActiveSessionRouteProp = RouteProp<RootStackParamList, 'ActiveSession'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'ActiveSession'>;

const INPUT_HEIGHT = 50;

export const ActiveSessionScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<ActiveSessionRouteProp>();
    const { sessionId } = route.params;
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
        hasUnsavedChanges,
        saveChanges,
    } = useSession(sessionId);

    const [userInteractingWithMap, setUserInteractingWithMap] = useState(false);
    const [mapInteractionEnabled, setMapInteractionEnabled] = useState(false);

    const { seconds, start, stop } = useTimer();
    const { route: locationRoute, stopLocationTracking, errorMsg, location } = useLocationTracking();

    const { handleAddCatch, handleEditCatch, handleDeleteCatch } = useCatchManagement(sessionId, setCatches);

    useEffect(() => {
        if (errorMsg) {
            Alert.alert('Erreur de localisation', errorMsg);
        }
    }, [errorMsg]);

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

    const handleSaveSessionChanges = async () => {
        const success = await saveChanges();
        if (success) {
            Alert.alert('Succès', 'Les modifications ont été enregistrées.');
        }
        return success;
    };

    const proceedToEndSession = async () => {
        if (!session?.started_at) return;

        stop();
        stopLocationTracking();

        const startTime = new Date(session.started_at).getTime();
        const endTime = Date.now();
        const durationMinutes = Math.round((endTime - startTime) / (1000 * 60));
        const distanceKm = calculateTotalDistance(locationRoute);

        try {
            await FishingSessionsService.updateSession(sessionId, { 
                status: 'completed', 
                ended_at: new Date(endTime).toISOString(),
                duration_minutes: durationMinutes,
                route: locationRoute as any,
                distance_km: distanceKm,
            });
            
            route.params?.onGoBack();
            
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
                            const success = await handleSaveSessionChanges();
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

    const recenterMap = () => {
        if (!mapViewRef.current) return;

        if (locationRoute && locationRoute.length > 1) {
            const latitudes = locationRoute.map(p => p.latitude);
            const longitudes = locationRoute.map(p => p.longitude);
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

    const onAddCatchPress = () => {
        if (location?.coords) {
            const { latitude, longitude, accuracy } = location.coords;
            handleAddCatch({ latitude, longitude, accuracy: accuracy ?? undefined });
        } else {
            handleAddCatch();
        }
    };

    if (loading || !session) {
        return <View style={styles.center}><ActivityIndicator size="large" color={theme.colors.primary[500]} /></View>;
    }

    const initialMapRegion = locationRoute.length > 0 ? {
        latitude: locationRoute[locationRoute.length - 1].latitude,
        longitude: locationRoute[locationRoute.length - 1].longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
    } : (session?.location_lat && session?.location_lng ? {
        latitude: session.location_lat,
        longitude: session.location_lng,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
    } : undefined);

    const windStrengthLabel = windStrengthOptions.find(opt => opt.key === session.wind_strength)?.label || '-';
    const currentDistance = calculateTotalDistance(locationRoute);

    return (
        <ScrollView 
            style={styles.scrollContainer} 
            contentContainerStyle={styles.container}
            keyboardShouldPersistTaps="handled"
        >
            <SessionHeader
                isEditing={true}
                locationName={locationName}
                onLocationNameChange={setLocationName}
                region={session.region}
            />

            <TargetSpeciesList species={targetSpecies} />

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
            
            <SessionMap
                mapRef={mapViewRef}
                initialRegion={initialMapRegion}
                route={locationRoute}
                isMapInteractionEnabled={mapInteractionEnabled}
                setMapInteractionEnabled={setMapInteractionEnabled}
                recenterMap={recenterMap}
                onPanDrag={() => setUserInteractingWithMap(true)}
                showUserLocation={true}
            />

            <CatchList
                catches={catches}
                onAddCatch={onAddCatchPress}
                onEditCatch={handleEditCatch}
                onDeleteCatch={handleDeleteCatch}
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

            <SessionNotes
                isEditing={true}
                caption={caption}
                onCaptionChange={setCaption}
            />

            <View style={{width: '100%', marginTop: theme.spacing[4]}}>
                <TouchableOpacity style={[styles.button, styles.saveButton, isSaving && styles.buttonDisabled, !hasUnsavedChanges && styles.buttonDisabled]} onPress={handleSaveSessionChanges} disabled={isSaving || !hasUnsavedChanges}>
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
});
