import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import firestore from "@react-native-firebase/firestore";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../../context/AuthContext";
import { decryptData } from "../utils/encryption";

const LoanSummary = () => {
    const { user } = useAuth();
    const navigation = useNavigation();

    const [lenders, setLenders] = useState([]);
    const [lenderSums, setLenderSums] = useState({});

    useEffect(() => {
        if (!user) return;

        const fetchData = async () => {
            try {
                const lendersSnap = await firestore().collection("categories").doc(decryptData(user.uid)).get();
                const txnsSnap = await firestore().collection("transactions").doc(decryptData(user.uid)).get();

                const lenderList = lendersSnap.exists ? decryptData(lendersSnap?.data())?.lenders : [];
                const txnData = txnsSnap.exists ? decryptData(txnsSnap?.data()) : { income: [], expense: [] };

                const allTxns = [...(txnData?.income || []), ...(txnData?.expense || [])];
                const loanTxns = allTxns?.filter(txn => txn?.category === "loan");

                const loanTotals = {};
                lenderList?.forEach((lender) => {
                    const name = lender?.name || lender;
                    const lenderTxns = loanTxns?.filter(txn => txn.lenderName === name);

                    const totalExpense = lenderTxns?.filter(t => t.type === "expense")?.reduce((sum, t) => sum + (t.amount || 0), 0);
                    const totalIncome = lenderTxns?.filter(t => t.type === "income")?.reduce((sum, t) => sum + (t.amount || 0), 0);

                    loanTotals[name] = totalExpense - totalIncome;
                });

                setLenders(lenderList);
                setLenderSums(loanTotals);
            } catch (err) {
                console.error("Error fetching lender loans:", err);
            }
        };

        fetchData();
    }, [user]);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Loan Summary</Text>

            <FlatList
                data={lenders}
                keyExtractor={(item) => item.name || item}
                renderItem={({ item }) => {
                    const name = item.name || item;
                    return (
                        <TouchableOpacity
                            style={styles.card}
                            onPress={() =>
                                navigation.navigate("LenderLoanDetails", { lenderName: name })
                            }
                        >
                            <Text style={styles.name}>{name}</Text>
                            <Text style={styles.amount}>Total Loan: ₹{lenderSums[name] || 0}</Text>
                        </TouchableOpacity>
                    );
                }}
                contentContainerStyle={{ paddingBottom: 50, flexGrow: 1 }}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No data here</Text>
                    </View>
                }
            />
        </View>
    );
};

export default LoanSummary;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: "#f4f4f4",
    },
    title: {
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 16,
    },
    card: {
        backgroundColor: "white",
        padding: 16,
        borderRadius: 10,
        marginBottom: 12,
        elevation: 3,
    },
    name: {
        fontSize: 18,
        fontWeight: "600",
    },
    amount: {
        marginTop: 6,
        color: "#333",
    },
});
