import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from 'react-native-screens/native-stack';
import { FishingSessionsService, FishingSession } from '../../services';
import { colors } from '../../theme';
import { RootStackParamList } from '../../navigation/types';
import { useTimer } from '../../hooks/useTimer';

type ActiveSessionRouteProp = RouteProp<RootStackParamList, 'ActiveSession'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'ActiveSession'>;

export const ActiveSessionScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<ActiveSessionRouteProp>();
    const { sessionId } = route.params;

    const [session, setSession] = useState<FishingSession | null>(null);
    const [loading, setLoading] = useState(true);

    const { seconds: elapsedTime, formatTime, start, setSeconds } = useTimer(0);

    useEffect(() => {
        const fetchSession = async () => {
            setLoading(true);
            try {
                const fetchedSession = await FishingSessionsService.getSessionById(sessionId);
                if (fetchedSession) {
                    setSession(fetchedSession);
                    // Une fois la session chargée, calculer le temps écoulé et mettre à jour le timer
                    const initialElapsedTime = Math.floor((Date.now() - new Date(fetchedSession.started_at).getTime()) / 1000);
                    setSeconds(initialElapsedTime);
                    start(); // Démarrer le timer
                } else {
                    Alert.alert('Erreur', 'Session introuvable.');
                    navigation.goBack();
                }
            } catch (error) {
                console.error('Erreur chargement session:', error);
                Alert.alert('Erreur', 'Impossible de charger la session.');
                navigation.goBack();
            } finally {
                setLoading(false);
            }
        };
        fetchSession();
    }, [sessionId, navigation, setSeconds, start]);

    const handleEndSession = useCallback(async () => {
        Alert.alert(
            'Terminer la session',
            'Êtes-vous sûr de vouloir terminer cette session ?',
            [
                { text: 'Annuler', style: 'cancel' },
                {
                    text: 'Terminer',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await FishingSessionsService.updateSession(sessionId, { status: 'completed', ended_at: new Date().toISOString() });
                            Alert.alert('Session terminée', 'Votre session a bien été enregistrée.');
                            navigation.popToTop();
                        } catch (error) {
                            console.error('Erreur fin de session:', error);
                            Alert.alert('Erreur', 'Impossible de terminer la session.');
                        }
                    },
                },
            ]
        );
    }, [sessionId, navigation]);

    if (loading || !session) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={colors.primary['500']} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.container}>
                <Text style={styles.title}>{session.location_name}</Text>
                <View style={styles.timerContainer}>
                    <Text style={styles.timerText}>{formatTime(elapsedTime)}</Text>
                </View>
                <Text style={styles.infoText}>Session démarrée le {new Date(session.started_at!).toLocaleString('fr-FR')}</Text>
            </View>

            <TouchableOpacity style={styles.endButton} onPress={handleEndSession}>
                <Text style={styles.buttonText}>Terminer la session</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
        alignItems: 'center',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: colors.primary['900'],
        marginBottom: 20,
        marginTop: 30,
    },
    timerContainer: {
        backgroundColor: '#f5f5f5',
        padding: 20,
        borderRadius: 100,
        width: 200,
        height: 200,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 30,
        borderWidth: 5,
        borderColor: colors.primary['500'],
    },
    timerText: {
        fontSize: 30,
        fontWeight: 'bold',
        color: colors.primary['900'],
    },
    infoText: {
        fontSize: 16,
        color: '#666',
        marginBottom: 40,
    },
    endButton: {
        backgroundColor: colors.error.main,
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 8,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
});
