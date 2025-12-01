import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../contexts/AuthContext';
import { FishingSessionsService, FishingSession } from '../../services';
import { theme } from '../../theme';
import { RootStackParamList } from '../../navigation/types';
import { SessionList } from '../../components/session/SessionList'; // Import the new SessionList component

type SessionNavigationProp = NativeStackNavigationProp<RootStackParamList, 'NewSession' | 'ActiveSession'>;

export const SessionScreen = () => {
    const { user, refreshUser } = useAuth();
    const navigation = useNavigation<SessionNavigationProp>();
    const [history, setHistory] = useState<FishingSession[]>([]);
    const [activeSession, setActiveSession] = useState<FishingSession | null>(null);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [hasLoadedInitial, setHasLoadedInitial] = useState(false);

    const loadData = useCallback(async (isRefreshCall: boolean = false) => {
        if (!user) return;

        // Only show the full-screen loader on the very first load
        if (!isRefreshCall && !hasLoadedInitial) {
            setLoading(true);
        }

        try {
            const userSessions = await FishingSessionsService.getSessions({ userId: user.id });

            if (isRefreshCall) {
                await refreshUser();
            }

            const completedSessions = userSessions?.filter(s => s.status === 'completed') || [];
            const currentSession = userSessions?.find(s => s.status === 'active') || null;

            setHistory(completedSessions);
            setActiveSession(currentSession);

        } catch (error) {
            console.error("Erreur lors du chargement des sessions:", error);
        } finally {
            if (!isRefreshCall && !hasLoadedInitial) {
                setLoading(false);
                setHasLoadedInitial(true);
            }
        }
    }, [user, refreshUser, hasLoadedInitial]);

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [loadData])
    );

    const handleRefresh = useCallback(async () => {
        setIsRefreshing(true);
        await loadData(true);
        setIsRefreshing(false);
    }, [loadData]);

    const handleDelete = (sessionId: string) => {
        Alert.alert(
            'Supprimer la session',
            'Êtes-vous sûr de vouloir supprimer définitivement cette session ?',
            [
                { text: 'Annuler', style: 'cancel' },
                {
                    text: 'Supprimer',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await FishingSessionsService.deleteSession(sessionId);
                            setHistory(prevSessions => prevSessions.filter(s => s.id !== sessionId));
                        } catch (error) {
                            console.error("Erreur lors de la suppression:", error);
                            Alert.alert("Erreur", "Impossible de supprimer la session.");
                        }
                    },
                },
            ]
        );
    };

    const handleNavigateToDetail = useCallback((sessionId: string) => {
        navigation.navigate('SessionDetail', {
            sessionId: sessionId,
        });
    }, [navigation]);

    const handleNavigateToNewSession = useCallback(() => {
        navigation.navigate('NewSession', {
            onGoBack: () => {
                loadData(true); // Silently refresh data
            },
        });
    }, [navigation, loadData]);

    const handleNavigateToPostNewSession = useCallback(() => {
        navigation.navigate('NewSession', {
            isPostSession: true,
            onGoBack: () => {
                loadData(true); // Silently refresh data
            },
        });
    }, [navigation, loadData]);

    const handleNavigateToActiveSession = useCallback(() => {
        if (activeSession) {
            navigation.navigate('ActiveSession', {
                sessionId: activeSession.id,
                onGoBack: () => {
                    loadData(true); // Silently refresh data
                },
            });
        }
    }, [navigation, activeSession, loadData]);

    if (loading && !hasLoadedInitial) {
        return <View style={styles.center}><ActivityIndicator size="large" color={theme.colors.primary[500]} /></View>;
    }

    return (
        <SafeAreaView style={styles.container}>
            <SessionList
                history={history}
                activeSession={activeSession}
                loading={loading}
                isRefreshing={isRefreshing}
                onRefresh={handleRefresh}
                onDelete={handleDelete}
                onNavigateToDetail={handleNavigateToDetail}
                onNavigateToNewSession={handleNavigateToNewSession}
                onNavigateToPostNewSession={handleNavigateToPostNewSession}
                onNavigateToActiveSession={handleNavigateToActiveSession}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background.default,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.background.default,
    },
});
