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
import MapView, { Polyline, Region } from 'react-native-maps'; // Import MapView and Polyline

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

// Helper function to calculate map region from route coordinates
const getMapRegion = (route: { latitude: number; longitude: number }[]): Region | undefined => {
    if (!route || route.length === 0) {
        return undefined;
    }

    // Handle single point case
    if (route.length === 1) {
        return {
            latitude: route[0].latitude,
            longitude: route[0].longitude,
            latitudeDelta: 0.0005, // Adjusted for closer view for single point
            longitudeDelta: 0.0005,
        };
    }

    const latitudes = route.map(p => p.latitude);
    const longitudes = route.map(p => p.longitude);

    const minLat = Math.min(...latitudes);
    const maxLat = Math.max(...latitudes);
    const minLng = Math.min(...longitudes);
    const maxLng = Math.max(...longitudes);

    const midLat = (minLat + maxLat) / 2;
    const midLng = (minLng + maxLng) / 2;

    let latSpan = maxLat - minLat;
    let lngSpan = maxLng - minLng;

    // Apply a padding factor to ensure the route is not right at the edge
    const paddingFactor = 1.05; // Current value, can be reduced further if needed
    latSpan *= paddingFactor;
    lngSpan *= paddingFactor;

    // Ensure a minimum span to avoid issues with extremely small routes
    // This minimum span should be small enough to still appear zoomed in for tiny routes
    const minSpan = 0.0001; // Adjusted to an even smaller value (approx 11 meters)
    latSpan = Math.max(latSpan, minSpan);
    lngSpan = Math.max(lngSpan, minSpan);

    // To ensure the entire route fits in a square map preview,
    // take the larger of the two spans and apply it to both deltas.
    const maxOverallSpan = Math.max(latSpan, lngSpan);

    return {
        latitude: midLat,
        longitude: midLng,
        latitudeDelta: maxOverallSpan,
        longitudeDelta: maxOverallSpan,
    };
};

const SessionCard = ({ session, onDelete, onNavigate }: { session: FishingSession, onDelete: () => void, onNavigate: () => void }) => {
    const date = session.ended_at ? new Date(session.ended_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }) : 'Date inconnue';
    const duration = formatDuration(session.duration_minutes);

    const sessionRoute = session.route ? (session.route as unknown as { latitude: number; longitude: number }[]) : [];
    const mapRegion = getMapRegion(sessionRoute);

    return (
        <View style={styles.cardWrapper}>
            <Swipeable renderRightActions={(progress, dragX) => renderRightActions(progress, dragX, onDelete)}>
                <TouchableOpacity onPress={onNavigate}>
                    <View style={styles.card}>
                        {mapRegion ? ( // Check if mapRegion is defined (meaning route has at least one point)
                            <View style={styles.mapPreviewContainer}>
                                <MapView
                                    style={styles.mapPreview}
                                    initialRegion={mapRegion}
                                    scrollEnabled={false}
                                    zoomEnabled={false}
                                    rotateEnabled={false}
                                    pitchEnabled={false}
                                >
                                    {sessionRoute.length > 1 && ( // Only draw polyline if there are at least two points
                                        <Polyline
                                            coordinates={sessionRoute}
                                            strokeColor={theme.colors.primary[500]}
                                            strokeWidth={3}
                                        />
                                    )}
                                </MapView>
                            </View>
                        ) : (
                            <View style={[styles.mapPreviewContainer, styles.noRouteContainer]}>
                                <Ionicons name="map-outline" size={20} color={theme.colors.text.secondary} style={{ marginBottom: 2 }} />
                                <Text style={styles.noRouteText}>Aucun tracé</Text>
                            </View>
                        )}
                        <View style={styles.cardContent}>
                            <Text style={styles.cardTitle}>{session.location_name || 'Session sans nom'}</Text>
                            <View style={styles.cardInfoContainer}>
                                <Text style={styles.cardInfoText}>{date}</Text>
                                {duration && (
                                    <Text style={styles.cardInfoText}>{duration}</Text>
                                )}
                            </View>
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
        // Removed onGoBack from params as useFocusEffect in SessionScreen handles data refresh
        navigation.navigate('SessionDetail', {
            sessionId: sessionId,
            // onGoBack: (modified: boolean) => {
            //     if (modified) {
            //         loadData(true); // Silently refresh data
            //     }
            // },
        });
    }, [navigation]); // Removed loadData from dependencies as it's not directly used here anymore

    const handleNavigateToNewSession = useCallback(() => {
        navigation.navigate('NewSession', {
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
                    !loading && (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>Aucun historique de session pour le moment.</Text>
                        </View>
                    )
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
        ...theme.shadows.sm,
        borderWidth: 1,
        borderColor: theme.colors.border.light,
        overflow: 'hidden',
        flexDirection: 'row',
        alignItems: 'center',
        padding: theme.spacing[3],
    },
    cardContent: {
        flex: 1,
        paddingLeft: theme.spacing[3],
    },
    cardTitle: {
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: theme.typography.fontSize.lg,
        color: theme.colors.text.primary,
        marginBottom: theme.spacing[1], // Reduced margin
    },
    cardInfoContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: theme.spacing[1], // Reduced margin
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
    mapPreviewContainer: {
        height: 80,
        width: 80,
        borderRadius: theme.borderRadius.md,
        overflow: 'hidden',
        marginRight: theme.spacing[3],
        borderWidth: 1,
        borderColor: theme.colors.border.light,
    },
    mapPreview: {
        ...StyleSheet.absoluteFillObject,
    },
    noRouteContainer: {
        backgroundColor: theme.colors.background.default,
        opacity: 0.7,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
    },
    noRouteText: {
        fontFamily: theme.typography.fontFamily.regular,
        fontSize: 8,
        color: theme.colors.text.secondary,
        textAlign: 'center',
        marginTop: 0,
    },
});
