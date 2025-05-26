// context/AuthContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { onAuthStateChanged } from '@react-native-firebase/auth';
import { onSnapshot } from '@react-native-firebase/firestore';
import { decryptData } from '../src/utils/encryption';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth(), async (currentUser) => {
            if (currentUser) {
                const userRef = firestore().collection('users').doc(currentUser.uid);
                const unsubscribeSnapshot = onSnapshot(userRef, async (docSnap) => {
                    if (docSnap.exists) {
                        const encryptedData = docSnap.data();
                        const userData = decryptData(encryptedData);

                        setUser(userData);
                        await AsyncStorage.setItem('user', JSON.stringify(userData));
                    }
                    setLoading(false);
                });

                return () => unsubscribeSnapshot();
            } else {
                setUser(null);
                await AsyncStorage.removeItem('user');
                setLoading(false);
            }
        });

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
