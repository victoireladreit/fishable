
import React from 'react';
import { Text as RNText, StyleSheet, TextProps as RNTextProps } from 'react-native';
import { theme } from '../../theme';

interface TextProps extends RNTextProps {
    variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'bodySmall' | 'caption';
    color?: 'primary' | 'secondary' | 'disabled' | 'inverse' | 'error' | 'success';
    weight?: 'regular' | 'medium' | 'semibold' | 'bold';
    align?: 'left' | 'center' | 'right';
}

export const Text: React.FC<TextProps> = ({
                                              variant = 'body',
                                              color = 'primary',
                                              weight = 'regular',
                                              align = 'left',
                                              style,
                                              children,
                                              ...props
                                          }) => {
    return (
        <RNText
            style={[
                styles.text,
                styles[`variant_${variant}`],
                styles[`color_${color}`],
                styles[`weight_${weight}`],
                { textAlign: align },
                style,
            ]}
            {...props}
        >
            {children}
        </RNText>
    );
};

const styles = StyleSheet.create({
    text: {
        fontFamily: theme.typography.fontFamily.regular,
    },

    // Variants
    variant_h1: {
        fontSize: theme.typography.fontSize['4xl'],
        lineHeight: theme.typography.fontSize['4xl'] * theme.typography.lineHeight.tight,
        fontWeight: theme.typography.fontWeight.bold,
    },
    variant_h2: {
        fontSize: theme.typography.fontSize['3xl'],
        lineHeight: theme.typography.fontSize['3xl'] * theme.typography.lineHeight.tight,
        fontWeight: theme.typography.fontWeight.bold,
    },
    variant_h3: {
        fontSize: theme.typography.fontSize['2xl'],
        lineHeight: theme.typography.fontSize['2xl'] * theme.typography.lineHeight.tight,
        fontWeight: theme.typography.fontWeight.semibold,
    },
    variant_h4: {
        fontSize: theme.typography.fontSize.xl,
        lineHeight: theme.typography.fontSize.xl * theme.typography.lineHeight.normal,
        fontWeight: theme.typography.fontWeight.semibold,
    },
    variant_body: {
        fontSize: theme.typography.fontSize.base,
        lineHeight: theme.typography.fontSize.base * theme.typography.lineHeight.normal,
    },
    variant_bodySmall: {
        fontSize: theme.typography.fontSize.sm,
        lineHeight: theme.typography.fontSize.sm * theme.typography.lineHeight.normal,
    },
    variant_caption: {
        fontSize: theme.typography.fontSize.xs,
        lineHeight: theme.typography.fontSize.xs * theme.typography.lineHeight.normal,
    },

    // Colors
    color_primary: {
        color: theme.colors.text.primary,
    },
    color_secondary: {
        color: theme.colors.text.secondary,
    },
    color_disabled: {
        color: theme.colors.text.disabled,
    },
    color_inverse: {
        color: theme.colors.text.inverse,
    },
    color_error: {
        color: theme.colors.error.main,
    },
    color_success: {
        color: theme.colors.success.main,
    },

    // Weights
    weight_regular: {
        fontWeight: theme.typography.fontWeight.regular,
    },
    weight_medium: {
        fontWeight: theme.typography.fontWeight.medium,
    },
    weight_semibold: {
        fontWeight: theme.typography.fontWeight.semibold,
    },
    weight_bold: {
        fontWeight: theme.typography.fontWeight.bold,
    },
});