import React, { useState, useEffect, useCallback } from 'react';
import {
    Text,
    StyleSheet,
    ActivityIndicator,
    Alert,
    View,
    RefreshControl,
    FlatList,
    TouchableOpacity
} from 'react-native';
import { useNavigation, NavigationProp, useFocusEffect } from '@react-navigation/native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../config/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Database } from '../../lib/types';
import { FishCard, CatchInfo } from '../../components/fishlog/FishCard';
import { theme } from '../../theme';
import { FishLogStackParamList } from '../../navigation/types';

type Species = Database['public']['Tables']['species_registry']['Row'];

const NUM_COLUMNS = 3;
const Tab = createMaterialTopTabNavigator();

const waterTypeTranslations: { [key: string]: string } = {
    'fresh': 'Eau douce',
    'salt': 'Mer',
    'brackish': 'Saumâtre',
};

interface FilteredFishListProps {
    speciesList: Species[];
    catchInfoMap: Record<string, CatchInfo>;
    isCaught: boolean;
    onRefresh: () => void;
    isRefreshing: boolean;
    navigation: NavigationProp<FishLogStackParamList>;
    waterTypes: string[];
    activeFilter: string | null;
    onFilterChange: (filter: string | null) => void;
}

const FilteredFishList: React.FC<FilteredFishListProps> = ({ speciesList, catchInfoMap, isCaught, onRefresh, isRefreshing, navigation, waterTypes, activeFilter, onFilterChange }) => {
    
    const filteredSpecies = activeFilter
        ? speciesList.filter(species => {
            const types = species.water_types && species.water_types.length > 0 ? species.water_types : (species.category ? [species.category] : []);
            const translatedTypes = types.map(t => waterTypeTranslations[t.toLowerCase()] || t);
            return translatedTypes.includes(activeFilter);
        })
        : speciesList;

    const renderItem = ({ item: species }: { item: Species }) => (
        <FishCard
            key={species.id}
            species={species}
            isCaught={isCaught}
            catchInfo={catchInfoMap[species.id]}
            onPress={() => navigation.navigate('FishLogDetail', { speciesId: species.id })}
        />
    );

    const allFilters = ['Tous', ...waterTypes];

    return (
        <View style={{ flex: 1 }}>
            <View style={styles.segmentedControlContainer}>
                {allFilters.map(filter => (
                    <TouchableOpacity 
                        key={filter} 
                        onPress={() => onFilterChange(filter === 'Tous' ? null : filter)} 
                        style={[
                            styles.segmentButton, 
                            (activeFilter === filter || (!activeFilter && filter === 'Tous')) && styles.activeSegmentButton
                        ]}
                    >
                        <Text style={[
                            styles.segmentText, 
                            (activeFilter === filter || (!activeFilter && filter === 'Tous')) && styles.activeSegmentText
                        ]}>{filter}</Text>
                    </TouchableOpacity>
                ))}
            </View>
            <FlatList
                data={filteredSpecies}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                numColumns={NUM_COLUMNS}
                contentContainerStyle={styles.listContentContainer}
                refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={theme.colors.primary[500]} />}
            />
        </View>
    );
};


