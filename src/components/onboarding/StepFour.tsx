import React, { useState } from 'react';
import {
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import firestore from '@react-native-firebase/firestore';
import uuid from 'react-native-uuid';
import { useAuth } from '../../../context/AuthContext';

type Props = {
    onNext: () => void;
};

const BusinessDetails: React.FC<Props> = ({ onNext }) => {
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [businessType, setBusinessType] = useState('');
    const [employees, setEmployee] = useState('');
    const { user } = useAuth();

    const handleContinue = async () => {
        try {
            const uid = user?.uid;
            if (!uid) return;

            const businessRef = firestore().collection('business').doc(uid);

            const newBusiness = {
                id: uuid.v4(),
                name,
                address,
                businessType,
                employees,
            };

            await businessRef.set({
                businesses: [newBusiness],
                hasBusiness: true,
            });

            await firestore().collection('users').doc(uid).update({
                currentStep: 4,
            });

            console.log('Business added successfully');
            onNext();
        } catch (error) {
            console.error('Error adding business:', error);
        }
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.wrapper}>
                    <ScrollView
                        style={styles.scroll}
                        contentContainerStyle={styles.scrollContent}
                        keyboardShouldPersistTaps="handled"
                    >
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                            <Text style={styles.title}>Business Details</Text>
                            <Text style={{ fontSize: 18 }}>(Optional)</Text>
                        </View>

                        <Text style={styles.label}>Business Name</Text>
                        <TextInput
                            placeholder="e.g., Venue Originals"
                            value={name}
                            onChangeText={setName}
                            style={styles.input}
                            placeholderTextColor="#6b7280"
                        />

                        <Text style={styles.label}>Address</Text>
                        <TextInput
                            placeholder="e.g., 123 Street"
                            value={address}
                            onChangeText={setAddress}
                            style={styles.input}
                            placeholderTextColor="#6b7280"
                        />

                        <Text style={styles.label}>Business Type</Text>
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={businessType}
                                onValueChange={(itemValue) => setBusinessType(itemValue)}
                            >
                                <Picker.Item label="Select type" value="" />
                                <Picker.Item label="Product" value="product" />
                                <Picker.Item label="Service" value="service" />
                            </Picker>
                        </View>

                        <Text style={styles.label}>Number of Employees</Text>
                        <TextInput
                            placeholder="e.g., 50"
                            value={employees}
                            onChangeText={setEmployee}
                            keyboardType="numeric"
                            style={styles.input}
                            placeholderTextColor="#6b7280"
                        />
                    </ScrollView>

                    <View style={styles.bottomSection}>
                        <View style={styles.stepperContainer}>
                            {Array.from({ length: 5 }).map((_, index) => {
                                const isActive = index + 1 === 4;
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
                </View>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
};

export default BusinessDetails;

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    scroll: {
        flex: 1,
    },
    scrollContent: {
        padding: 24,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#26897C',
        marginBottom: 8,
    },
    label: {
        fontSize: 16,
        marginBottom: 4,
        color: '#111827',
    },
    input: {
        backgroundColor: '#f3f4f6',
        borderRadius: 15,
        paddingHorizontal: 15,
        paddingVertical: 15,
        marginBottom: 12,
        borderWidth: 1,
        fontSize: 18,
        borderColor: '#e5e7eb',
        color: '#000000',
    },
    pickerContainer: {
        borderWidth: 1,
        backgroundColor: '#f3f4f6',
        borderRadius: 15,
        marginBottom: 16,
        overflow: 'hidden',
        borderColor: '#e5e7eb',
    },
    bottomSection: {
        paddingHorizontal: 24,
        paddingBottom: 24,
        marginBottom: 24,
        backgroundColor: '#ffffff',
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
