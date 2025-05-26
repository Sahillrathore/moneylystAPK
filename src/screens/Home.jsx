import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
    Platform,
    PermissionsAndroid,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
// import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from "../../context/AuthContext";
import firestore from "@react-native-firebase/firestore";
// import SmsListener from "react-native-android-sms-listener";
// import notifee from "@notifee/react-native";
import { decryptData } from "../utils/encryption";
import RecentTransactions from "../components/RecentTransaction";
import BankCards from "../components/BankCards";

const parseSMS = (message) => {
    const creditMatch = message.match(/(?:₹|Rs\.?)\s?(\d+(?:\.\d+)?).*(credited)/i);
    const debitMatch = message.match(/(?:₹|Rs\.?)\s?(\d+(?:\.\d+)?).*(debited)/i);


    if (creditMatch) {
        return { type: 'income', amount: creditMatch[1] };
    }
    if (debitMatch) {
        return { type: 'expense', amount: debitMatch[1] };
    }
    return null;
};

const Home = () => {
    const navigation = useNavigation();
    const { user } = useAuth();
    const [transactions, setTransactions] = useState([]);
    const [totalIncome, setTotalIncome] = useState(0);
    const [totalExpense, setTotalExpense] = useState(0);
    const [balance, setBalance] = useState(0);

    // useEffect(() => {
    //   const requestSMSPermission = async () => {
    //     const granted = await PermissionsAndroid.request(
    //       PermissionsAndroid.PERMISSIONS.RECEIVE_SMS,
    //       {
    //         title: "SMS Receive Permission",
    //         message: "This Home needs access to receive SMS messages to track transactions.",
    //         buttonPositive: "Allow",
    //       }
    //     );
    //     if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
    //       console.log("❌ SMS RECEIVE permission denied");
    //       return;
    //     }

    //     const subscription = SmsListener.addListener((message) => {
    //       const parsed = parseSMS(message.body);
    //       if (parsed) {
    //         // sendLocalNotification(parsed.type, parsed.amount);
    //       }
    //     });

    //     return () => subscription.remove();
    //   };

    //   if (Platform.OS === "android") {
    //     requestSMSPermission();
    //   }
    // }, []);

    // const sendLocalNotification = async (type, amount) => {
    //   await notifee.requestPermission();

    //   const channelId = await notifee.createChannel({
    //     id: 'default',
    //     name: 'Default Channel',
    //   });

    //   await notifee.displayNotification({
    //     title: `${type === 'income' ? 'Income' : 'Expense'} Detected`,
    //     body: `₹${amount} ${type === 'income' ? 'credited' : 'debited'} - Add to tracker?`,
    //     android: {
    //       channelId,
    //     },
    //   });
    // };


    console.log(user);

    useEffect(() => {
        if (!user) return;

        const fetchTransactions = async () => {
            try {
                const docRef = firestore().collection("transactions").doc(decryptData(user?.uid));
                const docSnap = await docRef.get();

                if (docSnap.exists) {
                    const data = decryptData(docSnap.data());
                    const incomeList = data?.income || [];
                    const expenseList = data?.expense || [];

                    const now = new Date();
                    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

                    const filteredIncome = incomeList?.filter(
                        (t) => new Date(t.date) >= startOfMonth
                    );
                    const filteredExpense = expenseList?.filter(
                        (t) => new Date(t.date) >= startOfMonth
                    );

                    const totalIncomeCalc = filteredIncome?.reduce(
                        (acc, t) => acc + t.amount,
                        0
                    );
                    const totalExpenseCalc = filteredExpense?.reduce(
                        (acc, t) => acc + t.amount,
                        0
                    );

                    setTotalIncome(totalIncomeCalc);
                    setTotalExpense(totalExpenseCalc);
                    setBalance(totalIncomeCalc - totalExpenseCalc);

                    setTransactions(
                        [
                            ...filteredIncome?.map((t) => ({ ...t, type: "income" })),
                            ...filteredExpense?.map((t) => ({ ...t, type: "expense" })),
                        ].sort((a, b) => new Date(b.date) - new Date(a.date))
                    );
                }
            } catch (error) {
                console.log("Error fetching transactions:", error);
            }
        };

        fetchTransactions();
    }, [user]);

    useEffect(() => {
        if (!user) {
            navigation.navigate("Welcome");
        }
    }, [user]);

    return (
        
        <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
            <FlatList
                data={[]} // empty since we don't need this FlatList to render actual data
                renderItem={null}
                ListHeaderComponent={
                    <>
                        {/* Balance Card */}
                        <View style={styles.container}>
                            <View style={styles.balanceCard}>
                                <Text style={styles.totalText}>Total Balance</Text>
                                <Text style={styles.amount}>₹ {balance}</Text>
                                <View style={styles.balanceRow}>
                                    <View>
                                        <Text style={styles.label}>Income</Text>
                                        <Text style={[styles.income, styles.balanceAmount]}>
                                            ₹ {totalIncome}
                                        </Text>
                                    </View>
                                    <View>
                                        <Text style={styles.label}>Expenses</Text>
                                        <Text style={[styles.expense, styles.balanceAmount]}>
                                            ₹ {totalExpense}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        </View>

                        <View>
                            <BankCards user={user} />
                        </View>

                        <View style={{ backgroundColor: 'white' }}>
                            <RecentTransactions />
                        </View>
                    </>
                }
                keyExtractor={(_, index) => index.toString()}
                contentContainerStyle={{ paddingBottom: 100 }}
            />

            {/* Floating Button */}
            <View style={{ position: 'absolute', bottom: 40, right: 20 }}>
                <TouchableOpacity
                    onPress={() => navigation.navigate('AddTransaction')}
                    style={styles.floatingButton}
                >
                    <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 30 }}>+</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>

        // <Text style={{ flex: 1, ustifyContent: "center", alignItems: "center" }}>Sahil</Text>
    );
};

export default Home;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "white", padding: 10 },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    bell: { padding: 8 },
    balanceCard: {
        backgroundColor: "#26897C",
        borderRadius: 20,
        padding: 20,
        marginVertical: 20,
    },
    totalText: { color: "#fff", fontSize: 16 },
    amount: {
        fontSize: 34,
        color: "#fff",
        fontWeight: "bold",
        marginVertical: 5,
    },
    balanceRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 10,
    },
    label: { color: "#ccc", fontSize: 16 },
    balanceAmount: { fontWeight: "bold", marginTop: 5, fontSize: 24 },
    income: { color: "#00e676" },
    expense: { color: "#ff1744" },
    floatingButton: {
        backgroundColor: "#26897C",
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: "center",
        justifyContent: "center",
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
});
