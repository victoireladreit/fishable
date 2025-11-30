import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { theme } from '../../theme';
import { CatchList } from '../../components/catch/CatchList';
import { CatchesService } from '../../services';
import { Database } from '../../lib/types';

type Catch = Database['public']['Tables']['catches']['Row'];
type ClusterCatchesScreenRouteProp = RouteProp<RootStackParamList, 'ClusterCatches'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const ClusterCatchesScreen = () => {
    const route = useRoute<ClusterCatchesScreenRouteProp>();
    const navigation = useNavigation<NavigationProp>();
    const [catches, setCatches] = useState<Catch[]>(route.params.catches);

    const handleCatchDetail = (catchId: string) => {
        navigation.navigate('CatchDetail', { catchId });
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
                            // Note: This only updates the state of this screen.
                            // The map on the previous screen won't be updated until it's re-focused.
                        } catch (error) {
                            console.error("Erreur lors de la suppression de la prise:", error);
                            Alert.alert("Erreur", "Impossible de supprimer la prise.");
                        }
                    },
                },
            ]
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
            <CatchList
                catches={catches}
                onCatchDetail={handleCatchDetail}
                onDeleteCatch={handleDeleteCatch}
                isRefreshing={false}
                onRefresh={() => {}}
                showTitleHeader={false}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background.default,
        paddingTop: theme.spacing[4],
    },
});
