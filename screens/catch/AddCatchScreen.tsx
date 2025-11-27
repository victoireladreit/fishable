import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, Switch, Image, Platform, Modal } from 'react-native';
import { useRoute, RouteProp, useNavigation, usePreventRemove } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CatchesService, SpeciesService } from '../../services';
import { RootStackParamList } from '../../navigation/types';
import { theme } from '../../theme';
import { Database } from '../../lib/types';
import { Ionicons } from '@expo/vector-icons';
import { useImagePicker } from '../../hooks';

type AddCatchRouteProp = RouteProp<RootStackParamList, 'AddCatch'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'AddCatch'>;
type WaterType = Database['public']['Tables']['catches']['Row']['water_type'];

const waterTypeOptions: { value: NonNullable<WaterType>; label: string }[] = [
    { value: 'fresh', label: 'Douce' },
    { value: 'salt', label: 'Salée' },
    { value: 'brackish', label: 'Saumâtre' },
];

const INPUT_HEIGHT = 50;

export const AddCatchScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<AddCatchRouteProp>();
    const { sessionId, catchLocationLat, catchLocationLng, catchLocationAccuracy } = route.params;
    const { image, takePhoto, pickImage, setImage } = useImagePicker();

    // Form states
    const [speciesName, setSpeciesName] = useState('');
    const [sizeCm, setSizeCm] = useState('');
    const [weightKg, setWeightKg] = useState('');
    const [technique, setTechnique] = useState('');
    const [lureName, setLureName] = useState('');
    const [lureColor, setLureColor] = useState('');
    const [rodType, setRodType] = useState('');
    const [waterDepthM, setWaterDepthM] = useState('');
    const [habitatType, setHabitatType] = useState('');
    const [waterType, setWaterType] = useState<WaterType>(null);
    const [structure, setStructure] = useState('');
    const [fightDurationMinutes, setFightDurationMinutes] = useState('');
    const [isReleased, setIsReleased] = useState(true);
    const [notes, setNotes] = useState('');
    const [modalVisible, setModalVisible] = useState(false);

    // Helper states
    const [loading, setLoading] = useState(false);
    const [allSpecies, setAllSpecies] = useState<{ id: string; name: string }[]>([]);
    const [filteredSpecies, setFilteredSpecies] = useState<{ id: string; name: string }[]>([]);

    const hasUnsavedChanges =
        speciesName !== '' ||
        sizeCm !== '' ||
        weightKg !== '' ||
        technique !== '' ||
        lureName !== '' ||
        lureColor !== '' ||
        rodType !== '' ||
        waterDepthM !== '' ||
        habitatType !== '' ||
        waterType !== null ||
        structure !== '' ||
        fightDurationMinutes !== '' ||
        !isReleased ||
        notes !== '' ||
        image !== null;

    usePreventRemove(
        hasUnsavedChanges && !loading,
        ({ data }) => {
            Alert.alert(
                'Modifications non enregistrées',
                'Que voulez-vous faire ?',
                [
                    {
                        text: 'Enregistrer et Quitter',
                        onPress: handleSave,
                    },
                    {
                        text: 'Quitter sans enregistrer',
                        style: 'destructive',
                        onPress: () => navigation.dispatch(data.action),
                    },
                    { text: "Rester", style: 'cancel', onPress: () => {} },
                ]
            );
        }
    );

    useEffect(() => {
        const fetchSpecies = async () => {
            try {
                const species = await SpeciesService.getAllSpecies();
                setAllSpecies(species);
            } catch (error) {
                console.error('Erreur récupération des espèces:', error);
            }
        };
        fetchSpecies();
    }, []);

    const selectImageSource = () => {
        Alert.alert(
            "Ajouter une photo",
            "Choisissez une source",
            [
                {
                    text: "Prendre une photo",
                    onPress: takePhoto,
                },
                {
                    text: "Choisir depuis la galerie",
                    onPress: pickImage,
                },
                {
                    text: "Annuler",
                    style: "cancel"
                }
            ]
        );
    };

    const handleImagePress = () => {
        if (image) {
            setModalVisible(true);
        } else {
            selectImageSource();
        }
    };

    const handleRemoveImage = () => {
        Alert.alert(
            "Supprimer la photo",
            "Êtes-vous sûr de vouloir supprimer cette photo ?",
            [
                {
                    text: "Annuler",
                    style: "cancel"
                },
                { 
                    text: "Supprimer", 
                    onPress: () => setImage(null),
                    style: 'destructive'
                }
            ]
        );
    };

    const handleSpeciesSearch = (text: string) => {
        setSpeciesName(text);
        if (text) {
            const filtered = allSpecies.filter(species =>
                species.name.toLowerCase().includes(text.toLowerCase())
            );
            setFilteredSpecies(filtered);
        } else {
            setFilteredSpecies([]);
        }
    };

    const handleSelectSpecies = (species: { id: string; name: string }) => {
        setSpeciesName(species.name);
        setFilteredSpecies([]);
    };

    const handleSave = async () => {
        if (!speciesName) {
            Alert.alert('Erreur', 'Veuillez renseigner le nom de l\'espèce.');
            return;
        }

        if (!sessionId) {
            Alert.alert('Erreur', 'ID de session manquant.');
            return;
        }

        setLoading(true);
        try {
            await CatchesService.addCatch({
                session_id: sessionId,
                species_name: speciesName,
                size_cm: sizeCm ? parseFloat(sizeCm.replace(',', '.')) : null,
                weight_kg: weightKg ? parseFloat(weightKg.replace(',', '.')) : null,
                caught_at: new Date().toISOString(),
                technique: technique || null,
                lure_name: lureName || null,
                lure_color: lureColor || null,
                rod_type: rodType || null,
                water_depth_m: waterDepthM ? parseFloat(waterDepthM.replace(',', '.')) : null,
                habitat_type: habitatType || null,
                water_type: waterType,
                structure: structure || null,
                fight_duration_minutes: fightDurationMinutes ? parseInt(fightDurationMinutes, 10) : null,
                is_released: isReleased,
                notes: notes || null,
                photo_uri: image?.uri,
                catch_location_lat: catchLocationLat || null,
                catch_location_lng: catchLocationLng || null,
                catch_location_accuracy: catchLocationAccuracy || null,
            });
            navigation.goBack();
        } catch (error) {
            console.error('Erreur ajout de la prise:', error);
            Alert.alert('Erreur', 'Impossible d\'ajouter la prise.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
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
            
            {/* Photo */}
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

            {/* Species */}
            <View style={styles.formGroup}>
                <Text style={styles.label}>Espèce *</Text>
                <TextInput
                    style={styles.input}
                    value={speciesName}
                    onChangeText={handleSpeciesSearch}
                    placeholder="Ex: Brochet"
                    placeholderTextColor={theme.colors.text.disabled}
                />
                {filteredSpecies.length > 0 && (
                    <View style={styles.suggestionsList}>
                        {filteredSpecies.map(item => (
                            <TouchableOpacity key={item.id} onPress={() => handleSelectSpecies(item)} style={styles.suggestionItem}>
                                <Text>{item.name}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </View>

            {/* Size and Weight */}
            <View style={styles.row}>
                <View style={[styles.formGroup, styles.halfWidth]}>
                    <Text style={styles.label}>Taille (cm)</Text>
                    <TextInput style={styles.input} value={sizeCm} onChangeText={setSizeCm} placeholder="Ex: 80" placeholderTextColor={theme.colors.text.disabled} keyboardType="numeric" />
                </View>
                <View style={[styles.formGroup, styles.halfWidth]}>
                    <Text style={styles.label}>Poids (kg)</Text>
                    <TextInput style={styles.input} value={weightKg} onChangeText={setWeightKg} placeholder="Ex: 5.4" placeholderTextColor={theme.colors.text.disabled} keyboardType="decimal-pad" />
                </View>
            </View>

            {/* Technique */}
            <View style={styles.formGroup}>
                <Text style={styles.label}>Technique</Text>
                <TextInput style={styles.input} value={technique} onChangeText={setTechnique} placeholder="Ex: Lancer-ramener" placeholderTextColor={theme.colors.text.disabled} />
            </View>

            {/* Lure */}
            <View style={styles.row}>
                <View style={[styles.formGroup, styles.halfWidth]}>
                    <Text style={styles.label}>Leurre</Text>
                    <TextInput style={styles.input} value={lureName} onChangeText={setLureName} placeholder="Ex: Shad GT" placeholderTextColor={theme.colors.text.disabled} />
                </View>
                <View style={[styles.formGroup, styles.halfWidth]}>
                    <Text style={styles.label}>Couleur</Text>
                    <TextInput style={styles.input} value={lureColor} onChangeText={setLureColor} placeholder="Ex: Ayu" placeholderTextColor={theme.colors.text.disabled} />
                </View>
            </View>

            {/* Equipment */}
            <View style={styles.formGroup}>
                <Text style={styles.label}>Canne</Text>
                <TextInput style={styles.input} value={rodType} onChangeText={setRodType} placeholder="Ex: Spinning 7' M" placeholderTextColor={theme.colors.text.disabled} />
            </View>

            {/* Environment */}
            <View style={styles.formGroup}>
                <Text style={styles.label}>Type d'eau</Text>
                <View style={styles.selectorContainer}>
                    {waterTypeOptions.map(opt => (
                        <TouchableOpacity
                            key={opt.value}
                            style={[styles.selectorOption, waterType === opt.value && styles.selectorOptionSelected]}
                            onPress={() => setWaterType(prev => prev === opt.value ? null : opt.value)}
                        >
                            <Text style={[styles.selectorText, waterType === opt.value && styles.selectorTextSelected]}>{opt.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
            <View style={styles.row}>
                <View style={[styles.formGroup, styles.halfWidth]}>
                    <Text style={styles.label}>Profondeur (m)</Text>
                    <TextInput style={styles.input} value={waterDepthM} onChangeText={setWaterDepthM} placeholder="Ex: 2.5" placeholderTextColor={theme.colors.text.disabled} keyboardType="numeric" />
                </View>
                <View style={[styles.formGroup, styles.halfWidth]}>
                    <Text style={styles.label}>Habitat</Text>
                    <TextInput style={styles.input} value={habitatType} onChangeText={setHabitatType} placeholder="Ex: Herbier" placeholderTextColor={theme.colors.text.disabled} />
                </View>
            </View>
            <View style={styles.formGroup}>
                <Text style={styles.label}>Structure</Text>
                <TextInput style={styles.input} value={structure} onChangeText={setStructure} placeholder="Ex: Pile de pont" placeholderTextColor={theme.colors.text.disabled} />
            </View>

            {/* Fight */}
            <View style={styles.formGroup}>
                <Text style={styles.label}>Durée du combat (min)</Text>
                <TextInput style={styles.input} value={fightDurationMinutes} onChangeText={setFightDurationMinutes} placeholder="Ex: 5" placeholderTextColor={theme.colors.text.disabled} keyboardType="numeric" />
            </View>

            {/* Notes */}
            <View style={styles.formGroup}>
                <Text style={styles.label}>Notes</Text>
                <TextInput style={[styles.input, styles.multilineInput]} value={notes} onChangeText={setNotes} placeholder="Attaque violente, poisson très combatif..." placeholderTextColor={theme.colors.text.disabled} multiline />
            </View>
            
            {/* Location Accuracy Display (Optional, for user info) */}
            {catchLocationLat && catchLocationLng && catchLocationAccuracy !== undefined && (
                <View style={styles.formGroup}>
                    <Text style={styles.label}>Précision de la localisation:</Text>
                    <Text style={styles.locationAccuracyText}>{catchLocationAccuracy.toFixed(1)} mètres</Text>
                    {catchLocationAccuracy > 50 && ( // Example threshold for warning
                        <Text style={styles.locationWarningText}>La précision est faible. La position enregistrée pourrait être imprécise.</Text>
                    )}
                </View>
            )}

            {/* Released Switch */}
            <View style={styles.switchContainer}>
                <Text style={styles.label}>Relâché ?</Text>
                <Switch
                    trackColor={{ false: theme.colors.background.default, true: theme.colors.primary[500] }}
                    thumbColor={isReleased ? theme.colors.primary[200] : theme.colors.text.disabled}
                    onValueChange={setIsReleased}
                    value={isReleased}
                />
            </View>

            <TouchableOpacity style={[styles.button, styles.saveButton, loading && styles.buttonDisabled]} onPress={handleSave} disabled={loading}>
                <Text style={styles.buttonText}>Enregistrer la prise</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    scrollContainer: {
        flex: 1,
        backgroundColor: theme.colors.background.default,
    },
    container: {
        flexGrow: 1,
        alignItems: 'center',
        padding: theme.layout.containerPadding,
        paddingBottom: theme.spacing[16], // Added padding
    },
    formGroup: {
        width: '100%',
        marginBottom: theme.spacing[4],
    },
    label: {
        fontFamily: theme.typography.fontFamily.medium,
        fontSize: theme.typography.fontSize.base,
        color: theme.colors.text.secondary,
        marginBottom: theme.spacing[2],
    },
    input: {
        backgroundColor: theme.colors.background.paper,
        color: theme.colors.text.primary,
        height: INPUT_HEIGHT,
        borderWidth: 1,
        borderColor: theme.colors.border.main,
        borderRadius: theme.borderRadius.base,
        paddingHorizontal: theme.spacing[4],
        fontSize: theme.typography.fontSize.base,
    },
    multilineInput: {
        height: 100,
        textAlignVertical: 'top',
        paddingTop: theme.spacing[3],
    },
    suggestionsList: {
        maxHeight: 150,
        borderColor: theme.colors.border.main,
        borderWidth: 1,
        borderRadius: theme.borderRadius.base,
        backgroundColor: theme.colors.background.paper,
    },
    suggestionItem: {
        padding: theme.spacing[3],
        borderBottomColor: theme.colors.border.main,
        borderBottomWidth: 1,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    halfWidth: {
        width: '48%',
    },
    switchContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        marginBottom: theme.spacing[4],
        paddingHorizontal: theme.spacing[1],
    },
    selectorContainer: {
        flexDirection: 'row',
        width: '100%',
        backgroundColor: theme.colors.gray[100],
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing[1],
    },
    selectorOption: {
        flex: 1,
        paddingVertical: theme.spacing[2],
        borderRadius: theme.borderRadius.base,
        alignItems: 'center',
    },
    selectorOptionSelected: {
        backgroundColor: theme.colors.white,
        ...theme.shadows.sm,
    },
    selectorText: {
        fontFamily: theme.typography.fontFamily.medium,
        fontSize: theme.typography.fontSize.sm,
        color: theme.colors.text.secondary,
        fontWeight: theme.typography.fontWeight.medium,
        textAlign: 'center',
    },
    selectorTextSelected: {
        color: theme.colors.primary[600],
    },
    imagePicker: {
        height: 200,
        width: '100%',
        backgroundColor: theme.colors.background.paper,
        borderRadius: theme.borderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.colors.border.main,
        overflow: 'hidden', // To keep the remove button inside the rounded corners
    },
    imagePickerPlaceholder: {
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
    },
    imagePickerText: {
        color: theme.colors.text.secondary,
        fontFamily: theme.typography.fontFamily.medium,
        marginTop: theme.spacing[2],
    },
    imagePreview: {
        width: '100%',
        height: '100%',
    },
    removeImageButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: 'rgba(0,0,0,0.6)',
        borderRadius: 20,
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    button: {
        height: INPUT_HEIGHT,
        justifyContent: 'center',
        borderRadius: theme.borderRadius.base,
        alignItems: 'center',
        width: '100%',
        marginTop: theme.spacing[4],
        ...theme.shadows.base,
    },
    saveButton: {
        backgroundColor: theme.colors.primary[500],
    },
    buttonDisabled: {
        backgroundColor: theme.colors.primary[300],
    },
    buttonText: {
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: theme.typography.fontSize.base,
        color: theme.colors.text.inverse,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.9)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    fullScreenImage: {
        width: '100%',
        height: '80%',
    },
    closeButton: {
        position: 'absolute',
        top: 50,
        right: 20,
        zIndex: 1,
    },
    locationAccuracyText: {
        fontFamily: theme.typography.fontFamily.regular,
        fontSize: theme.typography.fontSize.base,
        color: theme.colors.text.primary,
        marginTop: theme.spacing[1],
    },
    locationWarningText: {
        fontFamily: theme.typography.fontFamily.regular,
        fontSize: theme.typography.fontSize.sm,
        color: theme.colors.error.main,
        marginTop: theme.spacing[1],
    },
});
