import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import {
    FishingSessionsService,
    FishingSession,
    FishingSessionUpdate,
    CatchesService,
    TargetSpeciesService,
} from '../services';
import { Database } from '../lib/types';

type Catch = Database['public']['Tables']['catches']['Row'];
type LocationVisibility = 'public' | 'region' | 'private';
type WaterLevel = 'normal' | 'high' | 'flood';

// Helper function to compare string/null values, treating null and empty string as equal
const areStringsEqual = (str1: string | null | undefined, str2: string | null | undefined) => {
    const normalizedStr1 = str1 || '';
    const normalizedStr2 = str2 || '';
    return normalizedStr1 === normalizedStr2;
};

export const useSession = (sessionId: string) => {
    const [session, setSession] = useState<FishingSession | null>(null);
    const [catches, setCatches] = useState<Catch[]>([]);
    const [targetSpecies, setTargetSpecies] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // States for editable fields
    const [locationName, setLocationName] = useState<string | null>(null);
    const [caption, setCaption] = useState<string | null>(null);
    const [locationVisibility, setLocationVisibility] = useState<LocationVisibility>('private');
    const [waterColor, setWaterColor] = useState<string | null>(null);
    const [waterCurrent, setWaterCurrent] = useState<string | null>(null);
    const [waterLevel, setWaterLevel] = useState<WaterLevel | null>(null);

    const hasUnsavedChanges =
        !areStringsEqual(session?.location_name, locationName) ||
        !areStringsEqual(session?.caption, caption) ||
        session?.location_visibility !== locationVisibility ||
        !areStringsEqual(session?.water_color, waterColor) ||
        !areStringsEqual(session?.water_current, waterCurrent) ||
        session?.water_level !== waterLevel;

    const loadSessionData = useCallback(async () => {
        setLoading(true);
        try {
            const [sessionData, catchesData, speciesData] = await Promise.all([
                FishingSessionsService.getSessionById(sessionId),
                CatchesService.getCatchesBySession(sessionId),
                TargetSpeciesService.getTargetSpeciesBySessionId(sessionId),
            ]);

            if (sessionData) {
                setSession(sessionData);
                // Initialize editable fields, preserving null values
                setLocationName(sessionData.location_name);
                setCaption(sessionData.caption);
                setLocationVisibility(sessionData.location_visibility || 'private');
                setWaterColor(sessionData.water_color);
                setWaterCurrent(sessionData.water_current);
                setWaterLevel(sessionData.water_level);
            }
            setCatches(catchesData);
            setTargetSpecies(speciesData);
        } catch (error) {
            console.error('Error loading session data:', error);
            Alert.alert('Erreur', 'Impossible de charger les données de la session.');
        } finally {
            setLoading(false);
        }
    }, [sessionId]);

    useEffect(() => {
        loadSessionData();
    }, [loadSessionData]);

    const saveChanges = async () => {
        if (!session) return false;

        setIsSaving(true);
        const updates: FishingSessionUpdate = {
            location_name: locationName || null,
            caption: caption || null,
            location_visibility: locationVisibility,
            water_color: waterColor || null,
            water_current: waterCurrent || null,
            water_level: waterLevel || null,
        };

        try {
            const updatedSession = await FishingSessionsService.updateSession(session.id, updates);
            setSession(updatedSession);
            // After saving, re-sync the state to remove "unsaved changes" state
            if (updatedSession) {
                setLocationName(updatedSession.location_name);
                setCaption(updatedSession.caption);
                setLocationVisibility(updatedSession.location_visibility || 'private');
                setWaterColor(updatedSession.water_color);
                setWaterCurrent(updatedSession.water_current);
                setWaterLevel(updatedSession.water_level);
            }
            return true;
        } catch (error) {
            console.error('Error saving session:', error);
            Alert.alert('Erreur', 'Impossible d\'enregistrer les modifications.');
            return false;
        } finally {
            setIsSaving(false);
        }
    };

    return {
        session,
        catches,
        setCatches,
        targetSpecies,
        loading,
        isSaving,
        locationName,
        setLocationName,
        caption,
        setCaption,
        locationVisibility,
        setLocationVisibility,
        waterColor,
        setWaterColor,
        waterCurrent,
        setWaterCurrent,
        waterLevel,
        setWaterLevel,
        hasUnsavedChanges,
        reload: loadSessionData,
        saveChanges,
    };
};
