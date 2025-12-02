import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FishingSessionsService, FishingSession } from '../../services';
import { SessionListItem } from '../../components/session/SessionListItem';
import { RootStackParamList } from '../../navigation/types';
import { theme, colors } from '../../theme';

type HomeNavigationProp = NativeStackNavigationProp<RootStackParamList, 'SessionDetail'>;

export const HomeScreen = () => {
    const navigation = useNavigation<HomeNavigationProp>();
    const [sessions, setSessions] = useState<FishingSession[]>([]);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [hasLoadedInitial, setHasLoadedInitial] = useState(false);

    const loadPublishedSessions = useCallback(async (isRefresh: boolean = false) => {
        if (!isRefresh && !hasLoadedInitial) {
            setLoading(true);
        }

        try {
            const publishedSessions = await FishingSessionsService.getPublishedSessions();
            setSessions(publishedSessions || []);
        } catch (error) {
            console.error("Erreur lors du chargement des sessions publiées:", error);
        } finally {
            if (!isRefresh && !hasLoadedInitial) {
                setLoading(false);
                setHasLoadedInitial(true);
            }
            if (isRefresh) {
                setIsRefreshing(false);
            }
        }
    }, [hasLoadedInitial]);

    useFocusEffect(
        useCallback(() => {
            loadPublishedSessions();
        }, [loadPublishedSessions])
    );

    const handleRefresh = useCallback(async () => {
        setIsRefreshing(true);
        await loadPublishedSessions(true);
    }, [loadPublishedSessions]);

    const handleNavigateToDetail = (sessionId: string) => {
        navigation.navigate('SessionDetail', { sessionId });
    };

    const renderEmptyComponent = () => (
        !loading && (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Aucune session publiée pour le moment.</Text>
            </View>
        )
    );

    if (loading && !hasLoadedInitial) {
        return <View style={styles.center}><ActivityIndicator size="large" color={theme.colors.primary[500]} /></View>;
    }

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={sessions}
                renderItem={({ item }) => (
                    <SessionListItem
                        session={item}
                        onNavigate={handleNavigateToDetail}
                    />
                )}
                keyExtractor={item => item.id}
                ListHeaderComponent={<Text style={styles.title}>Sessions Publiées</Text>}
                ListEmptyComponent={renderEmptyComponent}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={handleRefresh}
                        colors={[colors.primary['500']]}
                        tintColor={colors.primary['500']}
                    />
                }
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
    title: {
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: theme.typography.fontSize['4xl'],
        color: theme.colors.text.primary,
        paddingHorizontal: theme.layout.screenPadding,
        paddingTop: theme.spacing[4],
        paddingBottom: theme.spacing[6],
    },
    listContent: {
        paddingBottom: theme.spacing[8],
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: theme.spacing[20],
    },
    emptyText: {
        fontFamily: theme.typography.fontFamily.regular,
        fontSize: theme.typography.fontSize.base,
        color: theme.colors.text.secondary,
    },
});
