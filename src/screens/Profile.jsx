import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { useAuth } from "../../context/AuthContext";
import CustomHeader from "../components/CustomHeader";

const ProfileScreen = () => {
    const { user } = useAuth();

    return (
        <View style={styles.container}>
            <CustomHeader title="Profile" />

            <View style={styles.profileContainer}>
                {/* Placeholder avatar */}
                <Image
                    source={require("../../assets/profile.png")} // Replace with your own or use a URI
                    style={styles.avatar}
                />

                <Text style={styles.username}>
                    {user?.username || user?.name || "User"}
                </Text>
                <Text style={styles.email}>{user?.email}</Text>
            </View>

            <View style={styles.card}>
                <View style={styles.infoRow}>
                    <Text style={styles.label}>Username</Text>
                    <Text style={styles.value}>{user?.username || user?.name}</Text>
                </View>

                <View style={styles.infoRow}>
                    <Text style={styles.label}>Email</Text>
                    <Text style={styles.value}>{user?.email || "Not available"}</Text>
                </View>

                <View style={styles.infoRow}>
                    <Text style={styles.label}>Phone Number</Text>
                    <Text style={styles.value}>{user?.mobile || "Not available"}</Text>
                </View>
            </View>
        </View>
    );
};

export default ProfileScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f0f2f5",
    },
    profileContainer: {
        alignItems: "center",
        paddingVertical: 30,
        backgroundColor: "#ffffff",
        marginBottom: 10,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        elevation: 3,
    },
    avatar: {
        width: 90,
        height: 90,
        borderRadius: 45,
        marginBottom: 10,
    },
    username: {
        fontSize: 20,
        fontWeight: "600",
    },
    email: {
        fontSize: 14,
        color: "#777",
        marginTop: 4,
    },
    card: {
        margin: 20,
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 20,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 4,
    },
    infoRow: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        color: "#888",
        marginBottom: 4,
    },
    value: {
        fontSize: 16,
        fontWeight: "500",
        color: "#222",
    },
});
