import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import { doc, getDoc } from "firebase/firestore"; // for compatibility, but we use firestore().doc
import { decryptData } from "../utils/encryption";
import { useAuth } from "../../context/AuthContext";
import { useNavigation } from "@react-navigation/native";

const Login = () => {
    const { setUser, user } = useAuth();
    const navigation = useNavigation();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if(user) {
            navigation.navigate('Home');
        }
    },[])

    const handleLogin = async () => {
        setError("");
        if (!email || !password) {
            setError("Please enter both email and password.");
            return;
        }

        try {
            setLoading(true);
            const userCredential = await auth().signInWithEmailAndPassword(email, password);
            const user1 = userCredential.user;
            // console.log(user);
            
            const userDoc = await firestore().collection("users").doc(user1.uid).get();
            console.log(userDoc);
            if (!userDoc.exists) {
                setError("User data not found.");
                return;
            }

            const userData = decryptData(userDoc.data());
            console.log(userDoc.data());
            

            try {
                await AsyncStorage.setItem("user", JSON.stringify(userData));
                setUser(userData);
                console.log(user);
                
            } catch (err) {
                console.error("Failed to store user data:", err);
            }

            if (userData?.hasOnboarded) {
                navigation.reset({ index: 0, routes: [{ name: "Home" }] });
                console.log('homepar');
                
            } else {
                navigation.reset({ index: 0, routes: [{ name: "Home" }] });
            }
        } catch (err) {
            console.log("Login Error:", err);
            if (err.code === "auth/user-not-found") {
                setError("No account found with this email.");
            } else if (err.code === "auth/wrong-password") {
                setError("Incorrect password.");
            } else if (err.code === "auth/invalid-email") {
                setError("Invalid email address.");
            } else {
                setError("Something went wrong. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        // <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                {/* Card */}
                <View style={styles.card}>
                    <Text style={styles.title}>Login here</Text>
                    <Text style={styles.subtitle}>Welcome back you've been missed!</Text>

                    {error ? <Text style={{ color: "red", marginBottom: 8 }}>{error}</Text> : null}

                    <TextInput
                        placeholder="Email"
                        placeholderTextColor="#999"
                        value={email}
                        onChangeText={setEmail}
                        style={styles.input}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />

                    <TextInput
                        placeholder="Password"
                        placeholderTextColor="#999"
                        secureTextEntry
                        value={password}
                        onChangeText={setPassword}
                        style={styles.input}
                    />

                    <TouchableOpacity
                        style={styles.button}
                        onPress={handleLogin}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>Log in</Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
                        <Text style={styles.bottomText}>Create an account</Text>
                    </TouchableOpacity>
                </View>
            </View>
        // </SafeAreaView>
    );
};

export default Login;


const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        // backgroundColor: '#2563eb',
    },
    container: {
        flex: 1,
        backgroundColor: "white",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 5,
    },
    card: {
        width: "100%",
        backgroundColor: "#fff",
        borderTopRightRadius: 30,
        borderTopLeftRadius: 30,
        padding: 25,
        paddingBottom: 40,
        // elevation: 5,
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#195A5A",
        marginBottom: 5,
    },
    subtitle: {
        color: "#6b7280",
        marginBottom: 20,
        fontSize: 16,
    },
    input: {
        backgroundColor: "#f3f4f6",
        borderRadius: 15,
        paddingHorizontal: 15,
        paddingVertical: 12,
        marginBottom: 12,
        borderWidth: 1,
        fontSize: 18,
        borderColor: "#e5e7eb",
    },
    button: {
        backgroundColor: "#26897C",
        paddingVertical: 14,
        borderRadius: 15,
        alignItems: "center",
        marginTop: 5,
    },
    buttonText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 18,
    },
    bottomText: {
        color: "#26897C",
        textAlign: "center",
        marginTop: 20,
        fontSize: 16,
    },
    orText: {
        textAlign: "center",
        marginVertical: 15,
        color: "#9ca3af",
        fontSize: 12,
    },
    socialRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 5,
    },
    socialButton: {
        width: 50,
        height: 50,
        borderRadius: 10,
        backgroundColor: "#f3f4f6",
        justifyContent: "center",
        alignItems: "center",
    },
});