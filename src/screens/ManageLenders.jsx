import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    Alert,
    Image
} from "react-native";
import firestore from "@react-native-firebase/firestore";
import { useAuth } from "../../context/AuthContext";
import { decryptData, encryptData } from "../utils/encryption";
import CustomHeader from "../components/CustomHeader";

const ManageLenders = () => {
    const { user } = useAuth();
    const [lenders, setLenders] = useState([]);
    const [newLender, setNewLender] = useState("");

    useEffect(() => {
        const unsubscribe = fetchLenders();
        return unsubscribe;
    }, [user]);

    const fetchLenders = () => {
        const ref = firestore().collection('categories').doc(decryptData(user.uid));
        return ref.onSnapshot(docSnap => {
            if (docSnap.exists) {
                const data = decryptData(docSnap.data());
                setLenders(data.lenders || []);
                console.log(lenders);
                
            } else {
                setLenders([]);
            }
        });
    };

    const saveLenders = async (updatedLenders) => {
        const ref = firestore().collection("categories").doc(decryptData(user.uid));
        const encrypted = ({ lenders: updatedLenders });
        await ref.set(encrypted, { merge: true });
    };

    const handleAddLender = () => {
        const trimmed = newLender.trim();
        if (!trimmed) return;

        if (lenders.includes(trimmed)) {
            Alert.alert("Lender already exists.");
            return;
        }

        const updated = [...lenders, trimmed];
        setLenders(updated);
        saveLenders(updated);
        setNewLender("");
    };

    const handleDeleteLender = (name) => {
        Alert.alert(
            "Delete Lender",
            `Are you sure you want to delete "${name}"?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => {
                        const updated = lenders.filter(l => l !== name);
                        setLenders(updated);
                        saveLenders(updated);
                    }
                }
            ]
        );
    };

    return (
        <View style={styles.container}>

            <CustomHeader
                title={'Lenders'}
                action={
                    <TouchableOpacity
                        style={{ marginRight: 15 }}
                        onPress={() => navigation.navigate('NewCategory', { type })}
                    >
                        {/* <Image
                            source={require('../../assets/add.png')}
                            style={styles.icon}
                            resizeMode="contain"
                        /> */}
                    </TouchableOpacity>
                }
            />
            
            <Text style={styles.title}>Manage Lenders</Text>

            <View style={styles.inputRow}>
                <TextInput
                    style={styles.input}
                    placeholder="Enter lender name"
                    placeholderTextColor={'#999'}
                    value={newLender}
                    onChangeText={setNewLender}
                />
                <TouchableOpacity style={styles.addButton} onPress={handleAddLender}>
                    <Text style={styles.addButtonText}>Add</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={lenders}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                    <View style={styles.lenderItem}>
                        <Text style={styles.lenderText}>{item}</Text>
                        <TouchableOpacity onPress={() => handleDeleteLender(item)}>
                            <Text style={styles.deleteText}>Delete</Text>
                        </TouchableOpacity>
                    </View>
                )}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No lenders yet.</Text>
                    </View>
                }
                contentContainerStyle={{ paddingBottom: 100 }}
            />
        </View>
    );
};

export default ManageLenders;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // padding: 20,
        backgroundColor: "#f4f4f4",
    },
    title: {
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 16,
        paddingHorizontal: 20,
        marginTop: 10,
    },
    inputRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
        paddingHorizontal: 20,
        // marginTop: 10,
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        padding: 10,
        backgroundColor: "#fff",
    },
    addButton: {
        marginLeft: 10,
        backgroundColor: "#4CAF50",
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
    },
    addButtonText: {
        color: "#fff",
        fontWeight: "bold",
    },
    lenderItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        padding: 12,
        backgroundColor: "#fff",
        marginBottom: 10,
        borderRadius: 8,
        elevation: 2,
        marginHorizontal: 20,
    },
    lenderText: {
        fontSize: 16,
        color: ''
    },
    deleteText: {
        color: "red",
    },
    emptyContainer: {
        alignItems: "center",
        marginTop: 40,
    },
    emptyText: {
        color: "#666",
        fontSize: 16,
    },
    icon: {
        width: 24,
        height: 24,
    },
});
