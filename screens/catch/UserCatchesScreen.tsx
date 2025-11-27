import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../contexts/AuthContext';
import { CatchesService } from '../../services';
import { theme } from '../../theme';
import { RootStackParamList } from '../../navigation/types';
import { CatchList } from '../../components/catch/CatchList';
import { Database } from '../../lib/types';

type Catch = Database['public']['Tables']['catches']['Row'];
type CatchesNavigationProp = NativeStackNavigationProp<RootStackParamList, 'CatchDetail' | 'AddCatch'>;

export const UserCatchesScreen = () => {
    const { user } = useAuth();
    const navigation = useNavigation<CatchesNavigationProp>();
    const [catches, setCatches] = useState<Catch[]>([]);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [hasLoadedInitial, setHasLoadedInitial] = useState(false);

    const loadCatches = useCallback(async () => {
        if (!user) return;

        if (!hasLoadedInitial) {
            setLoading(true);
        }

        try {
            const userCatches = await CatchesService.getCatchesByUserId(user.id);
            setCatches(userCatches || []);
        } catch (error) {
            console.error("Erreur lors du chargement des prises:", error);
            Alert.alert("Erreur", "Impossible de charger les prises.");
        } finally {
            if (!hasLoadedInitial) {
                setLoading(false);
                setHasLoadedInitial(true);
            }
        }
    }, [user, hasLoadedInitial]);

    useFocusEffect(
        useCallback(() => {
            loadCatches();
        }, [loadCatches])
    );

    const handleRefresh = useCallback(async () => {
        setIsRefreshing(true);
        await loadCatches();
        setIsRefreshing(false);
    }, [loadCatches]);

    const handleAddCatch = () => {
        navigation.navigate('AddCatch', {
            onGoBack: () => loadCatches(),
        });
    };

    const handleCatchDetail = (catchId: string) => {
        navigation.navigate('CatchDetail', {
            catchId,
            onGoBack: () => loadCatches(),
        });
    };

    const handleDeleteCatch = (catchId: string) => {
        Alert.alert(
            "Supprimer la prise",
            "Êtes-vous sûr de vouloir supprimer cette prise ?",
            [
                { text: "Annuler", style: "cancel" },
                {
                    text: "Supprimer",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await CatchesService.deleteCatch(catchId);
                            setCatches(prevCatches => prevCatches.filter(c => c.id !== catchId));
                        } catch (error) {
                            console.error("Erreur lors de la suppression de la prise:", error);
                            Alert.alert("Erreur", "Impossible de supprimer la prise.");
                        }
                    },
                },
            ]
        );
    };

    if (loading && !hasLoadedInitial) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={theme.colors.primary[500]} />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <CatchList
                catches={catches}
                onCatchDetail={handleCatchDetail}
                onDeleteCatch={handleDeleteCatch}
                onAddCatch={handleAddCatch}
                isRefreshing={isRefreshing}
                onRefresh={handleRefresh}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background.default,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.background.default,
    },
});
