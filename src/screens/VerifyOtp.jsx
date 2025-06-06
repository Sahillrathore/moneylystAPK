import React, { useRef, useState } from 'react';
import {
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from '../utils/axios';
import { useAuth } from '../../context/AuthContext';

const VerifyOTPScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { email, username, password } = route.params;

    const { setUser, setNotification } = useAuth();

    const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);

    const inputRefs = useRef([]);

    const handleChange = (text, index) => {
        const newOtpDigits = [...otpDigits];
        newOtpDigits[index] = text;
        setOtpDigits(newOtpDigits);

        // Move to next input if typing a digit
        if (text && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleVerifyOtp = async () => {
        const otp = otpDigits.join('');
        if (otp.length !== 6) {
            setNotification?.({ msg: 'Please enter full 6-digit OTP', type: 'error' });
            return;
        }

        try {
            setLoading(true);

            // Step 1: Verify OTP
            await axios.post('/api/auth/verify/otp', {
                email,
                otp,
            });

            // Step 2: Register user
            const res = await axios.post('/api/auth/register', {
                name: username,
                email,
                password,
            });

            const token = res.data.token;
            const user = res.data.user;

            await AsyncStorage.setItem('token', token);
            await AsyncStorage.setItem('user', JSON.stringify(user));

            setUser?.(user);

            setNotification?.({ msg: 'Account created successfully!', type: 'success' });

            navigation.reset({
                index: 0,
                routes: [{ name: 'Onboarding' }],
            });
        } catch (err) {
            console.log(err);
            setNotification?.({
                msg: err.response?.data?.error || 'Failed to verify OTP',
                type: 'error',
            });
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
                <Text style={styles.title}>Verify Email</Text>
                <Text style={styles.subtitle}>
                    Enter the 6-digit OTP sent to {email}
                </Text>

                <View style={styles.otpContainer}>
                    {otpDigits.map((digit, index) => (
                        <TextInput
                            key={index}
                            ref={(ref) => (inputRefs.current[index] = ref)}
                            style={styles.otpInput}
                            keyboardType="number-pad"
                            maxLength={1}
                            value={digit}
                            onChangeText={(text) => handleChange(text, index)}
                        />
                    ))}
                </View>

                <TouchableOpacity disabled={loading} style={styles.button} onPress={handleVerifyOtp}>
                    <Text style={styles.buttonText}>
                        {loading ? 'Verifying...' : 'Verify OTP'}
                    </Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
};

export default VerifyOTPScreen;

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
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    otpInput: {
        backgroundColor: '#f3f4f6',
        borderRadius: 10,
        paddingHorizontal: 15,
        paddingVertical: 12,
        borderWidth: 1,
        fontSize: 20,
        borderColor: '#e5e7eb',
        color: '#222',
        textAlign: 'center',
        width: 50,
        height: 50,
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
});
