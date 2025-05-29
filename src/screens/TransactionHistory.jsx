import React, { useCallback, useEffect, useLayoutEffect, useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import firestore from "@react-native-firebase/firestore";
import moment from "moment";
import { useAuth } from "../../context/AuthContext";
import { decryptData } from "../utils/encryption";

const alphabetColors = {
    a: "#E53935", b: "#D81B60", c: "#8E24AA", d: "#5E35B1", e: "#3949AB",
    f: "#1E88E5", g: "#039BE5", h: "#00ACC1", i: "#00897B", j: "#43A047",
    k: "#7CB342", l: "#C0CA33", m: "#FDD835", n: "#FFB300", o: "#FB8C00",
    p: "#F4511E", q: "#6D4C41", r: "#757575", s: "#546E7A", t: "#D32F2F",
    u: "#C2185B", v: "#7B1FA2", w: "#512DA8", x: "#303F9F", y: "#1976D2", z: "#0288D1"
};

const TransactionHistory = () => {
    const { user } = useAuth();
    const [groupedData, setGroupedData] = useState({});
    const navigation = useNavigation();

    useLayoutEffect(() => {
        navigation.setOptions({
            headerTitle: "Transaction History",
        });
    }, [navigation]);

    useFocusEffect(
        useCallback(() => {
            const fetchTransactions = async () => {
                if (!user?.uid) return;

                const docRef = firestore().collection("transactions").doc(decryptData(user.uid));
                const docSnap = await docRef.get();

                if (docSnap.exists) {
                    const data = decryptData(docSnap.data());
                    const incomes = data.income || [];
                    const expenses = data.expense || [];

                    const allTransactions = [
                        ...incomes.map((tx) => ({ ...tx, type: "income" })),
                        ...expenses.map((tx) => ({ ...tx, type: "expense" })),
                    ];

                    allTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));

                    const grouped = {};

                    allTransactions.forEach((tx) => {
                        const month = moment(tx.date).format("MMMM YYYY");
                        if (!grouped[month]) {
                            grouped[month] = { transactions: [], income: 0, expense: 0 };
                        }

                        grouped[month].transactions.push(tx);

                        if (tx.type === "income") grouped[month].income += tx.amount;
                        if (tx.type === "expense") grouped[month].expense += tx.amount;
                    });

                    setGroupedData(grouped);
                }
            };

            fetchTransactions();
        }, [user?.uid])
    );

    return (
        <ScrollView>
            <View style={styles.container}>
                {Object.keys(groupedData).length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No data here</Text>
                    </View>
                ) : (
                    Object.keys(groupedData).map((month) => (
                        <View key={month} style={styles.monthBlock}>
                            <View style={styles.monthHeader}>
                                <Text style={styles.monthTitle}>{month}</Text>
                                <View>
                                    <Text style={styles.summary}>
                                        Income:{" "}
                                        <Text style={styles.incomeAmount}>
                                            + ₹{groupedData[month].income.toFixed()}
                                        </Text>
                                    </Text>
                                    <Text style={styles.summary}>
                                        Expense:{" "}
                                        <Text style={styles.expenseAmount}>
                                            - ₹{groupedData[month].expense.toFixed()}
                                        </Text>
                                    </Text>
                                </View>
                            </View>

                            {groupedData[month].transactions.map((tx, i) => (
                                <View key={i} style={styles.transactionRow}>
                                    <View
                                        style={[
                                            styles.circle,
                                            {
                                                backgroundColor:
                                                    alphabetColors[tx?.category[0]?.toLowerCase()] || "#C68EFD",
                                            },
                                        ]}
                                    >
                                        <Text style={styles.circleText}>
                                            {tx.category[0].toUpperCase()}
                                        </Text>
                                    </View>

                                    <View style={{ flex: 1, marginLeft: 10 }}>
                                        <Text style={styles.category}>{tx.category}</Text>
                                        <Text style={styles.date}>
                                            {moment(tx.date).format("MMM D, YYYY")}
                                        </Text>
                                    </View>

                                    <Text
                                        style={[
                                            styles.amount,
                                            tx.type === "income" ? styles.income : styles.expense,
                                        ]}
                                    >
                                        {tx.type === "income"
                                            ? `+ ₹${tx.amount}`
                                            : `- ₹${tx.amount}`}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    ))
                )}
            </View>
        </ScrollView>
    );
};

export default TransactionHistory;

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#fff",
        paddingBottom: 20,
    },
    monthBlock: {
        marginBottom: 10,
    },
    monthHeader: {
        backgroundColor: "#EFEFEF",
        padding: 10,
        paddingHorizontal: 15,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    monthTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#222",
    },
    summary: {
        fontSize: 14,
        color: "#333",
    },
    incomeAmount: {
        color: "green",
        fontWeight: "500",
        fontSize: 16,
    },
    expenseAmount: {
        color: "red",
        fontWeight: "500",
        fontSize: 16,
    },
    transactionRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 10,
        paddingHorizontal: 15,
    },
    circle: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: "center",
        alignItems: "center",
    },
    circleText: {
        color: "#fff",
        fontSize: 24,
        fontWeight: "500",
        textTransform: "uppercase",
    },
    category: {
        fontSize: 16,
        fontWeight: "500",
        textTransform: "capitalize",
        color: "#222",
    },
    date: {
        fontSize: 12,
        color: "#777",
    },
    amount: {
        fontSize: 18,
        fontWeight: "600",
    },
    income: {
        color: "green",
    },
    expense: {
        color: "red",
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 50,
        backgroundColor: "#f4f4f4",
    },
    emptyText: {
        fontSize: 16,
        color: "#666",
    },

});
