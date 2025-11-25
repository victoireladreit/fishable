import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import MapView, { Polyline, Region } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';

interface SessionMapProps {
    route?: { latitude: number; longitude: number }[];
    initialRegion?: Region;
    mapRef: React.RefObject<MapView | null>;
    isMapInteractionEnabled: boolean;
    setMapInteractionEnabled: (enabled: boolean) => void;
    recenterMap: () => void;
    onPanDrag?: () => void;
    showUserLocation?: boolean;
    children?: React.ReactNode;
}

export const SessionMap: React.FC<SessionMapProps> = ({
    route,
    initialRegion,
    mapRef,
    isMapInteractionEnabled,
    setMapInteractionEnabled,
    recenterMap,
    onPanDrag,
    showUserLocation,
    children,
}) => {
    const hasRouteData = route && route.length > 0;

    // Don't render map if there's no route and no initial region, which can happen for old sessions without location data.
    if (!hasRouteData && !initialRegion) {
        return (
            <View style={[styles.mapContainer, styles.mapFallback]}>
                <Text style={styles.mapFallbackText}>Aucune donnée de parcours disponible.</Text>
            </View>
        );
    }

    return (
        <View style={styles.mapContainer}>
            <MapView
                ref={mapRef}
                style={styles.map}
                initialRegion={initialRegion}
                showsUserLocation={showUserLocation}
                onPanDrag={onPanDrag}
                scrollEnabled={isMapInteractionEnabled}
                zoomEnabled={isMapInteractionEnabled}
                showsCompass={true}
            >
                {hasRouteData && (
                    <Polyline
                        coordinates={route}
                        strokeColor={theme.colors.primary[500]}
                        strokeWidth={4}
                    />
                )}
                {children}
            </MapView>

            <View style={styles.mapButtonsContainer}>
                <TouchableOpacity
                    style={styles.mapButton}
                    onPress={() => {
                        // When locking the map, recenter it.
                        if (isMapInteractionEnabled) {
                            recenterMap();
                        }
                        setMapInteractionEnabled(!isMapInteractionEnabled);
                    }}
                >
                    <Ionicons name={isMapInteractionEnabled ? "lock-open-outline" : "lock-closed-outline"} size={theme.iconSizes.xs} color={theme.colors.text.primary} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.mapButton} onPress={recenterMap}>
                    <Ionicons name="locate-outline" size={theme.iconSizes.xs} color={theme.colors.text.primary} />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    mapContainer: {
        position: 'relative',
        width: '100%',
        height: 300,
        borderRadius: theme.borderRadius.lg,
        marginVertical: theme.spacing[4],
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: theme.colors.border.light,
        ...theme.shadows.sm,
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    mapButtonsContainer: {
        position: 'absolute',
        top: theme.spacing[2],
        right: theme.spacing[2],
        flexDirection: 'row',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: theme.borderRadius.full,
        ...theme.shadows.md,
        padding: theme.spacing[1],
    },
    mapButton: {
        padding: theme.spacing[2],
    },
    mapFallback: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.gray[100],
    },
    mapFallbackText: {
        fontFamily: theme.typography.fontFamily.regular,
        fontSize: theme.typography.fontSize.base,
        color: theme.colors.text.secondary,
    },
});
