import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext';
import { RootStackParamList } from './types';
import { theme } from '../theme'; // Importer le thème complet

import { NewSessionScreen, ActiveSessionScreen } from '../screens/session';
import { BottomTabNavigator } from './BottomTabNavigator';
import { LoginScreen, RegisterScreen } from '../screens/auth';

const Stack = createNativeStackNavigator<RootStackParamList>();

const RootNavigator = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background.default }}>
                <ActivityIndicator size="large" color={theme.colors.primary[500]} />
            </View>
        );
    }

    return (
        <Stack.Navigator
            screenOptions={{
                headerStyle: {
                    backgroundColor: theme.colors.background.paper, // Fond de l'en-tête
                },
                headerTintColor: theme.colors.text.primary, // Couleur du titre et de la flèche de retour
                headerTitleStyle: {
                    fontFamily: theme.typography.fontFamily.bold,
                    fontWeight: theme.typography.fontWeight.bold,
                    fontSize: theme.typography.fontSize.lg,
                },
                headerBackVisible: false,
            }}
        >
            {user ? (
                <>
                    <Stack.Screen
                        name="Home"
                        component={BottomTabNavigator}
                        options={{ headerShown: false }}
                    />
                    <Stack.Screen
                        name="ActiveSession"
                        component={ActiveSessionScreen}
                        options={{ title: 'Session en cours' }}
                    />
                    <Stack.Screen
                        name="NewSession"
                        component={NewSessionScreen}
                        options={{
                            title: 'Nouvelle session',
                            presentation: 'modal', // Affiche l'écran par-dessus les autres
                        }}
                    />
                </>
            ) : (
                <>
                    <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
                </>
            )}
        </Stack.Navigator>
    );
}

export const AppNavigator = () => {
    return (
        <NavigationContainer>
            <RootNavigator />
        </NavigationContainer>
    );
};
