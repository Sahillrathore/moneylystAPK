import React, { useState } from 'react';
import {
    Keyboard,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
    Alert,
} from 'react-native';
// import Feather from 'react-native-vector-icons/Feather'; // ✅ CLI-compatible icon import
import firestore from '@react-native-firebase/firestore'; // ✅ React Native Firebase
import { useAuth } from '../../../context/AuthContext'; // ✅ adjust path if needed

type Props = {
    onNext: () => void;
};

const MobileNumberStep: React.FC<Props> = ({ onNext }) => {
    const [mobile, setMobile] = useState('');
    const [error, setError] = useState('');
    const { user } = useAuth();

    const handleContinue = async () => {
        try {
            const sanitizedMobile = mobile.trim().replace(/\D/g, '');
            if (!sanitizedMobile) {
                setError('Please enter your mobile number.');
                return;
            }
            if (sanitizedMobile.length !== 10) {
                setError('Please enter a valid 10-digit mobile number.');
                return;
            }

            const userRef = firestore().collection('users').doc(user?.uid);
            await userRef.update({
                mobile: sanitizedMobile,
                currentStep: 1,
            });

            console.log('Phone number submitted:', mobile);
            onNext();
        } catch (error) {
            console.error('Error updating mobile:', error);
            Alert.alert('Error', 'Failed to save mobile number. Please try again.');
        }
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.container}>
                <ScrollView
                    contentContainerStyle={styles.inner}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.topSection}>
                        <Text style={styles.title}>Mobile Number</Text>
                        <View style={styles.labelRow}>
                            {/* <Feather name="phone" size={16} color="black" /> */}
                            <Text style={styles.labelText}>  Mobile Number</Text>
                        </View>

                        <TextInput
                            style={styles.input}
                            keyboardType="phone-pad"
                            maxLength={10}
                            placeholder="+91 9999999999"
                            value={mobile}
                            onChangeText={setMobile}
                            placeholderTextColor="#888"
                        />

                        {error ? <Text style={styles.errorText}>{error}</Text> : null}
                    </View>

                    <View style={styles.bottomSection}>
                        <View style={styles.stepperContainer}>
                            {Array.from({ length: 5 }).map((_, index) => {
                                const isActive = index === 0;
                                return (
                                    <View
                                        key={index}
                                        style={[
                                            styles.stepDot,
                                            isActive ? styles.activeDot : styles.inactiveDot,
                                        ]}
                                    />
                                );
                            })}
                        </View>

                        <TouchableOpacity onPress={handleContinue} style={styles.button}>
                            <Text style={styles.buttonText}>Next</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </View>
        </TouchableWithoutFeedback>
    );
};

export default MobileNumberStep;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    inner: {
        flexGrow: 1,
        justifyContent: 'space-between',
        padding: 24,
    },
    topSection: {
        marginBottom: 32,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#26897C',
        marginBottom: 8,
    },
    labelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    labelText: {
        color: '#4b5563',
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
        color: '#000',
    },
    errorText: {
        color: '#ef4444',
        marginBottom: 8,
    },
    button: {
        backgroundColor: '#26897C',
        paddingVertical: 12,
        borderRadius: 24,
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 21,
        textAlign: 'center',
        fontWeight: '600',
    },
    bottomSection: {
        paddingBottom: 24,
    },
    stepperContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 24,
    },
    stepDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginHorizontal: 4,
    },
    activeDot: {
        backgroundColor: '#6b7280',
    },
    inactiveDot: {
        backgroundColor: '#d1d5db',
    },
});
