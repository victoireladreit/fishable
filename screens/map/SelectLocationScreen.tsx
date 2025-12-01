import React, { useState, useRef, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, Text, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker } from 'react-native-maps';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { useNavigation, RouteProp, useRoute } from '@react-navigation/native';
import * as Location from 'expo-location';
import { theme } from '../../theme';
import { RootStackParamList } from '../../navigation/types';
import {Ionicons} from "@expo/vector-icons";

type SelectLocationRouteProp = RouteProp<RootStackParamList, 'SelectLocation'>;
const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

const DEFAULT_REGION = {
    latitude: 46.2276,
    longitude: 2.2137,
    latitudeDelta: 10,
    longitudeDelta: 10,
};

export const SelectLocationScreen = () => {
    const navigation = useNavigation();
    const route = useRoute<SelectLocationRouteProp>();
    const { onLocationSelect, initialLocation } = route.params;

    const mapViewRef = useRef<MapView>(null);
    const [markerPosition, setMarkerPosition] = useState<{ latitude: number; longitude: number } | null>(initialLocation || null);
    const [searchKey, setSearchKey] = useState(0);

    useEffect(() => {
        const getInitialRegion = async () => {
            if (initialLocation) {
                mapViewRef.current?.animateToRegion({ ...initialLocation, latitudeDelta: 0.01, longitudeDelta: 0.01 });
            } else {
                let { status } = await Location.requestForegroundPermissionsAsync();
                if (status === 'granted') {
                    try {
                        const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
                        const userRegion = {
                            latitude: location.coords.latitude,
                            longitude: location.coords.longitude,
                            latitudeDelta: 0.0922,
                            longitudeDelta: 0.0421,
                        };
                        mapViewRef.current?.animateToRegion(userRegion);
                    } catch (error) {
                        console.error("Could not fetch user location:", error);
                    }
                }
            }
        };
        getInitialRegion();
    }, [initialLocation]);

    const handleConfirmLocation = () => {
        if (markerPosition) {
            onLocationSelect(markerPosition);
            navigation.goBack();
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <MapView
                ref={mapViewRef}
                style={styles.map}
                initialRegion={DEFAULT_REGION}
                onPress={(e) => setMarkerPosition(e.nativeEvent.coordinate)}
            >
                {markerPosition && (
                    <Marker
                        draggable
                        coordinate={markerPosition}
                        onDragEnd={(e) => setMarkerPosition(e.nativeEvent.coordinate)}
                    >
                        <View>
                            <Ionicons name="location-sharp" size={40} color={theme.colors.primary[500]} />
                        </View>
                    </Marker>
                )}
            </MapView>
            <View style={styles.searchContainer}>
                <GooglePlacesAutocomplete
                    key={searchKey}
                    placeholder='Rechercher un lieu ou une adresse'
                    onPress={(data, details = null) => {
                        if (details?.geometry?.location) {
                            const { lat, lng } = details.geometry.location;
                            const newPosition = { latitude: lat, longitude: lng };
                            setMarkerPosition(newPosition);
                            mapViewRef.current?.animateToRegion({
                                ...newPosition,
                                latitudeDelta: 0.01,
                                longitudeDelta: 0.01,
                            });
                        }
                        setSearchKey(prevKey => prevKey + 1);
                    }}
                    query={{
                        key: GOOGLE_MAPS_API_KEY,
                        language: 'fr',
                    }}
                    fetchDetails={true}
                    styles={{
                        textInput: styles.searchInput,
                        listView: styles.listView,
                    }}
                />
            </View>
            {markerPosition && (
                <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmLocation}>
                    <Text style={styles.confirmButtonText}>Confirmer la localisation</Text>
                </TouchableOpacity>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    searchContainer: {
        position: 'absolute',
        top: Platform.OS === 'android' ? theme.spacing[4] : 0,
        left: 0,
        right: 0,
        zIndex: 1,
        padding: theme.spacing[4],
        paddingTop: Platform.OS === 'ios' ? theme.spacing[6] : theme.spacing[4],
    },
    searchInput: {
        backgroundColor: theme.colors.background.paper,
        color: theme.colors.text.primary,
        height: 40,
        borderWidth: 1,
        borderColor: theme.colors.border.main,
        borderRadius: theme.borderRadius.base,
        paddingHorizontal: theme.spacing[4],
        fontSize: theme.typography.fontSize.base,
    },
    listView: {
        backgroundColor: theme.colors.background.paper,
        borderRadius: theme.borderRadius.base,
        borderWidth: 1,
        borderColor: theme.colors.border.main,
        marginTop: 2,
    },
    confirmButton: {
        position: 'absolute',
        bottom: 40,
        left: 20,
        right: 20,
        backgroundColor: theme.colors.primary[500],
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        ...theme.shadows.base,
    },
    confirmButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
});
