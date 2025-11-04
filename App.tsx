import React from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import {RegisterScreen} from "./screens/auth/RegisterScreen";
import {LoginScreen} from "./screens/auth/LoginScreen";
import {HomeScreen} from "./screens/home/HomeScreen";


// Navigation simple sans bibliothèque
const Navigation = () => {
    const { user, loading } = useAuth();
    const [screen, setScreen] = React.useState('Login');

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    if (!user) {
        if (screen === 'Register') {
            return <RegisterScreen navigation={{ navigate: setScreen, goBack: () => setScreen('Login') }} />;
        }
        return <LoginScreen navigation={{ navigate: setScreen }} />;
    }

    return <HomeScreen />;
};

export default function App() {
    return (
        <AuthProvider>
            <Navigation />
            <StatusBar style="auto" />
        </AuthProvider>
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
});