import { Redirect, Stack } from 'expo-router';

export default function DashboardLayout() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Redirect href="/Dashboard/board" />
    </>
  );
} 