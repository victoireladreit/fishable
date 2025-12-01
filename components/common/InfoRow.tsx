import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';

interface InfoRowProps {
    iconName: keyof typeof Ionicons.glyphMap;
    label: string;
    value: string | number | null | undefined;
    unit?: string;
    defaultValue?: string;
    onPress?: () => void;
    iconColor?: string; // Nouvelle prop pour la couleur de l'icône
}

export const InfoRow: React.FC<InfoRowProps> = ({ iconName, label, value, unit, defaultValue = '-', onPress, iconColor }) => {
    const displayValue = value !== null && value !== undefined && value !== '' ? `${value}${unit || ''}` : defaultValue;

    const content = (
        <View style={styles.infoRow}>
            <Ionicons name={iconName} size={theme.iconSizes.sm} color={iconColor || theme.colors.primary[500]} style={styles.icon} />
            <View style={styles.textContainer}>
                <Text style={styles.label}>{label}</Text>
                <Text style={styles.value} numberOfLines={1}>{displayValue}</Text>
            </View>
            {onPress && <Ionicons name="chevron-forward-outline" size={theme.iconSizes.sm} color={theme.colors.text.secondary} />}
        </View>
    );

    if (onPress) {
        return (
            <TouchableOpacity onPress={onPress}>
                {content}
            </TouchableOpacity>
        );
    }

    return content;
};

const styles = StyleSheet.create({
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: theme.spacing[3],
    },
    icon: {
        marginRight: theme.spacing[3],
    },
    textContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    label: {
        fontFamily: theme.typography.fontFamily.medium,
        fontSize: theme.typography.fontSize.base,
        color: theme.colors.text.secondary,
    },
    value: {
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: theme.typography.fontSize.base,
        color: theme.colors.text.primary,
        flexShrink: 1,
        marginRight: theme.spacing[2],
    },
});
