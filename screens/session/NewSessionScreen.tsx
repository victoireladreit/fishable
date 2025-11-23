import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, SafeAreaView, ScrollView } from 'react-native'; // Added ScrollView
import { useNavigation, RouteProp, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from 'react-native-screens/native-stack';
import { useAuth } from '../../contexts/AuthContext';
import {
    FishingSessionInsert,
    FishingSessionsService,
    WeatherService,
    SpeciesService,
    TargetSpeciesService, TargetSpeciesInsert
} from '../../services';
import { theme } from '../../theme';
import { RootStackParamList } from '../../navigation/types';
import { useLocation, useLocationTracking } from '../../hooks';
import { getWindStrengthCategory } from '../../lib/weather';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'NewSession'>;
type NewSessionRouteProp = RouteProp<RootStackParamList, 'NewSession'>;

const INPUT_HEIGHT = 50;

export const NewSessionScreen = () => {
    const { user } = useAuth();
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<NewSessionRouteProp>();
    const [locationName, setLocationName] = useState('');
    const [loading, setLoading] = useState(false);
    const { getLocation, getRegionFromCoords, loading: locationLoading } = useLocation();
    const { startLocationTracking } = useLocationTracking();

    const [allSpecies, setAllSpecies] = useState<{ id: string; name: string }[]>([]);
    const [filteredSpecies, setFilteredSpecies] = useState<{ id: string; name: string }[]>([]); // New state for filtered species
    const [selectedTargetSpeciesNames, setSelectedTargetSpeciesNames] = useState<string[]>([]);
    const [speciesInput, setSpeciesInput] = useState('');

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

    const handleSpeciesSearch = (text: string) => {
        setSpeciesInput(text);
        if (text) {
            const filtered = allSpecies.filter(species =>
                species.name.toLowerCase().includes(text.toLowerCase()) &&
                !selectedTargetSpeciesNames.includes(species.name) // Don't suggest already selected species
            );
            setFilteredSpecies(filtered);
        } else {
            setFilteredSpecies([]);
        }
    };

    const handleSelectSpecies = (species: { id: string; name: string }) => {
        if (!selectedTargetSpeciesNames.includes(species.name)) {
            setSelectedTargetSpeciesNames([...selectedTargetSpeciesNames, species.name]);
            setSpeciesInput('');
            setFilteredSpecies([]);
        }
    };

    const handleRemoveSpecies = (speciesToRemove: string) => {
        setSelectedTargetSpeciesNames(selectedTargetSpeciesNames.filter(s => s !== speciesToRemove));
    };

    const handleStartSession = async () => {
        if (!user) {
            Alert.alert('Erreur', 'Vous devez être connecté pour créer une session.');
            return;
        }

        if (!locationName.trim()) {
            Alert.alert('Attention', 'Veuillez donner un nom à votre session.');
            return;
        }

        setLoading(true);

        const location = await getLocation();
        let regionName: string | null = null;
        let weatherData = null;

        if (location) {
            regionName = await getRegionFromCoords(location.coords);
            weatherData = await WeatherService.getWeatherByCoords(location.coords.latitude, location.coords.longitude);
        }

        const windStrength = weatherData?.windSpeed ? getWindStrengthCategory(weatherData.windSpeed) : null;

        const sessionData: FishingSessionInsert = {
            user_id: user.id,
            location_name: locationName,
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

        try {
            const newSession = await FishingSessionsService.createSession(sessionData);

            if (newSession?.id) {
                // Save target species
                if (selectedTargetSpeciesNames.length > 0) {
                    const targetSpeciesToInsert: TargetSpeciesInsert[] = selectedTargetSpeciesNames.map(speciesName => ({
                        session_id: newSession.id,
                        species_name: speciesName,
                    }));
                    await TargetSpeciesService.createTargetSpecies(targetSpeciesToInsert);
                }

                startLocationTracking();
                
                navigation.replace('ActiveSession', { 
                    sessionId: newSession.id,
                    onGoBack: route.params.onGoBack,
                });
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

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.contentContainer} keyboardShouldPersistTaps="handled">
                <Text style={styles.label}>Nom du spot</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Ex: Lac du Salagou"
                    value={locationName}
                    onChangeText={setLocationName}
                    placeholderTextColor={theme.colors.text.disabled}
                />

                <Text style={styles.label}>Espèces ciblées (optionnel)</Text>
                <View style={styles.speciesInputContainer}>
                    <TextInput
                        style={[styles.input, styles.speciesTextInput]}
                        placeholder="Rechercher et ajouter une espèce"
                        value={speciesInput}
                        onChangeText={handleSpeciesSearch}
                        placeholderTextColor={theme.colors.text.disabled}
                    />
                </View>
                {filteredSpecies.length > 0 && (
                    <View style={styles.suggestionsList}>
                        <ScrollView keyboardShouldPersistTaps="handled">
                            {filteredSpecies.map(item => (
                                <TouchableOpacity key={item.id} onPress={() => handleSelectSpecies(item)} style={styles.suggestionItem}>
                                    <Text style={styles.suggestionItemText}>{item.name}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                )}

                <View style={styles.selectedSpeciesContainer}>
                    {selectedTargetSpeciesNames.map((species, index) => (
                        <View key={index} style={styles.speciesTag}>
                            <Text style={styles.speciesTagText}>{species}</Text>
                            <TouchableOpacity onPress={() => handleRemoveSpecies(species)} style={styles.removeSpeciesButton}>
                                <Text style={styles.removeSpeciesButtonText}>x</Text>
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>

                <TouchableOpacity
                    style={[styles.button, isLoading && styles.buttonDisabled]}
                    onPress={handleStartSession}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color={theme.colors.white} />
                    ) : (
                        <Text style={styles.buttonText}>🚀 Démarrer la session</Text>
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
        // Removed justifyContent: 'center',
        padding: theme.layout.containerPadding,
        paddingBottom: theme.spacing[10], // Added paddingBottom to allow scrolling above keyboard
    },
    title: { // Keep the style definition, but the component is removed
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: theme.typography.fontSize['4xl'],
        color: theme.colors.text.primary,
        textAlign: 'center',
        marginBottom: theme.spacing[10],
    },
    label: {
        fontFamily: theme.typography.fontFamily.medium,
        fontSize: theme.typography.fontSize.base,
        color: theme.colors.text.primary,
        marginBottom: theme.spacing[2], // Adjusted from 4 to 2
        marginTop: theme.spacing[2], // Adjusted from 4 to 2
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
        marginBottom: theme.spacing[4], // Adjusted from 6 to 4
        width: '100%',
    },
    speciesInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: theme.spacing[4],
    },
    speciesTextInput: {
        flex: 1,
        marginBottom: 0, // Override default margin
        marginRight: 0, // No add button anymore
    },
    suggestionsList: {
        maxHeight: 150,
        borderColor: theme.colors.border.main,
        borderWidth: 1,
        borderRadius: theme.borderRadius.base,
        backgroundColor: theme.colors.background.paper,
        marginBottom: theme.spacing[4],
    },
    suggestionItem: {
        padding: theme.spacing[3],
        borderBottomColor: theme.colors.border.light,
        borderBottomWidth: 1,
    },
    suggestionItemText: {
        fontFamily: theme.typography.fontFamily.regular,
        fontSize: theme.typography.fontSize.base,
        color: theme.colors.text.primary,
    },
    selectedSpeciesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: theme.spacing[6],
    },
    speciesTag: {
        flexDirection: 'row',
        backgroundColor: theme.colors.primary[100],
        borderRadius: theme.borderRadius.full,
        paddingVertical: theme.spacing[2],
        paddingHorizontal: theme.spacing[3],
        marginRight: theme.spacing[2],
        marginBottom: theme.spacing[2],
        alignItems: 'center',
    },
    speciesTagText: {
        color: theme.colors.primary[700],
        fontSize: theme.typography.fontSize.sm,
        fontFamily: theme.typography.fontFamily.medium,
    },
    removeSpeciesButton: {
        marginLeft: theme.spacing[2],
        paddingHorizontal: theme.spacing[1],
    },
    removeSpeciesButtonText: {
        color: theme.colors.primary[700],
        fontSize: theme.typography.fontSize.sm,
        fontWeight: theme.typography.fontWeight.bold,
    },
    button: {
        height: INPUT_HEIGHT,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.primary[500],
        borderRadius: theme.borderRadius.base,
        ...theme.shadows.base,
        width: '100%',
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
});
