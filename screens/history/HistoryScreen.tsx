import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../../theme';
import { FishingSession, FishingSessionsService } from '../../services';
import { useAuth } from '../../contexts/AuthContext'; // Supposons que vous ayez un hook d'authentification

const formatDuration = (start: string, end: string | null): string => {
    if (!end) return 'En cours';
    const durationMs = new Date(end).getTime() - new Date(start).getTime();
    const totalSeconds = Math.floor(durationMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);

    if (hours > 0) {
        return `${hours}h ${minutes}min`;
    }
    return `${minutes}min`;
};

export const HistoryScreen = () => {
    const { user } = useAuth(); // Récupérer l'utilisateur connecté
    const [sessions, setSessions] = useState<FishingSession[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchHistory = useCallback(async () => {
        if (!user) return;

        try {
            // Utiliser la nouvelle méthode du service
            const fetchedSessions = await FishingSessionsService.getSessions({ userId: user.id, status: 'completed' });
            // Le tri est déjà fait par le service, mais on peut s'en assurer
            fetchedSessions.sort((a, b) => new Date(b.ended_at!).getTime() - new Date(a.ended_at!).getTime());
            setSessions(fetchedSessions);
        } catch (error) {
            console.error("Erreur lors de la récupération de l'historique:", error);
            // Idéalement, afficher un message d'erreur à l'utilisateur
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [user]);

    useFocusEffect(
        useCallback(() => {
            setLoading(true);
            fetchHistory();
        }, [fetchHistory])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchHistory();
    };

    const renderSessionItem = ({ item }: { item: FishingSession }) => (
        <TouchableOpacity style={styles.sessionCard} activeOpacity={0.7}>
            <View>
                <Text style={styles.sessionLocation}>{item.location_name}</Text>
                <Text style={styles.sessionDate}>
                    {new Date(item.ended_at!).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </Text>
            </View>
            <Text style={styles.sessionDuration}>{formatDuration(item.started_at, item.ended_at)}</Text>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={colors.primary['500']} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Sessions passées</Text>
            {sessions.length === 0 ? (
                <View style={styles.center}>
                    <Text style={styles.emptyText}>Aucune session terminée pour le moment.</Text>
                </View>
            ) : (
                <FlatList
                    data={sessions}
                    renderItem={renderSessionItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContainer}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary['500']} />
                    }
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: colors.primary['900'],
        paddingHorizontal: 20,
        paddingTop: 40,
        paddingBottom: 10,
        marginTop: 30,
    },
    listContainer: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    sessionCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        marginBottom: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    sessionLocation: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.primary['800'],
    },
    sessionDate: {
        fontSize: 14,
        color: '#6c757d',
        marginTop: 4,
    },
    sessionDuration: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.primary['500'],
    },
    emptyText: {
        fontSize: 18,
        color: '#6c757d',
    },
});
