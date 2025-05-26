// components/CustomHeader.js
import { useNavigation } from '@react-navigation/native';
import { StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';

const CustomHeader = ({ title = "Header", onRightPress = () => { }, action = "" }) => {
    const navigation = useNavigation();

    return (
        <View style={styles.header}>
            {/* Back Arrow */}
            <View style={{ display: "flex", flexDirection: "row", alignItems: "flex-start" }}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.left}>
                    {/* <Ionicons name="arrow-back" size={24} color="#333" /> */}
                    <Image
                       source={require('../../assets/arrow.png')}
                        style={styles.icon}
                        resizeMode="contain"
                    />
                </TouchableOpacity>
                <Text style={styles.title}>{title}</Text>
            </View>

            {/* Right Button */}
            <View style={{ marginLeft: -20 }}>
                {action}
            </View>
        </View>
    );
};

export default CustomHeader;

const styles = StyleSheet.create({
    header: {
        height: 60,
        width: "100%",
        backgroundColor: "#f8f8f8",
        paddingHorizontal: 16,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottomWidth: 1,
        borderBottomColor: "#ddd",
    },
    left: {
        width: 35,
        alignItems: "flex-start",
    },
    title: {
        flex: 1,
        // textAlign: "center",
        fontSize: 18,
        fontWeight: "bold",
        color: "#333",
    },
    icon: {
        width: 24,
        height: 24,
    },
});
