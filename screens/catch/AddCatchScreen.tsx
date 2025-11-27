import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useRoute, RouteProp, useNavigation, usePreventRemove } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CatchesService, FishingSessionsService } from '../../services';
import { RootStackParamList } from '../../navigation/types';
import { theme } from '../../theme';
import { CatchForm, CatchFormData } from '../../components/catch/CatchForm';

type AddCatchRouteProp = RouteProp<RootStackParamList, 'AddCatch'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'AddCatch'>;

const initialFormData: CatchFormData = {
    speciesName: '',
    sizeCm: '',
    weightKg: '',
    technique: '',
    lureName: '',
    lureColor: '',
    rodType: '',
    waterDepthM: '',
    habitatType: '',
    waterType: null,
    structure: '',
    fightDurationMinutes: '',
    isReleased: true,
    notes: '',
    sessionSearchText: '',
    selectedSessionId: null,
    imageUri: null,
    photoTakenAt: null, // Initialiser photoTakenAt
    catch_location_lat: null, // Initialiser la latitude
    catch_location_lng: null, // Initialiser la longitude
};

export const AddCatchScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<AddCatchRouteProp>();
    const { sessionId: initialSessionId, catchLocationLat, catchLocationLng, catchLocationAccuracy } = route.params;

    const [formData, setFormData] = useState<CatchFormData>({
        ...initialFormData,
        selectedSessionId: initialSessionId ?? null,
    });
    const [isSaving, setIsSaving] = useState(false);
    
    const handleFormChange = (data: Partial<CatchFormData>) => {
        setFormData(prev => ({ ...prev, ...data }));
    };

    const hasUnsavedChanges =
        JSON.stringify(formData) !== JSON.stringify({ ...initialFormData, selectedSessionId: initialSessionId ?? null });

    usePreventRemove(
        hasUnsavedChanges && !isSaving,
        ({ data }) => {
            Alert.alert(
                'Modifications non enregistrées',
                'Que voulez-vous faire ?',
                [
                    { text: 'Enregistrer et Quitter', onPress: handleSave },
                    { text: 'Quitter sans enregistrer', style: 'destructive', onPress: () => navigation.dispatch(data.action) },
                    { text: "Rester", style: 'cancel', onPress: () => {} },
                ]
            );
        }
    );

    useEffect(() => {
        if (initialSessionId) {
            FishingSessionsService.getSessionById(initialSessionId).then(session => {
                if (session) {
                    handleFormChange({
                        sessionSearchText: `${session.location_name} - ${session.created_at ? new Date(session.created_at).toLocaleDateString() : ''}`
                    });
                }
            }).catch(console.error);
        }
    }, [initialSessionId]);

    const handleSave = async () => {
        if (!formData.speciesName) {
            Alert.alert('Erreur', 'Veuillez renseigner le nom de l\'espèce.');
            return;
        }

        setIsSaving(true);
        try {
            await CatchesService.addCatch({
                session_id: formData.selectedSessionId,
                species_name: formData.speciesName,
                size_cm: formData.sizeCm ? parseFloat(formData.sizeCm.replace(',', '.')) : null,
                weight_kg: formData.weightKg ? parseFloat(formData.weightKg.replace(',', '.')) : null,
                caught_at: formData.photoTakenAt || new Date().toISOString(), // Utiliser photoTakenAt ou la date actuelle
                technique: formData.technique || null,
                lure_name: formData.lureName || null,
                lure_color: formData.lureColor || null,
                rod_type: formData.rodType || null,
                water_depth_m: formData.waterDepthM ? parseFloat(formData.waterDepthM.replace(',', '.')) : null,
                habitat_type: formData.habitatType || null,
                water_type: formData.waterType,
                structure: formData.structure || null,
                fight_duration_minutes: formData.fightDurationMinutes ? parseInt(formData.fightDurationMinutes, 10) : null,
                is_released: formData.isReleased,
                notes: formData.notes || null,
                photo_uri: formData.imageUri,
                catch_location_lat: formData.catch_location_lat || catchLocationLat || null, // Utiliser formData d'abord
                catch_location_lng: formData.catch_location_lng || catchLocationLng || null, // Utiliser formData d'abord
                catch_location_accuracy: catchLocationAccuracy || null,
            });
            navigation.goBack();
        } catch (error) {
            console.error('Erreur ajout de la prise:', error);
            Alert.alert('Erreur', 'Impossible d\'ajouter la prise.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <View style={styles.container}>
            <CatchForm
                formData={formData}
                onFormChange={handleFormChange}
                onSubmit={handleSave}
                isSaving={isSaving}
                submitButtonText="Enregistrer la prise"
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background.default,
        padding: theme.layout.containerPadding,
    },
});