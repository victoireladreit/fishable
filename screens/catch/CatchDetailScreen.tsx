import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CatchesService, FishingSessionsService } from '../../services';
import { RootStackParamList } from '../../navigation/types';
import { theme } from '../../theme';
import { Database } from '../../lib/types';
import { Ionicons } from '@expo/vector-icons';
import { CatchForm, CatchFormData } from '../../components/catch/CatchForm';
import {Card, InfoRow} from "../../components/common";

type CatchDetailRouteProp = RouteProp<RootStackParamList, 'CatchDetail'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'CatchDetail'>;
type Catch = Database['public']['Tables']['catches']['Row'];

const catchToFormData = (catchData: Catch, sessionText: string): CatchFormData => ({
    speciesName: catchData.species_name || '',
    sizeCm: catchData.size_cm?.toString().replace('.', ',') || '',
    weightKg: catchData.weight_kg?.toString().replace('.', ',') || '',
    technique: catchData.technique || '',
    lureName: catchData.lure_name || '',
    lureColor: catchData.lure_color || '',
    rodType: catchData.rod_type || '',
    waterDepthM: catchData.water_depth_m?.toString().replace('.', ',') || '',
    habitatType: catchData.habitat_type || '',
    waterType: catchData.water_type || null,
    structure: catchData.structure || '',
    fightDurationMinutes: catchData.fight_duration_minutes?.toString() || '',
    isReleased: catchData.is_released ?? true,
    notes: catchData.notes || '',
    sessionSearchText: sessionText,
    selectedSessionId: catchData.session_id,
    imageUri: catchData.photo_url,
    photoTakenAt: catchData.caught_at,
    catch_location_lat: catchData.catch_location_lat, // Add existing lat
    catch_location_lng: catchData.catch_location_lng, // Add existing lng
});

