import React from 'react';
import { Stack } from 'expo-router';

export default function DahboardlLayout() {
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
        name="MyProperties" // This file should be named `index.js` under `awareness tool/`
        options={{presentation: 'modal', headerShown: false }} // Title for the index screen
      />
      <Stack.Screen
        name="settings" // This file should be named `index.js` under `awareness tool/`
        options={{presentation: 'modal', headerShown: false }} // Title for the index screen
      />
    </Stack>
    
  );
}
