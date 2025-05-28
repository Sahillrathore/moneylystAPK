import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';
// import { useAuth } from '../context/AuthContext';
import firestore from '@react-native-firebase/firestore';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useFocusEffect, useNavigation } from "@react-navigation/native";


const BankCards = ({ user }) => {
    const [accounts, setAccounts] = useState([]);
    // const { user } = useAuth();
    const navigation = useNavigation();

    useFocusEffect(
        useCallback(() => {
            const fetchBanks = async () => {
                if (!user) return;
                const userRef = firestore().collection("banks").doc(user.uid);
                const docSnap = await userRef.get();
                if (docSnap.exists) {
                    const banksData = docSnap.data();
                    setAccounts(banksData?.banks || []);
                }
            };

            fetchBanks();
        }, [])
    );

    return (
        <TouchableOpacity style={styles.container} activeOpacity={0.8}>
            <View style={styles.headerRow}>
                <Text style={styles.title}>Accounts</Text>
                <Text style={styles.arrow}
                    onPress={() => navigation.navigate("Accounts")}
                >›</Text>
            </View>

            <View style={styles.accountGrid}>
                {accounts.map((account, index) => (
                    <View key={index} style={[styles.item, { width: '48%' }]}>
                        <View style={[
                            styles.iconCircle,
                            { backgroundColor: account?.bgColor || '#ccc' }
                        ]}>
                            {account?.accountType === "Cash" ? (
                                // <FontAwesome5 name="money-bill" size={24} color="#26897C" />
                                <Image
                                    // source={{ uri: 'https://cdn-icons-png.flaticon.com/512/190/190411.png' }}
                                    source={require('../../assets/bank.png')}
                                    style={styles.icon}
                                    resizeMode="contain"
                                />
                            ) : (
                                // <MaterialCommunityIcons name="bank" size={24} color="#26897C" />
                                <Image
                                    // source={{ uri: 'https://cdn-icons-png.flaticon.com/512/190/190411.png' }}
                                    source={require('../../assets/bank.png')}
                                    style={styles.icon}
                                    resizeMode="contain"
                                />
                            )}
                        </View>
                        <View style={{ flex: '' }}>
                            <Text style={styles.accountName} numberOfLines={1} ellipsizeMode="tail">
                                {account?.accountName}
                            </Text>
                            <Text style={styles.accountAmount}>₹{account?.initialBalance}</Text>
                        </View>
                    </View>
                ))}
            </View>
        </TouchableOpacity>
    );
};

export default BankCards;

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#f2f2f2',
        borderRadius: 18,
        padding: 20,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: '#000',
    },
    arrow: {
        fontSize: 20,
        color: '#999',
    },
    accountGrid: {
        marginTop: 5,
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        gap: 10,
    },
    item: {
        flexDirection: "row",
        alignItems: 'center',
        gap: 10,
        borderRadius: 8,
        marginBottom: 15,
    },
    iconCircle: {
        width: 50,
        height: 50,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    accountName: {
        fontSize: 18,
        color: '#333',
        flexShrink: 1,
    },
    accountAmount: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#000',
    },
    icon: {
        width: 24,
        height: 24,
    },
});
