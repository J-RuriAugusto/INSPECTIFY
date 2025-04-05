import React from 'react';
import { Image, View, StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { GestureHandlerRootView } from 'react-native-gesture-handler'; // Import this!

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}> {/* Wrap the whole Tabs inside this */}
      <Tabs
        initialRouteName="board"
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
          tabBarInactiveTintColor: '#ccc',
          headerShown: false,
          tabBarStyle: styles.tabBarStyle, // Standardized height
          tabBarShowLabel: false, // Hides text labels
        }}
      >
        {/* Dashboard Tab */}
        <Tabs.Screen
          name="board"
          options={{
            tabBarIcon: ({ focused }) => (
              <Image
                source={
                  focused
                    ? require('../../assets/images/report columns.png')
                    : require('../../assets/images/report columns.png')
                }
                style={styles.icon}
              />
            ),
          }}
          // Adding tabPress event to reset the screen on tab click
          listeners={({ navigation }) => ({
            tabPress: (e) => {
              // Prevent default behavior and reset the screen
              e.preventDefault();
              navigation.reset({
                index: 0,
                routes: [{ name: 'board' }],
              });
            },
          })}
        />

        {/* Awareness Tool Tab */}
        <Tabs.Screen
          name="awareness tool"
          options={{
            tabBarIcon: ({ focused }) => (
              <Image
                source={
                  focused
                    ? require('../../assets/images/test results.png')
                    : require('../../assets/images/test results.png')
                }
                style={styles.icon}
              />
            ),
          }}
        />

        {/* Assess Structure Tab */}
        <Tabs.Screen
          name="assess structure"
          options={{
            tabBarIcon: ({ focused }) => (
              <View style={styles.centeredIcon}>
                <Image source={require('../../assets/images/rectangle.png')} style={styles.circle} />
                <Image
                  source={
                    focused
                      ? require('../../assets/images/scan_icon.png')
                      : require('../../assets/images/scan_icon.png')
                  }
                  style={styles.icon}
                />
              </View>
            ),
          }}
        />

        {/* Emergency Hotlines Tab */}
        <Tabs.Screen
          name="emergency_hotlines"
          options={{
            tabBarIcon: ({ focused }) => (
              <Image
                source={
                  focused
                    ? require('../../assets/images/duplicate contacts.png')
                    : require('../../assets/images/duplicate contacts.png')
                }
                style={styles.icon}
              />
            ),
          }}
        />

        {/* Nearby Shops Tab */}
        <Tabs.Screen
          name="nearby_shops"
          options={{
            tabBarIcon: ({ focused }) => (
              <Image
                source={
                  focused
                    ? require('../../assets/images/group.png')
                    : require('../../assets/images/group.png')
                }
                style={styles.icon}
              />
            ),
          }}
        />
      </Tabs>
    </GestureHandlerRootView>
  );
}

// Styles for consistency
const styles = StyleSheet.create({
  tabBarStyle: {
    backgroundColor: '#FFFFFF',
    height: 65, // Increased height for better spacing
    // paddingBottom: 10, // Adjust spacing
  },
  icon: {
    width: 30, // Standardized icon size
    height: 30,
    resizeMode: 'contain',
  },
  centeredIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    width: 50,
    height: 50,
    position: 'absolute',
  },
});
