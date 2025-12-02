import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Switch, Image, Modal, Alert, ActivityIndicator } from 'react-native';
import { SpeciesService, FishingSessionsService, FishingSession } from '../../services';
import { theme } from '../../theme';
import { Database } from '../../lib/types';
import { useImagePicker, CustomImagePickerAsset } from '../../hooks';
import { supabase } from '../../config/supabase';
import {Ionicons} from "@expo/vector-icons";
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { DatePickerInput } from '../common/DatePickerInput'; // Import the new component


type WaterType = Database['public']['Tables']['catches']['Row']['water_type'];
export type CatchFormData = {
    speciesName: string;
    sizeCm: string;
    weightKg: string;
    technique: string;
    lureName: string;
    lureColor: string;
    rodType: string;
    waterDepthM: string;
    habitatType: string;
    waterType: WaterType;
    structure: string;
    fightDurationMinutes: string;
    isReleased: boolean;
    notes: string;
    sessionSearchText: string; // Garder ce champ pour l'affichage dans le TextInput
    selectedSessionId: string | null;
    imageUri: string | null;
    photoTakenAt: string | null; // Nouveau champ pour la date de prise de vue de la photo
    catch_location_lat: number | null; // Nouveau champ pour la latitude
    catch_location_lng: number | null; // Nouveau champ pour la longitude
};

type CatchFormProps = {
    formData: CatchFormData;
    onFormChange: (data: Partial<CatchFormData>) => void;
    onSubmit: () => void;
    isSaving: boolean;
    submitButtonText: string;
};

const waterTypeOptions: { value: NonNullable<WaterType>; label: string }[] = [
    { value: 'fresh', label: 'Douce' },
    { value: 'salt', label: 'Salée' },
    { value: 'brackish', label: 'Saumâtre' },
];

const INPUT_HEIGHT = 50;

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'SelectLocation'>;


