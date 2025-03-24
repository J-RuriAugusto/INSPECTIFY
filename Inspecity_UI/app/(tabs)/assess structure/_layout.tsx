import React from 'react';
import { Stack } from 'expo-router';

export default function AsessStructureLayout() {
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
        name="reportName" // This file should be named `index.js` under `awareness tool/`
        options={{ title: 'Report Name' }} // Title for the index screen
      />

      {/* Example of dynamic child routes (e.g., flood, earthquake, etc.) */}
      {/* <Stack.Screen
        name="wall"
        options={{ title: 'Flood Preparedness' }} // Title for Flood screen
      />
      <Stack.Screen
        name="roof"
        options={{ title: 'Earthquake Preparedness' }} // Title for Earthquake screen
      />
      <Stack.Screen
        name="floor"
        options={{ title: 'Typhoon Preparedness' }} // Title for Typhoon screen
      /> */}
    </Stack>
  );
}
