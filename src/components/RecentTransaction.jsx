import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
// import { useAuth } from "../context/AuthContext";
import firestore from "@react-native-firebase/firestore";

import { decryptData } from "../utils/encryption";

const alphabetColors = {
    a: "#E53935", b: "#D81B60", c: "#8E24AA", d: "#5E35B1", e: "#3949AB",
    f: "#1E88E5", g: "#039BE5", h: "#00ACC1", i: "#00897B", j: "#43A047",
    k: "#7CB342", l: "#C0CA33", m: "#FDD835", n: "#FFB300", o: "#FB8C00",
    p: "#F4511E", q: "#6D4C41", r: "#757575", s: "#546E7A", t: "#D32F2F",
    u: "#C2185B", v: "#7B1FA2", w: "#512DA8", x: "#303F9F", y: "#1976D2", z: "#0288D1",
};

const user = {
    uid: "afyPQkqgbCSMaQfHEFuDffVF1EG3"
}

const RecentTransactions = () => {
    // const { user } = useAuth();
    const navigation = useNavigation();
    const [transactions, setTransactions] = useState([]);

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                if (!user?.uid) return;

                const docRef = firestore().collection("transactions").doc(decryptData(user?.uid));
                const docSnap = await docRef.get();

                if (docSnap.exists) {
                    const data = decryptData(docSnap.data());
                    const incomes = data.income || [];
                    const expenses = data.expense || [];

                    let combinedTransactions = [
                        ...incomes.map((tx) => ({ ...tx, type: "income" })),
                        ...expenses.map((tx) => ({ ...tx, type: "expense" })),
                    ];

                    combinedTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
                    const recentFive = combinedTransactions.slice(0, 5);
                    setTransactions(recentFive);
                } else {
                    console.log("No transaction data found for this user.");
                }
            } catch (error) {
                console.error("Error fetching transactions:", error);
            }
        };

        if (user?.uid) fetchTransactions();
    }, [user?.uid]);

    return (
        <View style={styles.container}>
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Transactions History</Text>
                <TouchableOpacity
                    onPress={() => navigation.navigate("TransactionHistory")}
                >
                    <Text style={styles.seeAll}>See all</Text>
                </TouchableOpacity>
            </View>

            {transactions.length > 0 ? (
                <FlatList
                    data={transactions}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item }) => (
                        <View style={styles.row}>
                            <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
                                <View style={{
                                    width: 50,
                                    height: 50,
                                    backgroundColor: alphabetColors[item?.category[0]?.toLowerCase()] || "#C68EFD",
                                    borderRadius: 50,
                                    justifyContent: "center",
                                    alignItems: "center"
                                }}>
                                    <Text style={{ color: "white", fontSize: 28, fontWeight: "500", textTransform: "uppercase" }}>
                                        {item.category[0]}
                                    </Text>
                                </View>
                                <View>
                                    <Text style={styles.amount}>{item.category}</Text>
                                    <Text style={styles.date}>{item.date}</Text>
                                </View>
                            </View>
                            <View>
                                <Text style={[
                                    styles.amount,
                                    item.type === "income" ? styles.income : styles.expense
                                ]}>
                                    {item.type === "income"
                                        ? `+ ₹${item.amount}`
                                        : `- ₹${item.amount}`}
                                </Text>
                            </View>
                        </View>
                    )}
                />
            ) : (
                <Text style={styles.noData}>No transactions found</Text>
            )}
        </View>
    );
};

export default RecentTransactions;

const styles = StyleSheet.create({
    container: {
        padding: 15,
        borderRadius: 12,
        marginVertical: 10,
    },
    section: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 15,
        marginBottom: 15,
    },
    sectionTitle: {
        fontWeight: "500",
        fontSize: 20,
        color: "#222222"
    },
    seeAll: {
        color: "#26897C",
        fontSize: 16
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 8,
        borderBottomWidth: 0.5,
        borderColor: "#ccc",
    },
    amount: {
        fontWeight: "500",
        marginTop: 2,
        fontSize: 16
    },
    date: {
        fontSize: 12,
        color: "#777"
    },
    income: {
        color: "green"
    },
    expense: {
        color: "red"
    },
    noData: {
        textAlign: "center",
        color: "#777",
        marginTop: 20
    }
});
