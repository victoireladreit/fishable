import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Alert, Text, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import MapView, { Marker, Callout } from 'react-native-maps';
import { useAuth } from '../../contexts/AuthContext';
import { CatchesService } from '../../services';
import { theme, colors } from '../../theme';
import { RootStackParamList } from '../../navigation/types';
import { Database } from '../../lib/types';
import { Ionicons } from '@expo/vector-icons';
import { CatchListScreen } from '../../components/catch/CatchListScreen'; // Import CatchListScreen

type Catch = Database['public']['Tables']['catches']['Row'];
type CatchesNavigationProp = NativeStackNavigationProp<RootStackParamList, 'CatchDetail' | 'AddCatch'>;

const Tab = createMaterialTopTabNavigator();

// New component for the custom Callout
const CatchMapCallout = ({ catchItem }: { catchItem: Catch }) => (
    <View style={calloutStyles.container}>
        {catchItem.photo_url ? (
            <Image source={{ uri: catchItem.photo_url }} style={calloutStyles.image} />
        ) : (
            <View style={[calloutStyles.image, calloutStyles.imagePlaceholder]}>
                <Ionicons name="image-outline" size={30} color={theme.colors.text.disabled} />
            </View>
        )}
        <Text style={calloutStyles.speciesName}>{catchItem.species_name || 'Espèce inconnue'}</Text>
        {catchItem.caught_at && (
            <Text style={calloutStyles.date}>{new Date(catchItem.caught_at).toLocaleDateString()}</Text>
        )}
        {catchItem.size_cm && (
            <Text style={calloutStyles.details}>{catchItem.size_cm} cm</Text>
        )}
        {catchItem.weight_kg && (
            <Text style={calloutStyles.details}>{catchItem.weight_kg} kg</Text>
        )}
    </View>
);

const calloutStyles = StyleSheet.create({
    container: {
        flexDirection: 'column',
        alignItems: 'center',
        width: 150, // Fixed width for the callout
        padding: theme.spacing[2],
        backgroundColor: theme.colors.background.paper,
        borderRadius: theme.borderRadius.md,
    },
    image: {
        width: 100,
        height: 100,
        borderRadius: theme.borderRadius.sm,
        marginBottom: theme.spacing[1],
    },
    imagePlaceholder: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.gray[200],
    },
    speciesName: {
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: theme.typography.fontSize.sm,
        color: theme.colors.text.primary,
        textAlign: 'center',
        marginBottom: theme.spacing[0],
    },
    date: {
        fontFamily: theme.typography.fontFamily.regular,
        fontSize: theme.typography.fontSize.sm,
        color: theme.colors.text.secondary,
        textAlign: 'center',
    },
    details: {
        fontFamily: theme.typography.fontFamily.regular,
        fontSize: theme.typography.fontSize.sm,
        color: theme.colors.text.secondary,
        textAlign: 'center',
    },
});


