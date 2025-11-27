import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { Database } from '../../lib/types';
import { renderDeleteAction } from '../common/SwipeableActions';

type Catch = Database['public']['Tables']['catches']['Row'];

type CatchListItemProps = {
    item: Catch;
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
    onPressImage: (url: string) => void;
};

export const CatchListItem: React.FC<CatchListItemProps> = ({ item, onEdit, onDelete, onPressImage }) => {
    const formattedDate = item.caught_at ? new Date(item.caught_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '';

    return (
        <View style={styles.cardWrapper}>
            <Swipeable renderRightActions={(progress, dragX) => renderDeleteAction(progress, dragX, () => onDelete(item.id))}>
                <TouchableOpacity onPress={() => onEdit(item.id)}>
                    <View style={styles.card}>
                        {item.photo_url ? (
                            <TouchableOpacity onPress={() => onPressImage(item.photo_url!)} style={styles.imagePreviewContainer}>
                                <Image source={{ uri: item.photo_url }} style={styles.imagePreview} />
                            </TouchableOpacity>
                        ) : (
                            <View style={[styles.imagePreviewContainer, styles.noImageContainer]}>
                                <Ionicons name="camera-outline" size={20} color={theme.colors.text.secondary} />
                                <Text style={styles.noImageText}>Aucune photo</Text>
                            </View>
                        )}
                        <View style={styles.cardContent}>
                            <Text style={styles.cardTitle}>{item.species_name}</Text>
                            <View style={styles.cardInfoContainer}>
                                <Text style={styles.cardInfoText}>{formattedDate}</Text>
                                <View style={styles.measurementsContainer}>
                                    {item.size_cm && <Text style={styles.cardInfoText}>{item.size_cm} cm</Text>}
                                    {item.weight_kg && <Text style={styles.cardInfoText}>{item.weight_kg.toFixed(1)} kg</Text>}
                                </View>
                            </View>
                        </View>
                    </View>
                </TouchableOpacity>
            </Swipeable>
        </View>
    );
};

const styles = StyleSheet.create({
    cardWrapper: {
        marginBottom: theme.spacing[4],
    },
    card: {
        backgroundColor: theme.colors.background.paper,
        borderRadius: theme.borderRadius.md,
        ...theme.shadows.sm,
        borderWidth: 1,
        borderColor: theme.colors.border.light,
        overflow: 'hidden',
        flexDirection: 'row',
        alignItems: 'center',
        padding: theme.spacing[3],
    },
    imagePreviewContainer: {
        height: 80,
        width: 80,
        borderRadius: theme.borderRadius.md,
        overflow: 'hidden',
        marginRight: theme.spacing[3],
        borderWidth: 1,
        borderColor: theme.colors.border.light,
        justifyContent: 'center',
        alignItems: 'center',
    },
    imagePreview: {
        height: '100%',
        width: '100%',
    },
    noImageContainer: {
        backgroundColor: theme.colors.background.default,
        opacity: 0.7,
    },
    noImageText: {
        fontFamily: theme.typography.fontFamily.regular,
        fontSize: 8,
        color: theme.colors.text.secondary,
        textAlign: 'center',
        marginTop: 2,
    },
    cardContent: {
        flex: 1,
    },
    cardTitle: {
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: theme.typography.fontSize.lg,
        color: theme.colors.text.primary,
        marginBottom: theme.spacing[1],
    },
    cardInfoContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: theme.spacing[1],
    },
    measurementsContainer: {
        flexDirection: 'row',
        gap: theme.spacing[3],
    },
    cardInfoText: {
        fontFamily: theme.typography.fontFamily.regular,
        fontSize: theme.typography.fontSize.sm,
        color: theme.colors.text.secondary,
    },
});
