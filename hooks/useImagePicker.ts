import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Alert, Linking } from 'react-native';

// Étendre le type ImagePickerAsset pour inclure la propriété exif
export interface CustomImagePickerAsset extends ImagePicker.ImagePickerAsset {
    exif?: { [key: string]: any };
}

export const useImagePicker = (initialImageUri: string | null = null) => {
    const [image, setImage] = useState<CustomImagePickerAsset | null>(
        initialImageUri ? { uri: initialImageUri, width: 0, height: 0 } : null
    );

    const pickImage = async (): Promise<CustomImagePickerAsset | null> => {
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
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: false,
            exif: true, // Demander les données EXIF
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            const asset = result.assets[0] as CustomImagePickerAsset;
            setImage(asset);
            return asset;
        }
        return null;
    };

    const takePhoto = async (): Promise<CustomImagePickerAsset | null> => {
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
            exif: true, // Demander les données EXIF
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            const asset = result.assets[0] as CustomImagePickerAsset;
            setImage(asset);
            return asset;
        }
        return null;
    };

    return { pickImage, takePhoto, image, setImage };
};