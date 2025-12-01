import React, {useEffect, useRef, useState} from 'react';
import {ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View} from 'react-native';
import {RouteProp, useNavigation, useRoute, usePreventRemove} from '@react-navigation/native';
import {useAuth} from '../../contexts/AuthContext';
import {
    FishingSessionInsert,
    FishingSessionsService,
    SpeciesService,
    TargetSpeciesInsert,
    TargetSpeciesService,
    WeatherService
} from '../../services';
import {theme} from '../../theme';
import {RootStackParamList} from '../../navigation/types';
import {useLocation, useLocationTracking} from '../../hooks';
import {getWindStrengthCategory} from '../../lib/weather';
import {SpeciesSelector} from '../../components/session/SpeciesSelector';
import {SafeAreaView} from "react-native-safe-area-context";
import {NativeStackNavigationProp} from "@react-navigation/native-stack";
import {Card, InfoRow} from '../../components/common';
import {DatePickerInput} from '../../components/common/DatePickerInput';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'NewSession'>;
type NewSessionRouteProp = RouteProp<RootStackParamList, 'NewSession'>;

interface NewSessionFormData {
    locationName: string;
    startDate: Date;
    endDate: Date;
    startPosition: { latitude: number; longitude: number } | null;
    selectedTargetSpeciesNames: string[];
}

const baseInitialFormData: NewSessionFormData = {
    locationName: '',
    startDate: new Date(),
    endDate: new Date(),
    startPosition: null,
    selectedTargetSpeciesNames: [],
};

const INPUT_HEIGHT = 50;

