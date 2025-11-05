import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './contexts/AuthContext';
import { AppNavigator } from './navigation/AppNavigator';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';

export default function App() {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <AuthProvider>
                <ActionSheetProvider>
                    <>
                        <AppNavigator />
                        <StatusBar style="auto" />
                    </>
                </ActionSheetProvider>
            </AuthProvider>
        </GestureHandlerRootView>
    );
}
