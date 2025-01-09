import React from 'react';
import { View, Text, Button } from 'react-native';
import { useRouter } from 'expo-router';

const GettingStarted = () => {
  const router = useRouter();

  const handleNavigateToDashboard = () => {
    router.push('/dashboard'); // Navigate to the dashboard when the button is pressed
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>You're All Set!</Text>
      <Text style={{ fontSize: 16, textAlign: 'center', marginBottom: 20 }}>
        Inspectify is ready to help you 
        inspect your home.
      </Text>
      <Button title="Go to Dashboard" onPress={handleNavigateToDashboard} />
    </View>
  );
};

export default GettingStarted;
