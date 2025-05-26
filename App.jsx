import React from "react";
import 'react-native-get-random-values';
import 'react-native-gesture-handler';
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { AuthProvider } from "./context/AuthContext";
import Welcome from "./src/screens/Welcome";
import Signup from "./src/screens/Signup";
import Login from "./src/screens/Login";
import AddTransaction from "./src/screens/AddTransaction";
import BottomTabs from "./src/navigation/BottomTabs"; // ✅ NEW
import Configuration from "./src/screens/Configuration";
import Categories from "./src/components/Categories";
import { SafeAreaProvider } from "react-native-safe-area-context";
import ToastNotification from "./src/components/ToastNotification";
import NewCategory from "./src/screens/NewCategory";

const Stack = createStackNavigator();

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
              <Stack.Screen name="Welcome" component={Welcome} />
              <Stack.Screen name="Signup" component={Signup} />
              <Stack.Screen name="Login" component={Login} />
              <Stack.Screen name="Main" component={BottomTabs} />
              <Stack.Screen name="AddTransaction" component={AddTransaction} />
              <Stack.Screen name="Configuration" component={Configuration} />
              <Stack.Screen name="Categories" component={Categories} />
              <Stack.Screen name="NewCategory" component={NewCategory} />
            </Stack.Navigator>
          </NavigationContainer>
          <ToastNotification/>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
