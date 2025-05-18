import 'react-native-gesture-handler';
import React from 'react';
import { Stack } from 'expo-router';


export default function AwarenessToolLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false, // Show the header for all screens in this stack
        headerStyle: {
          backgroundColor: '#0B417D', // Custom background color for the header
        },
        headerTintColor: '#FFFFFF', // Color for header text and icons
        headerTitleStyle: {
          fontSize: 20,
          fontWeight: 'bold',
        },
        headerTitleAlign: 'center', // Center-align the header title
      }}
    >
      {/* Default screen for the Awareness Tool route */}
      <Stack.Screen
        name="awareness_tool" // This file should be named `index.js` under `awareness tool/`
        options={{ title: 'Awareness Tool' }} // Title for the index screen
      />

      {/* Example of dynamic child routes (e.g., flood, earthquake, etc.) */}
      <Stack.Screen
        name="flood"
        options={{ title: 'Flood Preparedness' }} // Title for Flood screen
      />
      <Stack.Screen
        name="earthquake"
        options={{ title: 'Earthquake Preparedness' }} // Title for Earthquake screen
      />
      <Stack.Screen
        name="earthquakeQueries"
        options={{ title: 'Earthquake Queries' }}
      />
      <Stack.Screen
        name="fire"
        options={{ title: 'Fire Preparedness' }} // Title for Typhoon screen
      />
      <Stack.Screen
        name="general"
        options={{ title: 'General Preparedness' }} // Title for General screen
      />
    </Stack>
  );
}
