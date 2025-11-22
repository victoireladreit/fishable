import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Alert, Linking } from 'react-native';

export const useImagePicker = () => {
    const [image, setImage] = useState<ImagePicker.ImagePickerAsset | null>(null);

    const pickImage = async () => {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (permission.status !== 'granted') {
            Alert.alert(
                'Permission requise',
                'L\'accès à la galerie est nécessaire. Veuillez l\'activer dans les paramètres.',
                [
                    { text: 'Annuler', style: 'cancel' },
                    { text: 'Ouvrir les paramètres', onPress: () => Linking.openSettings() }
                ]
            );
            return null;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: 'Images' as any,
            allowsEditing: false,
        });

        if (!result.canceled) {
            setImage(result.assets[0]);
            return result.assets[0];
        }
        return null;
    };

    const takePhoto = async () => {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (permission.status !== 'granted') {
            Alert.alert(
                'Permission requise',
                'L\'accès à l\'appareil photo est nécessaire. Veuillez l\'activer dans les paramètres.',
                [
                    { text: 'Annuler', style: 'cancel' },
                    { text: 'Ouvrir les paramètres', onPress: () => Linking.openSettings() }
                ]
            );
            return null;
        }

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: false,
        });

        if (!result.canceled) {
            setImage(result.assets[0]);
            return result.assets[0];
        }
        return null;
    };

    return { pickImage, takePhoto, image, setImage };
};
