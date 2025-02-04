import React from 'react';
import { Image, View } from 'react-native';
import { Tabs } from 'expo-router';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      initialRouteName="dashboard"
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        tabBarInactiveTintColor: '#ccc', // Color for inactive icons
        headerShown: false, // Hide the header for all tabs
        tabBarStyle: {
          backgroundColor: '#FFFFFF', // Set the background color here
          height: 60, // Adjust height if necessary
        },
        tabBarLabelStyle: {
          fontSize: 12, // Adjust the font size of the labels
          fontWeight: '600',
        },
      }}
    >
      {/* Dashboard Tab */}
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, focused }) => (
            <Image
              source={
                require('../../assets/images/report columns.png') // Active icon
              }
              style={{
                width: 24,
                height: 24,
                tintColor: focused ? color : undefined, // Apply tint color if needed
              }}
            />
          ),
        }}
      />

      {/* Awareness Tool Tab */}
      <Tabs.Screen
        name="awareness tool"
        options={{
          title: 'Awareness Tool',
          tabBarIcon: ({ color, focused }) => (
            <Image
              source={
                require('../../assets/images/test results.png')
              }
              style={{
                width: 24,
                height: 24,
                tintColor: focused ? color : undefined,
              }}
            />
          ),
        }}
      />

      {/* Assess Structure Tab */}
      <Tabs.Screen
        name="assess structure"
        options={{
          title: 'Assess Structure',
          tabBarIcon: ({ color, focused }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              {/* Background Image (Big Circle) */}
              <Image
                source={require('../../assets/images/rectangle.png')} // Your background circle image
                style={{
                  width: 40, // Adjust size for the circle
                  height: 40,
                  position: 'absolute', // Stacks it behind the icon
                }}
              />
              {/* Foreground Icon */}
              <Image
                source={require('../../assets/images/scan_icon.png')} // Your icon above the circle
                style={{
                  width: 24, // Adjust size for the icon
                  height: 24,
                  tintColor: focused ? color : undefined, // Apply focus color
                }}
              />
            </View>
          ),
        }}
      />

      {/* Emergency Hotlines Tab */}
      <Tabs.Screen
        name="emergency_hotlines"
        options={{
          title: 'Emergency Hotlines',
          tabBarIcon: ({ color, focused }) => (
            <Image
              source={
                require('../../assets/images/duplicate contacts.png')
              }
              style={{
                width: 24,
                height: 24,
                tintColor: focused ? color : undefined,
              }}
            />
          ),
        }}
      />

      {/* Nearby Shops Tab */}
      <Tabs.Screen
        name="nearby_shops"
        options={{
          title: 'Nearby Shops',
          tabBarIcon: ({ color, focused }) => (
            <Image
              source={
                require('../../assets/images/group.png')
              }
              style={{
                width: 20,
                height: 20,
                tintColor: focused ? color : undefined,
              }}
            />
          ),
        }}
      />
    </Tabs>
  );
}
