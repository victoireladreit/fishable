import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, Image, ScrollView, SafeAreaView, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { supabase } from '../../config/supabase';
import { Database } from '../../lib/types';
import { theme } from '../../theme';
import { FishLogStackParamList } from '../../navigation/types';
import { useAuth } from '../../contexts/AuthContext';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { CatchLeaderboardCard, TopCatch } from '../../components/CatchLeaderboardCard';

type Species = Database['public']['Tables']['species_registry']['Row'];
type UserPokedexEntry = Database['public']['Tables']['user_pokedex']['Row'];

type FishLogDetailScreenRouteProp = RouteProp<FishLogStackParamList, 'FishLogDetail'>;


const waterTypeTranslations: { [key: string]: string } = {
    'freshwater': 'Eau douce',
    'saltwater': 'Mer',
    'brackish': 'Saumâtre',
};

interface StatItemProps {
    iconName: keyof typeof Ionicons.glyphMap;
    label: string;
    value: string | number | null | undefined;
    unit?: string;
    defaultValue?: string;
}

const StatItem: React.FC<StatItemProps> = ({ iconName, label, value, unit, defaultValue = '-' }) => {
    const displayValue = value !== null && value !== undefined && value !== '' ? `${value}${unit || ''}` : defaultValue;

    return (
        <View style={styles.statItem}>
            <Ionicons name={iconName} size={theme.iconSizes.sm} color={theme.colors.primary[500]} style={styles.statIcon} />
            <View style={styles.statTextContainer}>
                <Text style={styles.statLabel}>{label}</Text>
                <Text style={styles.statValue} numberOfLines={1}>{displayValue}</Text>
            </View>
        </View>
    );
};


