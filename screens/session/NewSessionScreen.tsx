import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from 'react-native-screens/native-stack';
import { useAuth } from '../../contexts/AuthContext';
import { FishingSessionInsert, FishingSessionsService } from '../../services';
import { theme } from '../../theme';
import { RootStackParamList } from '../../navigation/types';
import { useLocation, useLocationTracking } from '../../hooks';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'NewSession'>;

const INPUT_HEIGHT = 50;

export const NewSessionScreen = () => {
    const { user } = useAuth();
    const navigation = useNavigation<NavigationProp>();
    const [locationName, setLocationName] = useState('');
    const [loading, setLoading] = useState(false);
    const { getLocation, getRegionFromCoords, loading: locationLoading } = useLocation();
    const { startLocationTracking } = useLocationTracking();

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

        if (location) {
            regionName = await getRegionFromCoords(location.coords);
        }

        const sessionData: FishingSessionInsert = {
            user_id: user.id,
            location_name: locationName,
            status: 'active',
            started_at: new Date().toISOString(),
            location_lat: location?.coords.latitude,
            location_lng: location?.coords.longitude,
            region: regionName,
            location_visibility: 'region',
        };

        try {
            const newSession = await FishingSessionsService.createSession(sessionData);

            if (newSession?.id) {
                startLocationTracking();
                navigation.replace('ActiveSession', { sessionId: newSession.id });
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
            <View style={styles.contentContainer}>
                <Text style={styles.title}>Nouvelle Session</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Nom du spot (ex: Lac du Salagou)"
                    value={locationName}
                    onChangeText={setLocationName}
                    placeholderTextColor={theme.colors.text.disabled}
                />
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
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background.default,
    },
    contentContainer: {
        flex: 1,
        justifyContent: 'center',
        padding: theme.layout.containerPadding,
    },
    title: {
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: theme.typography.fontSize['4xl'],
        color: theme.colors.text.primary,
        textAlign: 'center',
        marginBottom: theme.spacing[10],
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
        marginBottom: theme.spacing[6],
        width: '100%', // Assurer la pleine largeur
    },
    button: {
        height: INPUT_HEIGHT,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.primary[500],
        borderRadius: theme.borderRadius.base,
        ...theme.shadows.base,
        width: '100%', // Assurer la pleine largeur
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
