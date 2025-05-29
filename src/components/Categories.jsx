// Categories.js (React Native CLI version)

import React, { useEffect, useLayoutEffect, useState } from 'react';
import {
    FlatList,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Image,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import firestore from '@react-native-firebase/firestore';

import CustomHeader from '../components/CustomHeader';
import { useAuth } from '../../context/AuthContext';
import { decryptData } from '../utils/encryption';

const Categories = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { type = 'income' } = route.params || {};
    const [categories, setCategories] = useState([]);
    const { user, setNotification } = useAuth();

    useLayoutEffect(() => {
        navigation.setOptions({
            headerTitle: type === 'expense' ? 'Expense Category' : 'Income Category',
            headerRight: () => (
                <TouchableOpacity
                    style={{ marginRight: 15 }}
                    onPress={() => navigation.navigate('NewCategory', { type })}
                >
                    <Ionicons name="add" size={24} color="black" />
                </TouchableOpacity>
            ),
        });
    }, [navigation, type]);

    useEffect(() => {
        if (!user?.uid) return;
        const ref = firestore().collection('categories').doc(decryptData(user.uid));

        const unsubscribe = ref.onSnapshot(docSnap => {
            if (docSnap.exists) {
                const data = decryptData(docSnap.data());
                const filtered = (data.category || []).filter(item => item.type === type);
                setCategories(filtered);
            }
        });

        return () => unsubscribe();
    }, [user, type]);

    const handleDelete = async (categoryToDelete) => {
        try {
            const transactionRef = firestore().collection('transactions').doc(user.uid);
            const transactionSnap = await transactionRef.get();
            if (transactionSnap.exists) {
                const data = transactionSnap.data();
                const allTransactions = [...(data?.income || []), ...(data?.expense || [])];

                const isUsed = allTransactions.some(
                    t =>
                        t.category?.toLowerCase() === categoryToDelete.category?.toLowerCase() &&
                        t.type === categoryToDelete.type
                );

                if (isUsed) {
                    setNotification({
                        msg: 'This category is used in transactions.',
                        type: 'error',
                    });
                    return;
                }
            }

            const categoryRef = firestore().collection('categories').doc(user.uid);
            const categorySnap = await categoryRef.get();
            if (!categorySnap.exists) return;

            const data = categorySnap.data();
            const updated = (data.category || []).filter(
                cat =>
                    !(
                        cat.category.toLowerCase() === categoryToDelete.category.toLowerCase() &&
                        cat.type === categoryToDelete.type
                    )
            );

            await categoryRef.update({ category: updated });
            setNotification({ msg: 'Category deleted successfully.', type: 'success' });
        } catch (error) {
            console.error('Delete error:', error);
            setNotification({ msg: 'Failed to delete category.', type: 'error' });
        }
    };

    return (
        <View style={styles.container}>
            <CustomHeader
                title={type === 'expense' ? 'Expense Category' : 'Income Category'}
                action={
                    <TouchableOpacity
                        style={{ marginRight: 15 }}
                        onPress={() => navigation.navigate('NewCategory', { type })}
                    >
                        <Image
                            source={require('../../assets/add.png')}
                            style={styles.icon}
                            resizeMode="contain"
                        />
                    </TouchableOpacity>
                }
            />
            {/* <ScrollView> */}
                <FlatList
                    data={categories}
                    keyExtractor={(item, index) => index.toString()}
                    contentContainerStyle={{ paddingHorizontal: 10, paddingBottom: 20 }}
                    renderItem={({ item }) => (
                        <View style={styles.itemRow}>
                            <Text style={styles.itemText}>{item?.category}</Text>
                            <TouchableOpacity onPress={() => handleDelete(item)} style={styles.rightIcons}>
                                {/* <MaterialIcons name="delete-outline" size={24} color="red" /> */}
                                <Image
                                    source={require('../../assets/delete.png')}
                                    style={styles.icon}
                                    resizeMode="contain"
                                />
                            </TouchableOpacity>
                        </View>
                    )}
                    ListEmptyComponent={
                        <Text style={{ textAlign: 'center', marginTop: 30 }}>
                            No {type} categories found.
                        </Text>
                    }
                />
            {/* </ScrollView> */}
        </View>
    );
};

export default Categories;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    itemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        borderBottomColor: '#eee',
        borderBottomWidth: 1,
    },
    itemText: {
        flex: 1,
        fontSize: 16,
        marginLeft: 10,
        textTransform: 'capitalize',
    },
    rightIcons: {
        flexDirection: 'row',
        gap: 15,
    },
    icon: {
        width: 24,
        height: 24,
    },
});