const CatchMapScreen = ({ catches }: { catches: Catch[] }) => {
    const catchesWithLocation = useMemo(() => {
        return catches.filter(c => c.catch_location_lat !== null && c.catch_location_lng !== null);
    }, [catches]);

    const defaultRegion = {
        latitude: 48.8566,
        longitude: 2.3522,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
    };

    const calculateRegion = useCallback(() => {
        if (catchesWithLocation.length > 0) {
            const latitudes = catchesWithLocation.map(c => c.catch_location_lat!);
            const longitudes = catchesWithLocation.map(c => c.catch_location_lng!);

            const minLat = Math.min(...latitudes);
            const maxLat = Math.max(...latitudes);
            const minLng = Math.min(...longitudes);
            const maxLng = Math.max(...longitudes);

            const centerLat = (minLat + maxLat) / 2;
            const centerLng = (minLng + maxLng) / 2;

            const latDelta = (maxLat - minLat) * 1.5 || 0.0922;
            const lngDelta = (maxLng - minLng) * 1.5 || 0.0421;

            return {
                latitude: centerLat,
                longitude: centerLng,
                latitudeDelta: latDelta,
                longitudeDelta: lngDelta,
            };
        }
        return defaultRegion;
    }, [catchesWithLocation]);

    const [region, setRegion] = useState(calculateRegion());

    useEffect(() => {
        setRegion(calculateRegion());
    }, [calculateRegion]);

    if (catchesWithLocation.length === 0) {
        return (
            <View style={styles.mapContainer}>
                <Text style={styles.mapPlaceholderText}>Aucune prise avec des coordonnées GPS à afficher sur la carte.</Text>
            </View>
        );
    }

    return (
        <MapView
            style={styles.map}
            region={region} // Use region prop instead of initialRegion
            onRegionChangeComplete={setRegion} // Update region state when user moves map
            showsUserLocation={true}
        >
            {catchesWithLocation.map((catchItem) => (
                <Marker
                    key={catchItem.id}
                    coordinate={{
                        latitude: catchItem.catch_location_lat!,
                        longitude: catchItem.catch_location_lng!,
                    }}
                    anchor={{ x: 0.5, y: 0.5 }} // Center anchor for a circle
                >
                    <View style={markerStyles.outerBubble}>
                        <View style={markerStyles.innerBubble}>
                            <Text style={markerStyles.emoji}>🐟</Text>
                        </View>
                    </View>
                    <Callout>
                        <CatchMapCallout catchItem={catchItem} />
                    </Callout>
                </Marker>
            ))}
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
    const [mapUpdateKey, setMapUpdateKey] = useState(0); // New state for forcing map re-render

    const loadCatches = useCallback(async () => {
        if (!user) return;

        // Only show the full-screen loader on the very first load
        if (!hasLoadedInitial) {
            setLoading(true);
        }

        try {
            const userCatches = await CatchesService.getCatchesByUserId(user.id);
            setCatches(userCatches || []);
            setMapUpdateKey(prevKey => prevKey + 1); // Increment key to force CatchMapScreen re-render
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

    useFocusEffect(
        useCallback(() => {
            loadCatches();
        }, [loadCatches])
    );

    const handleRefresh = useCallback(async () => {
        setIsRefreshing(true);
        await loadCatches();
        setIsRefreshing(false);
    }, [loadCatches]);

    const handleAddCatch = () => {
        navigation.navigate('AddCatch', {
            onGoBack: () => loadCatches(),
        });
    };

    const handleCatchDetail = (catchId: string) => {
        navigation.navigate('CatchDetail', {
            catchId,
            onGoBack: () => loadCatches(),
        });
    };

    const handleDeleteCatch = (catchId: string) => {
        Alert.alert(
            "Supprimer la prise",
            "Êtes-vous sûr de vouloir supprimer cette prise ?",
            [
                { text: "Annuler", style: "cancel" },
                {
                    text: "Supprimer",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await CatchesService.deleteCatch(catchId);
                            setCatches(prevCatches => prevCatches.filter(c => c.id !== catchId));
                            setMapUpdateKey(prevKey => prevKey + 1); // Increment key to force CatchMapScreen re-render
                        } catch (error) {
                            console.error("Erreur lors de la suppression de la prise:", error);
                            Alert.alert("Erreur", "Impossible de supprimer la prise.");
                        }
                    },
                },
            ]
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            {loading && !hasLoadedInitial ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={theme.colors.primary[500]} />
                </View>
            ) : (
                <>
                    <View style={styles.headerContainer}>
                        <Text style={styles.title}>Mes Prises</Text>
                        <TouchableOpacity style={styles.buttonPrimary} onPress={handleAddCatch}>
                            <Text style={styles.buttonText}>🐟 Nouvelle prise</Text>
                        </TouchableOpacity>
                    </View>

                    <Tab.Navigator
                        screenOptions={{
                            tabBarActiveTintColor: theme.colors.primary[500],
                            tabBarInactiveTintColor: theme.colors.text.secondary,
                            tabBarIndicatorStyle: { backgroundColor: theme.colors.primary[500] },
                            tabBarStyle: { backgroundColor: theme.colors.background.default },
                        }}
                    >
                        <Tab.Screen name="Historique">
                            {() => (
                                <CatchListScreen
                                    catches={catches}
                                    isRefreshing={isRefreshing}
                                    onRefresh={handleRefresh}
                                    onCatchDetail={handleCatchDetail}
                                    onDeleteCatch={handleDeleteCatch}
                                />
                            )}
                        </Tab.Screen>
                        <Tab.Screen name="Carte">
                            {() => <CatchMapScreen key={mapUpdateKey} catches={catches} />}
                        </Tab.Screen>
                    </Tab.Navigator>
                </>
            )}
        </SafeAreaView>
    );
};

const markerStyles = StyleSheet.create({
    outerBubble: {
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: '#b558ef',
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
    },
    innerBubble: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#b558ef',
        justifyContent: 'center',
        alignItems: 'center',
    },
    emoji: {
        fontSize: 16,
        lineHeight: 18,
    },
});

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
    mapContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.background.paper,
        padding: theme.spacing[4],
    },
    mapPlaceholderText: {
        fontSize: theme.typography.fontSize.lg,
        color: theme.colors.text.primary,
        marginBottom: theme.spacing[2],
        textAlign: 'center',
    },
    map: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: theme.layout.screenPadding,
        paddingTop: theme.spacing[4],
        paddingBottom: theme.spacing[2],
        backgroundColor: theme.colors.background.default,
    },
    title: {
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: theme.typography.fontSize['4xl'],
        color: theme.colors.text.primary,
    },
    buttonPrimary: {
        backgroundColor: colors.primary["500"],
        padding: 15, // Uniform padding
        borderRadius: 8, // Consistent border radius
    },
    buttonText: {
        color: '#fff', // Consistent color
        textAlign: 'center', // Consistent text alignment
        fontWeight: 'bold', // Consistent font weight
        fontSize: 16, // Consistent font size
    },
});
