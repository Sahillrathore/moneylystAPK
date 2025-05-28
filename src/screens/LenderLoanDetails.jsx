import React, { useEffect, useState, useMemo } from "react";
import {
    View,
    Text,
    TextInput,
    FlatList,
    StyleSheet,
    ScrollView,
} from "react-native";
import firestore from "@react-native-firebase/firestore";
import { useRoute } from "@react-navigation/native";
import { useAuth } from "../../context/AuthContext";
import { decryptData } from "../utils/encryption";

const LenderLoanDetails = () => {
    const route = useRoute();
    const { lenderName } = route.params;
    const { user } = useAuth();

    const [loans, setLoans] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        if (!user) return;

        const fetchLoans = async () => {
            const txnsSnap = await firestore()
                .collection("transactions")
                .doc(decryptData(user.uid))
                .get();

            if (!txnsSnap.exists) return;

            const data = decryptData(txnsSnap.data());
            const all = [...(data.income || []), ...(data.expense || [])];
            const filtered = all.filter(
                (txn) => txn.category === "loan" && txn.lenderName === lenderName
            );

            setLoans(filtered);
        };

        fetchLoans();
    }, [user, lenderName]);

    const filteredLoans = useMemo(() => {
        if (!searchTerm.trim()) return loans;

        const term = searchTerm.toLowerCase();

        return loans.filter((txn) => {
            const account = txn.accountName?.toLowerCase() || "";
            const description = txn.description?.toLowerCase() || "";
            const amount = String(txn.amount || "");

            return (
                account.includes(term) ||
                description.includes(term) ||
                amount.includes(term)
            );
        });
    }, [searchTerm, loans]);

    const renderItem = ({ item }) => {
        const date = new Date(item.date);
        const time = new Date(item.createdAt);
        return (
            <View style={styles.itemContainer}>
                <Text style={styles.type}>{item.type.toUpperCase()}</Text>
                <Text style={[styles.amount, item.type === "income" ? styles.income : styles.expense]}>
                    {item.type === "income" ? "+" : "-"}₹{item.amount.toLocaleString()}
                </Text>
                <Text style={styles.detail}>Bank: {item.accountName || "--"}</Text>
                <Text style={styles.detail}>
                    Date: {date.toLocaleDateString()} at {time.toLocaleTimeString()}
                </Text>
                <Text style={styles.detail}>Description: {item.description || "--"}</Text>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Loans from {lenderName}</Text>
            <TextInput
                style={styles.searchInput}
                placeholder="Search amount, account, description..."
                value={searchTerm}
                onChangeText={setSearchTerm}
            />

            {filteredLoans.length === 0 ? (
                <Text style={styles.noData}>No loan transactions found.</Text>
            ) : (
                <FlatList
                    data={filteredLoans}
                    keyExtractor={(item, index) => `${item.transactionId}-${index}`}
                    renderItem={renderItem}
                    contentContainerStyle={{ paddingBottom: 100 }}
                />
            )}
        </View>
    );
};

export default LenderLoanDetails;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: "#f5f5f5",
    },
    header: {
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 12,
    },
    searchInput: {
        backgroundColor: "#fff",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#ccc",
        paddingHorizontal: 12,
        paddingVertical: 10,
        marginBottom: 16,
    },
    itemContainer: {
        backgroundColor: "#fff",
        borderRadius: 10,
        padding: 14,
        marginBottom: 12,
        elevation: 2,
    },
    type: {
        fontSize: 16,
        fontWeight: "bold",
        textTransform: "capitalize",
        color: "#333",
    },
    amount: {
        fontSize: 18,
        fontWeight: "bold",
        marginVertical: 4,
    },
    income: {
        color: "green",
    },
    expense: {
        color: "red",
    },
    detail: {
        fontSize: 14,
        color: "#555",
    },
    noData: {
        marginTop: 60,
        textAlign: "center",
        color: "#999",
        fontSize: 16,
    },
});
