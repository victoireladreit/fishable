import React from 'react';
import { FlatList, View, Text, StyleSheet, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import { FishingSession } from '../../services';
import { theme, colors } from '../../theme';
import { SessionListItem } from './SessionListItem'; // Import the new SessionListItem

interface SessionListProps {
    history: FishingSession[];
    activeSession: FishingSession | null;
    loading: boolean;
    isRefreshing: boolean;
    onRefresh: () => void;
    onDelete: (sessionId: string) => void;
    onNavigateToDetail: (sessionId: string) => void;
    onNavigateToNewSession: () => void;
    onNavigateToActiveSession: () => void;
}

export const SessionList = ({
    history,
    activeSession,
    loading,
    isRefreshing,
    onRefresh,
    onDelete,
    onNavigateToDetail,
    onNavigateToNewSession,
    onNavigateToActiveSession,
}: SessionListProps) => {

    const renderHeader = () => (
        <>
            <Text style={styles.title}>Mes Sessions</Text>
            <View style={styles.headerButtons}>
                {activeSession ? (
                    <TouchableOpacity style={styles.buttonResume} onPress={onNavigateToActiveSession}>
                        <Text style={styles.buttonText}>Reprendre la session en cours</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity style={styles.buttonPrimary} onPress={onNavigateToNewSession}>
                        <Text style={styles.buttonText}>🚀 Nouvelle session</Text>
                    </TouchableOpacity>
                )}
            </View>
            <Text style={styles.subtitle}>Historique</Text>
        </>
    );

    const renderEmptyComponent = () => (
        !loading && (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Aucun historique de session pour le moment.</Text>
            </View>
        )
    );

    return (
        <FlatList
            data={history}
            ListHeaderComponent={renderHeader}
            renderItem={({ item }) => (
                <SessionListItem
                    session={item}
                    onDelete={onDelete}
                    onNavigate={onNavigateToDetail}
                />
            )}
            keyExtractor={item => item.id}
            contentContainerStyle={{ paddingBottom: theme.spacing[8] }}
            ListEmptyComponent={renderEmptyComponent}
            refreshControl={
                <RefreshControl
                    refreshing={isRefreshing}
                    onRefresh={onRefresh}
                    colors={[colors.primary['500']]}
                    tintColor={colors.primary['500']}
                />
            }
        />
    );
};

const styles = StyleSheet.create({
    title: {
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: theme.typography.fontSize['4xl'],
        color: theme.colors.text.primary,
        marginTop: theme.spacing[4],
        paddingHorizontal: theme.layout.screenPadding,
    },
    subtitle: {
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: theme.typography.fontSize['2xl'],
        color: theme.colors.text.primary,
        marginTop: theme.spacing[6],
        marginBottom: theme.spacing[4],
        paddingHorizontal: theme.layout.screenPadding,
    },
    headerButtons: {
        paddingHorizontal: theme.layout.screenPadding,
        marginTop: theme.spacing[4],
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
    buttonPrimary: {
        backgroundColor: colors.primary["500"],
        padding: 15,
        borderRadius: 8,
    },
    buttonResume: {
        backgroundColor: colors.success.main,
        padding: 15,
        borderRadius: 8,
    },
    buttonText: {
        color: '#fff',
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: 16,
    },
});
