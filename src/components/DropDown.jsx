import React from "react";
import { StyleSheet, Text, View } from "react-native";
import SelectDropdown from "react-native-select-dropdown";

const DropDown = ({ data, placeholder, SetFormData, keyName }) => {
    return (
        <SelectDropdown
            data={data}
            onSelect={(selectedItem, index) => {
                console.log(selectedItem, keyName);
                SetFormData((prev) => ({ ...prev, [keyName]: selectedItem }));
            }}
            renderButton={(selectedItem, isOpened) => {
                return (
                    <View style={styles.dropdownButtonStyle}>
                        <Text style={styles.dropdownButtonTxtStyle}>
                            {selectedItem || placeholder}
                        </Text>
                    </View>
                );
            }}
            renderItem={(item, index, isSelected) => {
                return (
                    <View
                        style={[
                            styles.dropdownItemStyle,
                            isSelected && { backgroundColor: "#D2D9DF" },
                        ]}
                    >
                        <Text style={styles.dropdownItemTxtStyle}>{item}</Text>
                    </View>
                );
            }}
            showsVerticalScrollIndicator={false}
            dropdownStyle={styles.dropdownMenuStyle}
        />
    );
};

export default DropDown;

const styles = StyleSheet.create({
    dropdownButtonStyle: {
        width: "100%",
        backgroundColor: "#fff",
        borderRadius: 8,
        padding: 10,
        marginTop: 5,
        borderWidth: 1,
        borderColor: "#ccc",
    },
    dropdownButtonTxtStyle: {
        flex: 1,
        fontSize: 16,
        color: "#151E26",
    },
    dropdownMenuStyle: {
        backgroundColor: "#E9ECEF",
        borderRadius: 8,
    },
    dropdownItemStyle: {
        width: "100%",
        flexDirection: "row",
        paddingHorizontal: 12,
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 10,
    },
    dropdownItemTxtStyle: {
        flex: 1,
        fontSize: 16,
        color: "#151E26",
        textTransform: "capitalize",
    },
});
