import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext';
import { RootStackParamList } from './types';
import { colors } from '../theme';

import { NewSessionScreen } from '../screens/session/NewSessionScreen';
import { ActiveSessionScreen } from '../screens/session/ActiveSessionScreen';
import {HistoryScreen} from "../screens/history/HistoryScreen";
import {BottomTabNavigator} from "./BottomTabNavigator";
import {LoginScreen, RegisterScreen} from "../screens/auth";

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator = () => {
    const { user, loading } = useAuth();

    // Optionnel : Affichez un écran de chargement pendant que l'état d'authentification est vérifié
    if (loading) {
        return null; // Ou un écran de chargement
    }

    return (
        <NavigationContainer>
            <Stack.Navigator
                screenOptions={{
                    headerTintColor: colors.primary['900'], // Couleur par défaut pour la flèche et le titre
                }}
            >
                {user ? (
                    <>
                        <Stack.Screen name="Home" component={BottomTabNavigator} options={{ headerShown: false, title: 'Accueil' }} />
                        <Stack.Screen name="ActiveSession" component={ActiveSessionScreen} options={{ title: 'Session en cours' }} />
                        <Stack.Screen name="History" component={HistoryScreen} options={{ title: 'Historique' }} />
                        
                        {/* C'est ici que nous ajoutons les options pour NewSession */}
                        <Stack.Screen
                            name="NewSession"
                            component={NewSessionScreen}
                            options={{
                                title: 'Nouvelle session',
                                presentation: 'modal',
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
        </NavigationContainer>
    );
};