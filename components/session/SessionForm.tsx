import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';

type WaterClarity = 'clear' | 'slightly_murky' | 'murky' | 'very_murky';
type WaterCurrent = 'none' | 'light' | 'moderate' | 'strong';
type WaterLevel = 'low' | 'normal' | 'high';
type LocationVisibility = 'public' | 'region' | 'private';

const waterClarityOptions: { key: WaterClarity; label: string }[] = [
    { key: 'clear', label: 'Clair' },
    { key: 'slightly_murky', label: 'Peu trouble' },
    { key: 'murky', label: 'Trouble' },
    { key: 'very_murky', label: 'Très trouble' },
];

const waterCurrentOptions: { key: WaterCurrent; label: string }[] = [
    { key: 'none', label: 'Nul' },
    { key: 'light', label: 'Léger' },
    { key: 'moderate', label: 'Modéré' },
    { key: 'strong', label: 'Fort' },
];

const waterLevelOptions: { key: WaterLevel; label: string }[] = [
    { key: 'low', label: 'Bas' },
    { key: 'normal', label: 'Normal' },
    { key: 'high', label: 'Haut' },
];

const locationVisibilityOptions: { key: LocationVisibility; label: string }[] = [
    { key: 'private', label: 'Privé' },
    { key: 'region', label: 'Région' },
    { key: 'public', label: 'Public' },
];

const locationVisibilityInfo = `
• Privé : Personne ne peut voir la localisation de votre session.\n
• Région : Seule la région (ex: "Haute-Savoie") est visible, pas le point GPS exact.\n
• Public : La localisation GPS exacte de votre session est visible par les autres utilisateurs.
`;

interface SelectorProps<T> {
    label: string;
    options: { key: T; label: string }[];
    selectedValue: T | null;
    onSelect: (value: T | null) => void;
    info?: string;
}

const Selector = <T extends string>({ label, options, selectedValue, onSelect, info }: SelectorProps<T>) => {
    return (
        <View style={styles.formGroup}>
            <View style={styles.labelContainer}>
                <Text style={styles.label}>{label}</Text>
                {info && (
                    <TouchableOpacity onPress={() => Alert.alert(label, info)}>
                        <Ionicons name="information-circle-outline" size={theme.iconSizes.sm} color={theme.colors.primary[500]} />
                    </TouchableOpacity>
                )}
            </View>
            <View style={styles.selectorContainer}>
                {options.map(opt => (
                    <TouchableOpacity
                        key={opt.key}
                        style={[styles.selectorOption, selectedValue === opt.key && styles.selectorOptionSelected]}
                        onPress={() => onSelect(selectedValue === opt.key ? null : opt.key)}
                    >
                        <Text style={[styles.selectorText, selectedValue === opt.key && styles.selectorTextSelected]}>{opt.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
};

interface SessionFormProps {
    waterClarity: WaterClarity | null;
    setWaterClarity: (value: WaterClarity | null) => void;
    waterCurrent: WaterCurrent | null;
    setWaterCurrent: (value: WaterCurrent | null) => void;
    waterLevel: WaterLevel | null;
    setWaterLevel: (value: WaterLevel | null) => void;
    locationVisibility: LocationVisibility;
    setLocationVisibility: (value: LocationVisibility) => void;
}

export const SessionForm: React.FC<SessionFormProps> = ({
    waterClarity,
    setWaterClarity,
    waterCurrent,
    setWaterCurrent,
    waterLevel,
    setWaterLevel,
    locationVisibility,
    setLocationVisibility,
}) => {
    return (
        <>
            <Selector
                label="Clarté de l'eau"
                options={waterClarityOptions}
                selectedValue={waterClarity}
                onSelect={setWaterClarity}
            />
            <Selector
                label="Courant de l'eau"
                options={waterCurrentOptions}
                selectedValue={waterCurrent}
                onSelect={setWaterCurrent}
            />
            <Selector
                label="Niveau d'eau"
                options={waterLevelOptions}
                selectedValue={waterLevel}
                onSelect={setWaterLevel}
            />
            <Selector
                label="Visibilité de la localisation"
                options={locationVisibilityOptions}
                selectedValue={locationVisibility}
                onSelect={(value) => setLocationVisibility(value || 'private')}
                info={locationVisibilityInfo}
            />
        </>
    );
};

const styles = StyleSheet.create({
    formGroup: { width: '100%', marginBottom: theme.spacing[5] },
    labelContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing[3] },
    label: {
        fontFamily: theme.typography.fontFamily.medium,
        fontSize: theme.typography.fontSize.base,
        color: theme.colors.text.secondary,
        fontWeight: theme.typography.fontWeight.medium,
    },
    selectorContainer: {
        flexDirection: 'row',
        width: '100%',
        backgroundColor: theme.colors.gray[100],
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing[1],
    },
    selectorOption: { flex: 1, paddingVertical: theme.spacing[2], borderRadius: theme.borderRadius.base, alignItems: 'center' },
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
    selectorTextSelected: { color: theme.colors.primary[600] },
});
