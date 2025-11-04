import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '../../theme';

interface CardProps {
    children: React.ReactNode;
    variant?: 'elevated' | 'outlined' | 'filled';
    padding?: keyof typeof theme.spacing;
    style?: ViewStyle;
}

export const Card: React.FC<CardProps> = ({
                                              children,
                                              variant = 'elevated',
                                              padding = 4,
                                              style,
                                          }) => {
    return (
        <View
            style={[
                styles.card,
                styles[`card_${variant}`],
                { padding: theme.spacing[padding] },
                style,
            ]}
        >
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: theme.borderRadius.lg,
        backgroundColor: theme.colors.white,
    },
    card_elevated: {
        ...theme.shadows.base,
    },
    card_outlined: {
        borderWidth: 1,
        borderColor: theme.colors.border.light,
    },
    card_filled: {
        backgroundColor: theme.colors.background.paper,
    },
});