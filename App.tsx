import 'react-native-gesture-handler'; // Doit être en haut
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './contexts/AuthContext';
import { AppNavigator } from './navigation/AppNavigator';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function App() {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <AuthProvider>
                <AppNavigator />
                <StatusBar style="auto" />
            </AuthProvider>
        </GestureHandlerRootView>
    );
}
