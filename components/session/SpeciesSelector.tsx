import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { theme } from '../../theme';

interface SpeciesSelectorProps {
    allSpecies: { id: string; name: string }[];
    selectedSpecies: string[];
    onSelectSpecies: (species: { id: string; name: string }) => void;
    onRemoveSpecies: (speciesName: string) => void;
    label?: string;
}

export const SpeciesSelector: React.FC<SpeciesSelectorProps> = ({
    allSpecies,
    selectedSpecies,
    onSelectSpecies,
    onRemoveSpecies,
    label = "Espèces ciblées",
}) => {
    const [speciesInput, setSpeciesInput] = useState('');
    const [filteredSpecies, setFilteredSpecies] = useState<{ id: string; name: string }[]>([]);

    const handleSpeciesSearch = (text: string) => {
        setSpeciesInput(text);
        if (text) {
            const filtered = allSpecies.filter(species =>
                species.name.toLowerCase().includes(text.toLowerCase()) &&
                !selectedSpecies.includes(species.name)
            );
            setFilteredSpecies(filtered);
        } else {
            setFilteredSpecies([]);
        }
    };

    const handleSelect = (species: { id: string; name: string }) => {
        onSelectSpecies(species);
        setSpeciesInput('');
        setFilteredSpecies([]);
    };

    return (
        <View style={styles.formGroup}>
            <Text style={styles.label}>{label}</Text>
            <View style={styles.speciesInputContainer}>
                <TextInput
                    style={[styles.input, styles.speciesTextInput]}
                    placeholder="Rechercher et ajouter une espèce"
                    value={speciesInput}
                    onChangeText={handleSpeciesSearch}
                    placeholderTextColor={theme.colors.text.disabled}
                />
            </View>
            {filteredSpecies.length > 0 && (
                <View style={styles.suggestionsList}>
                    <ScrollView keyboardShouldPersistTaps="handled">
                        {filteredSpecies.map(item => (
                            <TouchableOpacity key={item.id} onPress={() => handleSelect(item)} style={styles.suggestionItem}>
                                <Text style={styles.suggestionItemText}>{item.name}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            )}
            <View style={styles.selectedSpeciesContainer}>
                {selectedSpecies.map((species, index) => (
                    <View key={index} style={styles.speciesTag}>
                        <Text style={styles.speciesTagText}>{species}</Text>
                        <TouchableOpacity onPress={() => onRemoveSpecies(species)} style={styles.removeSpeciesButton}>
                            <Text style={styles.removeSpeciesButtonText}>x</Text>
                        </TouchableOpacity>
                    </View>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    formGroup: { marginBottom: theme.spacing[5] },
    label: { fontFamily: theme.typography.fontFamily.medium, fontSize: theme.typography.fontSize.base, color: theme.colors.text.secondary, marginBottom: theme.spacing[3] },
    input: { backgroundColor: theme.colors.background.paper, color: theme.colors.text.primary, height: 50, borderWidth: 1, borderColor: theme.colors.border.main, borderRadius: theme.borderRadius.base, paddingHorizontal: theme.spacing[4], fontSize: theme.typography.fontSize.base },
    speciesInputContainer: { flexDirection: 'row', alignItems: 'center' },
    speciesTextInput: { flex: 1, marginBottom: 0 },
    suggestionsList: {
        maxHeight: 150,
        borderColor: theme.colors.border.main,
        borderWidth: 1,
        borderRadius: theme.borderRadius.base,
        backgroundColor: theme.colors.background.paper,
        marginTop: theme.spacing[2],
        marginBottom: theme.spacing[2],
    },
    suggestionItem: {
        padding: theme.spacing[3],
        borderBottomColor: theme.colors.border.light,
        borderBottomWidth: 1,
    },
    suggestionItemText: {
        fontFamily: theme.typography.fontFamily.regular,
        fontSize: theme.typography.fontSize.base,
        color: theme.colors.text.primary,
    },
    selectedSpeciesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: theme.spacing[2],
    },
    speciesTag: {
        backgroundColor: theme.colors.primary[100],
        borderRadius: theme.borderRadius.full,
        paddingVertical: theme.spacing[2],
        paddingHorizontal: theme.spacing[3],
        marginRight: theme.spacing[2],
        marginBottom: theme.spacing[2],
        flexDirection: 'row',
        alignItems: 'center',
    },
    speciesTagText: { color: theme.colors.primary[700], fontSize: theme.typography.fontSize.sm, fontFamily: theme.typography.fontFamily.medium },
    removeSpeciesButton: { marginLeft: theme.spacing[2], paddingHorizontal: theme.spacing[1] },
    removeSpeciesButtonText: { color: theme.colors.primary[700], fontSize: theme.typography.fontSize.sm, fontWeight: theme.typography.fontWeight.bold },
});