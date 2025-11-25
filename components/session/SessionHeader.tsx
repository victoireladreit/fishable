import React from 'react';
import { Text, TextInput, StyleSheet } from 'react-native';
import { theme } from '../../theme';
import { Card } from '../common';

interface SessionHeaderProps {
    isEditing: boolean;
    locationName: string | null;
    onLocationNameChange: (text: string) => void;
    region: string | null | undefined;
}

export const SessionHeader: React.FC<SessionHeaderProps> = ({
    isEditing,
    locationName,
    onLocationNameChange,
    region,
}) => {
    return (
        <Card style={{ width: "100%", marginBottom: theme.spacing[6] }}>
            {isEditing ? (
                <TextInput
                    style={styles.titleInput}
                    value={locationName ?? ''}
                    onChangeText={onLocationNameChange}
                    placeholder="Nom du spot"
                    placeholderTextColor={theme.colors.text.disabled}
                />
            ) : (
                <Text style={styles.infoTitle}>{locationName || 'Session sans nom'}</Text>
            )}
            {region ? <Text style={styles.regionText}>{region}</Text> : null}
        </Card>
    );
};

const styles = StyleSheet.create({
    titleInput: {
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: theme.typography.fontSize['2xl'],
        color: theme.colors.text.primary,
        paddingBottom: theme.spacing[1],
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border.main,
    },
    infoTitle: {
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: theme.typography.fontSize['2xl'],
        color: theme.colors.text.primary,
        marginBottom: theme.spacing[1],
    },
    regionText: {
        fontFamily: theme.typography.fontFamily.regular,
        fontSize: theme.typography.fontSize.lg,
        color: theme.colors.text.secondary,
        marginTop: theme.spacing[2],
    },
});
