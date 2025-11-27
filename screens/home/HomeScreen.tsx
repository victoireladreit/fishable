import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Image, RefreshControl, Dimensions, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { theme } from '../../theme';
import { supabase } from '../../config/supabase';
import { Database, Json } from '../../lib/types';
import { Card, InfoRow } from '../../components/common';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { SessionDetailsCompact } from '../../components/session/SessionDetailsCompact'; // Import the new component

const { width } = Dimensions.get('window');
const IMAGE_HEIGHT = 250; // Slightly larger image for social feed feel
const CATCH_IMAGE_SIZE = 80; // Smaller catch images for compactness
const CATCH_CARD_WIDTH = width * 0.4; // Make catch cards smaller

type FishingSession = Database['public']['Tables']['fishing_sessions']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];
type SessionPhoto = Database['public']['Tables']['session_photos']['Row'];
type Catch = Database['public']['Tables']['catches']['Row'];

interface FishingSessionWithProfile extends FishingSession {
    profiles: Profile;
    session_photos: SessionPhoto[];
    catches: Catch[];
}

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

// Helper for wind strength translation
const translateWindStrength = (strength: 'calm' | 'light' | 'moderate' | 'strong' | null) => {
    switch (strength) {
        case 'calm': return 'Calme';
        case 'light': return 'Léger';
        case 'moderate': return 'Modéré';
        case 'strong': return 'Fort';
        default: return 'Non spécifié';
    }
};

// Helper to format date for social feed (e.g., "2 hours ago", "yesterday", "Dec 15")
const formatDateForFeed = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.round((now.getTime() - date.getTime()) / 1000);
    const minutes = Math.round(seconds / 60);
    const hours = Math.round(minutes / 60);
    const days = Math.round(hours / 24);

    if (seconds < 60) return 'à l\'instant';
    if (minutes < 60) return `il y a ${minutes} min`;
    if (hours < 24) return `il y a ${hours} h`;
    if (days < 7) return `il y a ${days} j`;
    
    // For older dates, use a more standard format
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
};

