import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';
import { theme } from '../../theme';
import { FishingSession } from '../../services';
import { formatDuration } from "../../lib/formatters";
import { renderDeleteAction } from '../common/SwipeableActions';
import { SessionMapPreview } from '../common/SessionMapPreview'; // Import the new component

interface SessionListItemProps {
    session: FishingSession;
    onNavigate: (sessionId: string) => void;
    onDelete?: (sessionId: string) => void;
    onPublish?: (sessionId: string) => void;
}

export const SessionListItem = ({ session, onDelete, onNavigate, onPublish }: SessionListItemProps) => {
    const date = session.ended_at ? new Date(session.ended_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }) : 'Date inconnue';
    const duration = formatDuration(session.duration_minutes);

    const sessionRoute = session.route ? (session.route as unknown as { latitude: number; longitude: number }[]) : [];
    // getMapRegion and hasLocationData logic is now encapsulated in SessionMapPreview

    const canPublish = session.ended_at && !session.published_at && onPublish;

    const renderMainContent = () => (
        <TouchableOpacity onPress={() => onNavigate(session.id)}>
            <View style={styles.card}>
                <SessionMapPreview
                    sessionRoute={sessionRoute}
                    locationLat={session.location_lat}
                    locationLng={session.location_lng}
                    mapHeight={80} // Fixed height for list item
                    locationVisibility={session.location_visibility || 'private'}
                    forceShowDetailedLocation={true}
                />
                <View style={styles.cardContent}>
                    <View style={styles.titleRow}>
                        <Text style={styles.cardTitle} numberOfLines={1} ellipsizeMode="tail">{session.location_name || 'Session sans nom'}</Text>
                        {canPublish && (
                            <TouchableOpacity onPress={() => onPublish(session.id)} style={styles.publishButton}>
                                <Ionicons name="paper-plane-outline" size={24} color={theme.colors.primary[500]} />
                            </TouchableOpacity>
                        )}
                    </View>
                    <View style={styles.cardInfoContainer}>
                        <Text style={styles.cardInfoText}>{date}</Text>
                        {duration && (
                            <Text style={styles.cardInfoText}>{duration}</Text>
                        )}
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.cardWrapper}>
            {onDelete ? (
                <Swipeable renderRightActions={(progress, dragX) => renderDeleteAction(progress, dragX, () => onDelete(session.id))}>
                    {renderMainContent()}
                </Swipeable>
            ) : (
                renderMainContent()
            )}
        </View>
    );
};

const styles = StyleSheet.create({
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
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing[1],
    },
    cardTitle: {
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: theme.typography.fontSize.lg,
        color: theme.colors.text.primary,
        flexShrink: 1,
        marginRight: theme.spacing[2],
    },
    publishButton: {
        // No specific styles needed if alignment is correct
    },
    cardInfoContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: theme.spacing[1],
    },
    cardInfoText: {
        fontFamily: theme.typography.fontFamily.regular,
        fontSize: theme.typography.fontSize.sm,
        color: theme.colors.text.secondary,
    },
    // Removed map-related styles as they are now in SessionMapPreview.tsx
});
