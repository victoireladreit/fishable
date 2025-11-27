import { useState } from 'react';
import * as Location from 'expo-location';
import { Alert } from 'react-native';

export const useLocation = () => {
    const [location, setLocation] = useState<Location.LocationObject | null>(null);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const getLocation = async () => {
        setLoading(true);
        setErrorMsg(null);

        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            setErrorMsg('La permission d\'accès à la localisation a été refusée.');
            Alert.alert('Permission refusée', 'Vous devez autoriser l\'accès à la localisation pour utiliser cette fonctionnalité.');
            setLoading(false);
            return null;
        }

        try {
            const currentLocation = await Location.getCurrentPositionAsync({});
            setLocation(currentLocation);
            setLoading(false);
            return currentLocation;
        } catch (error) {
            console.error("Erreur lors de la récupération de la position :", error);
            setErrorMsg("Impossible d'obtenir la position actuelle.");
            Alert.alert('Erreur de localisation', "Impossible d'obtenir la position actuelle. Veuillez vérifier vos paramètres GPS.");
            setLoading(false);
            return null;
        }
    };

    /**
     * Convertit les coordonnées GPS en une adresse lisible (ville, région).
     */
    const getRegionFromCoords = async (coords: { latitude: number; longitude: number; }) => {
        try {
            const geocode = await Location.reverseGeocodeAsync(coords);
            if (geocode.length > 0) {
                const { city, region, country } = geocode[0];
                // Formatte l'adresse pour être lisible, ex: "Annecy, Haute-Savoie"
                return [city, region].filter(Boolean).join(', ');
            }
            return null;
        } catch (error) {
            console.error("Erreur de géocodage inversé :", error);
            return null;
        }
    };

    return { getLocation, getRegionFromCoords, location, loading, errorMsg };
};