export const NewSessionScreen = () => {
    const { user } = useAuth();
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<NewSessionRouteProp>();
    const { isPostSession } = route.params || {};

    const [formData, setFormData] = useState<NewSessionFormData>(baseInitialFormData);
    const [initialFormState, setInitialFormState] = useState<NewSessionFormData | null>(null);
    const [loading, setLoading] = useState(false);
    const { getLocation, getRegionFromCoords, loading: locationLoading } = useLocation();
    const { startLocationTracking } = useLocationTracking();

    const [allSpecies, setAllSpecies] = useState<{ id: string; name: string }[]>([]);
    const [showWeatherWarning, setShowWeatherWarning] = useState(false);

    useEffect(() => {
        const fetchSpecies = async () => {
            try {
                const species = await SpeciesService.getAllSpecies();
                setAllSpecies(species);
            } catch (error) {
                console.error('Error fetching species:', error);
                Alert.alert('Erreur', 'Impossible de charger la liste des espèces.');
            }
        };
        fetchSpecies();
    }, []);

    useEffect(() => {
        // Setup initial form state
        const setupInitialData = () => {
            const initialState = {
                ...baseInitialFormData,
                startDate: new Date(),
                endDate: new Date(),
            };
            setFormData(initialState);
            setInitialFormState(initialState);
        };
        setupInitialData();
    }, []); // Run once on mount

    useEffect(() => {
        if (isPostSession) {
            const today = new Date();
            const sevenDaysAgo = new Date(today.setDate(today.getDate() - 7));
            setShowWeatherWarning(formData.startDate <= sevenDaysAgo);
        }
    }, [isPostSession, formData.startDate]);

    const handleFormChange = (data: Partial<NewSessionFormData>) => {
        setFormData(prev => ({ ...prev, ...data }));
    };

    const handleSelectSpecies = (species: { id: string; name: string }) => {
        if (!formData.selectedTargetSpeciesNames.includes(species.name)) {
            handleFormChange({ selectedTargetSpeciesNames: [...formData.selectedTargetSpeciesNames, species.name] });
        }
    };

    const handleRemoveSpecies = (speciesToRemove: string) => {
        handleFormChange({ selectedTargetSpeciesNames: formData.selectedTargetSpeciesNames.filter(s => s !== speciesToRemove) });
    };

    const hasUnsavedChanges =
        initialFormState !== null &&
        JSON.stringify(formData) !== JSON.stringify(initialFormState);

    usePreventRemove(
        hasUnsavedChanges && !loading && !!isPostSession,
        ({ data: { action } }) => {
            Alert.alert(
                'Modifications non enregistrées',
                'Que voulez-vous faire ?',
                [
                    { text: 'Enregistrer et Quitter', onPress: handleStartSession },
                    { text: 'Quitter sans enregistrer', style: 'destructive', onPress: () => navigation.dispatch(action) },
                    { text: "Rester", style: 'cancel', onPress: () => {} },
                ]
            );
        }
    );

    const handleStartSession = async () => {
        if (!user) {
            Alert.alert('Erreur', 'Vous devez être connecté pour créer une session.');
            return;
        }

        if (!formData.locationName.trim()) {
            Alert.alert('Attention', 'Veuillez donner un nom à votre session.');
            return;
        }

        setLoading(true);

        let sessionData: FishingSessionInsert;

        if (isPostSession) {
            if (!formData.startPosition) {
                Alert.alert('Attention', 'Veuillez définir la position de départ sur la carte.');
                setLoading(false);
                return;
            }

            if (formData.endDate < formData.startDate) {
                Alert.alert('Attention', 'La date de fin ne peut pas être antérieure à la date de début.');
                setLoading(false);
                return;
            }

            let weatherData = null;
            if (!showWeatherWarning) {
                weatherData = await WeatherService.getWeatherByCoords(formData.startPosition.latitude, formData.startPosition.longitude, formData.startDate);
            }

            const windStrength = weatherData?.windSpeed ? getWindStrengthCategory(weatherData?.windSpeed) : null;
            const regionName = await getRegionFromCoords({ latitude: formData.startPosition.latitude, longitude: formData.startPosition.longitude });
            const durationInMinutes = Math.round((formData.endDate.getTime() - formData.startDate.getTime()) / 60000);

            sessionData = {
                user_id: user.id,
                location_name: formData.locationName,
                status: 'completed',
                started_at: formData.startDate.toISOString(),
                ended_at: formData.endDate.toISOString(),
                location_lat: formData.startPosition.latitude,
                location_lng: formData.startPosition.longitude,
                region: regionName,
                location_visibility: 'region',
                weather_temp: weatherData?.temperature,
                weather_conditions: weatherData?.conditions,
                wind_speed_kmh: weatherData?.windSpeed,
                wind_strength: windStrength,
                duration_minutes: durationInMinutes,
                distance_km: null,
            };
        } else {
            const location = await getLocation();
            let regionName: string | null = null;
            let weatherData = null;

            if (location) {
                regionName = await getRegionFromCoords(location.coords);
                weatherData = await WeatherService.getWeatherByCoords(location.coords.latitude, location.coords.longitude);
            }

            const windStrength = weatherData?.windSpeed ? getWindStrengthCategory(weatherData?.windSpeed) : null;

            sessionData = {
                user_id: user.id,
                location_name: formData.locationName,
                status: 'active',
                started_at: new Date().toISOString(),
                location_lat: location?.coords.latitude,
                location_lng: location?.coords.longitude,
                region: regionName,
                location_visibility: 'region',
                weather_temp: weatherData?.temperature,
                weather_conditions: weatherData?.conditions,
                wind_speed_kmh: weatherData?.windSpeed,
                wind_strength: windStrength,
            };
        }


        try {
            const newSession = await FishingSessionsService.createSession(sessionData);

            if (newSession?.id) {
                if (formData.selectedTargetSpeciesNames.length > 0) {
                    const targetSpeciesToInsert: TargetSpeciesInsert[] = formData.selectedTargetSpeciesNames.map(speciesName => ({
                        session_id: newSession.id,
                        species_name: speciesName,
                    }));
                    await TargetSpeciesService.createTargetSpecies(targetSpeciesToInsert);
                }

                // Reset unsaved changes after successful save
                setInitialFormState(formData); // Update initialFormState to current formData

                if (isPostSession) {
                    route.params.onGoBack?.();
                    navigation.replace('SessionDetail', {
                        sessionId: newSession.id,
                        onGoBack: route.params.onGoBack,
                    });
                } else {
                    startLocationTracking();
                    navigation.replace('ActiveSession', {
                        sessionId: newSession.id,
                        onGoBack: route.params.onGoBack,
                    });
                }
            } else {
                Alert.alert('Erreur', 'Impossible de créer la session.');
            }
        } catch (error) {
            console.error('Erreur création session:', error);
            Alert.alert('Erreur', 'Une erreur est survenue lors de la création de la session.');
        } finally {
            setLoading(false);
        }
    };

    const isLoading = loading || locationLoading;

    if (!initialFormState) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary[500]} />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.contentContainer} keyboardShouldPersistTaps="handled">
                <Text style={[styles.label, styles.label]}>Nom du spot</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Ex: Lac du Salagou"
                    value={formData.locationName}
                    onChangeText={(text) => handleFormChange({ locationName: text })}
                    placeholderTextColor={theme.colors.text.disabled}
                />

                <SpeciesSelector
                    label="Espèces ciblées (optionnel)"
                    allSpecies={allSpecies}
                    selectedSpecies={formData.selectedTargetSpeciesNames}
                    onSelectSpecies={handleSelectSpecies}
                    onRemoveSpecies={handleRemoveSpecies}
                />

                {isPostSession && (
                    <>
                        <Card>
                            <DatePickerInput
                                label="Début"
                                value={formData.startDate}
                                onChange={(date) => handleFormChange({ startDate: date })}
                                maximumDate={new Date()}
                                mode="datetime"
                            />
                            <DatePickerInput
                                label="Fin"
                                value={formData.endDate}
                                onChange={(date) => handleFormChange({ endDate: date })}
                                maximumDate={new Date()}
                                mode="datetime"
                            />
                            <InfoRow
                                iconName="location-outline"
                                label="Position"
                                value={formData.startPosition ? `${formData.startPosition.latitude.toFixed(4)}, ${formData.startPosition.longitude.toFixed(4)}` : 'Choisir'}
                                onPress={() => navigation.navigate('SelectLocation', { 
                                    onLocationSelect: (location) => handleFormChange({ startPosition: location }),
                                    initialLocation: formData.startPosition || undefined,
                                })}
                            />
                        </Card>
                        {showWeatherWarning && (
                            <Text style={styles.infoText}>La météo historique n'est disponible que pour les 7 derniers jours. Les données météo ne seront pas enregistrées pour cette session.</Text>
                        )}
                    </>
                )}

                <TouchableOpacity
                    style={[styles.button, isLoading && styles.buttonDisabled]}
                    onPress={handleStartSession}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color={theme.colors.white} />
                    ) : (
                        <Text style={styles.buttonText}>
                            {isPostSession ? 'Enregistrer la session' : '🚀 Démarrer la session'}
                        </Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background.default,
    },
    contentContainer: {
        flexGrow: 1,
        padding: theme.layout.containerPadding,
        paddingBottom: theme.spacing[10],
    },
    label: {
        fontFamily: theme.typography.fontFamily.medium,
        fontSize: theme.typography.fontSize.base,
        color: theme.colors.text.secondary,
        marginBottom: theme.spacing[2],
        marginTop: theme.spacing[4],
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
        marginBottom: theme.spacing[4],
        width: '100%',
    },
    button: {
        height: INPUT_HEIGHT,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.primary[500],
        borderRadius: theme.borderRadius.base,
        ...theme.shadows.base,
        width: '100%',
        marginTop: theme.spacing[4],
    },
    buttonDisabled: {
        backgroundColor: theme.colors.primary[300],
        ...theme.shadows.none,
    },
    buttonText: {
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: theme.typography.fontSize.base,
        color: theme.colors.text.inverse,
        fontWeight: theme.typography.fontWeight.bold,
    },
    infoText: {
        fontFamily: theme.typography.fontFamily.regular,
        fontSize: theme.typography.fontSize.sm,
        backgroundColor: theme.colors.warning.light,
        color: theme.colors.warning.dark,
        textAlign: 'center',
        padding: theme.spacing[2],
        marginVertical: theme.spacing[4],
        borderRadius: theme.borderRadius.base
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.background.default,
    },
});
