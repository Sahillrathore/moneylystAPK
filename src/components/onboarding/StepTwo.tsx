import React, { useState } from 'react';
import {
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import firestore from '@react-native-firebase/firestore'; // ✅ CLI-compatible Firestore
import uuid from 'react-native-uuid';
import { useAuth } from '../../../context/AuthContext'; // ✅ adjust if path differs

type Props = {
    onNext: () => void;
};

const AccountDetailsStep: React.FC<Props> = ({ onNext }) => {
    const [accountName, setAccountName] = useState('');
    const [accountType, setAccountType] = useState('');
    const [createDate, setCreationDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [initialBalance, setBalance] = useState('');
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();

    const handleDateChange = (_: any, selectedDate?: Date) => {
        setShowDatePicker(Platform.OS === 'ios');
        if (selectedDate) setCreationDate(selectedDate);
    };

    const handleContinue = async () => {
        if(!accountName || !accountType || !createDate) {
            setError('Please fill all fields');
            return;
        }
        try {
            const newBank = {
                accountName,
                accountType,
                initialBalance: parseFloat(initialBalance) || 0,
                bankId: uuid.v4(),
                createDate: createDate.toISOString().split('T')[0],
            };

            const bankRef = firestore().collection('banks').doc(user?.uid);
            await bankRef.update({
                banks: firestore.FieldValue.arrayUnion(newBank),
            });

            const userRef = firestore().collection('users').doc(user?.uid);
            await userRef.update({
                currentStep: 2,
            });

            console.log('Bank added successfully');
            setError(null);
            onNext();
        } catch (error) {
            console.error('Error adding bank:', error);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>Account Details</Text>

                {error && <Text style={{ color: 'red', marginBottom: 10 }}>{error}</Text>} 

                <Text style={styles.label}>Account Name</Text>
                <TextInput
                    style={styles.input}
                    placeholder="e.g., Cash, SBI Savings"
                    value={accountName}
                    onChangeText={setAccountName}
                    placeholderTextColor="#000"

                />

                <Text style={styles.label}>Account Type</Text>
                <View style={styles.pickerContainer}>
                    <Picker
                        selectedValue={accountType}
                        onValueChange={(value) => setAccountType(value)}
                        style={{ color: '#000' }} 
                    >
                        <Picker.Item label="Select type" value="" />
                        <Picker.Item label="Bank Account" value="bank" />
                        <Picker.Item label="Card" value="card" />
                        <Picker.Item label="Debit Card" value="debitCard" />
                        <Picker.Item label="Savings" value="savings" />
                        <Picker.Item label="Loan" value="loan" />
                        <Picker.Item label="Investments" value="investments" />
                        <Picker.Item label="Others" value="others" />
                    </Picker>
                </View>

                <Text style={styles.label}>Date of Creation</Text>
                <TouchableOpacity
                    style={styles.datePickerButton}
                    onPress={() => setShowDatePicker(true)}
                >
                    <Text style={styles.dateText}>
                        {createDate.toLocaleDateString('en-GB')}
                    </Text>
                </TouchableOpacity>
                {showDatePicker && (
                    <DateTimePicker
                        value={createDate}
                        mode="date"
                        display="default"
                        onChange={handleDateChange}
                    />
                )}

                <Text style={styles.label}>Current Balance</Text>
                <TextInput
                    style={styles.input}
                    placeholder="₹500"
                    keyboardType="numeric"
                    value={initialBalance}
                    onChangeText={setBalance}
                    placeholderTextColor="#999"
                />
                <Text style={styles.subLabel}>Must be a valid number (min: 0)</Text>
            </View>

            <View style={styles.bottomSection}>
                <View style={styles.stepperContainer}>
                    {Array.from({ length: 5 }).map((_, index) => {
                        const isActive = index + 1 === 2;
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

                <TouchableOpacity style={styles.button} onPress={handleContinue}>
                    <Text style={styles.buttonText}>Next</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default AccountDetailsStep;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'space-between',
        backgroundColor: '#ffffff',
        paddingHorizontal: 24,
        paddingVertical: 24,
    },
    content: {
        flexGrow: 1,
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
        color: '#000',
    },
    subLabel: {
        fontSize: 12,
        color: '#6b7280',
        marginBottom: 16,
    },
    input: {
        backgroundColor: "#f3f4f6",
        borderRadius: 15,
        paddingHorizontal: 15,
        paddingVertical: 15,
        marginBottom: 12,
        borderWidth: 1,
        fontSize: 18,
        borderColor: "#e5e7eb",
        // color: "#000",
    },
    pickerContainer: {
        borderWidth: 1,
        backgroundColor: "#f3f4f6",
        borderRadius: 15,
        marginBottom: 16,
        paddingVertical: 0,
        overflow: 'hidden',
        borderColor: "#e5e7eb",
        color: '888'
    },
    datePickerButton: {
        borderWidth: 1,
        backgroundColor: "#f3f4f6",
        borderRadius: 15,
        paddingHorizontal: 16,
        paddingVertical: 15,
        marginBottom: 16,
        borderColor: "#e5e7eb",
    },
    dateText: {
        color: '#4b5563',
        fontSize: 16,
    },
    bottomSection: {
        paddingBottom: 24, // add padding so keyboard doesn't overlap
    },
    button: {
        backgroundColor: '#26897C',
        paddingVertical: 14,
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
