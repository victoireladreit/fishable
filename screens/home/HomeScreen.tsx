import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { FishingSession, FishingSessionsService } from '../../services';
import { colors, theme } from '../../theme';
import { RootStackParamList } from '../../navigation/types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export const HomeScreen = () => {
    const { user, refreshUser } = useAuth();
    const navigation = useNavigation<NavigationProp>();
    const [activeSession, setActiveSession] = useState<FishingSession | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const loadData = useCallback(async (isRefreshCall: boolean = false) => {
        if (!user) {
            if (!isRefreshCall) setIsLoading(false);
            return;
        }
        if (!isRefreshCall) setIsLoading(true);

        try {
            const sessionsResult = await FishingSessionsService.getSessions({ userId: user.id, status: 'active' });
            
            if (isRefreshCall) {
                await refreshUser();
            }
            
            setActiveSession(sessionsResult?.[0] || null);

        } catch (error) {
            console.error('Erreur chargement session active:', error);
            setActiveSession(null);
        } finally {
            if (!isRefreshCall) setIsLoading(false);
        }
    }, [user, refreshUser]);

    useFocusEffect(
        useCallback(() => {
            const fetchData = async () => {
                await loadData();
            };
            fetchData();
        }, [loadData])
    );

    const handleRefresh = useCallback(async () => {
        setIsRefreshing(true);
        await loadData(true);
        setIsRefreshing(false);
    }, [loadData]);

    if (isLoading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={colors.primary['500']} />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView
                contentContainerStyle={styles.container}
                refreshControl={
                    <RefreshControl 
                        refreshing={isRefreshing} 
                        onRefresh={handleRefresh} 
                        colors={[colors.primary['500']]} 
                        tintColor={colors.primary['500']} 
                    />
                }
            >
                <View style={styles.content}>
                    <Text style={styles.title}>🎣 Fishable</Text>
                    <Text style={styles.welcome}>Bienvenue, {user?.user_metadata.username || 'Pêcheur'} !</Text>

                    {activeSession ? (
                        <TouchableOpacity style={styles.buttonResume} onPress={() => navigation.navigate('ActiveSession', { sessionId: activeSession.id })}>
                            <Text style={styles.buttonText}>Reprendre la session en cours</Text>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity style={styles.buttonPrimary} onPress={() => navigation.navigate('NewSession')}>
                            <Text style={styles.buttonText}>🚀 Nouvelle session</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
    },
    container: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 20,
    },
    content: {
        alignItems: 'center', // Centre les éléments horizontalement
    },
    center: { 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 40,
        textAlign: 'center',
        marginBottom: 20,
        fontFamily: theme.typography.fontFamily.bold,
    },
    welcome: {
        fontSize: 20,
        textAlign: 'center',
        marginBottom: 30,
        fontFamily: theme.typography.fontFamily.regular,
    },
    buttonPrimary: {
        backgroundColor: colors.primary["500"],
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 8,
        width: '80%', // Donner une largeur pour un meilleur aspect
    },
    buttonResume: {
        backgroundColor: colors.success.main,
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 8,
        marginBottom: 20,
        width: '80%', // Donner une largeur pour un meilleur aspect
    },
    buttonText: {
        color: '#fff',
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: 16,
        fontFamily: theme.typography.fontFamily.medium,
    },
});
