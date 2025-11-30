import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { View, StyleSheet, ActivityIndicator, Alert, Text, TouchableOpacity, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import MapView, { Marker, Callout, Region } from 'react-native-maps';
import Supercluster from 'supercluster';
import { useAuth } from '../../contexts/AuthContext';
import { CatchesService } from '../../services';
import { theme, colors } from '../../theme';
import { RootStackParamList } from '../../navigation/types';
import { Database } from '../../lib/types';
import { Ionicons } from '@expo/vector-icons';
import { CatchListScreen } from '../../components/catch/CatchListScreen';
import * as Location from 'expo-location';

type Catch = Database['public']['Tables']['catches']['Row'];
type CatchesNavigationProp = NativeStackNavigationProp<RootStackParamList, 'CatchDetail' | 'AddCatch' | 'ClusterCatches'>;

const Tab = createMaterialTopTabNavigator();
const { width, height } = Dimensions.get('window');

const CatchMapScreen = ({ catches }: { catches: Catch[] }) => {
    const mapRef = useRef<MapView>(null);
    const navigation = useNavigation<CatchesNavigationProp>();

    const [mapRegion, setMapRegion] = useState<Region | undefined>(undefined); // Use mapRegion to control the map
    const [initialLoadComplete, setInitialLoadComplete] = useState(false); // To prevent re-centering on every region change

    const points = useMemo(() => catches.map(c => ({
        type: 'Feature',
        properties: { catchData: c },
        geometry: { type: 'Point', coordinates: [c.catch_location_lng!, c.catch_location_lat!] }
    })), [catches]);

    const clusterIndex = useMemo(() => {
        const index = new Supercluster({ radius: 60, maxZoom: 16 });
        index.load(points as any);
        return index;
    }, [points]);

    const updateClusters = useCallback(() => {
        if (!mapRegion || !clusterIndex) return;
        const zoom = Math.round(Math.log2(360 / mapRegion.longitudeDelta));
        // console.log("Map Region Delta:", mapRegion.longitudeDelta, "Calculated Zoom:", zoom); // Pour le débogage

        // Clamper le zoom pour s'assurer qu'il est dans la plage valide de Supercluster (0 à 16)
        const clampedZoom = Math.max(0, Math.min(zoom, 16)); // 16 est le maxZoom défini dans Supercluster

        const bbox: [number, number, number, number] = [
            mapRegion.longitude - mapRegion.longitudeDelta / 2,
            mapRegion.latitude - mapRegion.latitudeDelta / 2,
            mapRegion.longitude + mapRegion.longitudeDelta / 2,
            mapRegion.latitude + mapRegion.latitudeDelta / 2,
        ];
        const newClusters = clusterIndex.getClusters(bbox, clampedZoom); // Utiliser le zoom clampé
        setClusters(newClusters);
    }, [mapRegion, clusterIndex]);

    const [clusters, setClusters] = useState<any[]>([]);

    // Effect to determine the initial map region
    useEffect(() => {
        const determineInitialRegion = async () => {
            // Initialiser calculatedRegion avec une valeur par défaut
            let calculatedRegion: Region = { latitude: 46.2276, longitude: 2.2137, latitudeDelta: 12, longitudeDelta: 12 }; // Default to France

            const defaultDelta = 0.0922; // Default delta for a single point or small area
            const wideDelta = 12; // Wider delta for country view

            const catchesWithLocation = catches.filter(c => c.catch_location_lat != null && c.catch_location_lng != null);

            let userLocationObtained = false;
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status === 'granted') {
                try {
                    const location = await Location.getCurrentPositionAsync({});
                    calculatedRegion = {
                        latitude: location.coords.latitude,
                        longitude: location.coords.longitude,
                        latitudeDelta: wideDelta,
                        longitudeDelta: wideDelta,
                    };
                    userLocationObtained = true;
                } catch (error) {
                    console.error("Could not fetch user location:", error);
                    // Si la localisation de l'utilisateur échoue, calculatedRegion conserve sa valeur par défaut initiale ou sera écrasée par la logique catchesWithLocation
                }
            }

            // Si la localisation de l'utilisateur n'a pas été obtenue (permission refusée ou échec de la récupération),
            // alors essayez d'utiliser catchesWithLocation ou conservez la valeur par défaut.
            if (!userLocationObtained) {
                if (catchesWithLocation.length > 0) {
                    const latitudes = catchesWithLocation.map(c => c.catch_location_lat!);
                    const longitudes = catchesWithLocation.map(c => c.catch_location_lng!);
                    const minLat = Math.min(...latitudes);
                    const maxLat = Math.max(...latitudes);
                    const minLng = Math.min(...longitudes);
                    const maxLng = Math.max(...longitudes);

                    calculatedRegion = {
                        latitude: (minLat + maxLat) / 2,
                        longitude: (minLng + maxLng) / 2,
                        latitudeDelta: (maxLat - minLat) * 1.5 || defaultDelta,
                        longitudeDelta: (maxLng - minLng) * 1.5 || defaultDelta,
                    };
                }
                // Si aucune localisation utilisateur et aucune prise avec localisation, calculatedRegion reste la valeur par défaut initiale.
            }

            setMapRegion(calculatedRegion);
            setInitialLoadComplete(true);
        };

        if (!initialLoadComplete) {
            determineInitialRegion();
        }
    }, [catches, initialLoadComplete]); // Depend on catches to re-calculate if data changes

    useEffect(() => {
        if (mapRegion) {
            updateClusters();
        }
    }, [mapRegion, updateClusters]);

    const handleRegionChangeComplete = (region: Region) => {
        setMapRegion(region);
    };

    const handleClusterPress = (clusterId: number) => {
        const leaves = clusterIndex.getLeaves(clusterId, Infinity);
        const clusterCatches = leaves.map(leaf => leaf.properties.catchData);
        navigation.navigate('ClusterCatches', { catches: clusterCatches });
    };

    if (!mapRegion) { // Show loading indicator until mapRegion is determined
        return (
            <View style={styles.mapContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary[500]} />
            </View>
        );
    }

    if (catches.length === 0) {
        return (
            <View style={styles.mapContainer}>
                <Text style={styles.mapPlaceholderText}>Aucune prise avec des coordonnées GPS à afficher sur la carte.</Text>
            </View>
        );
    }

    return (
        <MapView
            ref={mapRef}
            style={styles.map}
            region={mapRegion} // Use region prop for controlled component
            onRegionChangeComplete={handleRegionChangeComplete}
            showsUserLocation={false} // Always false as per user request
        >
            {clusters.map(item => {
                const [longitude, latitude] = item.geometry.coordinates;
                const { cluster: isCluster, point_count: pointCount, catchData } = item.properties;

                if (isCluster) {
                    return (
                        <Marker
                            key={item.id}
                            coordinate={{ latitude, longitude }}
                            onPress={() => handleClusterPress(item.id)}
                        >
                            <View style={markerStyles.clusterBubble}>
                                <Text style={markerStyles.clusterText}>{pointCount}</Text>
                            </View>
                        </Marker>
                    );
                }

                return (
                    <Marker
                        key={catchData.id}
                        coordinate={{ latitude, longitude }}
                        onPress={() => navigation.navigate('ClusterCatches', { catches: [catchData] })}
                    >
                        <View style={markerStyles.outerBubble}>
                            <View style={markerStyles.innerBubble}>
                                <Text style={markerStyles.emoji}>🐟</Text>
                            </View>
                        </View>
                    </Marker>
                );
            })}
        </MapView>
    );
};

