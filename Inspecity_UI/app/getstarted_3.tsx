import React from 'react';
import { View, Text, Button } from 'react-native';
import { useRouter } from 'expo-router';

const GettingStarted = () => {
  const router = useRouter();

  const handleNavigateToGetStarted4 = () => {
    router.push('/getstarted_4'); // Navigate to the dashboard when the button is pressed
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Tell Us About Your Home</Text>
      <Text style={{ fontSize: 16, textAlign: 'center', marginBottom: 20 }}>
      Enter basic details about your home to begin.
      </Text>
      <Button title="Next" onPress={handleNavigateToGetStarted4} />
    </View>
  );
};

export default GettingStarted;
