import React, { useEffect, useLayoutEffect, useState } from 'react';
import {
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { SafeAreaView } from 'react-native-safe-area-context';
import uuid from 'react-native-uuid';
import firestore from '@react-native-firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { decryptData } from '../utils/encryption';
import DropDown from '../components/DropDown';

const AddLoan = () => {
    const navigation = useNavigation();
    const { user, setNotification } = useAuth();

    const formatDate = (date) => {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0'); // months are 0-based
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const [formData, setFormData] = useState({
        amount: '',
        accountName: '',
        type: 'expense',
        lenderName: '',
        businessName: '',
        date: formatDate(new Date()),
        description: '',
    });

    const [banks, setBanks] = useState([]);
    const [businesses, setBusinesses] = useState([]);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [lenders, setLenders] = useState([]);
    
    const [showAddLender, setShowAddLender] = useState(false);
    const [newLenderName, setNewLenderName] = useState('');

    useLayoutEffect(() => {
        navigation.setOptions({ headerTitle: 'Add Loan' });
    }, [navigation]);

    // const formatDate = (date) => {
    //     const d = new Date(date);
    //     return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    // };

    const fetchBanks = async () => {
        const ref = firestore().collection('banks').doc(decryptData(user.uid));
        const snapshot = await ref.get();
        if (snapshot.exists) setBanks(snapshot.data().banks || []);
    };

    const fetchBusinesses = async () => {
        try {
            const ref = firestore().collection('business').doc(decryptData(user.uid));
            const snapshot = await ref.get();
            if (snapshot.exists) {
                const data = snapshot.data();
                setBusinesses(data?.businesses?.map(b => b.name) || []);
            }
        } catch (err) {
            console.error('Error fetching businesses:', err);
        }
    };

    const fetchLenders = () => {
        const ref = firestore().collection('categories').doc(decryptData(user.uid));
        return ref.onSnapshot(docSnap => {
            if (docSnap.exists) {
                const data = decryptData(docSnap.data());
                setLenders(data.lenders || []);
            }
        });
    };

    useEffect(() => {
        fetchBanks();
        fetchBusinesses();
        const unsubscribeLenders = fetchLenders();
        return () => unsubscribeLenders(); // cleanup
    }, []);

    const updateBankBalance = async (bankId, amount, type) => {
        const ref = firestore().collection('banks').doc(decryptData(user.uid));
        const snapshot = await ref.get();
        if (snapshot.exists) {
            let updatedBanks = snapshot.data().banks || [];
            updatedBanks = updatedBanks.map(bank =>
                bank.accountName === bankId
                    ? {
                        ...bank,
                        initialBalance:
                            type === 'income'
                                ? bank.initialBalance + parseFloat(amount)
                                : bank.initialBalance - parseFloat(amount),
                    }
                    : bank
            );
            await ref.update({ banks: updatedBanks });
        }
    };

    const handleSubmit = async () => {
        if (!formData.amount || isNaN(formData.amount) || parseFloat(formData.amount) <= 0) {
            return setNotification({ msg: 'Enter a valid amount', type: 'error' });
        }

        if (!formData.accountName || !formData.type || !formData.lenderName) {
            console.log(formData);
            
            return setNotification({ msg: 'Please fill all required fields', type: 'error' });
        }

        setIsSubmitting(true);
        try {
            const transactionId = uuid.v4();
            const typeField = formData.type;
            const docRef = firestore().collection('transactions').doc(decryptData(user.uid));

            const transactionData = {
                ...formData,
                amount: parseFloat(formData.amount),
                date: formatDate(formData.date),
                transactionId,
                category: 'loan',
                createdAt: Date.now(),
            };

            if (formData.accountName) {
                const bank = banks.find(b => b.accountName === formData.accountName);
                console.log(formData.date, bank.createDate);

                if (formData.accountName === 'Cash' || formData.date >= bank.createDate) {
                    console.log('Updating bank balance', formData);
                    await updateBankBalance(bank.accountName, formData.amount, typeField);
                }
            }
            // await updateBankBalance(formData.accountName, formData.amount, formData.type);

            await docRef.set(
                {
                    [typeField]: firestore.FieldValue.arrayUnion(transactionData),
                },
                { merge: true }
            );

            if (formData.businessName) {
                await firestore()
                    .collection('business_transactions')
                    .doc(decryptData(user.uid))
                    .set(
                        {
                            transactions: firestore.FieldValue.arrayUnion(transactionData),
                        },
                        { merge: true }
                    );
            }

            setNotification({ msg: 'Loan Added Successfully', type: 'success' });
            navigation.goBack();
        } catch (err) {
            console.error('AddLoan Error:', err);
            setNotification({ msg: 'Something went wrong', type: 'error' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        // <SafeAreaView style={{ flex: 1, backgroundColor: '' }}>

        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 50 }}>
            <Text style={styles.label}>Amount</Text>
            <TextInput
                style={styles.input}
                keyboardType="numeric"
                placeholder="Enter amount"
                placeholderTextColor="#888"
                value={formData.amount}
                onChangeText={(text) => setFormData({ ...formData, amount: text })}
            />

            <Text style={styles.label}>Bank</Text>
            <DropDown
                data={banks.map(b => b.accountName)}
                SetFormData={setFormData}
                keyName="accountName"
                placeholder="Select Bank"
            />


            <Text style={styles.label}>Transaction Type</Text>
            <View style={styles.row}>
                <TouchableOpacity
                    style={[styles.typeButton, formData.type === 'expense' && styles.typeButtonActive]}
                    onPress={() => setFormData(prev => ({ ...prev, type: 'expense' }))}
                >
                    <Text style={formData.type === 'expense' && styles.typeButtonTextActive}>Expense</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.typeButton, formData.type === 'income' && styles.typeButtonActive]}
                    onPress={() => setFormData(prev => ({ ...prev, type: 'income' }))}
                >
                    <Text style={formData.type === 'income' && styles.typeButtonTextActive}>Income</Text>
                </TouchableOpacity>
            </View>

            <Text style={styles.label}>Lender Name</Text>
            <DropDown
                data={lenders} // array of objects
                placeholder="Select Lender"
                keyName="lenderName"
                SetFormData={setFormData}
            />


            <Text style={styles.label}>Business (Optional)</Text>
            <DropDown
                data={businesses}
                SetFormData={setFormData}
                keyName="businessName"
                placeholder="Select Business"
            />


            <Text style={styles.label}>Date</Text>
            <TouchableOpacity
                style={styles.input}
                onPress={() => setShowDatePicker(true)}
            >
                <Text>{formatDate(formData.date)}</Text>
            </TouchableOpacity>

            {showDatePicker && (
                <DateTimePicker
                    value={new Date(formData.date)}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={(event, selectedDate) => {
                        setShowDatePicker(false);
                        if (selectedDate) {
                            setFormData(prev => ({ ...prev, date: selectedDate }));
                        }
                    }}
                />
            )}

            <Text style={styles.label}>Description</Text>
            <TextInput
                style={styles.input}
                placeholder="Enter description (optional)"
                placeholderTextColor="#888"
                value={formData.description}
                onChangeText={(text) => setFormData({ ...formData, description: text })}
            />

            <TouchableOpacity
                disabled={isSubmitting}
                style={styles.submitButton}
                onPress={handleSubmit}
            >
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>
                    {isSubmitting ? 'Saving...' : 'Add Loan'}
                </Text>
            </TouchableOpacity>
        </ScrollView>
        // </SafeAreaView>

    );
};

export default AddLoan;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5', padding: 20 },
    label: { marginTop: 10, fontSize: 14, color: '#555' },
    input: { backgroundColor: '#fff', borderRadius: 8, padding: 12, marginTop: 5, borderWidth: 1, borderColor: '#ccc' },
    row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 },
    typeButton: { flex: 1, backgroundColor: '#e0e0e0', padding: 13, borderRadius: 8, marginHorizontal: 5, alignItems: 'center' },
    typeButtonActive: { backgroundColor: '#26897C' },
    typeButtonTextActive: { color: '#fff', fontWeight: 'bold' },
    submitButton: { backgroundColor: '#26897C', marginTop: 20, padding: 15, borderRadius: 8, alignItems: 'center' },
});
