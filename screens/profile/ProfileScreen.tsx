import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { colors } from '../../theme';

export const ProfileScreen = () => {
    const { user, signOut } = useAuth();

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Mon Profil</Text>
            <View style={styles.infoContainer}>
                <Text style={styles.label}>Nom d'utilisateur:</Text>
                <Text style={styles.info}>{user?.user_metadata?.username}</Text>
            </View>
            <View style={styles.infoContainer}>
                <Text style={styles.label}>Email:</Text>
                <Text style={styles.info}>{user?.email}</Text>
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
        fontSize: 32,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 40,
        color: colors.primary['900'],
    },
    infoContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        color: '#666',
    },
    info: {
        fontSize: 18,
        fontWeight: '500',
        marginTop: 4,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingBottom: 8,
    },
    button: {
        backgroundColor: colors.error.main,
        padding: 15,
        borderRadius: 8,
        marginTop: 30,
    },
    buttonText: {
        color: '#fff',
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: 16,
    },
});
