import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { HistoryScreen } from '../screens/history/HistoryScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { theme } from '../theme';
import {HomeScreen} from "../screens/home/HomeScreen"; // Importer le thème complet

export type TabParamList = {
    HomeTab: undefined;
    History: undefined;
    Profile: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

export const BottomTabNavigator = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName: React.ComponentProps<typeof Ionicons>['name'] = 'alert-circle';

                    if (route.name === 'HomeTab') {
                        iconName = focused ? 'home' : 'home-outline';
                    } else if (route.name === 'History') {
                        iconName = focused ? 'time' : 'time-outline';
                    } else if (route.name === 'Profile') {
                        iconName = focused ? 'person' : 'person-outline';
                    }

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: theme.colors.primary[500],      // Utilise le thème
                tabBarInactiveTintColor: theme.colors.text.disabled,  // Utilise le thème
                tabBarStyle: {
                    backgroundColor: theme.colors.background.paper, // Fond de la barre d'onglets
                    borderTopColor: theme.colors.border.light,      // Couleur de la bordure supérieure
                },
                tabBarLabelStyle: {
                    fontFamily: theme.typography.fontFamily.medium,
                    fontWeight: theme.typography.fontWeight.medium,
                }
            })}
        >
            <Tab.Screen name="HomeTab" component={HomeScreen} options={{ title: 'Accueil' }} />
            <Tab.Screen name="History" component={HistoryScreen} options={{ title: 'Historique' }} />
            <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profil' }} />
        </Tab.Navigator>
    );
};
