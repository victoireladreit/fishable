import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Animated } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';
import { Database } from '../lib/types';

type Catch = Database['public']['Tables']['catches']['Row'];

type CatchListItemProps = {
    item: Catch;
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
    onPressImage: (url: string) => void;
};

const renderRightActions = (progress: Animated.AnimatedInterpolation<number>, dragX: Animated.AnimatedInterpolation<number>, onPress: () => void) => {
    const trans = dragX.interpolate({
        inputRange: [-80, 0],
        outputRange: [0, 80],
        extrapolate: 'clamp',
    });
    return (
        <TouchableOpacity onPress={onPress} style={styles.deleteButtonContainer}>
            <Animated.View style={[styles.deleteButton, { transform: [{ translateX: trans }] }]}>
                <Ionicons name="trash-outline" size={theme.iconSizes.lg} color={theme.colors.error.main} />
            </Animated.View>
        </TouchableOpacity>
    );
};

export const CatchListItem: React.FC<CatchListItemProps> = ({ item, onEdit, onDelete, onPressImage }) => {
    return (
        <View style={styles.catchItemWrapper}>
            <Swipeable renderRightActions={(progress, dragX) => renderRightActions(progress, dragX, () => onDelete(item.id))}>
                <TouchableOpacity onPress={() => onEdit(item.id)}>
                    <View style={styles.catchItem}>
                        {item.photo_url && (
                            <TouchableOpacity onPress={() => onPressImage(item.photo_url!)}>
                                <Image source={{ uri: item.photo_url }} style={styles.catchImage} />
                            </TouchableOpacity>
                        )}
                        <View style={styles.catchInfo}>
                            <Text style={styles.catchSpecies}>{item.species_name}</Text>
                            <View style={styles.catchDetails}>
                                {item.size_cm && <Text style={styles.catchDetailText}>{item.size_cm} cm</Text>}
                                {item.weight_kg && <Text style={styles.catchDetailText}>{item.weight_kg.toFixed(1)} kg</Text>}
                            </View>
                        </View>
                    </View>
                </TouchableOpacity>
            </Swipeable>
        </View>
    );
};

const styles = StyleSheet.create({
    catchItemWrapper: {
        marginBottom: theme.spacing[3],
    },
    catchItem: {
        backgroundColor: theme.colors.background.paper,
        padding: theme.spacing[2],
        borderRadius: theme.borderRadius.md,
        flexDirection: 'row',
        alignItems: 'center',
    },
    catchImage: {
        width: 60,
        height: 60,
        borderRadius: theme.borderRadius.sm,
        marginRight: theme.spacing[4],
    },
    catchInfo: {
        flex: 1,
    },
    catchSpecies: {
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: theme.typography.fontSize.base,
        color: theme.colors.text.primary,
    },
    catchDetails: {
        flexDirection: 'row',
        marginTop: theme.spacing[1],
    },
    catchDetailText: {
        marginRight: theme.spacing[4],
        fontFamily: theme.typography.fontFamily.regular,
        fontSize: theme.typography.fontSize.sm,
        color: theme.colors.text.secondary,
    },
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
