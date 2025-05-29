import React, { useEffect } from 'react';
import {
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';

// Define the type for your navigation stack
type RootStackParamList = {
    Welcome: undefined;
    Signup: undefined;
    Login: undefined;
    Home: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Welcome'>;

const Welcome: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();
    const {user} = useAuth();

    useEffect(() => {
        const checkUser = async () => {

            if (user) {
                navigation.replace('Main'); // or 'Main' if you have it as a screen
            }
        };

        checkUser();
    }, []);
    
    return (
        <SafeAreaView style={styles.container}>
            {/* Character Image */}
            <View style={styles.imageContainer}>
                <Image
                    source={require('../../assets/Man.png')} // Adjust path as per your folder structure
                    style={styles.image}
                    resizeMode="contain"
                />
            </View>

            {/* Bottom Card */}
            <View style={styles.bottomCard}>
                <Text style={styles.title}>Spend Smarter{'\n'}Save More</Text>

                <TouchableOpacity
                    style={styles.getStartedButton}
                    onPress={() => navigation.navigate('Signup')}
                >
                    <Text style={styles.getStartedText}>Get Started</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                    <Text style={styles.loginText}>
                        Already Have Account?{' '}
                        <Text style={{ color: '#26897C' }}>Log In</Text>
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

export default Welcome;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9F9F9',
        paddingHorizontal: 10,
    },
    imageContainer: {
        flex: 2,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F9F9F9',
    },
    image: {
        width: '80%',
        height: '80%',
    },
    bottomCard: {
        flex: 1,
        padding: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#195A5A',
        textAlign: 'center',
        marginBottom: 30,
    },
    getStartedButton: {
        width: '100%',
        backgroundColor: '#26897C',
        paddingVertical: 15,
        borderRadius: 30,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 5,
    },
    getStartedText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 18,
        textAlign: 'center',
    },
    loginText: {
        fontSize: 16,
        color: '#888',
        marginTop: 5,
    },
});
