import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';

interface InfoRowProps {
    iconName: keyof typeof Ionicons.glyphMap;
    label: string;
    value: string | number | null | undefined;
    unit?: string;
    defaultValue?: string;
}

export const InfoRow: React.FC<InfoRowProps> = ({ iconName, label, value, unit, defaultValue = '-' }) => {
    const displayValue = value !== null && value !== undefined && value !== '' ? `${value}${unit || ''}` : defaultValue;

    return (
        <View style={styles.infoRow}>
            <Ionicons name={iconName} size={theme.iconSizes.sm} color={theme.colors.primary[500]} style={styles.icon} />
            <View style={styles.textContainer}>
                <Text style={styles.label}>{label}</Text>
                <Text style={styles.value} numberOfLines={1}>{displayValue}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: theme.spacing[2],
        borderBottomColor: theme.colors.border.light,
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
    },
});
