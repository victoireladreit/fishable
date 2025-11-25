import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { theme } from '../../theme';
import { Card } from '../common';

interface SessionNotesProps {
    isEditing: boolean;
    caption: string | null;
    onCaptionChange: (text: string) => void;
}

export const SessionNotes: React.FC<SessionNotesProps> = ({
    isEditing,
    caption,
    onCaptionChange,
}) => {
    if (isEditing) {
        return (
            <View style={styles.formGroup}>
                <Text style={styles.label}>Notes de session</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    value={caption ?? ''}
                    onChangeText={onCaptionChange}
                    multiline
                    placeholder="Ajoutez une description..."
                    placeholderTextColor={theme.colors.text.disabled}
                />
            </View>
        );
    }

    return (
        <Card style={styles.notesCard}>
            <Text style={[styles.infoLabel, styles.notesCardLabel]}>Notes de session</Text>
            {caption ? (
                <Text style={styles.captionText}>{caption}</Text>
            ) : (
                <Text style={styles.noCaptionText}>Pas de notes pour cette session.</Text>
            )}
        </Card>
    );
};

const styles = StyleSheet.create({
    formGroup: {
        width: '100%',
        marginBottom: theme.spacing[5],
    },
    label: {
        fontFamily: theme.typography.fontFamily.medium,
        fontSize: theme.typography.fontSize.base,
        color: theme.colors.text.secondary,
        marginBottom: theme.spacing[3],
    },
    input: {
        backgroundColor: theme.colors.background.paper,
        color: theme.colors.text.primary,
        height: 120,
        borderWidth: 1,
        borderColor: theme.colors.border.main,
        borderRadius: theme.borderRadius.base,
        paddingHorizontal: theme.spacing[4],
        fontSize: theme.typography.fontSize.base,
    },
    textArea: {
        height: 120,
        textAlignVertical: 'top',
        paddingTop: theme.spacing[3],
    },
    notesCard: {
        width: '100%',
        marginTop: theme.spacing[4],
        marginBottom: theme.spacing[4],
        paddingBottom: theme.spacing[2],
    },
    notesCardLabel: {
        marginBottom: theme.spacing[2],
    },
    infoLabel: {
        fontFamily: theme.typography.fontFamily.medium,
        fontSize: theme.typography.fontSize.base,
        color: theme.colors.text.secondary,
    },
    captionText: {
        fontFamily: theme.typography.fontFamily.regular,
        fontSize: theme.typography.fontSize.base,
        color: theme.colors.text.primary,
        fontStyle: 'italic',
    },
    noCaptionText: {
        fontFamily: theme.typography.fontFamily.regular,
        fontSize: theme.typography.fontSize.base,
        color: theme.colors.text.primary,
        fontStyle: 'italic',
    },
});