export const CatchForm: React.FC<CatchFormProps> = ({ formData, onFormChange, onSubmit, isSaving, submitButtonText }) => {
    const navigation = useNavigation<NavigationProp>();
    const { image, takePhoto, pickImage, setImage } = useImagePicker(formData.imageUri);
    const [modalVisible, setModalVisible] = useState(false);
    const [showDateWarning, setShowDateWarning] = useState(false);


    // Autocomplete states
    const [allSpecies, setAllSpecies] = useState<{ id: string; name: string }[]>([]);
    const [filteredSpecies, setFilteredSpecies] = useState<{ id: string; name: string }[]>([]);
    const [speciesSearchText, setSpeciesSearchText] = useState(formData.speciesName || ''); // Nouvel état local pour le texte de recherche d'espèce

    const [allSessions, setAllSessions] = useState<FishingSession[]>([]);
    const [filteredSessions, setFilteredSessions] = useState<FishingSession[]>([]);
    const [sessionSearchText, setSessionSearchText] = useState(formData.sessionSearchText || ''); // Nouvel état local pour le texte de recherche de session

    useEffect(() => {
        // Synchroniser les états locaux avec formData lors du chargement initial ou de la mise à jour de formData
        setSpeciesSearchText(formData.speciesName || '');
        setSessionSearchText(formData.sessionSearchText || '');
    }, [formData.speciesName, formData.sessionSearchText]);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const species = await SpeciesService.getAllSpecies();
                setAllSpecies(species);

                const { data: { user } = {} } = await supabase.auth.getUser(); // Destructurer avec valeur par défaut
                if (user) {
                    const sessions = await FishingSessionsService.getSessions({ userId: user.id });
                    setAllSessions(sessions);
                }
            } catch (error) {
                console.error('Erreur récupération données pour le formulaire:', error);
            }
        };
        fetchInitialData().catch(console.error);
    }, []);

    useEffect(() => {
        onFormChange({ imageUri: image?.uri ?? null });
    }, [image]);

    useEffect(() => {
        const checkDateMismatch = () => {
            if (formData.selectedSessionId && formData.photoTakenAt) {
                const selectedSession = allSessions.find(s => s.id === formData.selectedSessionId);
                if (selectedSession && selectedSession.started_at) {
                    const catchDate = new Date(formData.photoTakenAt);
                    const sessionDate = new Date(selectedSession.started_at);
                    // Comparer uniquement la partie date (ignorer l'heure)
                    if (catchDate.toDateString() !== sessionDate.toDateString()) {
                        setShowDateWarning(true);
                    } else {
                        setShowDateWarning(false);
                    }
                }
            } else {
                setShowDateWarning(false);
            }
        };
        checkDateMismatch();
    }, [formData.selectedSessionId, formData.photoTakenAt, allSessions]);

    const extractPhotoTakenDate = (asset: CustomImagePickerAsset | null) => {
        if (asset && asset.exif && asset.exif.DateTimeOriginal) {
            // Le format est généralement "YYYY:MM:DD HH:MM:SS"
            const dateTimeOriginal = asset.exif.DateTimeOriginal.replace(/:/, '-').replace(/:/, '-');
            return new Date(dateTimeOriginal).toISOString();
        }
        return null;
    };

    const extractPhotoLocation = (asset: CustomImagePickerAsset | null) => {
        console.log("--- extractPhotoLocation called ---");
        if (asset && asset.exif) {
            console.log("asset.exif:", JSON.stringify(asset.exif, null, 2));
            const gpsLatitude = asset.exif.GPSLatitude;
            const gpsLongitude = asset.exif.GPSLongitude;
            const gpsLatitudeRef = asset.exif.GPSLatitudeRef; // 'N' or 'S'
            const gpsLongitudeRef = asset.exif.GPSLongitudeRef; // 'E' or 'W'

            // Check if GPS coordinates are directly available as numbers
            if (typeof gpsLatitude === 'number' && typeof gpsLongitude === 'number') {
                let lat = gpsLatitude;
                let lng = gpsLongitude;

                // Adjust sign based on reference
                if (gpsLatitudeRef === 'S') {
                    lat = -Math.abs(lat); // Ensure it's negative if South
                }
                if (gpsLongitudeRef === 'W') {
                    lng = -Math.abs(lng); // Ensure it's negative if West
                }

                console.log("Extracted Lat:", lat, "Lng:", lng);
                return { lat, lng };
            } else {
                console.log("GPS data not found in EXIF or not in expected numeric format.");
            }
        } else {
            console.log("Asset or asset.exif is null.");
        }
        console.log("--- extractPhotoLocation finished, returning nulls ---");
        return { lat: null, lng: null };
    };

    const handleImageSelection = async (imagePromise: Promise<CustomImagePickerAsset | null>) => {
        const asset = await imagePromise;
        const { lat, lng } = extractPhotoLocation(asset);
        const photoDate = extractPhotoTakenDate(asset);

        const updateData: Partial<CatchFormData> = {
            imageUri: asset?.uri ?? null,
            catch_location_lat: lat,
            catch_location_lng: lng,
        };

        if (photoDate) {
            updateData.photoTakenAt = photoDate;
        }

        onFormChange(updateData);

        if (!lat && !lng && asset) {
            Alert.alert(
                "Localisation non trouvée",
                "Aucune donnée GPS n'a été trouvée pour cette photo. Voulez-vous choisir l'emplacement manuellement ?",
                [
                    { text: "Non", style: "cancel" },
                    { text: "Oui", onPress: () => openMap() }
                ]
            );
        }
    };

    const handleImagePress = () => {
        if (image) {
            setModalVisible(true);
        } else {
            Alert.alert("Ajouter une photo", "Choisissez une source", [
                { text: "Prendre une photo", onPress: () => handleImageSelection(takePhoto()) },
                { text: "Choisir depuis la galerie", onPress: () => handleImageSelection(pickImage()) },
                { text: "Annuler", style: "cancel" }
            ]);
        }
    };

    const handleRemoveImage = () => {
        Alert.alert("Supprimer la photo", "Êtes-vous sûr de vouloir supprimer cette photo ?", [
            { text: "Annuler", style: "cancel" },
            { text: "Supprimer", onPress: () => {
                setImage(null);
                onFormChange({
                    imageUri: null,
                    photoTakenAt: new Date().toISOString(), // Réinitialiser la date à maintenant
                    catch_location_lat: null,
                    catch_location_lng: null
                });
            }, style: 'destructive' }
        ]);
    };

    const handleSpeciesSearch = (text: string) => {
        setSpeciesSearchText(text); // Met à jour l'état local du texte de recherche
        onFormChange({ speciesName: '' });
        if (text) {
            setFilteredSpecies(allSpecies.filter(s => s.name.toLowerCase().includes(text.toLowerCase())));
        } else {
            setFilteredSpecies([]);
        }
    };

    const handleSelectSpecies = (species: { id: string; name: string }) => {
        onFormChange({ speciesName: species.name }); // Met à jour formData.speciesName avec l'espèce sélectionnée
        setSpeciesSearchText(species.name); // Met à jour le texte de recherche pour afficher l'espèce sélectionnée
        setFilteredSpecies([]);
    };

    const handleSessionSearch = (text: string) => {
        setSessionSearchText(text); // Met à jour l'état local du texte de recherche
        onFormChange({ selectedSessionId: null, sessionSearchText: text });
        if (text) {
            const filtered = allSessions.filter(session =>
                session.location_name?.toLowerCase().includes(text.toLowerCase())
            );
            setFilteredSessions(filtered);
        } else {
            setFilteredSessions([]);
        }
    };

    const handleSelectSession = (session: FishingSession) => {
        const sessionDisplay = `${session.location_name} - ${session.started_at ? new Date(session.started_at).toLocaleDateString() : ''}`;
        onFormChange({
            selectedSessionId: session.id,
            sessionSearchText: sessionDisplay // Met à jour formData.sessionSearchText pour l'affichage
        });
        setSessionSearchText(sessionDisplay); // Met à jour le texte de recherche pour afficher la session sélectionnée
        setFilteredSessions([]);
    };

    const openMap = () => {
        const initialLocation = formData.catch_location_lat && formData.catch_location_lng
            ? { latitude: formData.catch_location_lat, longitude: formData.catch_location_lng }
            : undefined;

        navigation.navigate('SelectLocation', {
            onLocationSelect: (location) => {
                onFormChange({
                    catch_location_lat: location.latitude,
                    catch_location_lng: location.longitude,
                });
            },
            initialLocation,
        });
    };

    const handlePhotoTakenAtChange = (newDate: Date) => {
        onFormChange({ photoTakenAt: newDate.toISOString() });
    };

    return (
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.container}>
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
                        <Ionicons name="close" size={30} color={theme.colors.white} />
                    </TouchableOpacity>
                    <Image source={{ uri: image?.uri || '' }} style={styles.fullScreenImage} resizeMode="contain" />
                </View>
            </Modal>

            <View style={styles.formGroup}>
                <Text style={styles.label}>Photo</Text>
                <View style={styles.imagePicker}>
                    {image ? (
                        <>
                            <TouchableOpacity onPress={handleImagePress} style={{width: '100%', height: '100%'}}>
                                <Image source={{ uri: image.uri }} style={styles.imagePreview} />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.removeImageButton} onPress={handleRemoveImage}>
                                <Ionicons name="trash-outline" size={22} color={theme.colors.white} />
                            </TouchableOpacity>
                        </>
                    ) : (
                        <TouchableOpacity onPress={handleImagePress} style={styles.imagePickerPlaceholder}>
                            <Ionicons name="camera-outline" size={40} color={theme.colors.text.secondary} />
                            <Text style={styles.imagePickerText}>Ajouter une photo</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            <View style={styles.formGroup}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={[styles.label, !image && styles.disabledLabel]}>Localisation</Text>
                    <TouchableOpacity onPress={openMap} disabled={!image}>
                        <Text style={{color: image ? theme.colors.primary[500] : theme.colors.text.disabled}}>Choisir sur la carte</Text>
                    </TouchableOpacity>
                </View>
                {formData.catch_location_lat && formData.catch_location_lng ? (
                    <Text>Lat: {formData.catch_location_lat.toFixed(4)}, Lng: {formData.catch_location_lng.toFixed(4)}</Text>
                ) : (
                    <Text style={{color: theme.colors.text.disabled}}>Aucune localisation sélectionnée</Text>
                )}
            </View>

            <View style={styles.formGroup}>
                <DatePickerInput
                    label="Date de la prise"
                    value={formData.photoTakenAt ? new Date(formData.photoTakenAt) : new Date()}
                    onChange={handlePhotoTakenAtChange}
                    maximumDate={new Date()}
                    iconColor={theme.colors.text.secondary}
                    mode="date" // Définir le mode sur "date"
                />
                {showDateWarning && (
                    <View style={styles.warningContainer}>
                        <Ionicons name="warning-outline" size={14} color={theme.colors.warning.dark} />
                        <Text style={styles.warningText}>
                            La date de la prise ne correspond pas à la date de la session.
                        </Text>
                    </View>
                )}
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.label}>Espèce *</Text>
                <TextInput
                    style={styles.input}
                    value={speciesSearchText}
                    onChangeText={handleSpeciesSearch}
                    placeholder="Ex: Brochet"
                    placeholderTextColor={theme.colors.text.disabled}
                />
                {filteredSpecies.length > 0 && (
                    <ScrollView style={styles.suggestionsList}>
                        {filteredSpecies.map(item => (
                            <TouchableOpacity key={item.id} onPress={() => handleSelectSpecies(item)} style={styles.suggestionItem}>
                                <Text>{item.name}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                )}
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.label}>Session</Text>
                <TextInput
                    style={styles.input}
                    value={sessionSearchText} // Utilise l'état local pour le texte affiché
                    onChangeText={handleSessionSearch}
                    placeholder="Rechercher une session..."
                    placeholderTextColor={theme.colors.text.disabled}
                />
                {filteredSessions.length > 0 && (
                    <ScrollView style={styles.suggestionsList}>
                        {filteredSessions.map(item => (
                            <TouchableOpacity key={item.id} onPress={() => handleSelectSession(item)} style={styles.suggestionItem}>
                                <Text>{item.location_name} - {item.started_at ? new Date(item.started_at).toLocaleDateString() : ''}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                )}
            </View>

            <View style={styles.row}>
                <View style={[styles.formGroup, styles.halfWidth]}>
                    <Text style={styles.label}>Taille (cm)</Text>
                    <TextInput style={styles.input} value={formData.sizeCm} onChangeText={(v) => onFormChange({ sizeCm: v })} placeholder="Ex: 80" placeholderTextColor={theme.colors.text.disabled} keyboardType="numeric" />
                </View>
                <View style={[styles.formGroup, styles.halfWidth]}>
                    <Text style={styles.label}>Poids (kg)</Text>
                    <TextInput style={styles.input} value={formData.weightKg} onChangeText={(v) => onFormChange({ weightKg: v })} placeholder="Ex: 5.4" placeholderTextColor={theme.colors.text.disabled} keyboardType="decimal-pad" />
                </View>
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.label}>Technique</Text>
                <TextInput style={styles.input} value={formData.technique} onChangeText={(v) => onFormChange({ technique: v })} placeholder="Ex: Lancer-ramener" placeholderTextColor={theme.colors.text.disabled} />
            </View>

            <View style={styles.row}>
                <View style={[styles.formGroup, styles.halfWidth]}>
                    <Text style={styles.label}>Leurre</Text>
                    <TextInput style={styles.input} value={formData.lureName} onChangeText={(v) => onFormChange({ lureName: v })} placeholder="Ex: Shad GT" placeholderTextColor={theme.colors.text.disabled} />
                </View>
                <View style={[styles.formGroup, styles.halfWidth]}>
                    <Text style={styles.label}>Couleur</Text>
                    <TextInput style={styles.input} value={formData.lureColor} onChangeText={(v) => onFormChange({ lureColor: v })} placeholder="Ex: Ayu" placeholderTextColor={theme.colors.text.disabled} />
                </View>
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.label}>Canne</Text>
                <TextInput style={styles.input} value={formData.rodType} onChangeText={(v) => onFormChange({ rodType: v })} placeholder="Ex: Spinning 7' M" placeholderTextColor={theme.colors.text.disabled} />
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.label}>Type d'eau</Text>
                <View style={styles.selectorContainer}>
                    {waterTypeOptions.map(opt => (
                        <TouchableOpacity
                            key={opt.value}
                            style={[styles.selectorOption, formData.waterType === opt.value && styles.selectorOptionSelected]}
                            onPress={() => onFormChange({ waterType: formData.waterType === opt.value ? null : opt.value })}
                        >
                            <Text style={[styles.selectorText, formData.waterType === opt.value && styles.selectorTextSelected]}>{opt.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
            <View style={styles.row}>
                <View style={[styles.formGroup, styles.halfWidth]}>
                    <Text style={styles.label}>Profondeur (m)</Text>
                    <TextInput style={styles.input} value={formData.waterDepthM} onChangeText={(v) => onFormChange({ waterDepthM: v })} placeholder="Ex: 2.5" placeholderTextColor={theme.colors.text.disabled} keyboardType="numeric" />
                </View>
                <View style={[styles.formGroup, styles.halfWidth]}>
                    <Text style={styles.label}>Habitat</Text>
                    <TextInput style={styles.input} value={formData.habitatType} onChangeText={(v) => onFormChange({ habitatType: v })} placeholder="Ex: Herbier" placeholderTextColor={theme.colors.text.disabled} />
                </View>
            </View>
            <View style={styles.formGroup}>
                <Text style={styles.label}>Structure</Text>
                <TextInput style={styles.input} value={formData.structure} onChangeText={(v) => onFormChange({ structure: v })} placeholder="Ex: Pile de pont" placeholderTextColor={theme.colors.text.disabled} />
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.label}>Durée du combat (min)</Text>
                <TextInput style={styles.input} value={formData.fightDurationMinutes} onChangeText={(v) => onFormChange({ fightDurationMinutes: v })} placeholder="Ex: 5" placeholderTextColor={theme.colors.text.disabled} keyboardType="numeric" />
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.label}>Notes</Text>
                <TextInput style={[styles.input, styles.multilineInput]} value={formData.notes} onChangeText={(v) => onFormChange({ notes: v })} placeholder="Attaque violente, poisson très combatif..." placeholderTextColor={theme.colors.text.disabled} multiline />
            </View>
            
            <View style={styles.switchContainer}>
                <Text style={styles.label}>Relâché ?</Text>
                <Switch
                    trackColor={{ false: theme.colors.background.default, true: theme.colors.primary[500] }}
                    thumbColor={formData.isReleased ? theme.colors.primary[200] : theme.colors.text.disabled}
                    onValueChange={(v) => onFormChange({ isReleased: v })}
                    value={formData.isReleased}
                />
            </View>

            <TouchableOpacity style={[styles.button, styles.saveButton, isSaving && styles.buttonDisabled]} onPress={onSubmit} disabled={isSaving}>
                {isSaving ? (
                    <ActivityIndicator color={theme.colors.text.inverse} />
                ) : (
                    <Text style={styles.buttonText}>{submitButtonText}</Text>
                )}
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flexGrow: 1, alignItems: 'center', paddingBottom: theme.spacing[16] },
    formGroup: { width: '100%', marginBottom: theme.spacing[4] },
    label: { fontFamily: theme.typography.fontFamily.medium, fontSize: theme.typography.fontSize.base, color: theme.colors.text.secondary, marginBottom: theme.spacing[2] },
    disabledLabel: { color: theme.colors.text.disabled },
    input: { backgroundColor: theme.colors.background.paper, color: theme.colors.text.primary, height: INPUT_HEIGHT, borderWidth: 1, borderColor: theme.colors.border.main, borderRadius: theme.borderRadius.base, paddingHorizontal: theme.spacing[4], fontSize: theme.typography.fontSize.base },
    multilineInput: { height: 100, textAlignVertical: 'top', paddingTop: theme.spacing[3] },
    suggestionsList: { maxHeight: 150, borderColor: theme.colors.border.main, borderWidth: 1, borderRadius: theme.borderRadius.base, backgroundColor: theme.colors.background.paper, position: 'absolute', top: INPUT_HEIGHT + theme.spacing[2] + theme.typography.fontSize.base, left: 0, right: 0, zIndex: 1 },
    suggestionItem: { padding: theme.spacing[3], borderBottomColor: theme.colors.border.main, borderBottomWidth: 1 },
    row: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
    halfWidth: { width: '48%' },
    switchContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: theme.spacing[4], paddingHorizontal: theme.spacing[1] },
    selectorContainer: { flexDirection: 'row', width: '100%', backgroundColor: theme.colors.gray[100], borderRadius: theme.borderRadius.md, padding: theme.spacing[1] },
    selectorOption: { flex: 1, paddingVertical: theme.spacing[2], borderRadius: theme.borderRadius.base, alignItems: 'center' },
    selectorOptionSelected: { backgroundColor: theme.colors.white, ...theme.shadows.sm },
    selectorText: { fontFamily: theme.typography.fontFamily.medium, fontSize: theme.typography.fontSize.sm, color: theme.colors.text.secondary, fontWeight: theme.typography.fontWeight.medium, textAlign: 'center' },
    selectorTextSelected: { color: theme.colors.primary[600] },
    imagePicker: { height: 200, width: '100%', backgroundColor: theme.colors.background.paper, borderRadius: theme.borderRadius.md, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: theme.colors.border.main, overflow: 'hidden' },
    imagePickerPlaceholder: { alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' },
    imagePickerText: { color: theme.colors.text.secondary, fontFamily: theme.typography.fontFamily.medium, marginTop: theme.spacing[2] },
    imagePreview: { width: '100%', height: '100%' },
    removeImageButton: { position: 'absolute', top: 10, right: 10, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 20, width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
    button: { height: INPUT_HEIGHT, justifyContent: 'center', borderRadius: theme.borderRadius.base, alignItems: 'center', width: '100%', marginTop: theme.spacing[4], ...theme.shadows.base },
    saveButton: { backgroundColor: theme.colors.primary[500] },
    buttonDisabled: { backgroundColor: theme.colors.primary[300] },
    buttonText: { fontFamily: theme.typography.fontFamily.bold, fontSize: theme.typography.fontSize.base, color: theme.colors.text.inverse },
    modalContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' },
    fullScreenImage: { width: '100%', height: '80%' },
    closeButton: { position: 'absolute', top: 50, right: 20, zIndex: 1 },
    mapConfirmButton: {
        position: 'absolute',
        bottom: 30,
        left: 20,
        right: 20,
        backgroundColor: theme.colors.primary[500],
        padding: 15,
        borderRadius: theme.borderRadius.base,
        alignItems: 'center',
    },
    mapMarkerFixed: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginLeft: -20,
        marginTop: -40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    warningContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: theme.spacing[2],
        padding: theme.spacing[2],
        backgroundColor: theme.colors.warning.light,
        borderRadius: theme.borderRadius.base,
    },
    warningText: {
        marginLeft: theme.spacing[2],
        color: theme.colors.warning.dark,
        fontFamily: theme.typography.fontFamily.regular,
        fontSize: theme.typography.fontSize.xs,
    },
});
