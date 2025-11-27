import React, { useRef, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { theme } from '../../theme';
import { Ionicons } from '@expo/vector-icons';
import { Database } from '../../lib/types';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/types';

type ProfileInfo = Pick<Database['public']['Tables']['profiles']['Row'], 'username' | 'avatar_url'>;

export type TopCatch = Database['public']['Tables']['catches']['Row'] & {
    fishing_sessions: {
        started_at: string;
        location_name: string | null;
        profiles: ProfileInfo | null;
    } | null;
};

interface CatchLeaderboardCardProps {
    rank: number;
    catchData: TopCatch;
    isFeatured?: boolean;
    // Props for celebration animation
    showCelebration?: boolean;
    animatedScale?: Animated.Value;
    animatedOpacity?: Animated.Value;
    animatedRotate?: Animated.Value;
}

export const CatchLeaderboardCard: React.FC<CatchLeaderboardCardProps> = ({ 
    rank, 
    catchData, 
    isFeatured = false,
    showCelebration = false,
    animatedScale,
    animatedOpacity,
    animatedRotate,
}) => {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const { id: catchId, size_cm, weight_kg, photo_url, caught_at, session_id, fishing_sessions } = catchData; // Destructurer catchId

    let displayValue = '-';
    if (size_cm && weight_kg) {
        displayValue = `${size_cm} cm / ${weight_kg} kg`;
    } else if (size_cm) {
        displayValue = `${size_cm} cm`;
    } else if (weight_kg) {
        displayValue = `${weight_kg} kg`;
    }

    const locationName = fishing_sessions?.location_name;
    const date = fishing_sessions?.started_at ? new Date(fishing_sessions.started_at).toLocaleDateString() : (caught_at ? new Date(caught_at).toLocaleDateString() : null);

    const handleSessionPress = () => {
        if (session_id) {
            navigation.navigate('SessionDetail', { sessionId: session_id });
        }
    };

    const handleImagePress = () => {
        if (catchId) {
            navigation.navigate('CatchDetail', { catchId: catchId });
        }
    };
    
    const getRankColor = () => {
        switch (rank) {
            case 1: return theme.colors.accent[500];
            case 2: return theme.colors.gray[500];
            case 3: return theme.colors.accent[800];
            default: return theme.colors.text.secondary;
        }
    };

    const rotateInterpolate = animatedRotate?.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '-15deg'],
    });

    const renderRankBadge = () => {
        if (rank >= 1 && rank <= 3) {
            let trophyColor = '';
            switch (rank) {
                case 1: trophyColor = theme.colors.accent[500]; break;
                case 2: trophyColor = theme.colors.gray[500]; break;
                case 3: trophyColor = theme.colors.accent[800]; break;
            }
            return (
                <View style={[styles.trophyBadge, { backgroundColor: trophyColor }]}>
                    <Ionicons name="trophy" size={16} color={theme.colors.white} />
                    <Text style={styles.trophyRankText}>{rank}</Text>
                </View>
            );
        } else {
            return (
                <View style={styles.rankBadge}>
                    <Text style={[styles.rankText, { color: getRankColor() }]}>#{rank}</Text>
                </View>
            );
        }
    };

    return (
        <View style={[styles.card, isFeatured && styles.featuredCard]}>
            <TouchableOpacity onPress={handleImagePress} disabled={!catchId}>
                <Image source={{ uri: photo_url || undefined }} style={[styles.catchImage, isFeatured && styles.featuredCatchImage]} />
            </TouchableOpacity>
            {renderRankBadge()}
            <View style={styles.infoContainer}>
                <View style={styles.catchDetailRow}>
                    <Ionicons name="fish-outline" size={14} color={theme.colors.text.secondary} />
                    <Text style={styles.valueText}>{displayValue}</Text>
                </View>
                {date && (
                    <View style={styles.catchDetailRow}>
                        <Ionicons name="calendar-outline" size={14} color={theme.colors.text.secondary} />
                        <Text style={styles.valueText}>{date}</Text>
                    </View>
                )}
                {session_id && ( // Only show if there's a session
                    <TouchableOpacity onPress={handleSessionPress} disabled={!session_id} style={styles.catchDetailRow}>
                        <Ionicons name="albums-outline" size={14} color={theme.colors.primary[500]} />
                        <Text style={[styles.valueText, styles.sessionLink]} numberOfLines={1}>{locationName || 'Voir Session'}</Text>
                    </TouchableOpacity>
                )}
            </View>

            {isFeatured && showCelebration && animatedOpacity && animatedScale && animatedRotate && (
                <Animated.View style={[styles.celebrationContainer, {
                    opacity: animatedOpacity,
                    transform: [
                        { scale: animatedScale },
                        { rotate: rotateInterpolate || '0deg' }
                    ]
                }]}>
                    <Text style={styles.celebrationText}>Capturé !</Text>
                </Animated.View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        width: 200,
        backgroundColor: theme.colors.background.paper,
        borderRadius: theme.borderRadius.md,
        marginRight: theme.spacing[3],
        ...theme.shadows.base,
        overflow: 'hidden',
    },
    featuredCard: {
        width: '100%',
        marginRight: 0,
    },
    catchImage: {
        width: '100%',
        aspectRatio: 1,
        backgroundColor: theme.colors.gray[200],
    },
    featuredCatchImage: {
        aspectRatio: 1.2,
    },
    rankBadge: {
        position: 'absolute',
        top: 8,
        left: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: theme.borderRadius.sm,
        paddingHorizontal: theme.spacing[2],
        paddingVertical: theme.spacing[1],
        zIndex: 1,
    },
    rankText: {
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: theme.typography.fontSize.base,
    },
    trophyBadge: {
        position: 'absolute',
        top: 8,
        left: 8,
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: theme.borderRadius.full, // Make it circular
        paddingHorizontal: theme.spacing[2],
        paddingVertical: theme.spacing[1],
        zIndex: 1,
        ...theme.shadows.md, // Add some shadow for depth
    },
    trophyRankText: {
        marginLeft: theme.spacing[1],
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: theme.typography.fontSize.base,
        color: theme.colors.white,
    },
    infoContainer: {
        padding: theme.spacing[2],
    },
    catchDetailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: theme.spacing[1],
    },
    valueText: {
        marginLeft: theme.spacing[2],
        fontFamily: theme.typography.fontFamily.medium,
        fontSize: theme.typography.fontSize.sm,
        color: theme.colors.text.secondary,
        flexShrink: 1,
    },
    sessionLink: {
        color: theme.colors.primary[500],
        textDecorationLine: 'underline',
    },
    celebrationContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
        zIndex: 10,
    },
    celebrationText: {
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: theme.typography.fontSize['3xl'],
        color: theme.colors.white,
        textTransform: 'uppercase',
        ...theme.shadows.lg,
        shadowColor: theme.colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 3,
    },
});