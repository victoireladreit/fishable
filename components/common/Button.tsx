import React from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    ActivityIndicator,
    ViewStyle,
    TextStyle,
} from 'react-native';
import { theme } from '../../theme';

interface ButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    loading?: boolean;
    fullWidth?: boolean;
    style?: ViewStyle;
    textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
                                                  title,
                                                  onPress,
                                                  variant = 'primary',
                                                  size = 'md',
                                                  disabled = false,
                                                  loading = false,
                                                  fullWidth = false,
                                                  style,
                                                  textStyle,
                                              }) => {
    const buttonStyles = [
        styles.button,
        styles[`button_${variant}`],
        styles[`button_${size}`],
        disabled && styles.button_disabled,
        fullWidth && styles.button_fullWidth,
        style,
    ];

    const textStyles = [
        styles.text,
        styles[`text_${variant}`],
        styles[`text_${size}`],
        disabled && styles.text_disabled,
        textStyle,
    ];

    return (
        <TouchableOpacity
            style={buttonStyles}
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.7}
        >
            {loading ? (
                <ActivityIndicator
                    color={variant === 'outline' ? theme.colors.primary[500] : theme.colors.white}
                />
            ) : (
                <Text style={textStyles}>{title}</Text>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        borderRadius: theme.borderRadius.base,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },

    // Variants
    button_primary: {
        backgroundColor: theme.colors.primary[500],
        ...theme.shadows.sm,
    },
    button_secondary: {
        backgroundColor: theme.colors.secondary[500],
        ...theme.shadows.sm,
    },
    button_outline: {
        backgroundColor: theme.colors.transparent,
        borderWidth: 1.5,
        borderColor: theme.colors.primary[500],
    },
    button_ghost: {
        backgroundColor: theme.colors.transparent,
    },
    button_danger: {
        backgroundColor: theme.colors.error.main,
        ...theme.shadows.sm,
    },

    // Sizes
    button_sm: {
        paddingVertical: theme.spacing[2],
        paddingHorizontal: theme.spacing[3],
        minHeight: 36,
    },
    button_md: {
        paddingVertical: theme.spacing[3],
        paddingHorizontal: theme.spacing[4],
        minHeight: 44,
    },
    button_lg: {
        paddingVertical: theme.spacing[4],
        paddingHorizontal: theme.spacing[6],
        minHeight: 52,
    },

    // States
    button_disabled: {
        backgroundColor: theme.colors.gray[300],
        opacity: 0.6,
    },
    button_fullWidth: {
        width: '100%',
    },

    // Text
    text: {
        fontWeight: theme.typography.fontWeight.semibold,
    },
    text_primary: {
        color: theme.colors.white,
    },
    text_secondary: {
        color: theme.colors.white,
    },
    text_outline: {
        color: theme.colors.primary[500],
    },
    text_ghost: {
        color: theme.colors.primary[500],
    },
    text_danger: {
        color: theme.colors.white,
    },
    text_sm: {
        fontSize: theme.typography.fontSize.sm,
    },
    text_md: {
        fontSize: theme.typography.fontSize.base,
    },
    text_lg: {
        fontSize: theme.typography.fontSize.lg,
    },
    text_disabled: {
        color: theme.colors.text.disabled,
    },
});