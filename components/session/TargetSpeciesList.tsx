import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../../theme';

interface TargetSpeciesListProps {
    species: string[];
}

export const TargetSpeciesList: React.FC<TargetSpeciesListProps> = ({ species }) => {
    if (species.length === 0) {
        return null;
    }

    return (
        <View style={styles.targetSpeciesContainer}>
            <Text style={styles.targetSpeciesLabel}>Espèces ciblées :</Text>
            <View style={styles.targetSpeciesList}>
                {species.map((s, index) => (
                    <View key={index} style={styles.speciesTag}>
                        <Text style={styles.speciesTagText}>{s}</Text>
                    </View>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    targetSpeciesContainer: {
        width: '100%',
        backgroundColor: theme.colors.background.paper,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing[4],
        marginBottom: theme.spacing[6],
        borderWidth: 1,
        borderColor: theme.colors.border.light,
        ...theme.shadows.sm,
    },
    targetSpeciesLabel: {
        fontFamily: theme.typography.fontFamily.medium,
        fontSize: theme.typography.fontSize.base,
        color: theme.colors.text.secondary,
        marginBottom: theme.spacing[2],
    },
    targetSpeciesList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    speciesTag: {
        backgroundColor: theme.colors.primary[100],
        borderRadius: theme.borderRadius.full,
        paddingVertical: theme.spacing[2],
        paddingHorizontal: theme.spacing[3],
        marginRight: theme.spacing[2],
        marginBottom: theme.spacing[2],
    },
    speciesTagText: {
        color: theme.colors.primary[700],
        fontSize: theme.typography.fontSize.sm,
        fontFamily: theme.typography.fontFamily.medium,
    },
});
