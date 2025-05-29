// App.jsx
import React from "react";
import 'react-native-get-random-values';
import 'react-native-gesture-handler';
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { AuthProvider, useAuth } from "./context/AuthContext";
import Welcome from "./src/screens/Welcome";
import Signup from "./src/screens/Signup";
import AddTransaction from "./src/screens/AddTransaction";
import BottomTabs from "./src/navigation/BottomTabs";
import Configuration from "./src/screens/Configuration";
import Categories from "./src/components/Categories";
import { SafeAreaProvider } from "react-native-safe-area-context";
import ToastNotification from "./src/components/ToastNotification";
import NewCategory from "./src/screens/NewCategory";
import Onboarding from "./src/screens/Onboarding";
import { View, ActivityIndicator } from "react-native";
import AddLoan from "./src/screens/AddLoan";
import { SafeAreaView } from 'react-native-safe-area-context';
import LenderLoanDetails from "./src/screens/LenderLoanDetails";
import Login from "./src/screens/Login";
import ManageLenders from "./src/screens/ManageLenders";
import ProfileScreen from "./src/screens/Profile";

const Stack = createStackNavigator();

function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <>
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="Welcome" component={Welcome} />
            <Stack.Screen name="Signup" component={Signup} />
          </>
        ) : !user.hasOnboarded ? (
          <Stack.Screen name="Onboarding" component={Onboarding} />
        ) : (
          <>
            <Stack.Screen name="Main" component={BottomTabs} />
            <Stack.Screen name="AddTransaction" component={AddTransaction} />
            <Stack.Screen name="AddLoan" component={AddLoan} />
            <Stack.Screen name="Configuration" component={Configuration} />
            <Stack.Screen name="Categories" component={Categories} />
            <Stack.Screen name="NewCategory" component={NewCategory} />
            <Stack.Screen name="LenderLoanDetails" component={LenderLoanDetails} />
            <Stack.Screen name="ManageLenders" component={ManageLenders} />
            {/* <Stack.Screen name="Login" component={Login} /> */}
            <Stack.Screen name="Profile" component={ProfileScreen} />
          </>
        )}
      </Stack.Navigator>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
          <ToastNotification />
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
