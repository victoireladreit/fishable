import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { theme } from '../../theme';

export const HomeScreen = () => {
    const { user } = useAuth();

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <Text style={styles.title}>🎣 Fishable</Text>
                <Text style={styles.welcome}>Bienvenue, {user?.user_metadata.username || 'Pêcheur'} !</Text>
                <Text style={styles.subtitle}>Prêt à attraper du gros ?</Text>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: theme.colors.background.default,
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    title: {
        fontSize: 48,
        fontFamily: theme.typography.fontFamily.bold,
        color: theme.colors.text.primary,
        marginBottom: theme.spacing[2],
    },
    welcome: {
        fontSize: 24,
        fontFamily: theme.typography.fontFamily.medium,
        color: theme.colors.text.secondary,
        marginBottom: theme.spacing[6],
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 18,
        fontFamily: theme.typography.fontFamily.regular,
        color: theme.colors.text.secondary,
        textAlign: 'center',
        paddingHorizontal: theme.spacing[4],
    },
});
