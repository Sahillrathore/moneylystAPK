// src/screens/NotFound.jsx
import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

const NotFound = ({ navigation }) => {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Page Not Found</Text>
            <Button title="Go Back" onPress={() => navigation.goBack()} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
    },
    text: {
        fontSize: 22,
        marginBottom: 20
    }
});

export default NotFound;
