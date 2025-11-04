import React, { useState } from 'react';
import {
    View,
    TextInput,
    Text,
    StyleSheet,
    TextInputProps,
    ViewStyle,
} from 'react-native';
import { theme } from '../../theme';

interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
    helperText?: string;
    containerStyle?: ViewStyle;
}

export const Input: React.FC<InputProps> = ({
                                                label,
                                                error,
                                                helperText,
                                                containerStyle,
                                                style,
                                                ...textInputProps
                                            }) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <View style={[styles.container, containerStyle]}>
            {label && <Text style={styles.label}>{label}</Text>}

            <TextInput
                style={[
                    styles.input,
                    isFocused && styles.input_focused,
                    error && styles.input_error,
                    style,
                ]}
                placeholderTextColor={theme.colors.text.disabled}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                {...textInputProps}
            />

            {error && <Text style={styles.errorText}>{error}</Text>}
            {helperText && !error && <Text style={styles.helperText}>{helperText}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: theme.spacing[4],
    },
    label: {
        fontSize: theme.typography.fontSize.sm,
        fontWeight: theme.typography.fontWeight.medium,
        color: theme.colors.text.primary,
        marginBottom: theme.spacing[1],
    },
    input: {
        borderWidth: 1,
        borderColor: theme.colors.border.main,
        borderRadius: theme.borderRadius.base,
        paddingVertical: theme.spacing[3],
        paddingHorizontal: theme.spacing[4],
        fontSize: theme.typography.fontSize.base,
        color: theme.colors.text.primary,
        backgroundColor: theme.colors.white,
        minHeight: 48,
    },
    input_focused: {
        borderColor: theme.colors.primary[500],
        borderWidth: 2,
    },
    input_error: {
        borderColor: theme.colors.error.main,
    },
    errorText: {
        fontSize: theme.typography.fontSize.xs,
        color: theme.colors.error.main,
        marginTop: theme.spacing[1],
    },
    helperText: {
        fontSize: theme.typography.fontSize.xs,
        color: theme.colors.text.secondary,
        marginTop: theme.spacing[1],
    },
});