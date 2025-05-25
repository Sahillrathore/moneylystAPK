import React from 'react';
import {
    Alert,
    Image,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import auth from '@react-native-firebase/auth';
import { useNavigation } from '@react-navigation/native';

import { useAuth } from '../../context/AuthContext';
import { decryptData } from '../utils/encryption';

const More = () => {
    const { user, setUser } = useAuth();
    const navigation = useNavigation();

    const handleLogout = () => {
        Alert.alert('Logout', 'Are you sure you want to logout?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Logout',
                style: 'destructive',
                onPress: async () => {
                    await auth().signOut();
                    setUser(null);
                    navigation.replace('Login');
                },
            },
        ]);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.avatarSection}>
                <Image source={require('../../assets/profile.png')} style={styles.avatar} />
            </View>
            <Text style={styles.name}>{decryptData(user?.username) || 'Unknown User'}</Text>

            <View style={styles.grid}>
                <GridItem
                    icon={<MaterialIcons name="person-outline" size={28} color="#26897C" />}
                    label="Profile"
                />
                <GridItem
                    icon={<FontAwesome name="gear" size={28} color="#26897C" />}
                    label="Configuration"
                    onPress={() => navigation.navigate('Configuration')}
                />
                <GridItem
                    icon={<FontAwesome name="bank" size={28} color="#26897C" />}
                    label="Account"
                />
                <GridItem
                    icon={<Ionicons name="mail-outline" size={28} color="#26897C" />}
                    label="Feedback"
                />
                <GridItem
                    icon={<Ionicons name="lock-closed-outline" size={28} color="#26897C" />}
                    label="Login & Security"
                />
                <GridItem
                    icon={<MaterialIcons name="logout" size={28} color="red" />}
                    label="Logout"
                    onPress={handleLogout}
                />
            </View>
        </SafeAreaView>
    );
};

const GridItem = ({ icon, label, onPress }) => (
    <TouchableOpacity style={styles.gridItem} onPress={onPress}>
        {icon}
        <Text style={styles.gridLabel}>{label}</Text>
    </TouchableOpacity>
);

export default More;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarSection: {
        alignItems: 'center',
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 3,
        borderColor: '#26897C',
    },
    avatar: {
        width: '100%',
        height: '100%',
        borderRadius: 50,
    },
    name: {
        fontSize: 18,
        fontWeight: '700',
        marginTop: 10,
        textAlign: 'center',
        marginBottom: 30,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
        paddingHorizontal: 20,
        gap: 20,
    },
    gridItem: {
        width: '28%',
        marginBottom: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    gridLabel: {
        marginTop: 8,
        textAlign: 'center',
        fontSize: 15,
        fontWeight: '500',
    },
});
