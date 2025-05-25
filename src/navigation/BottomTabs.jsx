// src/navigation/BottomTabs.js

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';

import Home from '../screens/Home';
import Accounts from '../screens/Accounts';
import TransactionHistory from '../screens/TransactionHistory';
import More from '../screens/More';
import { SafeAreaView } from 'react-native-safe-area-context';

const Tab = createBottomTabNavigator();

const BottomTabs = () => {
    return (
        <SafeAreaView style={{ flex: 1 }}>
            <Tab.Navigator
                screenOptions={({ route }) => ({
                    headerShown: false,
                    tabBarIcon: ({ focused, color, size }) => {
                        let iconName;
                        if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
                        else if (route.name === 'Accounts') iconName = focused ? 'wallet' : 'wallet-outline';
                        else if (route.name === 'Transactions') iconName = focused ? 'home' : 'home-outline';
                        else if (route.name === 'More') iconName = focused ? 'wallet' : 'wallet-outline';
                        return <Ionicons name={iconName} size={size} color={color} />;
                    },
                    tabBarActiveTintColor: '#26897C',
                    tabBarInactiveTintColor: 'gray',
                })}
            >
                <Tab.Screen name="Home" component={Home} />
                <Tab.Screen name="Accounts" component={Accounts} />
                <Tab.Screen name="TransactionHistory" component={TransactionHistory} />
                <Tab.Screen name="More" component={More} />
            </Tab.Navigator>
        </SafeAreaView>
    );
};

export default BottomTabs;
