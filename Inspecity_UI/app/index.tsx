import React from 'react';
import { View, Text, Button, StatusBar, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

const LoadingScreen = () => {
  const router = useRouter();

  const handleNavigateToGetStarted = () => {
    router.push('/getstarted_1'); // Navigate to the dashboard when the button is pressed
  };

  return (
    <View style={styles.container}>
      {/* Hide Status Bar */}
      <StatusBar hidden={true} />

      <Text style={styles.title}>LOADING VIDEO</Text>
      <Text style={styles.subtitle}>Loading animation is here.</Text>
      <Button title="Get started" onPress={handleNavigateToGetStarted} />
    </View>
  );
};

const styles = StyleSheet.create ({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#ffffff', // Optional: Change background color if needed
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: 'bold', // Optional styling
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#555555', // Optional styling for subtitle color
  },
});

export default LoadingScreen;
