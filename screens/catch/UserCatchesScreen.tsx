import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../contexts/AuthContext';
import { CatchesService } from '../../services';
import { theme, colors } from '../../theme';
import { RootStackParamList } from '../../navigation/types';
import { CatchList } from '../../components/catch/CatchList';
import { Database } from '../../lib/types';

type Catch = Database['public']['Tables']['catches']['Row'];
type CatchesNavigationProp = NativeStackNavigationProp<RootStackParamList, 'EditCatch' | 'AddCatch'>;

export const UserCatchesScreen = () => {
    const { user } = useAuth();
    const navigation = useNavigation<CatchesNavigationProp>();
    const [catches, setCatches] = useState<Catch[]>([]);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const loadCatches = useCallback(async () => {
        if (!user) return;
        try {
            const userCatches = await CatchesService.getCatchesByUserId(user.id);
            setCatches(userCatches || []);
        } catch (error) {
            console.error("Erreur lors du chargement des prises:", error);
            Alert.alert("Erreur", "Impossible de charger les prises.");
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    }, [user]);

    useFocusEffect(
        useCallback(() => {
            setLoading(true);
            loadCatches();
        }, [loadCatches])
    );

    const handleRefresh = useCallback(() => {
        setIsRefreshing(true);
        loadCatches();
    }, [loadCatches]);

    const handleAddCatch = () => {
        navigation.navigate('AddCatch', {});
    };

    const handleEditCatch = (catchId: string) => {
        navigation.navigate('EditCatch', { catchId });
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

    if (loading && !isRefreshing) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={theme.colors.primary[500]} />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.scrollContainer}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={handleRefresh}
                        colors={[colors.primary['500']]}
                        tintColor={colors.primary['500']}
                    />
                }
            >
                <Text style={styles.title}>Prises</Text>
                <CatchList
                    catches={catches}
                    onEditCatch={handleEditCatch}
                    onDeleteCatch={handleDeleteCatch}
                />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background.default,
    },
    scrollContainer: {
        flexGrow: 1,
        paddingHorizontal: theme.layout.screenPadding,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.background.default,
    },
    title: {
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: theme.typography.fontSize['4xl'],
        color: theme.colors.text.primary,
        marginTop: theme.spacing[4],
        marginBottom: theme.spacing[4],
    },
});
