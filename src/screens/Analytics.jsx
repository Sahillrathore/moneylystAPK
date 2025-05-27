import React, { useEffect, useState, useMemo } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import { PieChart, BarChart } from "react-native-chart-kit";
import moment from "moment";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useAuth } from "../../context/AuthContext";
import firestore from "@react-native-firebase/firestore";
import { decryptData } from "../utils/encryption";

const screenWidth = Dimensions.get("window").width;
const chartConfig = {
    backgroundGradientFrom: "#fff",
    backgroundGradientTo: "#fff",
    color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    decimalPlaces: 2,
};

const filterTransactionsByDate = (transactions, filterType, customRange = null) => {
    const now = moment();
    let startDate;

    switch (filterType) {
        case "7days":
            startDate = now.clone().subtract(7, "days");
            break;
        case "30days":
            startDate = now.clone().subtract(30, "days");
            break;
        case "thisMonth":
            startDate = now.clone().startOf("month");
            break;
        case "lastMonth":
            startDate = now.clone().subtract(1, "month").startOf("month");
            break;
        case "custom":
            if (customRange) {
                const start = moment(customRange.start);
                const end = moment(customRange.end);
                return transactions.filter((tx) =>
                    moment(tx.date).isBetween(start, end, null, "[]")
                );
            }
            break;
        default:
            return transactions;
    }

    return transactions.filter((tx) => moment(tx.date).isSameOrAfter(startDate));
};

