import React from 'react';
import { createBottomTabNavigator, BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { theme } from '../theme';
import { MainTabParamList, FishLogStackParamList } from './types';
import { HomeScreen } from "../screens/home/HomeScreen";
import { FishLogScreen } from '../screens/fishlog/FishLogScreen';
import { FishLogDetailScreen } from '../screens/fishlog/FishLogDetailScreen';
import { SessionScreen } from "../screens/session/SessionScreen";
import { UserCatchesScreen } from '../screens/catch/UserCatchesScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

const FishLogStack = createStackNavigator<FishLogStackParamList>();

const FishLogNavigator = () => {
    return (
        <FishLogStack.Navigator screenOptions={{ headerShown: false }}>
            <FishLogStack.Screen name="FishLogList" component={FishLogScreen} />
            <FishLogStack.Screen name="FishLogDetail" component={FishLogDetailScreen} />
        </FishLogStack.Navigator>
    );
};

export const BottomTabNavigator = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }: BottomTabScreenProps<MainTabParamList>) => ({
                headerShown: false,
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName: React.ComponentProps<typeof Ionicons>['name'] = 'alert-circle';

                    if (route.name === 'HomeTab') {
                        iconName = focused ? 'home' : 'home-outline';
                    } else if (route.name === 'Sessions') {
                        iconName = focused ? 'boat' : 'boat-outline';
                    } else if (route.name === 'UserCatches') {
                        iconName = focused ? 'fish' : 'fish-outline';
                    } else if (route.name === 'FishLog') {
                        iconName = focused ? 'book' : 'book-outline';
                    } else if (route.name === 'Profile') {
                        iconName = focused ? 'person' : 'person-outline';
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
            <Tab.Screen name="Sessions" component={SessionScreen} options={{ title: 'Sessions' }} />
            <Tab.Screen name="UserCatches" component={UserCatchesScreen} options={{ title: 'Prises' }} />
            <Tab.Screen name="FishLog" component={FishLogNavigator} options={{ title: 'FishLog' }} />
            <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profil' }} />
        </Tab.Navigator>
    );
};
