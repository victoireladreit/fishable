import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';

export const HomeScreen = () => {
    const { user, signOut } = useAuth();

    return (
        <View style={styles.container}>
            <Text style={styles.title}>🎣 Fishable</Text>
            <Text style={styles.welcome}>Bienvenue, {user?.user_metadata?.username || user?.email}!</Text>

            <View style={styles.info}>
                <Text style={styles.infoText}>Email: {user?.email}</Text>
                <Text style={styles.infoText}>ID: {user?.id}</Text>
            </View>

            <TouchableOpacity style={styles.button} onPress={signOut}>
                <Text style={styles.buttonText}>Se déconnecter</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 48,
        textAlign: 'center',
        marginBottom: 20,
    },
    welcome: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 30,
    },
    info: {
        backgroundColor: '#f5f5f5',
        padding: 20,
        borderRadius: 8,
        marginBottom: 30,
    },
    infoText: {
        fontSize: 16,
        marginBottom: 10,
    },
    button: {
        backgroundColor: '#FF3B30',
        padding: 15,
        borderRadius: 8,
    },
    buttonText: {
        color: '#fff',
        textAlign: 'center',
        fontSize: 16,
        fontWeight: 'bold',
    },
});