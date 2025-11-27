import React, { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';
import * as Location from 'expo-location';

export interface LocationPoint {
    latitude: number;
    longitude: number;
    timestamp: number;
}

interface LocationContextType {
    location: Location.LocationObject | null;
    errorMsg: string | null;
    route: LocationPoint[];
    isTracking: boolean;
    startLocationTracking: (initialRoute?: LocationPoint[]) => void;
    stopLocationTracking: () => void;
}

const LocationTrackingContext = createContext<LocationContextType | undefined>(undefined);

export const LocationTrackingProvider = ({ children }: { children: ReactNode }) => {
    const [location, setLocation] = useState<Location.LocationObject | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [route, setRoute] = useState<LocationPoint[]>([]);
    const [isTracking, setIsTracking] = useState(false);

    useEffect(() => {
        let subscriber: { remove: () => void; } | undefined;

        const startTracking = async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrorMsg('Permission to access location was denied');
                setIsTracking(false);
                return;
            }

            subscriber = await Location.watchPositionAsync(
                {
                    accuracy: Location.Accuracy.BestForNavigation,
                    timeInterval: 5000,
                    distanceInterval: 5,
                },
                (newLocation) => {
                    setLocation(newLocation);
                    setRoute((prevRoute) => [
                        ...prevRoute,
                        {
                            latitude: newLocation.coords.latitude,
                            longitude: newLocation.coords.longitude,
                            timestamp: newLocation.timestamp,
                        },
                    ]);
                }
            );
        };

        if (isTracking) {
            startTracking();
        } else {
            if (subscriber) {
                subscriber.remove();
            }
        }

        return () => {
            if (subscriber) {
                subscriber.remove();
            }
        };
    }, [isTracking]);

    const startLocationTracking = useCallback((initialRoute: LocationPoint[] = []) => {
        setRoute(initialRoute);
        setIsTracking(true);
    }, []);

    const stopLocationTracking = useCallback(() => {
        setIsTracking(false);
        setRoute([]); // Clear route on stop
    }, []);

    const value = {
        location,
        errorMsg,
        route,
        isTracking,
        startLocationTracking,
        stopLocationTracking,
    };

    return (
        <LocationTrackingContext.Provider value={value}>
            {children}
        </LocationTrackingContext.Provider>
    );
};

export const useLocationTracking = () => {
    const context = useContext(LocationTrackingContext);
    if (context === undefined) {
        throw new Error('useLocationTracking must be used within a LocationTrackingProvider');
    }
    return context;
};
