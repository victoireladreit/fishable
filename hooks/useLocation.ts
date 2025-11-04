import * as Location from 'expo-location'
import { useEffect, useState } from 'react'

export const useLocation = () => {
    const [location, setLocation] = useState<Location.LocationObject | null>(null)
    const [errorMsg, setErrorMsg] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    const requestPermission = async () => {
        const { status } = await Location.requestForegroundPermissionsAsync()
        if (status !== 'granted') {
            setErrorMsg('Permission de localisation refusée')
            return false
        }
        return true
    }

    const getCurrentLocation = async () => {
        setLoading(true)
        const hasPermission = await requestPermission()
        if (!hasPermission) {
            setLoading(false)
            return
        }

        const loc = await Location.getCurrentPositionAsync({})
        setLocation(loc)
        setLoading(false)
    }

    const watchPosition = async () => {
        const hasPermission = await requestPermission()
        if (!hasPermission) return

        return Location.watchPositionAsync(
            { accuracy: Location.Accuracy.High, timeInterval: 5000, distanceInterval: 5 },
            (loc) => setLocation(loc)
        )
    }

    useEffect(() => {
        getCurrentLocation()
    }, [])

    return { location, errorMsg, loading, getCurrentLocation, watchPosition }
}
