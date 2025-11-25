import React from 'react';
import { Animated, TouchableOpacity, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';

export const renderDeleteAction = (progress: Animated.AnimatedInterpolation<number>, dragX: Animated.AnimatedInterpolation<number>, onPress: () => void) => {
    const trans = dragX.interpolate({
        inputRange: [-80, 0],
        outputRange: [0, 80],
        extrapolate: 'clamp',
    });
    return (
        <TouchableOpacity onPress={onPress} style={swipeableActionStyles.deleteButtonContainer}>
            <Animated.View style={[swipeableActionStyles.deleteButton, { transform: [{ translateX: trans }] }]}>
                <Ionicons name="trash-outline" size={theme.iconSizes.lg} color={theme.colors.error.main} />
            </Animated.View>
        </TouchableOpacity>
    );
};

export const swipeableActionStyles = StyleSheet.create({
    deleteButtonContainer: {
        width: 80,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: theme.spacing[2],
    },
    deleteButton: {
        justifyContent: 'center',
        alignItems: 'center',
        width: 80,
        height: '100%',
        borderRadius: theme.borderRadius.md,
        borderColor: theme.colors.error.main,
    },
});