export const UserCatchesScreen = () => {
    const { user } = useAuth();
    const navigation = useNavigation<CatchesNavigationProp>();
    const [catches, setCatches] = useState<Catch[]>([]);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [hasLoadedInitial, setHasLoadedInitial] = useState(false);

    const loadCatches = useCallback(async () => {
        if (!user) return;
        if (!hasLoadedInitial) setLoading(true);
        try {
            const userCatches = await CatchesService.getCatchesByUserId(user.id);
            setCatches(userCatches || []);
        } catch (error) {
            console.error("Erreur lors du chargement des prises:", error);
            Alert.alert("Erreur", "Impossible de charger les prises.");
        } finally {
            if (!hasLoadedInitial) {
                setLoading(false);
                setHasLoadedInitial(true);
            }
        }
    }, [user, hasLoadedInitial]);

    useFocusEffect(useCallback(() => { loadCatches(); }, [loadCatches]));

    const handleRefresh = useCallback(async () => {
        setIsRefreshing(true);
        await loadCatches();
        setIsRefreshing(false);
    }, [loadCatches]);

    const handleAddCatch = () => navigation.navigate('AddCatch', { onGoBack: loadCatches });
    const handleCatchDetail = (catchId: string) => navigation.navigate('CatchDetail', { catchId, onGoBack: loadCatches });

    const handleDeleteCatch = (catchId: string) => {
        Alert.alert("Supprimer la prise", "Êtes-vous sûr de vouloir supprimer cette prise ?", [
            { text: "Annuler", style: "cancel" },
            { text: "Supprimer", style: "destructive", onPress: async () => {
                try {
                    await CatchesService.deleteCatch(catchId);
                    setCatches(prevCatches => prevCatches.filter(c => c.id !== catchId));
                } catch (error) {
                    console.error("Erreur lors de la suppression de la prise:", error);
                    Alert.alert("Erreur", "Impossible de supprimer la prise.");
                }
            }},
        ]);
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            {loading ? (
                <View style={styles.center}><ActivityIndicator size="large" color={theme.colors.primary[500]} /></View>
            ) : (
                <>
                    <View style={styles.headerContainer}>
                        <Text style={styles.title}>Mes Prises</Text>
                        <TouchableOpacity style={styles.buttonPrimary} onPress={handleAddCatch}>
                            <Text style={styles.buttonText}>🐟 Nouvelle prise</Text>
                        </TouchableOpacity>
                    </View>
                    <Tab.Navigator screenOptions={{
                        tabBarActiveTintColor: theme.colors.primary[500],
                        tabBarInactiveTintColor: theme.colors.text.secondary,
                        tabBarIndicatorStyle: { backgroundColor: theme.colors.primary[500] },
                        tabBarStyle: { backgroundColor: theme.colors.background.default },
                    }}>
                        <Tab.Screen name="Historique">
                            {() => <CatchListScreen catches={catches} isRefreshing={isRefreshing} onRefresh={handleRefresh} onCatchDetail={handleCatchDetail} onDeleteCatch={handleDeleteCatch} />}
                        </Tab.Screen>
                        <Tab.Screen name="Carte">
                            {() => <CatchMapScreen catches={catches} />}
                        </Tab.Screen>
                    </Tab.Navigator>
                </>
            )}
        </SafeAreaView>
    );
};

