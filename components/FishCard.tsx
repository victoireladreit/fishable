import React from 'react';
import { Text, Image, StyleSheet, TouchableOpacity, Dimensions, View } from 'react-native';
import { Database } from '../lib/types';
import { theme } from '../theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type Species = Database['public']['Tables']['species_registry']['Row'];

export interface CatchInfo {
    photoUrl: string | null;
    totalCaught: number;
    biggestSizeCm: number | null; // From user_pokedex
    biggestWeightKg: number | null; // From user_pokedex
}

interface FishCardProps {
    species: Species;
    isCaught: boolean;
    onPress?: () => void;
    catchInfo?: CatchInfo;
}

const { width } = Dimensions.get('window');
const numColumns = 3;
const cardMargin = theme.spacing[1];
const cardWidth = (width - (cardMargin * 2 * numColumns) - theme.spacing[4]) / numColumns;

export const FishCard: React.FC<FishCardProps> = ({ species, isCaught, onPress, catchInfo }) => {
    const borderColor = theme.colors.border.main; // Always gray

    return (
        <TouchableOpacity
            style={[styles.container, { width: cardWidth, borderColor }]}
            onPress={onPress}
            disabled={!onPress}
        >
            {isCaught && catchInfo?.photoUrl ? (
                <Image
                    source={{ uri: catchInfo.photoUrl }}
                    style={styles.image}
                />
            ) : (
                <View style={[styles.image, styles.iconPlaceholder]}>
                    <MaterialCommunityIcons name="fish" size={50} color={theme.colors.text.disabled} />
                </View>
            )}
            
            <Text style={styles.name} numberOfLines={2}>
                {species.name}
            </Text>

            {isCaught && catchInfo && catchInfo.totalCaught > 0 && (
                <View>
                    <Text style={styles.catchInfoText}>
                        Captures : {catchInfo.totalCaught}
                    </Text>
                    {(catchInfo.biggestSizeCm || catchInfo.biggestWeightKg) && (
                        <View style={styles.prContainer}>
                            <MaterialCommunityIcons name="medal" size={16} color={theme.colors.text.secondary} />
                            <Text style={styles.prText}>
                                {catchInfo.biggestSizeCm ? ` ${catchInfo.biggestSizeCm} cm` : ''}
                                {catchInfo.biggestSizeCm && catchInfo.biggestWeightKg ? ' / ' : ''}
                                {catchInfo.biggestWeightKg ? `${catchInfo.biggestWeightKg} kg` : ''}
                            </Text>
                        </View>
                    )}
                </View>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        margin: cardMargin,
        padding: theme.spacing[2], // Increased padding
        borderRadius: theme.borderRadius.md,
        backgroundColor: theme.colors.background.paper,
        ...theme.shadows.sm,
        borderWidth: 1,
    },
    image: {
        width: '100%', // Take full width of padding box
        aspectRatio: 1, // Make it a square
        borderRadius: theme.borderRadius.md,
        marginBottom: theme.spacing[2], // Increased margin
    },
    iconPlaceholder: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.gray[200],
    },
    name: {
        fontFamily: theme.typography.fontFamily.bold,
        fontWeight: theme.typography.fontWeight.bold,
        fontSize: theme.typography.fontSize.sm,
        textAlign: 'center',
        color: theme.colors.text.primary,
    },
    notCaughtText: {
        color: theme.colors.text.disabled,
        fontFamily: theme.typography.fontFamily.medium,
        fontWeight: theme.typography.fontWeight.medium,
    },
    catchInfoText: {
        marginTop: theme.spacing[1],
        fontFamily: theme.typography.fontFamily.regular,
        fontSize: theme.typography.fontSize.xs,
        color: theme.colors.text.secondary,
        textAlign: 'center',
    },
    prContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: theme.spacing[1],
    },
    prText: {
        fontFamily: theme.typography.fontFamily.regular,
        fontSize: theme.typography.fontSize.xs,
        color: theme.colors.text.secondary,
    },
});