export const CatchDetailScreen = () => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const route = useRoute<CatchDetailRouteProp>();
    const { catchId } = route.params;

    const [catchData, setCatchData] = useState<Catch | null>(null);
    const [formData, setFormData] = useState<CatchFormData | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [sessionDetailsForDisplay, setSessionDetailsForDisplay] = useState<string | null>(null);
    const [associatedSessionId, setAssociatedSessionId] = useState<string | null>(null);

    const loadCatch = useCallback(async () => {
        setLoading(true);
        try {
            const data = await CatchesService.getCatchById(catchId);
            if (data) {
                setCatchData(data);
                let sessionText = '';
                let currentSessionDetails = null;
                if (data.session_id) {
                    const session = await FishingSessionsService.getSessionById(data.session_id);
                    if (session) {
                        sessionText = session.location_name;
                        currentSessionDetails = sessionText;
                        setAssociatedSessionId(data.session_id);
                    }
                } else {
                    setAssociatedSessionId(null);
                }
                setFormData(catchToFormData(data, sessionText));
                setSessionDetailsForDisplay(currentSessionDetails);
            } else {
                Alert.alert("Erreur", "Prise introuvable.");
                navigation.goBack();
            }
        } catch (error) {
            console.error("Erreur chargement de la prise:", error);
            Alert.alert("Erreur", "Impossible de charger les données de la prise.");
        } finally {
            setLoading(false);
        }
    }, [catchId, navigation]);

    useEffect(() => {
        loadCatch();
    }, [loadCatch]);

    const handleSave = async () => {
        if (!formData || !formData.speciesName) {
            Alert.alert('Erreur', 'Veuillez renseigner le nom de l\'espèce.');
            return;
        }

        setIsSaving(true);
        try {
            // Déterminer la valeur de caught_at
            let finalCaughtAt: string;
            const photoChanged = formData.imageUri !== catchData?.photo_url;

            if (formData.photoTakenAt) {
                // Si une nouvelle photo a été sélectionnée/prise et qu'elle a des données EXIF
                finalCaughtAt = formData.photoTakenAt;
            } else if (photoChanged) {
                // Si la photo a été changée (nouvelle photo sans EXIF) ou supprimée
                finalCaughtAt = new Date().toISOString();
            } else {
                // Si la photo n'a pas été changée, ou s'il n'y a jamais eu de photo
                finalCaughtAt = catchData?.caught_at || new Date().toISOString();
            }

            await CatchesService.updateCatch(catchId, {
                session_id: formData.selectedSessionId,
                species_name: formData.speciesName,
                size_cm: formData.sizeCm ? parseFloat(formData.sizeCm.replace(',', '.')) : null,
                weight_kg: formData.weightKg ? parseFloat(formData.weightKg.replace(',', '.')) : null,
                caught_at: finalCaughtAt, // Utiliser la date déterminée
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
                photo_uri: formData.imageUri, // Changed from photo_uri to photo_url
                catch_location_lat: formData.catch_location_lat, // Add latitude
                catch_location_lng: formData.catch_location_lng, // Add longitude
            });
            setIsEditing(false);
            await loadCatch(); // Recharger les données pour voir les changements
            Alert.alert('Succès', 'Prise mise à jour.');
        } catch (error) {
            console.error('Erreur mise à jour de la prise:', error);
            Alert.alert('Erreur', 'Impossible de mettre à jour la prise.');
        } finally {
            setIsSaving(false);
        }
    };

    useEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <TouchableOpacity onPress={() => isEditing ? handleSave() : setIsEditing(true)} disabled={loading || isSaving}>
                    <Ionicons name={isEditing ? "save-outline" : "create-outline"} size={theme.iconSizes.lg} color={theme.colors.primary[500]} />
                </TouchableOpacity>
            ),
            headerLeft: () => (
                isEditing ? (
                    <TouchableOpacity onPress={() => { setIsEditing(false); loadCatch(); }}>
                        <Ionicons name={"close-outline"} size={theme.iconSizes.lg} color={theme.colors.error.main} />
                    </TouchableOpacity>
                ) : undefined
            ),
        });
    }, [navigation, isEditing, loading, isSaving, handleSave, loadCatch]);

    const handlePressSession = () => {
        if (associatedSessionId) {
            navigation.navigate('SessionDetail', { sessionId: associatedSessionId });
        }
    };

    if (loading || !catchData || !formData) {
        return <View style={styles.center}><ActivityIndicator size="large" color={theme.colors.primary[500]} /></View>;
    }

    if (isEditing) {
        return (
            <View style={styles.formContainer}>
                <CatchForm
                    formData={formData}
                    onFormChange={(data) => setFormData(prev => prev ? { ...prev, ...data } : null)}
                    onSubmit={handleSave}
                    isSaving={isSaving}
                    submitButtonText="Enregistrer les modifications"
                />
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            {catchData.photo_url && (
                <Image source={{ uri: catchData.photo_url }} style={styles.headerImage} />
            )}
            <Text style={styles.title}>{catchData.species_name}</Text>
            <Text style={styles.date}>{catchData.caught_at ? new Date(catchData.caught_at).toLocaleString('fr-FR') : "-"}</Text>

            {sessionDetailsForDisplay && (
                <TouchableOpacity onPress={handlePressSession} disabled={!associatedSessionId}>
                    <Card style={styles.cardMargin}>
                        <View style={styles.sessionInfoRow}>
                            <InfoRow iconName="calendar-outline" label="Session" value={sessionDetailsForDisplay} />
                            <Ionicons name="chevron-forward-outline" size={theme.iconSizes.sm} color={theme.colors.text.secondary} />
                        </View>
                    </Card>
                </TouchableOpacity>
            )}

            <Card style={styles.cardMargin}>
                <InfoRow iconName="resize-outline" label="Taille" value={catchData.size_cm} unit="cm" />
                <InfoRow iconName="barbell-outline" label="Poids" value={catchData.weight_kg} unit="kg" />
                <InfoRow iconName="checkmark-circle-outline" label="Relâché" value={catchData.is_released ? 'Oui' : 'Non'} />
            </Card>

            <Card style={styles.cardMargin}>
                <InfoRow iconName="flash-outline" label="Technique" value={catchData.technique} />
                <InfoRow iconName="color-wand-outline" label="Leurre" value={`${catchData.lure_name || ''}${catchData.lure_color ? ` (${catchData.lure_color})` : ''}`} />
                <InfoRow iconName="hardware-chip-outline" label="Canne" value={catchData.rod_type} />
                <InfoRow iconName="stopwatch-outline" label="Combat" value={catchData.fight_duration_minutes} unit="min" />
            </Card>

            <Card style={styles.cardMargin}>
                <InfoRow iconName="water-outline" label="Type d'eau" value={catchData.water_type} />
                <InfoRow iconName="swap-vertical-outline" label="Profondeur" value={catchData.water_depth_m} unit="m" />
                <InfoRow iconName="leaf-outline" label="Habitat" value={catchData.habitat_type} />
                <InfoRow iconName="business-outline" label="Structure" value={catchData.structure} />
            </Card>

            <Card>
                <Text style={styles.notesText}>{catchData.notes || "Aucune note"}</Text>
            </Card>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background.default },
    container: { 
        padding: theme.layout.containerPadding, 
        paddingBottom: theme.spacing[10],
        backgroundColor: theme.colors.background.default,
    },
    formContainer: {
        flex: 1,
        backgroundColor: theme.colors.background.default,
        padding: theme.layout.containerPadding,
    },
    headerImage: { width: '100%', height: 250, borderRadius: theme.borderRadius.lg, marginBottom: theme.spacing[4], backgroundColor: theme.colors.background.paper },
    title: { fontFamily: theme.typography.fontFamily.bold, fontSize: theme.typography.fontSize["2xl"], color: theme.colors.text.primary },
    date: { fontFamily: theme.typography.fontFamily.regular, fontSize: theme.typography.fontSize.sm, color: theme.colors.text.secondary, marginBottom: theme.spacing[4] },
    notesText: { fontFamily: theme.typography.fontFamily.regular, fontSize: theme.typography.fontSize.base, color: theme.colors.text.primary, lineHeight: 22 },
    cardMargin: {
        marginBottom: theme.spacing[4],
    },
    sessionInfoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingRight: theme.spacing[2],
    },
});