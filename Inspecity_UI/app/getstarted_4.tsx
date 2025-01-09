import React from 'react';
import { View, Text, Button } from 'react-native';
import { useRouter } from 'expo-router';

const GettingStarted = () => {
  const router = useRouter();

  const handleNavigateToGetStarted5 = () => {
    router.push('/getstarted_5'); // Navigate to the dashboard when the button is pressed
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Enable Location Access</Text>
      <Text style={{ fontSize: 16, textAlign: 'center', marginBottom: 20 }}>
      Turn on location services to find 
      nearby hardware shops and get accurate suggestions.
      </Text>
      <Button title="Next" onPress={handleNavigateToGetStarted5} />
    </View>
  );
};

export default GettingStarted;
