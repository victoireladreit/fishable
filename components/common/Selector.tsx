import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';

interface SelectorProps<T> {
    label: string;
    options: { key: T; label: string }[];
    selectedValue: T | null;
    onSelect: (value: T) => void; // Changed to T, as null is no longer allowed for deselection
    info?: string;
}

export const Selector = <T extends string>({ label, options, selectedValue, onSelect, info }: SelectorProps<T>) => {
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
                        onPress={() => onSelect(opt.key)} // Always select the key, no deselection
                    >
                        <Text style={[styles.selectorText, selectedValue === opt.key && styles.selectorTextSelected]}>{opt.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
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
