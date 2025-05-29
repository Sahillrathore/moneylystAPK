import React from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import CustomHeader from '../components/CustomHeader';

const settings = [
    {
        title: 'Category/Repeat',
        items: [
            { label: 'Income Category Setting', route: 'Categories', params: { type: 'income' } },
            { label: 'Expenses Category Setting', route: 'Categories', params: { type: 'expense' } },
            { label: 'Manage Lenders', route: 'ManageLenders' },
            // { label: 'Budget Setting', route: 'BudgetSetting' },
        ],
    },
    {
        title: 'Configuration',
        items: [
            { label: 'Main Currency Setting', value: 'INR (₹)', route: 'Configuration' },
            { label: 'Start Screen (Daily/Calendar)', value: 'Daily', route: 'Configuration' },
            { label: 'Monthly Start Date', value: 'Every 1', route: 'Configuration' },
        ],
    },
];
  
const Configuration = () => {
    const navigation = useNavigation();

    return (
        <View style={{ flex: 1 }}>
            <CustomHeader title="Configuration" />
            <ScrollView style={styles.container}>
                {settings.map((section, i) => (
                    <View key={i} style={styles.section}>
                        <Text style={styles.sectionTitle}>{section.title}</Text>
                        {section.items.map((item, idx) => (
                            <TouchableOpacity
                                key={idx}
                                style={styles.row}
                                onPress={() => navigation.navigate(item.route, item.params || {})}
                            >
                                <Text style={styles.label}>{item.label}</Text>
                                {item.value && (
                                    <Text
                                        style={[
                                            styles.value,
                                            item.value === 'OFF' ||
                                                item.value === 'Sunday' ||
                                                item.value === 'Daily' ||
                                                item.value.startsWith('Every')
                                                ? styles.redText
                                                : {},
                                        ]}
                                    >
                                        {item.value}
                                    </Text>
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                ))}
            </ScrollView>
        </View>
    );
};

export default Configuration;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 15,
    },
    section: {
        marginBottom: 25,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#888',
        paddingVertical: 6,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e5e5',
        marginBottom: 5,
    },
    row: {
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    label: {
        fontSize: 16,
        color: '#111',
    },
    value: {
        fontSize: 14,
        color: '#555',
    },
    redText: {
        color: '#d00',
    },
});
