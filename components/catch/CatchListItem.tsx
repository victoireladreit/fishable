import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { theme } from '../../theme';
import { Database } from '../../lib/types';
import { renderDeleteAction } from '../common/SwipeableActions'; // Import the common function

type Catch = Database['public']['Tables']['catches']['Row'];

type CatchListItemProps = {
    item: Catch;
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
    onPressImage: (url: string) => void;
};

export const CatchListItem: React.FC<CatchListItemProps> = ({ item, onEdit, onDelete, onPressImage }) => {
    return (
        <View style={styles.catchItemWrapper}>
            <Swipeable renderRightActions={(progress, dragX) => renderDeleteAction(progress, dragX, () => onDelete(item.id))}>
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
});
