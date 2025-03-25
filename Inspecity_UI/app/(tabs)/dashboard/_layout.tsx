import React from 'react';
import { Stack } from 'expo-router';

export default function DahboardlLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        headerStyle: {
          backgroundColor: '#0B417D',
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontSize: 20,
          fontWeight: 'bold',
        },
        headerTitleAlign: 'center',
      }}
    >
      <Stack.Screen
        name="MyProperties"
        options={{presentation: 'modal', headerShown: false }}
      />
      <Stack.Screen
        name="settings"
        options={{presentation: 'modal', headerShown: false }}
      />
    </Stack>
    
  );
}
