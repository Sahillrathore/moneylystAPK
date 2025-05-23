import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { useAuth } from '../../context/AuthContext'; // adjust path as needed
import { encryptData } from '../utils/encryption'; // adjust path as needed
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
    Login: undefined;
    Signup: undefined;
    Onboarding: undefined;
    Home: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Signup'>;

const Signup: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();
    const { setUser, setNotification } = useAuth();

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
    });

    const [loading, setLoading] = useState(false);

    const handleChange = (key: string, value: string) => {
        setFormData((prev) => ({ ...prev, [key]: value }));
    };

    const handleSignup = async () => {
        
        if (!formData.username || !formData.email || !formData.password) {
            return setNotification?.({ msg: 'Please fill all fields', type: 'error' });
        }

        if (formData.password.length < 6) {
            return setNotification?.({ msg: 'Password must be at least 6 characters', type: 'error' });
        }

        try {
            setLoading(true);

            const userCredential = await auth().createUserWithEmailAndPassword(
                formData.email,
                formData.password
            );

            const user = userCredential.user;
            await user.updateProfile({ displayName: formData.username });

            const userData = {
                uid: user.uid,
                username: formData.username,
                email: formData.email,
                balance: 0,
            };

            // const encryptedUserData = encryptData(userData);
            const encryptedUserData = userData;

            const banks = {
                banks: [
                    {
                        accountName: 'Cash',
                        accountType: 'Cash',
                        bankId: Date.now().toString(),
                        initialBalance: 0,
                    },
                ],
            };

            const categories = {
                category: [
                    { category: 'food', type: 'expense' },
                    { category: 'transport', type: 'expense' },
                    { category: 'beauty', type: 'expense' },
                    { category: 'health', type: 'expense' },
                    { category: 'education', type: 'expense' },
                ],
            };

            await firestore().collection('users').doc(user.uid).set(encryptedUserData);
            await firestore().collection('banks').doc(user.uid).set(banks);
            await firestore().collection('categories').doc(user.uid).set(categories);

            await AsyncStorage.setItem('user', JSON.stringify(userData));
            setUser?.(userData);
            setNotification?.({ msg: 'Account created successfully!', type: 'success' });
            navigation.replace('Home'); // change to 'Onboarding'
        } catch (error: any) {
            console.log(error);
            setNotification?.({ msg: error.message, type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.select({ ios: 'padding', android: undefined })}
        >
            <View style={styles.card}>
                <Text style={styles.title}>Create Account</Text>
                <Text style={styles.subtitle}>Create an account so you can explore all features</Text>

                <TextInput
                    placeholder="Username"
                    style={styles.input}
                    value={formData.username}
                    placeholderTextColor="#999"
                    onChangeText={(t) => handleChange('username', t)}
                />
                <TextInput
                    placeholder="Email"
                    style={styles.input}
                    keyboardType="email-address"
                    placeholderTextColor="#999"
                    value={formData.email}
                    onChangeText={(t) => handleChange('email', t)}
                />
                <TextInput
                    placeholder="Password"
                    secureTextEntry
                    style={styles.input}
                    placeholderTextColor="#999"
                    value={formData.password}
                    onChangeText={(t) => handleChange('password', t)}
                />

                <TouchableOpacity disabled={loading} style={styles.button} onPress={handleSignup}>
                    <Text style={styles.buttonText}>{loading ? 'Creating...' : 'Sign Up'}</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                    <Text style={styles.bottomText}>Already have an account?</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
};

export default Signup;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
    },
    card: {
        width: '100%',
        backgroundColor: '#fff',
        borderTopRightRadius: 30,
        borderTopLeftRadius: 30,
        padding: 25,
        paddingBottom: 40,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#195A5A',
        marginBottom: 5,
    },
    subtitle: {
        color: '#6b7280',
        marginBottom: 20,
        fontSize: 16,
    },
    input: {
        backgroundColor: '#f3f4f6',
        borderRadius: 15,
        paddingHorizontal: 15,
        paddingVertical: 12,
        marginBottom: 12,
        borderWidth: 1,
        fontSize: 18,
        borderColor: '#e5e7eb',
    },
    button: {
        backgroundColor: '#26897C',
        paddingVertical: 14,
        borderRadius: 15,
        alignItems: 'center',
        marginTop: 5,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 18,
    },
    bottomText: {
        color: '#26897C',
        textAlign: 'center',
        marginTop: 20,
        fontSize: 16,
    },
});
