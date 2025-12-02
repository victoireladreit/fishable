import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';
import MapView, { Polyline, Region, Marker } from 'react-native-maps';
import { theme } from '../../theme';
import { FishingSession } from '../../services';
import {formatDuration} from "../../lib/formatters";
import { renderDeleteAction } from '../common/SwipeableActions';

// Helper function to calculate map region from route coordinates or single point
const getMapRegion = (
    route: { latitude: number; longitude: number }[],
    singlePointLat?: number | null,
    singlePointLng?: number | null
): Region | undefined => {
    if (route && route.length > 0) {
        // Existing logic for routes
        if (route.length === 1) {
            return {
                latitude: route[0].latitude,
                longitude: route[0].longitude,
                latitudeDelta: 0.005, // Adjusted for closer view for single point
                longitudeDelta: 0.005,
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

        const paddingFactor = 1.05;
        latSpan *= paddingFactor;
        lngSpan *= paddingFactor;

        const minSpan = 0.0001;
        latSpan = Math.max(latSpan, minSpan);
        lngSpan = Math.max(lngSpan, minSpan);

        const maxOverallSpan = Math.max(latSpan, lngSpan);

        return {
            latitude: midLat,
            longitude: midLng,
            latitudeDelta: maxOverallSpan,
            longitudeDelta: maxOverallSpan,
        };
    } else if (singlePointLat != null && singlePointLng != null) {
        // New logic for single point (e.g., post-session without route)
        return {
            latitude: singlePointLat,
            longitude: singlePointLng,
            latitudeDelta: 0.005, // Adjusted for a slightly wider view
            longitudeDelta: 0.005,
        };
    }

    return undefined;
};

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
    const mapRegion = getMapRegion(sessionRoute, session.location_lat, session.location_lng);

    const hasLocationData = (sessionRoute && sessionRoute.length > 0) || (session.location_lat != null && session.location_lng != null);

    const canPublish = session.ended_at && !session.published_at && onPublish;

    const renderMainContent = () => (
        <TouchableOpacity onPress={() => onNavigate(session.id)}>
            <View style={styles.card}>
                {hasLocationData ? (
                    <View style={styles.mapPreviewContainer}>
                        <MapView
                            style={styles.mapPreview}
                            initialRegion={mapRegion}
                            scrollEnabled={false}
                            zoomEnabled={false}
                            rotateEnabled={false}
                            pitchEnabled={false}
                        >
                            {sessionRoute.length > 1 && (
                                <Polyline
                                    coordinates={sessionRoute}
                                    strokeColor={theme.colors.primary[500]}
                                    strokeWidth={3}
                                />
                            )}
                            {session.location_lat != null && session.location_lng != null && sessionRoute.length === 0 && (
                                <Marker
                                    coordinate={{ latitude: session.location_lat, longitude: session.location_lng }}
                                    anchor={{ x: 0.5, y: 0.5 }}
                                >
                                    <View style={styles.startMarker} />
                                </Marker>
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
                    <View style={styles.titleRow}>
                        <Text style={styles.cardTitle} numberOfLines={1} ellipsizeMode="tail">{session.location_name || 'Session sans nom'}</Text>
                        {canPublish && (
                            <TouchableOpacity onPress={() => onPublish(session.id)} style={styles.publishButton}>
                                <Ionicons name="arrow-up-circle-outline" size={24} color={theme.colors.primary[500]} />
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
    startMarker: {
        height: 14,
        width: 14,
        borderRadius: 7,
        backgroundColor: theme.colors.success.main,
        borderColor: theme.colors.white,
        borderWidth: 2,
    },
});