export const FishLogDetailScreen = () => {
    const route = useRoute<FishLogDetailScreenRouteProp>();
    const navigation = useNavigation();
    const { speciesId } = route.params;
    const { user } = useAuth();

    const [species, setSpecies] = useState<Species | null>(null);
    const [userPokedexEntry, setUserPokedexEntry] = useState<UserPokedexEntry | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [topCatches, setTopCatches] = useState<TopCatch[]>([]);

    const fetchSpeciesDetails = useCallback(async () => {
        if (!speciesId) {
            Alert.alert('Erreur', 'ID de l\'espèce manquant.');
            setLoading(false);
            return;
        }

        try {
            const [speciesData, pokedexEntry, topCatchesData] = await Promise.all([
                supabase.from('species_registry').select('*').eq('id', speciesId).single(),
                user ? supabase.from('user_pokedex').select('*').eq('user_id', user.id).eq('species_id', speciesId).single() : Promise.resolve({ data: null, error: null }),
                supabase.from('catches').select('*, fishing_sessions(started_at, location_name, profiles(username, avatar_url))').eq('species_id', speciesId).order('size_cm', { ascending: false, nullsFirst: false }).order('weight_kg', { ascending: false, nullsFirst: false }).limit(10)
            ]);

            if (speciesData.error) throw speciesData.error;
            setSpecies(speciesData.data);

            if (pokedexEntry.error && pokedexEntry.error.code !== 'PGRST116') throw pokedexEntry.error;
            if (pokedexEntry.data) {
                setUserPokedexEntry(pokedexEntry.data);
            }

            if (topCatchesData.error) throw topCatchesData.error;
            setTopCatches(topCatchesData.data as TopCatch[]);

        } catch (error: any) {
            Alert.alert('Erreur', 'Impossible de charger les détails de l\'espèce : ' + error.message);
        } finally {
            setLoading(false);
        }
    }, [speciesId, user]);

    useEffect(() => {
        fetchSpeciesDetails();
    }, [fetchSpeciesDetails]);

    const isCaught = !!userPokedexEntry;

    if (loading) {
        return <View style={styles.centered}><ActivityIndicator size="large" color={theme.colors.primary[500]} /></View>;
    }

    if (!species) {
        return <View style={styles.centered}><Text style={styles.errorText}>Détails de l'espèce introuvables.</Text></View>;
    }

    const topCatch = topCatches.length > 0 ? topCatches[0] : null;
    const leaderboardRest = topCatches.length > 1 ? topCatches.slice(1) : [];

    const getTranslatedWaterTypes = () => {
        let typesToProcess: string[] = [];
        if (species.water_types && species.water_types.length > 0) {
            typesToProcess = species.water_types;
        } else if (species.category) {
            typesToProcess = [species.category];
        }
        
        if (typesToProcess.length === 0) return null;

        return typesToProcess
            .map(type => waterTypeTranslations[type.toLowerCase()] || type)
            .join(', ');
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={theme.iconSizes.lg} color={theme.colors.primary[500]} />
                </TouchableOpacity>
                <Text style={styles.title} numberOfLines={1}>{species.name}</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContentContainer}>
                <View style={styles.mainInfoCard}>
                    {topCatch ? (
                        <CatchLeaderboardCard 
                            rank={1} 
                            catchData={topCatch} 
                            isFeatured={true} 
                        />
                    ) : (
                        <View style={[styles.speciesImage, styles.iconPlaceholder]}>
                            <MaterialCommunityIcons name="fish" size={100} color={theme.colors.text.disabled} />
                        </View>
                    )}
                </View>

                {leaderboardRest.length > 0 && (
                    <View style={styles.leaderboardContainer}>
                        <Text style={styles.leaderboardTitle}>Classement (10)</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.leaderboardScrollView}>
                            {leaderboardRest.map((item, index) => (
                                <CatchLeaderboardCard key={item.id} rank={index + 2} catchData={item} />
                            ))}
                        </ScrollView>
                    </View>
                )}

                <View style={styles.infoCard}>
                    <Text style={styles.cardTitle}>Informations Générales</Text>
                    <StatItem iconName="flask-outline" label="Nom scientifique" value={species.scientific_name} />
                    <StatItem iconName="pricetag-outline" label="Famille" value={species.family} />
                    <StatItem iconName="water-outline" label="Type d'eau" value={getTranslatedWaterTypes()} />
                    <StatItem iconName="star-outline" label="Rareté" value={species.rarity} />
                    <StatItem iconName="resize-outline" label="Taille max." value={species.max_size_cm} unit=" cm" />
                    <StatItem iconName="scale-outline" label="Poids max." value={species.max_weight_kg} unit=" kg" />
                </View>

                {isCaught && userPokedexEntry && (
                    <View style={styles.infoCard}>
                        <Text style={styles.cardTitle}>Mes Statistiques</Text>
                        <StatItem iconName="trophy-outline" label="Plus grosse prise" value={userPokedexEntry.biggest_size_cm || userPokedexEntry.biggest_weight_kg} unit={userPokedexEntry.biggest_size_cm ? ' cm' : ' kg'} />
                        <StatItem iconName="stats-chart-outline" label="Nombre de captures" value={userPokedexEntry.total_caught} />
                        <StatItem iconName="calendar-outline" label="Date 1ère prise" value={new Date(userPokedexEntry.first_caught_at).toLocaleDateString()} />
                        <StatItem iconName="location-outline" label="Lieu 1ère prise" value={userPokedexEntry.first_region} />
                        <StatItem iconName="hammer-outline" label="Technique favorite" value={userPokedexEntry.favorite_technique} />
                    </View>
                )}

            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: theme.colors.background.default },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background.default },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: theme.layout.screenPadding,
        paddingVertical: theme.spacing[2],
    },
    backButton: { padding: theme.spacing[1] },
    title: {
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: theme.typography.fontSize['2xl'],
        color: theme.colors.text.primary,
        textAlign: 'center',
        flex: 1,
    },
    placeholder: { width: theme.iconSizes.lg + theme.spacing[2] },
    scrollContentContainer: {
        paddingBottom: theme.spacing[8],
    },
    errorText: { color: theme.colors.text.primary, fontSize: theme.typography.fontSize.lg },
    
    mainInfoCard: {
        alignItems: 'center',
        marginBottom: theme.spacing[4],
        paddingHorizontal: theme.layout.containerPadding,
    },
    speciesImage: {
        width: '100%',
        aspectRatio: 1.2,
        borderRadius: theme.borderRadius.lg,
    },
    iconPlaceholder: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.gray[200],
    },

    infoCard: {
        backgroundColor: theme.colors.background.paper,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing[4],
        marginBottom: theme.spacing[4],
        marginHorizontal: theme.layout.containerPadding,
        ...theme.shadows.sm,
        borderWidth: 1,
        borderColor: theme.colors.border.light,
    },
    cardTitle: {
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: theme.typography.fontSize.xl,
        color: theme.colors.text.primary,
        marginBottom: theme.spacing[4],
    },

    leaderboardContainer: {
        marginBottom: theme.spacing[4],
    },
    leaderboardTitle: {
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: theme.typography.fontSize.xl,
        color: theme.colors.text.primary,
        marginBottom: theme.spacing[4],
        paddingHorizontal: theme.layout.containerPadding,
    },
    leaderboardScrollView: {
        paddingHorizontal: theme.layout.containerPadding,
    },

    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: theme.spacing[3],
    },
    statIcon: {
        marginRight: theme.spacing[3],
    },
    statTextContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    statLabel: {
        fontFamily: theme.typography.fontFamily.medium,
        fontSize: theme.typography.fontSize.base,
        color: theme.colors.text.secondary,
    },
    statValue: {
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: theme.typography.fontSize.base,
        color: theme.colors.text.primary,
        flexShrink: 1,
    },
});
