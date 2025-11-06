import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, SafeAreaView, TouchableOpacity, Animated, Alert, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../contexts/AuthContext';
import { FishingSessionsService, FishingSession } from '../../services';
import { theme } from '../../theme';
import { Ionicons } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';
import { RootStackParamList } from '../../navigation/types';

type HistoryNavigationProp = NativeStackNavigationProp<RootStackParamList, 'SessionSummary'>;

const formatDuration = (totalMinutes: number | null) => {
    if (totalMinutes === null || totalMinutes < 0) return null;
    if (totalMinutes < 60) {
        return `${totalMinutes}min`;
    }
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${minutes > 0 ? `${minutes}min` : ''}`.trim();
};

const renderRightActions = (progress: Animated.AnimatedInterpolation<number>, dragX: Animated.AnimatedInterpolation<number>, onPress: () => void) => {
    const trans = dragX.interpolate({
        inputRange: [-80, 0],
        outputRange: [0, 80],
        extrapolate: 'clamp',
    });
    return (
        <TouchableOpacity onPress={onPress} style={styles.deleteButtonContainer}>
            <Animated.View style={[styles.deleteButton, { transform: [{ translateX: trans }] }]}>
                <Ionicons name="trash-outline" size={theme.iconSizes.lg} color={theme.colors.error.main} />
            </Animated.View>
        </TouchableOpacity>
    );
};

const SessionCard = ({ session, onDelete, onNavigate }: { session: FishingSession, onDelete: () => void, onNavigate: () => void }) => {
    const date = session.ended_at ? new Date(session.ended_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }) : 'Date inconnue';
    const duration = formatDuration(session.duration_minutes);

    return (
        <View style={styles.cardWrapper}>
            <Swipeable renderRightActions={(progress, dragX) => renderRightActions(progress, dragX, onDelete)}>
                <TouchableOpacity onPress={onNavigate}>
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>{session.location_name || 'Session sans nom'}</Text>
                        <View style={styles.cardInfoContainer}>
                            <Text style={styles.cardInfoText}>{date}</Text>
                            {duration && (
                                <Text style={styles.cardInfoText}>{duration}</Text>
                            )}
                        </View>
                    </View>
                </TouchableOpacity>
            </Swipeable>
        </View>
    );
};

export const HistoryScreen = () => {
    const { user } = useAuth();
    const navigation = useNavigation<HistoryNavigationProp>();
    const [sessions, setSessions] = useState<FishingSession[]>([]);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const loadSessions = useCallback(async () => {
        if (!user) return;
        try {
            const userSessions = await FishingSessionsService.getSessions({userId: user.id});
            const completedSessions = userSessions?.filter(s => s.status === 'completed') || [];
            setSessions(completedSessions);
        } catch (error) {
            console.error("Erreur lors du chargement de l'historique:", error);
        }
    }, [user]);

    useEffect(() => {
        setLoading(true);
        loadSessions().finally(() => setLoading(false));
    }, [loadSessions]);

    const handleRefresh = useCallback(async () => {
        setIsRefreshing(true);
        await loadSessions();
        setIsRefreshing(false);
    }, [loadSessions]);

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
                            setSessions(prevSessions => prevSessions.filter(s => s.id !== sessionId));
                        } catch (error) {
                            console.error("Erreur lors de la suppression:", error);
                            Alert.alert("Erreur", "Impossible de supprimer la session.");
                        }
                    },
                },
            ]
        );
    };

    if (loading) {
        return <View style={styles.center}><ActivityIndicator size="large" color={theme.colors.primary[500]} /></View>;
    }

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>Historique</Text>
            {
                sessions.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>Aucun historique de session pour le moment.</Text>
                    </View>
                ) : (
                    <FlatList
                        data={sessions}
                        renderItem={({ item }) => (
                            <SessionCard 
                                session={item} 
                                onDelete={() => handleDelete(item.id)} 
                                onNavigate={() => navigation.navigate('SessionDetail', { sessionId: item.id })} 
                            />
                        )}
                        keyExtractor={item => item.id}
                        contentContainerStyle={{ paddingBottom: theme.spacing[8] }}
                        onRefresh={handleRefresh}
                        refreshing={isRefreshing}
                    />
                )
            }
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background.default,
        paddingTop: Platform.OS === 'android' ? theme.spacing[12] : 0,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.background.default,
    },
    title: {
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: theme.typography.fontSize['4xl'],
        color: theme.colors.text.primary,
        marginVertical: theme.spacing[4],
        paddingHorizontal: theme.layout.screenPadding,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        fontFamily: theme.typography.fontFamily.regular,
        fontSize: theme.typography.fontSize.base,
        color: theme.colors.text.secondary,
    },
    cardWrapper: {
        paddingHorizontal: theme.layout.screenPadding,
        marginBottom: theme.spacing[4],
    },
    card: {
        backgroundColor: theme.colors.background.paper,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing[4],
        ...theme.shadows.sm,
        borderWidth: 1,
        borderColor: theme.colors.border.light,
    },
    cardTitle: {
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: theme.typography.fontSize.lg,
        color: theme.colors.text.primary,
        marginBottom: theme.spacing[2],
    },
    cardInfoContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: theme.spacing[2],
    },
    cardInfoText: {
        fontFamily: theme.typography.fontFamily.regular,
        fontSize: theme.typography.fontSize.sm,
        color: theme.colors.text.secondary,
    },
    deleteButtonContainer: {
        width: 80,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: theme.spacing[2],
    },
    deleteButton: {
        justifyContent: 'center',
        alignItems: 'center',
        width: 80,
        height: '100%',
        borderRadius: theme.borderRadius.md,
        borderColor: theme.colors.error.main,
    },
});
