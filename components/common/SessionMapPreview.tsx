import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MapView, { Polyline, Region, Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { LocationVisibility } from '../../lib/constants'; // Import LocationVisibility type

interface SessionMapPreviewProps {
    sessionRoute?: { latitude: number; longitude: number }[];
    locationLat?: number | null;
    locationLng?: number | null;
    mapHeight?: number; // Optional fixed height
    aspectRatio?: number; // Optional aspect ratio, defaults to 1 for square. Only applies if mapHeight is NOT set.
    locationVisibility?: LocationVisibility; // New prop for conditional rendering
    forceShowDetailedLocation?: boolean; // New prop to force showing detailed location
}

// Helper function to calculate map region from route coordinates or single point
const getMapRegion = (
    route: { latitude: number; longitude: number }[],
    isPrivateVisibility: boolean, // New parameter to adjust delta for private visibility
    singlePointLat?: number | null,
    singlePointLng?: number | null,
): Region | undefined => {
    const privateDelta = 0.2; // A larger delta for city/region view
    const defaultDelta = 0.005; // Default zoomed-in delta

    if (route && route.length > 0) {
        if (route.length === 1) {
            return {
                latitude: route[0].latitude,
                longitude: route[0].longitude,
                latitudeDelta: isPrivateVisibility ? privateDelta : defaultDelta,
                longitudeDelta: isPrivateVisibility ? privateDelta : defaultDelta,
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
            latitudeDelta: isPrivateVisibility ? privateDelta : maxOverallSpan,
            longitudeDelta: isPrivateVisibility ? privateDelta : maxOverallSpan,
        };
    } else if (singlePointLat != null && singlePointLng != null) {
        return {
            latitude: singlePointLat,
            longitude: singlePointLng,
            latitudeDelta: isPrivateVisibility ? privateDelta : defaultDelta,
            longitudeDelta: isPrivateVisibility ? privateDelta : defaultDelta,
        };
    }

    return undefined;
};

export const SessionMapPreview: React.FC<SessionMapPreviewProps> = ({
    sessionRoute = [],
    locationLat,
    locationLng,
    mapHeight,
    aspectRatio = 1,
    locationVisibility,
    forceShowDetailedLocation = false,
}) => {
    const showDetailedLocation = forceShowDetailedLocation || locationVisibility === 'public';
    const isPrivateVisibility = !showDetailedLocation && locationVisibility === 'private';

    const mapRegion = getMapRegion(sessionRoute, isPrivateVisibility, locationLat, locationLng);
    const hasLocationData = (sessionRoute && sessionRoute.length > 0) || (locationLat != null && locationLng != null);

    const dynamicContainerStyle: any = {};

    if (mapHeight) {
        dynamicContainerStyle.height = mapHeight;
        dynamicContainerStyle.width = mapHeight * (aspectRatio || 1);
    } else {
        dynamicContainerStyle.width = '100%';
        dynamicContainerStyle.aspectRatio = aspectRatio;
    }

    if (!hasLocationData) {
        return (
            <View style={[styles.mapPreviewContainer, dynamicContainerStyle, styles.noRouteContainer]}>
                <Ionicons name="map-outline" size={theme.iconSizes.base} color={theme.colors.text.secondary} style={{ marginBottom: theme.spacing[1] }} />
                <Text style={styles.noRouteText}>Aucun tracé</Text>
            </View>
        );
    }

    if (!mapRegion) {
        return (
            <View style={[styles.mapPreviewContainer, dynamicContainerStyle, styles.noRouteContainer]}>
                <Ionicons name="map-outline" size={theme.iconSizes.base} color={theme.colors.text.secondary} style={{ marginBottom: theme.spacing[1] }} />
                <Text style={styles.noRouteText}>Localisation non disponible</Text>
            </View>
        );
    }

    return (
        <View style={[styles.mapPreviewContainer, dynamicContainerStyle]}>
            <MapView
                style={styles.mapPreview}
                region={mapRegion} // Changed from initialRegion to region
                scrollEnabled={false}
                zoomEnabled={false}
                rotateEnabled={false}
                pitchEnabled={false}
            >
                {showDetailedLocation && sessionRoute.length > 1 && (
                    <Polyline
                        coordinates={sessionRoute}
                        strokeColor={theme.colors.primary[500]}
                        strokeWidth={3}
                    />
                )}
                {showDetailedLocation && locationLat != null && locationLng != null && sessionRoute.length === 0 && (
                    <Marker
                        coordinate={{ latitude: locationLat, longitude: locationLng }}
                        anchor={{ x: 0.5, y: 0.5 }}
                    >
                        <View style={styles.startMarker} />
                    </Marker>
                )}
            </MapView>
        </View>
    );
};

const styles = StyleSheet.create({
    mapPreviewContainer: {
        borderRadius: theme.borderRadius.md,
        overflow: 'hidden',
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
        fontSize: theme.typography.fontSize.sm,
        color: theme.colors.text.secondary,
        textAlign: 'center',
        marginTop: theme.spacing[1],
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
