import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { theme } from '../../theme';

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
        <View style={styles.headerContainer}>
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
        </View>
    );
};

const styles = StyleSheet.create({
    headerContainer: {
        width: '100%',
        padding: theme.spacing[4],
        backgroundColor: theme.colors.background.paper,
        borderRadius: theme.borderRadius.lg,
        marginBottom: theme.spacing[6],
        ...theme.shadows.sm,
        borderWidth: 1,
        borderColor: theme.colors.border.light,
    },
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