export const HomeScreen = () => {
    const { user } = useAuth();
    const navigation = useNavigation<HomeScreenNavigationProp>();
    const [sessions, setSessions] = useState<FishingSessionWithProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const fetchFishingSessions = useCallback(async () => {
        if (!isRefreshing) setLoading(true);
        
        const { data, error } = await supabase
            .from('fishing_sessions')
            .select(`
                *,
                profiles (
                    username,
                    avatar_url
                ),
                session_photos (
                    photo_url,
                    caption,
                    order_index
                ),
                catches (
                    id,
                    species_name,
                    size_cm,
                    weight_kg,
                    photo_url,
                    notes,
                    is_released,
                    caught_at
                )
            `)
            .eq('is_published', true)
            .order('created_at', { ascending: false })
            .order('order_index', { foreignTable: 'session_photos', ascending: true })
            .order('size_cm', { foreignTable: 'catches', ascending: false, nullsFirst: false });

        if (error) {
            console.error('Error fetching fishing sessions:', error);
            setError(error.message);
            setSessions([]);
        } else {
            setSessions(data as FishingSessionWithProfile[]);
            setError(null);
        }
        setLoading(false);
        setIsRefreshing(false);
    }, [isRefreshing]);

    useEffect(() => {
        fetchFishingSessions();

        const subscription = supabase
            .channel('public:fishing_sessions')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'fishing_sessions' }, payload => {
                console.log('Change received!', payload);
                fetchFishingSessions();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        };
    }, [fetchFishingSessions]);

    const onRefresh = useCallback(() => {
        setIsRefreshing(true);
        fetchFishingSessions();
    }, [fetchFishingSessions]);

    const handlePressSession = (sessionId: string) => {
        navigation.navigate('SessionDetail', { sessionId });
    };

    const handlePressCatch = (catchId: string) => {
        navigation.navigate('CatchDetail', { catchId });
    };

    const renderCatchItem = ({ item }: { item: Catch }) => (
        <TouchableOpacity onPress={() => handlePressCatch(item.id)} style={styles.catchItemCard}>
            <View style={styles.catchItem}>
                {item.photo_url ? (
                    <Image source={{ uri: item.photo_url }} style={styles.catchImage} />
                ) : (
                    <View style={styles.catchImagePlaceholder} />
                )}
                <View style={styles.catchDetails}>
                    <Text style={styles.catchSpecies} numberOfLines={1}>{item.species_name}</Text>
                    <View style={styles.catchStats}>
                        {item.size_cm && <Text style={styles.catchStatText}>{item.size_cm} cm</Text>}
                        {item.weight_kg && <Text style={styles.catchStatText}>{item.weight_kg} kg</Text>}
                    </View>
                    {item.is_released && (
                        <View style={styles.releasedIndicator}>
                            <Ionicons name="leaf-outline" size={theme.typography.fontSize.sm} color={theme.colors.success.main} />
                            <Text style={styles.releasedText}>Relâché</Text>
                        </View>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );

    const renderSessionItem = ({ item }: { item: FishingSessionWithProfile }) => {
        const isMySession = user?.id === item.user_id;

        return (
            <Card style={styles.sessionCard}>
                <View style={styles.sessionHeader}>
                    <TouchableOpacity style={styles.profileInfoContainer}>
                        {item.profiles?.avatar_url ? (
                            <Image source={{ uri: item.profiles.avatar_url }} style={styles.avatar} />
                        ) : (
                            <View style={styles.avatarPlaceholder} />
                        )}
                        <View>
                            <Text style={styles.username}>{item.profiles?.username || 'Utilisateur inconnu'}</Text>
                            <Text style={styles.postTime}>{item.created_at ? formatDateForFeed(item.created_at) : "-"}</Text>
                        </View>
                    </TouchableOpacity>
                    {/* Optionally add a menu icon here for more options */}
                    {/* <Ionicons name="ellipsis-vertical" size={20} color={theme.colors.text.secondary} /> */}
                </View>

                {item.session_photos && item.session_photos.length > 0 && (
                    <Image
                        source={{ uri: item.session_photos[0].photo_url }}
                        style={styles.sessionImage}
                        resizeMode="cover"
                    />
                )}

                <View style={styles.sessionContent}>
                    {item.caption && <Text style={styles.caption}>{item.caption}</Text>}
                    
                    {/* Compact Session Details */}
                    <SessionDetailsCompact session={item} />

                    {item.catches && item.catches.length > 0 && (
                        <View style={styles.catchesContainer}>
                            <Text style={styles.catchesTitle}>Prises de la session ({item.catches.length})</Text>
                            <FlatList
                                horizontal
                                data={item.catches}
                                renderItem={renderCatchItem}
                                keyExtractor={(catchItem) => catchItem.id}
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.catchesCarousel}
                            />
                        </View>
                    )}
                    {/* Social Action Buttons - Moved to bottom */}
                    <View style={styles.socialActionsBar}>
                        <TouchableOpacity style={styles.socialActionButton}>
                            <Ionicons name="heart-outline" size={24} color={theme.colors.text.secondary} />
                            <Text style={styles.socialActionText}>J'aime</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.socialActionButton}>
                            <Ionicons name="chatbubble-outline" size={24} color={theme.colors.text.secondary} />
                            <Text style={styles.socialActionText}>Commenter</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.socialActionButton}>
                            <Ionicons name="share-outline" size={24} color={theme.colors.text.secondary} />
                            <Text style={styles.socialActionText}>Partager</Text>
                        </TouchableOpacity>
                    </View>

                    {isMySession && (
                        <TouchableOpacity onPress={() => handlePressSession(item.id)} style={styles.viewMySessionButton}>
                            <Text style={styles.viewMySessionButtonText}>Voir ma session complète</Text>
                            <Ionicons name="arrow-forward" size={theme.typography.fontSize.base} color={theme.colors.primary[500]} />
                        </TouchableOpacity>
                    )}


                </View>
            </Card>
        );
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.headerContainer}>
                <Text style={styles.title}>🎣 Fishable</Text>
            </View>

            {loading && !isRefreshing ? (
                <ActivityIndicator size="large" color={theme.colors.primary[500]} style={styles.loadingIndicator} />
            ) : error ? (
                <Text style={styles.errorText}>Erreur de chargement des sessions: {error}</Text>
            ) : (
                <FlatList
                    data={sessions}
                    renderItem={renderSessionItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.feedList}
                    ListEmptyComponent={<Text style={styles.emptyFeedText}>Aucune session de pêche publiée pour le moment.</Text>}
                    refreshControl={
                        <RefreshControl
                            refreshing={isRefreshing}
                            onRefresh={onRefresh}
                            tintColor={theme.colors.primary[500]}
                        />
                    }
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: theme.colors.background.default,
    },
    headerContainer: {
        padding: theme.spacing[4],
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border.main,
    },
    title: {
        fontSize: theme.typography.fontSize['3xl'],
        fontFamily: theme.typography.fontFamily.bold,
        color: theme.colors.text.primary,
    },
    loadingIndicator: {
        marginTop: theme.spacing[8],
    },
    errorText: {
        color: theme.colors.error.main,
        textAlign: 'center',
        marginTop: theme.spacing[8],
        fontSize: theme.typography.fontSize.lg,
    },
    emptyFeedText: {
        textAlign: 'center',
        marginTop: theme.spacing[8],
        color: theme.colors.text.secondary,
        fontSize: theme.typography.fontSize.base,
    },
    feedList: {
        paddingVertical: theme.spacing[4],
        paddingHorizontal: theme.spacing[2],
    },
    sessionCard: {
        marginBottom: theme.spacing[4],
        padding: 0,
        borderRadius: theme.borderRadius.lg, // More rounded corners for a modern look
        overflow: 'hidden', // Ensure image corners are rounded
    },
    sessionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between', // Space between profile info and potential menu icon
        padding: theme.spacing[4],
        paddingBottom: theme.spacing[2],
    },
    profileInfoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 48, // Slightly larger avatar
        height: 48,
        borderRadius: theme.borderRadius.full,
        marginRight: theme.spacing[3], // More space
        backgroundColor: theme.colors.primary[200],
        borderWidth: 1, // Add a subtle border
        borderColor: theme.colors.border.light,
    },
    avatarPlaceholder: {
        width: 48,
        height: 48,
        borderRadius: theme.borderRadius.full,
        marginRight: theme.spacing[3],
        backgroundColor: theme.colors.primary[200],
        borderWidth: 1,
        borderColor: theme.colors.border.light,
    },
    username: {
        fontFamily: theme.typography.fontFamily.bold, // Make username bolder
        fontSize: theme.typography.fontSize.lg,
        color: theme.colors.text.primary,
    },
    postTime: {
        fontFamily: theme.typography.fontFamily.regular,
        fontSize: theme.typography.fontSize.sm,
        color: theme.colors.text.secondary,
        marginTop: theme.spacing[0],
    },
    sessionImage: {
        width: '100%', // Image takes full width of the card
        height: IMAGE_HEIGHT,
        backgroundColor: theme.colors.background.paper,
        // No marginBottom here, caption will follow directly
    },
    sessionContent: {
        padding: theme.spacing[4],
        paddingTop: theme.spacing[3], // Slightly less padding at the top after image
    },
    caption: {
        fontFamily: theme.typography.fontFamily.regular,
        fontSize: theme.typography.fontSize.base,
        color: theme.colors.text.primary,
        marginBottom: theme.spacing[5], // Reduced space after caption
    },
    socialActionsBar: { // Renamed from socialActionsContainer
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingVertical: theme.spacing[3],
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: theme.colors.border.light,
        marginTop: theme.spacing[4], // Added marginTop
        // Removed marginBottom as it's now at the bottom
    },
    socialActionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: theme.spacing[2],
    },
    socialActionText: {
        marginLeft: theme.spacing[1],
        fontFamily: theme.typography.fontFamily.medium,
        fontSize: theme.typography.fontSize.sm,
        color: theme.colors.text.secondary,
    },
    catchesContainer: {
        marginTop: theme.spacing[4],
        borderTopWidth: 1,
        borderTopColor: theme.colors.border.light,
        paddingTop: theme.spacing[3],
    },
    catchesTitle: {
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: theme.typography.fontSize.base,
        color: theme.colors.text.primary,
        marginBottom: theme.spacing[3],
    },
    catchesCarousel: {
        paddingRight: theme.spacing[4],
    },
    catchItemCard: {
        width: CATCH_CARD_WIDTH,
        marginRight: theme.spacing[3],
        backgroundColor: theme.colors.background.paper, // Use paper background for catch cards
        borderRadius: theme.borderRadius.base,
        padding: theme.spacing[2],
        borderWidth: 1,
        borderColor: theme.colors.border.light,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    catchItem: {
        flexDirection: 'column', // Stack image and details vertically
        alignItems: 'flex-start',
    },
    catchImage: {
        width: '100%', // Catch image takes full width of its card
        height: CATCH_IMAGE_SIZE,
        borderRadius: theme.borderRadius.sm,
        marginBottom: theme.spacing[2], // Space below image
        backgroundColor: theme.colors.gray[200],
    },
    catchImagePlaceholder: {
        width: '100%',
        height: CATCH_IMAGE_SIZE,
        borderRadius: theme.borderRadius.sm,
        marginBottom: theme.spacing[2],
        backgroundColor: theme.colors.gray[200],
    },
    catchDetails: {
        flex: 1,
        width: '100%', // Ensure details take full width
    },
    catchSpecies: {
        fontFamily: theme.typography.fontFamily.medium,
        fontSize: theme.typography.fontSize.base,
        color: theme.colors.text.primary,
        marginBottom: theme.spacing[1],
    },
    catchStats: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: theme.spacing[1],
    },
    catchStatText: {
        fontFamily: theme.typography.fontFamily.regular,
        fontSize: theme.typography.fontSize.sm,
        color: theme.colors.text.secondary,
        marginRight: theme.spacing[2],
    },
    releasedIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: theme.spacing[1], // Add margin top
    },
    releasedText: {
        fontFamily: theme.typography.fontFamily.regular,
        fontSize: theme.typography.fontSize.sm,
        color: theme.colors.success.main,
        marginLeft: theme.spacing[1],
    },
    catchNotes: {
        fontFamily: theme.typography.fontFamily.regular,
        fontSize: theme.typography.fontSize.sm,
        color: theme.colors.text.secondary,
        marginTop: theme.spacing[1],
    },
    viewMySessionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: theme.spacing[4],
        paddingTop: theme.spacing[3],
        borderTopWidth: 1,
        borderTopColor: theme.colors.border.light,
    },
    viewMySessionButtonText: {
        fontFamily: theme.typography.fontFamily.medium,
        fontSize: theme.typography.fontSize.base,
        color: theme.colors.primary[500],
    },
});
