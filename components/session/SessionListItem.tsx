import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';
import MapView, { Polyline, Region } from 'react-native-maps';
import { theme } from '../../theme';
import { FishingSession } from '../../services';
import {formatDuration} from "../../lib/formatters";
import { renderDeleteAction } from '../common/SwipeableActions';

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
    const paddingFactor = 1.05;
    latSpan *= paddingFactor;
    lngSpan *= paddingFactor;

    // Ensure a minimum span to avoid issues with extremely small routes
    const minSpan = 0.0001;
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

interface SessionListItemProps {
    session: FishingSession;
    onDelete: (sessionId: string) => void;
    onNavigate: (sessionId: string) => void;
}

export const SessionListItem = ({ session, onDelete, onNavigate }: SessionListItemProps) => {
    const date = session.ended_at ? new Date(session.ended_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }) : 'Date inconnue';
    const duration = formatDuration(session.duration_minutes);

    const sessionRoute = session.route ? (session.route as unknown as { latitude: number; longitude: number }[]) : [];
    const mapRegion = getMapRegion(sessionRoute);

    return (
        <View style={styles.cardWrapper}>
            <Swipeable renderRightActions={(progress, dragX) => renderDeleteAction(progress, dragX, () => onDelete(session.id))}>
                <TouchableOpacity onPress={() => onNavigate(session.id)}>
                    <View style={styles.card}>
                        {mapRegion ? (
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
    cardTitle: {
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: theme.typography.fontSize.lg,
        color: theme.colors.text.primary,
        marginBottom: theme.spacing[1],
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
