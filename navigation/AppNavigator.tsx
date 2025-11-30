import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext';
import { RootStackParamList } from './types';
import { theme } from '../theme';
import { LocationTrackingProvider } from '../hooks';

import { NewSessionScreen, ActiveSessionScreen, SessionDetailScreen } from '../screens/session';
import { AddCatchScreen, CatchDetailScreen, ClusterCatchesScreen } from '../screens/catch';
import { BottomTabNavigator } from './BottomTabNavigator';
import { LoginScreen, RegisterScreen, ForgotPasswordScreen } from '../screens/auth';
import { SettingsScreen } from '../screens/settings/SettingsScreen';

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
                    backgroundColor: theme.colors.background.paper,
                },
                headerTintColor: theme.colors.text.primary,
                headerTitleStyle: {
                    fontFamily: theme.typography.fontFamily.bold,
                    fontWeight: theme.typography.fontWeight.bold,
                    fontSize: theme.typography.fontSize.lg,
                },
            }}
        >
            {user ? (
                <>
                    <Stack.Screen name="Home" component={BottomTabNavigator} options={{ headerShown: false }} />
                    <Stack.Screen name="Settings" component={SettingsScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="ActiveSession" component={ActiveSessionScreen} options={{ title: 'Session en cours' }} />
                    <Stack.Screen name="SessionDetail" component={SessionDetailScreen} options={{ title: 'Détails de la session' }} />
                    <Stack.Screen name="NewSession" component={NewSessionScreen} options={{ title: 'Nouvelle session', presentation: 'modal' }} />
                    <Stack.Screen name="AddCatch" component={AddCatchScreen} options={{ title: 'Nouvelle prise', presentation: 'modal' }} />
                    <Stack.Screen name="CatchDetail" component={CatchDetailScreen} options={{ title: 'Détails de la prise' }} />
                    <Stack.Screen name="ClusterCatches" component={ClusterCatchesScreen} options={{ title: 'Prises' }} />
                </>
            ) : (
                <>
                    <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ headerShown: false }} />
                </>
            )}
        </Stack.Navigator>
    );
}

export const AppNavigator = () => {
    return (
        <NavigationContainer>
            <LocationTrackingProvider>
                <RootNavigator />
            </LocationTrackingProvider>
        </NavigationContainer>
    );
};
