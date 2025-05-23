import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { onAuthStateChanged } from '@react-native-firebase/auth';
import { onSnapshot } from '@react-native-firebase/firestore';
import { decryptData } from '../src/utils/encryption';
import { useNavigation } from '@react-navigation/native';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState(null);

    // const navigation = useNavigation();

    useEffect(() => {
        const loadUserFromStorage = async () => {
            try {
                const storedUser = await AsyncStorage.getItem('user');
                if (storedUser) {
                    setUser(JSON.parse(storedUser));
                }
            } catch (err) {
                console.error('Failed to load user from storage', err);
            } finally {
                setLoading(false);
            }
        };

        const unsubscribe = onAuthStateChanged(auth(), async (currentUser) => {
            if (currentUser) {
                const userRef = firestore().collection('users').doc(currentUser.uid);
                const unsubscribeSnapshot = onSnapshot(userRef, async (docSnap) => {
                    if (docSnap.exists) {
                        const encryptedData = docSnap.data();
                        const userData = decryptData(encryptedData);

                        setUser(userData);
                        await AsyncStorage.setItem('user', JSON.stringify(userData));

                        if (!userData?.hasOnboarded) {
                            navigation.reset({
                                index: 0,
                                routes: [{ name: 'Onboarding' }],
                            });
                        }
                    }
                    setLoading(false);
                });

                return () => unsubscribeSnapshot();
            } else {
                setUser(null);
                await AsyncStorage.removeItem('user');
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'Welcome' }],
                });
                setLoading(false);
            }
        });

        loadUserFromStorage();
        return () => unsubscribe();
    }, []);

    return (
        <AuthContext.Provider
            value={{ user, setUser, loading, setLoading, notification, setNotification }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
