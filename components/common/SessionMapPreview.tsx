import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MapView, { Polyline, Region, Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { LocationVisibility } from '../../lib/constants';
import { formatDuration } from '../../lib/formatters';

// Define a type for the specific Ionicons names used for weather
type WeatherIconName = 'cloud-outline' | 'sunny-outline' | 'cloudy-outline' | 'rainy-outline' | 'snow-outline' | 'thunderstorm-outline';

interface SessionMapPreviewProps {
    sessionRoute?: { latitude: number; longitude: number }[];
    locationLat?: number | null;
    locationLng?: number | null;
    mapHeight?: number;
    aspectRatio?: number;
    locationVisibility?: LocationVisibility;
    forceShowDetailedLocation?: boolean;
    duration?: number | null;
    distance?: number | null;
    weatherTemp?: number | null;
    weatherConditions?: string | null;
    catchCount?: number | null;
}

// Helper function to calculate map region from route coordinates or single point
const getMapRegion = (
    route: { latitude: number; longitude: number }[],
    isPrivateVisibility: boolean,
    singlePointLat?: number | null,
    singlePointLng?: number | null,
): Region | undefined => {
    const privateDelta = 0.2;
    const defaultDelta = 0.005;

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

// Helper to get weather icon
const getWeatherIcon = (conditions: string | null): WeatherIconName => { // Explicitly type return
    if (!conditions) return 'cloud-outline'; // Default icon
    const lowerConditions = conditions.toLowerCase();
    if (lowerConditions.includes('soleil') || lowerConditions.includes('clair')) return 'sunny-outline';
    if (lowerConditions.includes('nuageux')) return 'cloudy-outline';
    if (lowerConditions.includes('pluie')) return 'rainy-outline';
    if (lowerConditions.includes('neige')) return 'snow-outline';
    if (lowerConditions.includes('orage')) return 'thunderstorm-outline';
    if (lowerConditions.includes('brouillard')) return 'cloud-outline';
    return 'cloud-outline';
};

export const SessionMapPreview: React.FC<SessionMapPreviewProps> = ({
    sessionRoute = [],
    locationLat,
    locationLng,
    mapHeight,
    aspectRatio = 1,
    locationVisibility,
    forceShowDetailedLocation = false,
    duration,
    distance,
    weatherTemp,
    weatherConditions,
    catchCount,
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

    const stats: { label: string; value?: string; icon?: WeatherIconName }[] = []; // Explicitly type stats array
    if (duration != null) stats.push({ label: 'Durée', value: formatDuration(duration) ?? '- min' });
    if (distance != null) stats.push({ label: 'Distance', value: `${distance.toFixed(2)} km` });
    if (weatherTemp != null || weatherConditions) {
        stats.push({
            label: 'Météo',
            icon: weatherConditions ? getWeatherIcon(weatherConditions) : undefined,
            value: weatherTemp != null ? `${weatherTemp}°C` : undefined,
        });
    }
    if (catchCount != null) stats.push({ label: 'Poissons', value: `${catchCount}` }); // Changed 'Prises' to 'Poissons'

    return (
        <View style={[styles.mapPreviewContainer, dynamicContainerStyle]}>
            <MapView
                style={styles.mapPreview}
                region={mapRegion}
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
            {stats.length > 0 && (
                <View style={styles.statsBanner}>
                    {stats.map((stat, index) => (
                        <React.Fragment key={stat.label}>
                            <View style={styles.statItem}>
                                <Text style={styles.statLabel}>{stat.label}</Text>
                                <View style={styles.weatherInfo}>
                                    {stat.icon && <Ionicons name={stat.icon} size={16} color={theme.colors.gray["700"]} />}
                                    {stat.value && <Text style={styles.statValue}> {stat.value}</Text>}
                                </View>
                            </View>
                            {index < stats.length - 1 && <View style={styles.statSeparator} />}
                        </React.Fragment>
                    ))}
                </View>
            )}
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
    statsBanner: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: theme.colors.gray["100"], // Changed to light gray
        paddingVertical: theme.spacing[2] + 2,
        paddingHorizontal: theme.spacing[4],
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        borderBottomLeftRadius: theme.borderRadius.md,
        borderBottomRightRadius: theme.borderRadius.md,
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
        paddingHorizontal: theme.spacing[1],
    },
    statLabel: {
        color: theme.colors.gray["600"], // Changed to medium gray
        fontSize: theme.typography.fontSize.xs,
        fontFamily: theme.typography.fontFamily.regular,
        marginBottom: theme.spacing[0],
    },
    statValue: {
        color: theme.colors.gray["800"], // Changed to dark gray
        fontSize: theme.typography.fontSize.base,
        fontFamily: theme.typography.fontFamily.bold,
    },
    weatherInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    statSeparator: {
        height: '60%',
        width: 1,
        backgroundColor: theme.colors.gray[300], // Changed to light gray
        opacity: 0.7,
    },
});
