import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { FishingSession, FishingSessionsService } from '../../services';
import { colors } from '../../theme';
import { RootStackParamList } from '../../navigation/types';
import { NativeStackNavigationProp } from 'react-native-screens/native-stack';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export const HomeScreen = () => {
    const { user, signOut } = useAuth();
    const navigation = useNavigation<NavigationProp>();
    const [activeSession, setActiveSession] = useState<FishingSession | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useFocusEffect(
        useCallback(() => {
            const fetchActiveSession = async () => {
                if (!user) {
                    setIsLoading(false);
                    return;
                }
                try {
                    const activeSessions = await FishingSessionsService.getSessions({ userId: user.id, status: 'active' });
                    setActiveSession(activeSessions?.[0] || null);
                } catch (error) {
                    console.error('Erreur chargement session active:', error);
                    setActiveSession(null);
                } finally {
                    setIsLoading(false);
                }
            };

            fetchActiveSession();
        }, [user])
    );

    if (isLoading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={colors.primary['500']} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>🎣 Fishable</Text>
            <Text style={styles.welcome}>Bienvenue, {user?.user_metadata?.username || user?.email} !</Text>

            {activeSession ? (
                <TouchableOpacity style={styles.buttonResume} onPress={() => navigation.navigate('ActiveSession', { sessionId: activeSession.id })}>
                    <Text style={styles.buttonText}>Reprendre la session en cours</Text>
                </TouchableOpacity>
            ) : (
                <TouchableOpacity style={styles.buttonPrimary} onPress={() => navigation.navigate('NewSession')}>
                    <Text style={styles.buttonText}>🚀 Nouvelle session</Text>
                </TouchableOpacity>
            )}
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
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    title: {
        fontSize: 40,
        textAlign: 'center',
        marginBottom: 20,
    },
    welcome: {
        fontSize: 20,
        textAlign: 'center',
        marginBottom: 30,
    },
    buttonPrimary: {
        backgroundColor: colors.primary["500"],
        padding: 15,
        borderRadius: 8,
    },
    buttonResume: {
        backgroundColor: colors.success.main, // Une couleur verte pour indiquer une action positive
        padding: 15,
        borderRadius: 8,
        marginBottom: 20,
    },
    buttonSecondary: {
        backgroundColor: colors.error.main,
        padding: 15,
        borderRadius: 8,
        marginTop: 20,
    },
    buttonText: {
        color: '#fff',
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: 16,
    },
});
