import React, { useState } from 'react';
import { SafeAreaView, StatusBar, StyleSheet, View } from 'react-native';

import MobileNumberStep from '../components/onboarding/StepOne';
import AccountDetailsStep from '../components/onboarding/StepTwo';
import CashAmount from '../components/onboarding/StepThree';
import BusinessDetails from '../components/onboarding/StepFour';
import CategoryStep from '../components/onboarding/StepFive';

import { useAuth } from '../../context/AuthContext'; 

const Onboarding = () => {
    const { user } = useAuth();
    const [step, setStep] = useState(user?.currentStep || 0);

    console.log('onboarding step:', step);

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar backgroundColor="#000" barStyle="light-content" />
            <View style={styles.container}>
                <View style={{ flex: 1 }}>
                    {step === 0 && <MobileNumberStep onNext={() => setStep(1)} />}
                    {step === 1 && <AccountDetailsStep onNext={() => setStep(2)} />}
                    {step === 2 && <CashAmount onNext={() => setStep(3)} />}
                    {step === 3 && <BusinessDetails onNext={() => setStep(4)} />}
                    {step === 4 && <CategoryStep />}
                </View>
            </View>
        </SafeAreaView>
    );
};

export default Onboarding;

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    container: {
        flex: 1,
        backgroundColor: 'white',
        paddingHorizontal: 5,
        paddingTop: 20,
    },
});
