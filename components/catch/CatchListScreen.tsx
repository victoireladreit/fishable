import React from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { theme } from '../../theme';
import { CatchList } from './CatchList';
import { Database } from '../../lib/types';

type Catch = Database['public']['Tables']['catches']['Row'];

interface CatchListScreenProps {
    catches: Catch[];
    isRefreshing: boolean;
    onRefresh: () => void;
    onCatchDetail: (catchId: string) => void;
    onDeleteCatch: (catchId: string) => void;
}

export const CatchListScreen: React.FC<CatchListScreenProps> = ({
    catches,
    isRefreshing,
    onRefresh,
    onCatchDetail,
    onDeleteCatch,
}) => {
    const renderEmptyComponent = () => (
        <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Aucune prise enregistrée pour le moment.</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <CatchList
                catches={catches}
                onCatchDetail={onCatchDetail}
                onDeleteCatch={onDeleteCatch}
                isRefreshing={isRefreshing}
                onRefresh={onRefresh}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background.default,
        paddingTop: theme.spacing[4]
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: theme.spacing[8],
    },
    emptyText: {
        fontFamily: theme.typography.fontFamily.regular,
        fontSize: theme.typography.fontSize.base,
        color: theme.colors.text.secondary,
    },
});
