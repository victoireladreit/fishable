import * as ImagePicker from 'expo-image-picker'
import { useState } from 'react'

export const useImagePicker = () => {
    const [image, setImage] = useState<string | null>(null)
    const [errorMsg, setErrorMsg] = useState<string | null>(null)

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
        if (status !== 'granted') {
            setErrorMsg('Permission de la galerie refusée')
            return
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.8,
        })

        if (!result.canceled) {
            setImage(result.assets[0].uri)
        }
    }

    const takePhoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync()
        if (status !== 'granted') {
            setErrorMsg('Permission de la caméra refusée')
            return
        }

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            quality: 0.8,
        })

        if (!result.canceled) {
            setImage(result.assets[0].uri)
        }
    }

    const reset = () => setImage(null)

    return { image, errorMsg, pickImage, takePhoto, reset }
}
