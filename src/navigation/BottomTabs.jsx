// src/navigation/BottomTabs.js

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Image, View } from 'react-native';

import Home from '../screens/Home';
import Accounts from '../screens/Accounts';
import TransactionHistory from '../screens/TransactionHistory';
import More from '../screens/More';
import { SafeAreaView } from 'react-native-safe-area-context';
import Analytics from '../screens/Analytics';
import LoanSummary from '../screens/LoanSummary';

const Tab = createBottomTabNavigator();

// Image imports (update paths based on your actual structure)
const icons = {
    Home: {
        active: require('../../assets/home.png'),
        inactive: require('../../assets/home.png'),
    },
    Accounts: {
        active: require('../../assets/wallet.png'),
        inactive: require('../../assets/wallet.png'),
    },
    TransactionHistory: {
        active: require('../../assets/transaction.png'),
        inactive: require('../../assets/transaction.png'),
    },
    Analytics: {
        active: require('../../assets/analytics.png'),
        inactive: require('../../assets/analytics.png'),
    },
    LoanSummary: {
        active: require('../../assets/loan.png'),
        inactive: require('../../assets/loan.png'),
    },
    More: {
        active: require('../../assets/option.png'),
        inactive: require('../../assets/option.png'),
    },
};

const BottomTabs = () => {
    return (
        // <SafeAreaView style={{ flex: 1 }}>
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarIcon: ({ focused }) => {
                    const icon = icons[route.name][focused ? 'active' : 'inactive'];
                    return (
                        <Image
                            source={icon}
                            style={{ width: 24, height: 24, resizeMode: 'contain' }}
                        />
                    );
                },
                tabBarShowLabel: false,
                tabBarStyle: {
                    height: 60,
                    paddingBottom: 6,
                    paddingTop: 6,
                },
            })}
        >
            <Tab.Screen name="Home" component={Home} />
            <Tab.Screen name="Accounts" component={Accounts} />
            <Tab.Screen name="TransactionHistory" component={TransactionHistory} />
            <Tab.Screen name="LoanSummary" component={LoanSummary} />
            <Tab.Screen name="Analytics" component={Analytics} />
            <Tab.Screen name="More" component={More} />
            {/* <Tab.Screen name="AddLoan" component={Analytics} /> */}
        </Tab.Navigator>
        // </SafeAreaView>
    );
};

export default BottomTabs;
