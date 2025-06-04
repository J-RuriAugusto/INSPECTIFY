import React from 'react';
import { Image, View, StyleSheet, Text } from 'react-native';
import { Tabs } from 'expo-router';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

function renderTabLabel(label: string) {
  return ({ focused }: { focused: boolean }) => (
    <Text style={{
      color: '#000000',
      fontWeight: focused ? 'bold' : 'normal',
      fontSize: 12,
      marginTop: 5
    }}>
      {label}
    </Text>
  );
}

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Tabs
        initialRouteName="Dashboard"
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
          tabBarInactiveTintColor: '#ccc',
          headerShown: false,
          tabBarStyle: styles.tabBarStyle,
          tabBarShowLabel: true,
          // tabBarItemStyle: {
          //   marginHorizontal: wp('1.5%'), // <-- Add horizontal margin between tabs
          // },
        }}
      >
        {/* Dashboard Tab */}
        <Tabs.Screen
          name="Dashboard"
          options={{
            tabBarIcon: ({ focused }) => (
              <Image
                source={require('../../assets/images/report columns.png')}
                style={[
                  styles.icon, // your default icon size
                  { width: wp('6.5%'), height: wp('6.5%') }, // override here for Dashboard only
                  focused && styles.focusedIcon, // optional color change if needed
                ]}
              />
            ),
              tabBarLabel: ({ focused }) => (
                <Text style={{
                  color: '#000000',
                  fontWeight: focused ? 'bold' : 'normal',
                  fontSize: 12,
                  marginTop: 5
                }}>
                  Dashboard
                </Text>
              ),
          }}
          listeners={({ navigation }) => ({
            tabPress: (e) => {
              e.preventDefault();
              navigation.reset({
                index: 0,
                routes: [{ name: 'Dashboard' }],
              });
            },
          })}
        />

        {/* Awareness Tool Tab */}
        <Tabs.Screen
          name="Forms"
          options={{
            tabBarIcon: ({ focused }) => (
              <Image
                source={require('../../assets/images/test results.png')}
                style={[
                  styles.icon,
                  focused && styles.focusedIcon,
                ]}
              />
            ),
            tabBarLabel: ({ focused }) => (
              <Text style={{ color: '#000000', fontWeight: focused ? 'bold' : 'normal', fontSize: 12, marginTop: 5 }}>
                Forms
              </Text>
            ),
          }}
        />

        {/* Assess Structure Tab */}
        <Tabs.Screen
          name="Scan"
          options={{
            tabBarIcon: ({ focused }) => (
              <View style={[styles.centeredIcon, styles.scanButton]}>
                <Image 
                  source={require('../../assets/images/rectangle.png')} 
                  style={styles.circle} 
                />
                <Image
                  source={require('../../assets/images/scan_icon.png')}
                  style={[
                    styles.icon,
                    { width: wp('7%'), height: wp('7%') },
                    focused && styles.focusedIcon,
                  ]}
                />
              </View>
            ),
            tabBarLabel: ({ focused }) => (
              <Text style={{ color: '#000000', fontWeight: focused ? 'bold' : 'normal', fontSize: 12, marginTop: 5 }}>
                Scan
              </Text>
            ),
          }}
        />

        {/* Emergency Hotlines Tab */}
        <Tabs.Screen
          name="Hotlines"
          options={{
            tabBarIcon: ({ focused }) => (
              <Image
                source={require('../../assets/images/duplicate contacts.png')}
                style={[
                  styles.icon,
                  focused && styles.focusedIcon,
                ]}
              />
            ),
            tabBarLabel: ({ focused }) => (
              <Text style={{ color: '#000000', fontWeight: focused ? 'bold' : 'normal', fontSize: 12, marginTop: 5 }}>
                Hotlines
              </Text>
            ),
          }}
        />

        {/* Nearby Shops Tab */}
        <Tabs.Screen
          name="Shops"
          options={{
            tabBarIcon: ({ focused }) => (
              <Ionicons
                name={focused ? 'location-sharp' : 'location-outline'}
                size={30}
                color={focused ? '#007aff' : '#000000'}
              />
            ),
            tabBarLabel: ({ focused }) => (
              <Text style={{ color: '#000000', fontWeight: focused ? 'bold' : 'normal', fontSize: 12, marginTop: 5 }}>
                Shops
              </Text>
            ),
          }}
        />
      </Tabs>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  tabBarStyle: {
    backgroundColor: '#FFFFFF',
    height: hp('9.5%'),
  },
  icon: {
    width: wp('8%'),
    height: wp('8%'),
    resizeMode: 'contain',
  },
  scanButton: {
    marginBottom: hp('4.5%'),
  },
  centeredIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    width: wp('16%'),
    height: wp('16%'),
    position: 'absolute',
    borderRadius: wp('8%'),
    borderWidth: wp('0.7%'),
    borderColor: '#00A8E8',
  },
  focusedIcon: {
    tintColor: '#007aff',
  },
});
