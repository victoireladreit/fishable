import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Animated, Alert, Platform, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../contexts/AuthContext';
import { FishingSessionsService, FishingSession } from '../../services';
import { theme, colors } from '../../theme';
import { Ionicons } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';
import { RootStackParamList } from '../../navigation/types';

type SessionNavigationProp = NativeStackNavigationProp<RootStackParamList, 'NewSession' | 'ActiveSession'>;

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

export const SessionScreen = () => {
    const { user, refreshUser } = useAuth();
    const navigation = useNavigation<SessionNavigationProp>();
    const [history, setHistory] = useState<FishingSession[]>([]);
    const [activeSession, setActiveSession] = useState<FishingSession | null>(null);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [shouldReload, setShouldReload] = useState(false);
    const [hasLoadedInitial, setHasLoadedInitial] = useState(false);

    const loadData = useCallback(async (isRefreshCall: boolean = false) => {
        if (!user) return;
        if (!isRefreshCall) setLoading(true);

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
            if (!isRefreshCall) setLoading(false);
        }
    }, [user, refreshUser]);

    useFocusEffect(
        useCallback(() => {
            const fetchData = async () => {
                await loadData();
                setShouldReload(false);
                setHasLoadedInitial(true);
            };

            if (shouldReload || !hasLoadedInitial) {
                fetchData();
            }
        }, [loadData, shouldReload, hasLoadedInitial])
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
            onGoBack: (modified: boolean) => {
                if (modified) {
                    setShouldReload(true);
                }
            },
        });
    }, [navigation]);

    const handleNavigateToNewSession = useCallback(() => {
        navigation.navigate('NewSession', {
            onGoBack: () => {
                setShouldReload(true);
            },
        });
    }, [navigation]);

    const handleNavigateToActiveSession = useCallback(() => {
        if (activeSession) {
            navigation.navigate('ActiveSession', {
                sessionId: activeSession.id,
                onGoBack: () => {
                    setShouldReload(true);
                },
            });
        }
    }, [navigation, activeSession]);

    const renderHeader = () => (
        <>
            <Text style={styles.title}>Mes Sessions</Text>
            <View style={styles.headerButtons}>
                {activeSession ? (
                    <TouchableOpacity style={styles.buttonResume} onPress={handleNavigateToActiveSession}>
                        <Text style={styles.buttonText}>Reprendre la session en cours</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity style={styles.buttonPrimary} onPress={handleNavigateToNewSession}>
                        <Text style={styles.buttonText}>🚀 Nouvelle session</Text>
                    </TouchableOpacity>
                )}
            </View>
            <Text style={styles.subtitle}>Historique</Text>
        </>
    );

    if (loading && !hasLoadedInitial) {
        return <View style={styles.center}><ActivityIndicator size="large" color={theme.colors.primary[500]} /></View>;
    }

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={history}
                ListHeaderComponent={renderHeader}
                renderItem={({ item }) => (
                    <SessionCard 
                        session={item} 
                        onDelete={() => handleDelete(item.id)} 
                        onNavigate={() => handleNavigateToDetail(item.id)} 
                    />
                )}
                keyExtractor={item => item.id}
                contentContainerStyle={{ paddingBottom: theme.spacing[8] }}
                ListEmptyComponent={() => (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>Aucun historique de session pour le moment.</Text>
                    </View>
                )}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={handleRefresh}
                        colors={[colors.primary['500']]}
                        tintColor={colors.primary['500']}
                    />
                }
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
    title: {
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: theme.typography.fontSize['4xl'],
        color: theme.colors.text.primary,
        marginTop: theme.spacing[4],
        paddingHorizontal: theme.layout.screenPadding,
    },
    subtitle: {
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: theme.typography.fontSize['2xl'],
        color: theme.colors.text.primary,
        marginTop: theme.spacing[6],
        marginBottom: theme.spacing[4],
        paddingHorizontal: theme.layout.screenPadding,
    },
    headerButtons: {
        paddingHorizontal: theme.layout.screenPadding,
        marginTop: theme.spacing[4],
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: theme.spacing[8],
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
    buttonPrimary: {
        backgroundColor: colors.primary["500"],
        padding: 15,
        borderRadius: 8,
    },
    buttonResume: {
        backgroundColor: colors.success.main,
        padding: 15,
        borderRadius: 8,
    },
    buttonText: {
        color: '#fff',
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: 16,
    },
});
