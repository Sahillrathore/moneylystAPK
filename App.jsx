import React from "react";
import 'react-native-get-random-values';
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import Home from "./src/screens/Home";
import TransactionHistory from "./src/screens/TransactionHistory";
import Welcome from "./src/screens/Welcome";
import { AuthProvider } from "./context/AuthContext";
import Signup from "./src/screens/Signup";
import Login from "./src/screens/Login";

const Stack = createStackNavigator();

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Home" component={Home} />
          <Stack.Screen name="TransactionHistory" component={TransactionHistory} />
          <Stack.Screen name="Welcome" component={Welcome} />
          <Stack.Screen name="Signup" component={Signup} />
          <Stack.Screen name="Login" component={Login} />

        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
}