const markerStyles = StyleSheet.create({
    outerBubble: { width: 32, height: 32, borderRadius: 16, borderWidth: 2, borderColor: theme.colors.primary[500], backgroundColor: 'white', justifyContent: 'center', alignItems: 'center' },
    innerBubble: { width: 24, height: 24, borderRadius: 12, backgroundColor: theme.colors.primary[500], justifyContent: 'center', alignItems: 'center' },
    emoji: { fontSize: 16, lineHeight: 18 },
    clusterBubble: { width: 40, height: 40, borderRadius: 20, backgroundColor: theme.colors.primary[500], justifyContent: 'center', alignItems: 'center', ...theme.shadows.base },
    clusterText: { color: 'white', fontWeight: 'bold' },
});

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background.default },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background.default },
    mapContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background.paper, padding: theme.spacing[4] },
    mapPlaceholderText: { fontSize: theme.typography.fontSize.lg, color: theme.colors.text.primary, marginBottom: theme.spacing[2], textAlign: 'center' },
    map: { flex: 1, width: '100%', height: '100%' },
    headerContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: theme.layout.screenPadding, paddingTop: theme.spacing[4], paddingBottom: theme.spacing[2], backgroundColor: theme.colors.background.default },
    title: { fontFamily: theme.typography.fontFamily.bold, fontSize: theme.typography.fontSize['4xl'], color: theme.colors.text.primary },
    buttonPrimary: { backgroundColor: colors.primary["500"], padding: 15, borderRadius: 8 },
    buttonText: { color: '#fff', textAlign: 'center', fontWeight: 'bold', fontSize: 16 },
});
