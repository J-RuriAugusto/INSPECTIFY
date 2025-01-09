import React from 'react';
import { View, Text, Button } from 'react-native';
import { useRouter } from 'expo-router';

const LoadingScreen = () => {
  const router = useRouter();

  const handleNavigateToGetStarted = () => {
    router.push('/getstarted_1'); // Navigate to the dashboard when the button is pressed
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>LOADING VIDEO</Text>
      <Text style={{ fontSize: 16, textAlign: 'center', marginBottom: 20 }}>
        Loading animation is here.
      </Text>
      <Button title="Get started" onPress={handleNavigateToGetStarted} />
    </View>
  );
};

export default LoadingScreen;
