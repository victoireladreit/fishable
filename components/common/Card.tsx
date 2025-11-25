import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '../../theme';

interface CardProps {
    children: React.ReactNode;
    style?: ViewStyle;
}

export const Card: React.FC<CardProps> = ({ children, style }) => {
    return <View style={[styles.card, style]}>{children}</View>;
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: theme.colors.background.paper,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing[4],
        ...theme.shadows.sm,
        borderWidth: 1,
        borderColor: theme.colors.border.light,
    },
});
