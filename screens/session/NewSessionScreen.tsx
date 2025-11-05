import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from 'react-native-screens/native-stack';
import { useAuth } from '../../contexts/AuthContext';
import { FishingSessionInsert, FishingSessionsService } from '../../services';
import { colors } from '../../theme';
import { RootStackParamList } from '../../navigation/types';
import { useLocation } from '../../hooks/useLocation';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'NewSession'>;

export const NewSessionScreen = () => {
    const { user } = useAuth();
    const navigation = useNavigation<NavigationProp>();
    const [locationName, setLocationName] = useState('');
    const [loading, setLoading] = useState(false);
    const { getLocation, getRegionFromCoords, loading: locationLoading } = useLocation();

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
            location_visibility: 'region', // Visibilité par défaut à 'region'
        };

        try {
            const newSession = await FishingSessionsService.createSession(sessionData);

            if (newSession?.id) {
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
        <View style={styles.container}>
            <Text style={styles.title}>Nouvelle Session</Text>
            <TextInput
                style={styles.input}
                placeholder="Nom du spot (ex: Lac du Salagou)"
                value={locationName}
                onChangeText={setLocationName}
                placeholderTextColor="#999"
            />
            <TouchableOpacity
                style={[styles.button, isLoading && styles.buttonDisabled]}
                onPress={handleStartSession}
                disabled={isLoading}
            >
                {isLoading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.buttonText}>Démarrer la session</Text>
                )}
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 30,
        color: colors.primary['900'],
    },
    input: {
        backgroundColor: '#f5f5f5',
        paddingHorizontal: 15,
        paddingVertical: 12,
        borderRadius: 8,
        fontSize: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    button: {
        backgroundColor: colors.primary['500'],
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonDisabled: {
        backgroundColor: colors.primary['300'],
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
});