export const FishLogScreen = () => {
    const { user } = useAuth();
    const navigation = useNavigation<NavigationProp<FishLogStackParamList>>();
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [caughtList, setCaughtList] = useState<Species[]>([]);
    const [notCaughtList, setNotCaughtList] = useState<Species[]>([]);
    const [totalSpeciesCount, setTotalSpeciesCount] = useState(0);
    const [catchInfoMap, setCatchInfoMap] = useState<Record<string, CatchInfo>>({});
    
    const [caughtWaterTypes, setCaughtWaterTypes] = useState<string[]>([]);
    const [notCaughtWaterTypes, setNotCaughtWaterTypes] = useState<string[]>([]);
    const [activeCaughtFilter, setActiveCaughtFilter] = useState<string | null>(null);
    const [activeNotCaughtFilter, setActiveNotCaughtFilter] = useState<string | null>(null);

    const getTranslatedWaterTypes = (speciesList: Species[]): string[] => {
        const types = new Set<string>();
        speciesList.forEach(species => {
            let typesToProcess: string[] = [];
            if (species.water_types && species.water_types.length > 0) {
                typesToProcess = species.water_types;
            } else if (species.category) {
                typesToProcess = [species.category];
            }
            typesToProcess.forEach(type => {
                const translated = waterTypeTranslations[type.toLowerCase()];
                if (translated) types.add(translated);
            });
        });
        return Array.from(types).sort();
    };

    const fetchFishLogData = useCallback(async (showLoader: boolean = true) => {
        if (!user) return;

        if (showLoader) {
            setLoading(true);
        }

        try {
            const [speciesResponse, userPokedexResponse] = await Promise.all([
                supabase.from('species_registry').select('*'),
                supabase.from('user_pokedex').select('species_id, biggest_catch_id, total_caught, biggest_size_cm, biggest_weight_kg').eq('user_id', user.id)
            ]);

            const { data: allSpecies, error: speciesError } = speciesResponse;
            const { data: userPokedexEntries, error: pokedexError } = userPokedexResponse;

            if (speciesError) throw speciesError;
            if (pokedexError) throw pokedexError;

            const caughtSpeciesIds = new Set(userPokedexEntries.map(entry => entry.species_id));

            const biggestCatchIds = userPokedexEntries
                .map(entry => entry.biggest_catch_id)
                .filter((id): id is string => id !== null);

            const newCatchInfoMap: Record<string, CatchInfo> = {};

            if (biggestCatchIds.length > 0) {
                const { data: catchesData, error: catchesError } = await supabase
                    .from('catches')
                    .select('id, photo_url')
                    .in('id', biggestCatchIds);

                if (catchesError) throw catchesError;

                const catchIdToDataMap = new Map<string, { photo_url: string | null }>();
                catchesData.forEach(catchEntry => {
                    catchIdToDataMap.set(catchEntry.id, { photo_url: catchEntry.photo_url });
                });

                userPokedexEntries.forEach(entry => {
                    if (entry.biggest_catch_id) {
                        const catchData = catchIdToDataMap.get(entry.biggest_catch_id);
                        newCatchInfoMap[entry.species_id] = {
                            photoUrl: catchData?.photo_url || null,
                            totalCaught: entry.total_caught || 0,
                            biggestSizeCm: entry.biggest_size_cm || null,
                            biggestWeightKg: entry.biggest_weight_kg || null,
                        };
                    }
                });
            }
            setCatchInfoMap(newCatchInfoMap);

            const newCaughtList: Species[] = [];
            const newNotCaughtList: Species[] = [];

            allSpecies.forEach(species => {
                if (caughtSpeciesIds.has(species.id)) {
                    newCaughtList.push(species);
                } else {
                    newNotCaughtList.push(species);
                }
            });

            setCaughtList(newCaughtList.sort((a, b) => a.name.localeCompare(b.name)));
            setNotCaughtList(newNotCaughtList.sort((a, b) => a.name.localeCompare(b.name)));
            
            setCaughtWaterTypes(getTranslatedWaterTypes(newCaughtList));
            setNotCaughtWaterTypes(getTranslatedWaterTypes(newNotCaughtList));

            setTotalSpeciesCount(allSpecies.length);

        } catch (error: any) {
            Alert.alert('Erreur', "Impossible de charger le FishLog : " + error.message);
        } finally {
            // Always set loading to false, regardless of showLoader
            setLoading(false); 
            setIsRefreshing(false);
        }
    }, [user]);

    useFocusEffect(
        useCallback(() => {
            fetchFishLogData(false); // Fetch data silently
        }, [fetchFishLogData])
    );

    const onRefresh = () => {
        setIsRefreshing(true);
        fetchFishLogData(true); // Show loader for manual refresh
    };

    if (loading) {
        return <View style={styles.centered}><ActivityIndicator size="large" color={theme.colors.primary[500]} /></View>;
    }

    const progressPercentage = totalSpeciesCount > 0 ? (caughtList.length / totalSpeciesCount) * 100 : 0;

    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            <View style={styles.headerContainer}>
                <Text style={styles.screenTitle}>FishLog</Text>
            </View>

            <View style={styles.progressCard}>
                <Text style={styles.progressText}>
                    Progression : {caughtList.length} / {totalSpeciesCount} espèces capturées
                </Text>
                <View style={styles.progressBarBackground}>
                    <View style={[styles.progressBarFill, { width: `${progressPercentage}%` }]} />
                </View>
            </View>

            <Tab.Navigator
                screenOptions={{
                    tabBarActiveTintColor: theme.colors.primary[500],
                    tabBarInactiveTintColor: theme.colors.text.secondary,
                    tabBarLabelStyle: {
                        fontFamily: theme.typography.fontFamily.bold,
                        fontWeight: theme.typography.fontWeight.bold,
                    },
                    tabBarStyle: {
                        backgroundColor: theme.colors.background.default,
                        elevation: 0,
                        shadowOpacity: 0,
                    },
                    tabBarIndicatorStyle: {
                        backgroundColor: theme.colors.primary[500],
                    },
                }}
            >
                <Tab.Screen name={`Capturés (${caughtList.length})`}>
                    {() => <FilteredFishList
                        speciesList={caughtList}
                        catchInfoMap={catchInfoMap}
                        isCaught={true}
                        onRefresh={onRefresh}
                        isRefreshing={isRefreshing}
                        navigation={navigation}
                        waterTypes={caughtWaterTypes}
                        activeFilter={activeCaughtFilter}
                        onFilterChange={setActiveCaughtFilter}
                    />}
                </Tab.Screen>
                <Tab.Screen name={`À attraper (${notCaughtList.length})`}>
                    {() => <FilteredFishList
                        speciesList={notCaughtList}
                        catchInfoMap={catchInfoMap}
                        isCaught={false}
                        onRefresh={onRefresh}
                        isRefreshing={isRefreshing}
                        navigation={navigation}
                        waterTypes={notCaughtWaterTypes}
                        activeFilter={activeNotCaughtFilter}
                        onFilterChange={setActiveNotCaughtFilter}
                    />}
                </Tab.Screen>
            </Tab.Navigator>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: theme.colors.background.default,
    },
    headerContainer: {
        paddingHorizontal: theme.layout.screenPadding,
        marginTop: theme.spacing[4],
        marginBottom: theme.spacing[4],
    },
    screenTitle: {
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: theme.typography.fontSize['4xl'],
        color: theme.colors.text.primary,
    },
    progressCard: {
        backgroundColor: theme.colors.background.paper,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing[4],
        marginHorizontal: theme.layout.containerPadding,
        marginBottom: theme.spacing[4],
        ...theme.shadows.sm,
        borderWidth: 1,
        borderColor: theme.colors.border.light,
        alignItems: 'center',
    },
    progressBarBackground: {
        height: 10,
        width: '100%',
        backgroundColor: theme.colors.gray[300],
        borderRadius: theme.borderRadius.full,
        marginTop: theme.spacing[2],
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: theme.colors.primary[500],
        borderRadius: theme.borderRadius.full,
    },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background.default },
    listContentContainer: {
        flexGrow: 1, // This is the key change
        paddingHorizontal: theme.spacing[1],
        paddingTop: theme.spacing[2],
        backgroundColor: theme.colors.background.default,
    },
    progressText: {
        fontSize: theme.typography.fontSize.lg,
        fontFamily: theme.typography.fontFamily.medium,
        color: theme.colors.text.primary,
    },
    segmentedControlContainer: {
        flexDirection: 'row',
        backgroundColor: theme.colors.gray[200],
        borderRadius: theme.borderRadius.base,
        marginHorizontal: theme.spacing[4],
        marginVertical: theme.spacing[2],
        padding: 2,
    },
    segmentButton: {
        flex: 1,
        paddingVertical: theme.spacing[2],
        borderRadius: theme.borderRadius.base,
    },
    activeSegmentButton: {
        backgroundColor: theme.colors.white,
        ...theme.shadows.sm,
    },
    segmentText: {
        textAlign: 'center',
        fontFamily: theme.typography.fontFamily.medium,
        fontSize: theme.typography.fontSize.sm,
        color: theme.colors.text.secondary,
    },
    activeSegmentText: {
        color: theme.colors.primary[600],
        fontFamily: theme.typography.fontFamily.bold,
    },
});