// AddTransactionScreen.js (React Native CLI compatible)

import React, { useEffect, useLayoutEffect, useState } from 'react';
import {
    Platform,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import { useRoute } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import uuid from 'react-native-uuid';
import { useNavigation } from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';
import DropDown from '../components/DropDown';
import { useAuth } from '../../context/AuthContext';
import { decryptData } from '../utils/encryption';

const AddTransaction = () => {
    const navigation = useNavigation();
    const { user, setNotification } = useAuth();

    const route = useRoute();
    const selectedType = route.params?.selectedType;

    const [businesses, setBusinesses] = useState([]);
    const [categories, setCategories] = useState([]);
    const [banks, setBanks] = useState([]);
    const [date, setDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showEndDatePicker, setShowEndDatePicker] = useState(false);
    const [isRecurring, setIsRecurring] = useState(false);
    const [endDate, setEndDate] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);


    const formatDate = (date) => {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0'); // months are 0-based
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const [formData, SetFormData] = useState({
        type: 'income',
        amount: '',
        category: '',
        accountName: '',
        date: formatDate(new Date()),
        description: '',
        isRecurring: false,
        recurringType: '',
        businessName: '',
    });

    useEffect(() => {
        if (selectedType === 'income' || selectedType === 'expense') {
            SetFormData(prev => ({ ...prev, type: selectedType }));
        }
    }, [selectedType]);

    useLayoutEffect(() => {
        navigation.setOptions({ headerTitle: 'Add Transaction' });
    }, [navigation]);

    const handleDataChange = (key, value) => {
        SetFormData(prev => ({ ...prev, [key]: value }));
    };


    const updateBankBalance = async (bankId, amount, type) => {
        // console.log(bankId, amount, type);

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
            fetchBanks();
        }
    };

    const fetchBusinesses = async () => {
        try {
            const ref = firestore().collection('business').doc(decryptData(user.uid));
            const snapshot = await ref.get();
            if (snapshot.exists) {
                const data = snapshot.data();
                console.log(data);

                // Assuming it's like: { businesses: [{ name: 'Business A' }, ...] }
                setBusinesses(data?.businesses?.map(b => b.name) || []);
                // console.log(data?.);

            }
        } catch (err) {
            console.error('Error fetching businesses:', err);
        }
    };


    const calculateNextExecution = (startDate, recurringType) => {
        let next = new Date(startDate);
        switch (recurringType) {
            case 'daily': next.setDate(next.getDate() + 1); break;
            case 'weekly': next.setDate(next.getDate() + 7); break;
            case 'monthly': next.setMonth(next.getMonth() + 1); break;
            case 'quarterly': next.setMonth(next.getMonth() + 3); break;
            case 'yearly': next.setFullYear(next.getFullYear() + 1); break;
        }
        return next.getTime();
    };

    const handleSubmit = async () => {
        if (!formData.amount || isNaN(formData.amount) || parseFloat(formData.amount) <= 0) {
            return setNotification({ msg: 'Enter a valid amount', type: 'error' });
        }
        if (!formData.type || !formData.amount || !formData.category || !formData.accountName) {
            return setNotification({ msg: 'Please fill all required fields!', type: 'error' });
        }

        setIsSubmitting(true);
        try {
            const transactionId = uuid.v4();
            const typeField = formData.type === 'income' ? 'income' : 'expense';
            const docRef = firestore().collection('transactions').doc(decryptData(user.uid));

            const transactionData = {
                transactionId,
                ...formData,
                // date: normalizeDate(formData.date),
                amount: parseFloat(formData.amount),
                date: formatDate(formData.date),
                createdAt: Date.now(),
            };

            if (formData.accountName) {
                const bank = banks.find(b => b.accountName === formData.accountName);
                console.log('ifTrue22');
                console.log(formData.date, bank.createDate);

                if (formData.date >= bank.createDate) {
                    console.log('ifTrue3');

                    await updateBankBalance(bank.accountName, formData.amount, typeField);
                }
            }

            await docRef.set({ [typeField]: firestore.FieldValue.arrayUnion(transactionData) }, { merge: true });

            console.log('Transaction Data added', transactionData);

            if (formData.businessName) {
                await firestore().collection('business_transactions').doc(decryptData(user.uid))
                    .set({ transactions: firestore.FieldValue.arrayUnion({ ...transactionData, date: formData.date }) }, { merge: true });
            }

            if (isRecurring) {
                const recurringTransaction = {
                    ...transactionData,
                    recurringTransactionId: uuid.v4(),
                    startDate: formData.date,
                    recurringType: formData.recurringType,
                    endDate: endDate ? new Date(endDate).getTime() : null,
                    status: 'active',
                    nextExecution: calculateNextExecution(formData.date, formData.recurringType),
                };
                await firestore().collection('recurring_transactions').doc(decryptData(user.uid))
                    .set({ recurringTransactions: firestore.FieldValue.arrayUnion(recurringTransaction) }, { merge: true });
            }

            setNotification({ msg: 'Transaction Added', type: 'success' });
            SetFormData({
                type: 'expense',
                amount: '',
                category: '',
                accountName: '',
                date: new Date(),
                description: '',
                isRecurring: false,
                recurringType: '',
                businessName: '',
            });
            setIsRecurring(false);
            setEndDate('');
        } catch (err) {
            console.error('Transaction Error:', err);
            setNotification({ msg: 'Please Try Again', type: 'error' });

        } finally {
            setIsSubmitting(false);
        }
    };

    const fetchBanks = async () => {
        const ref = firestore().collection('banks').doc(decryptData(user.uid));
        const snapshot = await ref.get();
        if (snapshot.exists) setBanks(snapshot.data().banks || []);
    };

    const fetchCategories = () => {
        const ref = firestore().collection('categories').doc(decryptData(user.uid));
        return ref.onSnapshot(docSnap => {
            if (docSnap.exists) setCategories(decryptData(docSnap.data()).category);
        });
    };

    useEffect(() => {
        fetchBanks();
        fetchBusinesses();
        const unsubscribe = fetchCategories();
        return () => unsubscribe();
    }, [user?.uid]);

    return (
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 50 }}>
            <View style={styles.row}>
                <TouchableOpacity style={[styles.typeButton, formData.type === 'expense' && styles.typeButtonActive]} onPress={() => handleDataChange('type', 'expense')}>
                    <Text style={formData.type === 'expense' && styles.typeButtonTextActive}>Expense</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.typeButton, formData.type === 'income' && styles.typeButtonActive]} onPress={() => handleDataChange('type', 'income')}>
                    <Text style={formData.type === 'income' && styles.typeButtonTextActive}>Income</Text>
                </TouchableOpacity>
            </View>

            <Text style={styles.label}>Amount</Text>
            <TextInput style={styles.input} keyboardType="numeric" placeholderTextColor='#888' placeholder="Enter amount" value={formData.amount} onChangeText={text => handleDataChange('amount', text)} />

            <Text style={styles.label}>Bank</Text>
            <DropDown data={banks.map(b => b.accountName)} SetFormData={SetFormData} keyName="accountName" placeholder="Select Bank" />

            <Text style={styles.label}>{formData.type === 'income' ? 'Source' : 'Category'}</Text>
            <DropDown data={categories.filter(c => c.type === formData.type).map(c => c.category)} SetFormData={SetFormData} keyName="category" placeholder="Select Category" />

            <Text style={styles.label}>Business</Text>
            <DropDown
                data={businesses}
                SetFormData={SetFormData}
                keyName="businessName"
                placeholder="Select Business (optional)"
            />

            <Text style={styles.label}>Date</Text>
            <TouchableOpacity style={styles.input} onPress={() => setShowDatePicker(true)}>
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
                            setDate(selectedDate);
                            handleDataChange('date', selectedDate);
                        }
                    }}
                />
            )}

            <Text style={styles.label}>Description</Text>
            <TextInput style={styles.input} placeholder="Description (optional)" placeholderTextColor='#888' value={formData.description} onChangeText={text => handleDataChange('description', text)} />

            <View style={styles.row}>
                <Text style={styles.label}>Recurring Transaction</Text>
                <Switch value={isRecurring} onValueChange={val => { setIsRecurring(val); handleDataChange('isRecurring', val); }} />
            </View>

            {isRecurring && (
                <>
                    <Text style={styles.label}>Recurring Type</Text>
                    <DropDown data={["daily", "weekly", "monthly", "quarterly", "yearly"]} SetFormData={SetFormData} keyName="recurringType" placeholder="Select Recurring Type" />

                    <Text style={styles.label}>End Date (optional)</Text>
                    <TextInput style={styles.input} placeholder="YYYY-MM-DD" value={endDate} onChangeText={setEndDate} />
                </>
            )}

            <TouchableOpacity disabled={isSubmitting} style={styles.submitButton} onPress={handleSubmit}>
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>{isSubmitting ? 'Submitting...' : 'Create Transaction'}</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

export default AddTransaction;

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
