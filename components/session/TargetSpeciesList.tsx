import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../../theme';
import { Card } from '../common';

interface TargetSpeciesListProps {
    species: string[];
}

export const TargetSpeciesList: React.FC<TargetSpeciesListProps> = ({ species }) => {
    if (species.length === 0) {
        return null;
    }

    return (
        <Card style={{ marginBottom: theme.spacing[6] }}>
            <Text style={styles.targetSpeciesLabel}>Espèces ciblées :</Text>
            <View style={styles.targetSpeciesList}>
                {species.map((s, index) => (
                    <View key={index} style={styles.speciesTag}>
                        <Text style={styles.speciesTagText}>{s}</Text>
                    </View>
                ))}
            </View>
        </Card>
    );
};

const styles = StyleSheet.create({
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
