import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { theme } from '../../theme';

const INPUT_HEIGHT = 50;

export const ProfileScreen = () => {
    const { user, signOut } = useAuth();

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.contentContainer}>
                <Text style={styles.title}>Mon Profil</Text>
                
                <View style={styles.infoCard}>
                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Nom d'utilisateur</Text>
                        <Text style={styles.info}>{user?.user_metadata?.username}</Text>
                    </View>
                    <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
                        <Text style={styles.label}>Email</Text>
                        <Text style={styles.info}>{user?.email}</Text>
                    </View>
                </View>

                <TouchableOpacity style={styles.button} onPress={signOut}>
                    <Text style={styles.buttonText}>Se déconnecter</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background.default,
    },
    contentContainer: {
        flex: 1,
        justifyContent: 'center',
        padding: theme.layout.containerPadding,
    },
    title: {
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: theme.typography.fontSize['4xl'],
        color: theme.colors.text.primary,
        textAlign: 'center',
        marginBottom: theme.spacing[10],
    },
    infoCard: {
        backgroundColor: theme.colors.background.paper,
        borderRadius: theme.borderRadius.md,
        paddingHorizontal: theme.spacing[5],
        ...theme.shadows.sm,
        borderWidth: 1,
        borderColor: theme.colors.border.light,
    },
    infoRow: {
        paddingVertical: theme.spacing[4],
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border.light,
    },
    label: {
        fontFamily: theme.typography.fontFamily.regular,
        fontSize: theme.typography.fontSize.sm,
        color: theme.colors.text.secondary,
        marginBottom: theme.spacing[1],
    },
    info: {
        fontFamily: theme.typography.fontFamily.medium,
        fontSize: theme.typography.fontSize.lg,
        color: theme.colors.text.primary,
        fontWeight: theme.typography.fontWeight.medium,
    },
    button: {
        height: INPUT_HEIGHT,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.error.main,
        borderRadius: theme.borderRadius.base,
        marginTop: theme.spacing[8],
        ...theme.shadows.base,
    },
    buttonText: {
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: theme.typography.fontSize.base,
        color: theme.colors.text.inverse,
        fontWeight: theme.typography.fontWeight.bold,
    },
});
