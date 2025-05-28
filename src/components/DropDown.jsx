import React from "react";
import { StyleSheet, Text, View } from "react-native";
import SelectDropdown from "react-native-select-dropdown";

const DropDown = ({ data = [], placeholder, SetFormData, keyName }) => {
    // Normalize value for rendering
    const getLabel = (item) => {
        if (typeof item === "string") return item;
        if (item && typeof item === "object" && item.name) return item.name;
        return "";
    };

    return (
        <SelectDropdown
            data={data}
            onSelect={(selectedItem) => {
                const label = getLabel(selectedItem);
                SetFormData((prev) => ({
                    ...prev,
                    [keyName]: label, // Store the name or string
                }));
            }}
            renderButton={(selectedItem, isOpened) => (
                <View style={styles.dropdownButtonStyle}>
                    <Text style={styles.dropdownButtonTxtStyle}>
                        {getLabel(selectedItem) || placeholder}
                    </Text>
                </View>
            )}
            renderItem={(item, index, isSelected) => (
                <View
                    style={[
                        styles.dropdownItemStyle,
                        isSelected && { backgroundColor: "#D2D9DF" },
                    ]}
                >
                    <Text style={styles.dropdownItemTxtStyle}>{getLabel(item)}</Text>
                </View>
            )}
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
        paddingVertical: 10,
        paddingHorizontal: 12,
        marginTop: 5,
        marginBottom: 4,
        borderWidth: 1,
        borderColor: "#ccc",
    },
    dropdownButtonTxtStyle: {
        flex: 1,
        fontSize: 14,
        color: "#888",
    },
    dropdownMenuStyle: {
        backgroundColor: "#E9ECEF",
        borderRadius: 8,
        maxHeight: 250,
        paddingVertical: 5,
    },
    dropdownItemStyle: {
        width: "100%",
        flexDirection: "row",
        justifyContent: "flex-start",
        alignItems: "center",
        paddingHorizontal: 12,
        paddingVertical: 14,
        minHeight: 48,
    },
    dropdownItemTxtStyle: {
        flex: 1,
        fontSize: 16,
        color: "#151E26",
        textTransform: "capitalize",
    },
});
