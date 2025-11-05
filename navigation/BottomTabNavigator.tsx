import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { HistoryScreen } from '../screens/history/HistoryScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { SettingsScreen } from '../screens/settings/SettingsScreen';
import { theme } from '../theme';
import { MainTabParamList } from './types';
import {HomeScreen} from "../screens/home/HomeScreen"; // Importer le type depuis le fichier central

const Tab = createBottomTabNavigator<MainTabParamList>();

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
                    } else if (route.name === 'Settings') {
                        iconName = focused ? 'settings' : 'settings-outline';
                    }

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: theme.colors.primary[500],
                tabBarInactiveTintColor: theme.colors.text.disabled,
                tabBarStyle: {
                    backgroundColor: theme.colors.background.paper,
                    borderTopColor: theme.colors.border.light,
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
            <Tab.Screen name="Settings" component={SettingsScreen} options={{ title: 'Réglages' }} />
        </Tab.Navigator>
    );
};
