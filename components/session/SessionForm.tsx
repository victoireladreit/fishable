import React from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';
import { theme } from '../../theme';
import { Selector } from '../common';

type WaterLevel = 'normal' | 'high' | 'flood';
type LocationVisibility = 'public' | 'region' | 'private';

const waterLevelOptions: { key: WaterLevel; label: string }[] = [
    { key: 'normal', label: 'Normal' },
    { key: 'high', label: 'Haut' },
    { key: 'flood', label: 'Crue' },
];

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
        </>
    );
};

const styles = StyleSheet.create({
    formGroup: { width: '100%', marginBottom: theme.spacing[4] },
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
});