const AnalyticsScreen = () => {
    const { user } = useAuth();
    const [transactions, setTransactions] = useState([]);
    const [filter, setFilter] = useState("30days");
    const [customRange, setCustomRange] = useState({ start: null, end: null });
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [dateField, setDateField] = useState("start");

    useEffect(() => {
        const fetchTransactions = async () => {
            if (!user?.uid) return;
            try {
                const docRef = firestore().collection("transactions").doc(decryptData(user.uid));
                const docSnap = await docRef.get();

                if (docSnap.exists) {
                    const data = decryptData(docSnap.data());
                    const incomes = data?.income || [];
                    const expenses = data?.expense || [];

                    const combined = [
                        ...incomes.map((tx) => ({ ...tx, type: "income" })),
                        ...expenses.map((tx) => ({ ...tx, type: "expense" })),
                    ];

                    combined.sort((a, b) => new Date(b.date) - new Date(a.date));
                    setTransactions(combined);
                }
            } catch (err) {
                console.error("Error fetching transactions:", err);
            }
        };
        fetchTransactions();
    }, [user]);

    const filteredData = useMemo(() => {
        return filterTransactionsByDate(transactions, filter, customRange);
    }, [transactions, filter, customRange]);

    const totalIncome = useMemo(
        () => filteredData.filter((tx) => tx.type === "income").reduce((acc, tx) => acc + tx.amount, 0),
        [filteredData]
    );

    const totalExpense = useMemo(
        () => filteredData.filter((tx) => tx.type === "expense").reduce((acc, tx) => acc + tx.amount, 0),
        [filteredData]
    );

    const getPieChartData = () => {
        const income = totalIncome;
        const expense = totalExpense;
        return [
            {
                name: "Income",
                amount: income,
                color: "#4CAF50",
                legendFontColor: "#7F7F7F",
                legendFontSize: 15,
            },
            {
                name: "Expense",
                amount: expense,
                color: "#F44336",
                legendFontColor: "#7F7F7F",
                legendFontSize: 15,
            },
        ];
    };

    const getCategorySummary = () => {
        const categorySummary = {};
        filteredData.forEach((tx) => {
            if (!categorySummary[tx.category]) {
                categorySummary[tx.category] = { income: 0, expense: 0 };
            }
            categorySummary[tx.category][tx.type] += tx.amount;
        });
        return Object.entries(categorySummary);
    };

    const getBarChartData = () => {
        const dailyTotals = {};
        filteredData.forEach((tx) => {
            const day = moment(tx.date).format("ddd");
            dailyTotals[day] = (dailyTotals[day] || 0) + tx.amount;
        });
        const labels = Object.keys(dailyTotals);
        const data = Object.values(dailyTotals);
        return { labels, datasets: [{ data }] };
    };

    const getCategoryData = (type) => {
        const stats = {};
        filteredData.filter((tx) => tx.type === type).forEach((tx) => {
            stats[tx.category] = (stats[tx.category] || 0) + tx.amount;
        });
        const max = Math.max(...Object.values(stats));
        return Object.entries(stats).map(([category, amount]) => ({
            category,
            amount,
            percentage: ((amount / max) * 100).toFixed(1)
        }));
    };

    return (
        <ScrollView style={styles.container}>
            {/* <Text style={styles.header}>Analytics</Text> */}

            <View style={styles.filterRow}>
                {["7days", "30days", "thisMonth", "lastMonth", ].map((key) => (
                    <TouchableOpacity
                        key={key}
                        onPress={() => setFilter(key)}
                        style={[styles.filterButton, filter === key ? styles.activeButton : styles.inactiveButton]}
                    >
                        <Text style={styles.buttonText}>{key.replace(/([a-z])([A-Z])/g, "$1 $2")}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {filter === "custom" && (
                <View style={styles.datePickers}>
                    <TouchableOpacity onPress={() => { setDateField("start"); setShowDatePicker(true); }}>
                        <Text style={styles.dateText}>Start: {customRange.start ? moment(customRange.start).format("DD MMM") : "Pick Date"}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => { setDateField("end"); setShowDatePicker(true); }}>
                        <Text style={styles.dateText}>End: {customRange.end ? moment(customRange.end).format("DD MMM") : "Pick Date"}</Text>
                    </TouchableOpacity>
                </View>
            )}

            {showDatePicker && (
                <DateTimePicker
                    value={new Date()}
                    mode="date"
                    display="default"
                    onChange={(event, selectedDate) => {
                        setShowDatePicker(false);
                        if (selectedDate) {
                            setCustomRange((prev) => ({ ...prev, [dateField]: selectedDate }));
                        }
                    }}
                />
            )}

            <View style={styles.summaryCards}>
                <View style={styles.card}><Text style={styles.cardTitle}>Income</Text><Text style={styles.cardAmount}>₹{totalIncome}</Text></View>
                <View style={styles.card}><Text style={styles.cardTitle}>Expense</Text><Text style={styles.cardAmount}>₹{totalExpense}</Text></View>
            </View>

            <View style={styles.chartRow}>
                <View style={styles.halfBox}>
                    <Text style={styles.sectionTitle}>Income vs Expense</Text>
                    <PieChart
                        data={getPieChartData()}
                        width={screenWidth / 2 - 32}
                        height={180}
                        chartConfig={chartConfig}
                        accessor="amount"
                        backgroundColor="transparent"
                        paddingLeft="35"
                        hasLegend={false}
                    />
                </View>
                <View style={styles.halfBox}>
                    <Text style={styles.sectionTitle}>By Category</Text>
                    {getCategorySummary().map(([cat, val]) => (
                        <View key={cat} style={styles.categoryRow}>
                            <Text style={{ fontWeight: "500" }}>{cat}</Text>
                            <Text>₹{val.income} / ₹{val.expense}</Text>
                        </View>
                    ))}
                </View>
            </View>

            <Text style={styles.sectionTitle}>Income Breakdown</Text>
            {getCategoryData("income").map((item) => (
                <View key={item.category} style={styles.barRow}>
                    <Text style={styles.barLabel}>{item.category}</Text>
                    <View style={styles.barBackground}>
                        <View style={[styles.barFill, { width: `${item.percentage}%` }]} />
                    </View>
                    <Text style={styles.barAmount}>₹{item.amount.toFixed(1)}</Text>
                </View>
            ))}

            <Text style={styles.sectionTitle}>Expense Breakdown</Text>
            {getCategoryData("expense").map((item) => (
                <View key={item.category} style={styles.barRow}>
                    <Text style={styles.barLabel}>{item.category}</Text>
                    <View style={styles.barBackground}>
                        <View style={[styles.barFill, { width: `${item.percentage}%` }]} />
                    </View>
                    <Text style={styles.barAmount}>₹{item.amount.toFixed(1)}</Text>
                </View>
            ))}

            <Text style={styles.sectionTitle}>Daily Totals</Text>
            <BarChart
                data={getBarChartData()}
                width={screenWidth - 32}
                height={220}
                chartConfig={chartConfig}
                fromZero
                showValuesOnTopOfBars
                style={{ marginVertical: 8, borderRadius: 8 }}
            />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: "#f5f5f5",
    },
    header: {
        fontSize: 24,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 16,
    },
    filterRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "center",
        marginBottom: 16,
    },
    filterButton: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        margin: 4,
    },
    activeButton: {
        backgroundColor: "#2563EB",
    },
    inactiveButton: {
        backgroundColor: "#999",
        color: "#888"
    },
    buttonText: {
        color: "#fff",
        textTransform: "capitalize",
    },
    datePickers: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginBottom: 16,
    },
    dateText: {
        color: "#1D4ED8",
    },
    summaryCards: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 16,
    },
    card: {
        flex: 1,
        margin: 4,
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 16,
        width: '100%',
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
        backgroundColor: "#26897C",

    },
    cardTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#ffffff",
    },
    cardAmount: {
        fontSize: 20,
        fontWeight: "bold",
        marginTop: 8,
        color: "#fff",
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 8,
        marginTop: 8,
    },
    chartRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginVertical: 16,
    },
    halfBox: {
        width: screenWidth / 2 - 24,
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    categoryRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 4,
    },

    totalsBox: {
        marginBottom: 16,
    },
    incomeText: {
        color: "green",
        fontSize: 16,
        fontWeight: "600",
    },
    expenseText: {
        color: "red",
        fontSize: 16,
        fontWeight: "600",
    },
    barRow: {
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 4,
    },
    barLabel: {
        width: 80,
        fontSize: 14,
    },
    barBackground: {
        flex: 1,
        height: 8,
        backgroundColor: "#E0E0E0",
        borderRadius: 4,
        marginHorizontal: 8,
    },
    barFill: {
        height: 8,
        backgroundColor: "#26897C",
        borderRadius: 4,
    },
    barAmount: {
        width: 60,
        fontSize: 14,
        textAlign: "right",
    },
});

export default AnalyticsScreen;