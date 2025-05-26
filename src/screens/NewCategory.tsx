import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';

import CustomHeader from '../components/CustomHeader';
import { useAuth } from '../../context/AuthContext';

type RouteParams = {
    params: {
        type?: 'income' | 'expense';
    };
};

const NewCategory = () => {
    const navigation = useNavigation();
    const route = useRoute<RouteProp<RouteParams, 'params'>>();
    const { user } = useAuth();

    const categoryType = route.params?.type || 'income';
    const [categoryName, setCategoryName] = useState('');

    const handleSave = async () => {
        if (!categoryName.trim()) {
            Alert.alert('Validation', 'Please enter a category name.');
            return;
        }

        try {
            const docRef = firestore().collection('categories').doc(user?.uid);
            const docSnap = await docRef.get();

            let updatedCategories: { category: string; type: string }[] = [];

            if (docSnap.exists) {
                const data = docSnap.data();
                updatedCategories = [...(data?.category || [])];
            }

            const isDuplicate = updatedCategories.some(
                (item) =>
                    item.category.toLowerCase() === categoryName.trim().toLowerCase() &&
                    item.type === categoryType
            );

            if (isDuplicate) {
                Alert.alert('Duplicate', 'This category already exists.');
                return;
            }

            updatedCategories.push({
                category: categoryName.trim(),
                type: categoryType,
            });

            await docRef.set({ category: updatedCategories }, { merge: true });

            console.log('Category saved successfully');
            navigation.goBack();
        } catch (err) {
            console.error('Error saving category:', err);
            Alert.alert('Error', 'Failed to save category');
        }
    };

    return (
        <View style={{ flex: 1 }}>
            <CustomHeader title={categoryType === 'expense' ? 'Expense Category' : 'Income Category'} />
            <View style={styles.container}>
                <Text style={styles.label}>Category Name</Text>
                <TextInput
                    style={styles.input}
                    placeholder="e.g. Shopping, Salary"
                    placeholderTextColor="#6e6d6b"
                    value={categoryName}
                    onChangeText={setCategoryName}
                />
                <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                    <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default NewCategory;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    label: {
        fontSize: 16,
        marginBottom: 6,
        color: '#333',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        marginBottom: 20,
        fontSize: 16,
        color: '#000',
    },
    saveButton: {
        backgroundColor: '#26897C',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
