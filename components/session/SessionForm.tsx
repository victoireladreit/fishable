import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';

type WaterLevel = 'normal' | 'high' | 'flood';
type LocationVisibility = 'public' | 'region' | 'private';

const waterLevelOptions: { key: WaterLevel; label: string }[] = [
    { key: 'normal', label: 'Normal' },
    { key: 'high', label: 'Haut' },
    { key: 'flood', label: 'Crue' },
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

interface FreeTextInputProps {
    label: string;
    value: string | null;
    onChange: (value: string | null) => void;
    placeholder?: string;
}

const FreeTextInput: React.FC<FreeTextInputProps> = ({ label, value, onChange, placeholder }) => {
    return (
        <View style={styles.formGroup}>
            <Text style={styles.label}>{label}</Text>
            <TextInput
                style={styles.input}
                value={value || ''}
                onChangeText={onChange}
                placeholder={placeholder}
                placeholderTextColor={theme.colors.text.disabled}
            />
        </View>
    );
}

interface SessionFormProps {
    waterColor: string | null;
    setWaterColor: (value: string | null) => void;
    waterCurrent: string | null;
    setWaterCurrent: (value: string | null) => void;
    waterLevel: WaterLevel | null;
    setWaterLevel: (value: WaterLevel | null) => void;
    locationVisibility: LocationVisibility;
    setLocationVisibility: (value: LocationVisibility) => void;
}

export const SessionForm: React.FC<SessionFormProps> = ({
    waterColor,
    setWaterColor,
    waterCurrent,
    setWaterCurrent,
    waterLevel,
    setWaterLevel,
    locationVisibility,
    setLocationVisibility,
}) => {
    return (
        <>
            <FreeTextInput
                label="Couleur de l'eau"
                value={waterColor}
                onChange={setWaterColor}
                placeholder="Ex: Claire, boueuse, etc."
            />
            <FreeTextInput
                label="Courant"
                value={waterCurrent}
                onChange={setWaterCurrent}
                placeholder="Ex: Nul, léger, fort, etc."
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
    formGroup: { width: '100%', marginBottom: theme.spacing[4] },
    labelContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing[2] },
    label: {
        fontFamily: theme.typography.fontFamily.medium,
        fontSize: theme.typography.fontSize.base,
        color: theme.colors.text.secondary,
        marginBottom: theme.spacing[2],
    },
    input: {
        backgroundColor: theme.colors.background.paper,
        color: theme.colors.text.primary,
        height: 50, // INPUT_HEIGHT from AddCatchScreen
        borderWidth: 1,
        borderColor: theme.colors.border.main,
        borderRadius: theme.borderRadius.base,
        paddingHorizontal: theme.spacing[4],
        fontSize: theme.typography.fontSize.base,
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
