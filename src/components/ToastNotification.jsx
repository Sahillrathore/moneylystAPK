import { StyleSheet, Text, View, Animated } from "react-native";
import React, { useEffect } from "react";
import { useAuth } from "../../context/AuthContext";

const ToastNotification = () => {
    const { notification, setNotification } = useAuth();

    
    useEffect(() => {
        const id = setTimeout(() => {
            setNotification(null);
        }, 2000);
        return () => clearTimeout(id);
    }, [notification]);
    
    if (!notification) return null; // Optional: to prevent rendering if there's no notification
    
    return (
        <View style={styles.container}>
            <View
                style={[
                    styles.toastBox,
                    notification?.type === "error" ? styles.errorBox : styles.successBox,
                ]}
            >
                <View
                    style={[
                        styles.iconWrapper,
                        notification?.type === "error"
                            ? styles.errorIcon
                            : styles.successIcon,
                    ]}
                >
                    {/* {notification?.type === "success" ? 
                        <FontAwesome name="check-circle" size={16} color="white" /> :
                        <FontAwesome name="exclamation-triangle" size={16} color="white" />
                    } */}
                </View>
                <Text style={styles.message}>{notification?.msg}</Text>
            </View>
        </View>
    );
};

export default ToastNotification;

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        top: 40,
        left: 0,
        right: 0,
        alignItems: "center",
        zIndex: 999,
    },
    toastBox: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: "#ffffff",
        maxWidth: 310,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
    },
    successBox: {
        backgroundColor: "#d1fae5", // green-100
    },
    errorBox: {
        backgroundColor: "#fee2e2", // red-100
    },
    iconWrapper: {
        width: 32,
        height: 32,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 8,
    },
    successIcon: {
        backgroundColor: "#16a34a", // green-600
    },
    errorIcon: {
        backgroundColor: "#dc2626", // red-600
    },
    message: {
        fontSize: 16,
        flex: 1,
    },
});
