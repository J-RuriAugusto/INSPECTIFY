import React, { useEffect, useState } from 'react';
import { View, Text, Button, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage
import useUserID from "./useUserID";

const LoadingScreen = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true); // Tracks if userId is being fetched
  const [userIdFetched, setUserIdFetched] = useState(false); // Tracks if userId fetch is complete
  const userId = useUserID();

  // // Automatically remove userId when the component mounts
  // useEffect(() => {
  //   const removeUserId = async () => {
  //     try {
  //       await AsyncStorage.removeItem('userId'); // Remove userId
  //       console.log('userId removed successfully');
  //     } catch (error) {
  //       console.error('Failed to remove userId:', error);
  //     }
  //   };

  //   removeUserId(); // Call the function to remove userId
  // }, []); // Empty dependency array ensures this runs only once when the component mounts


  useEffect(() => {
    if (userId !== undefined) {
      // userId has been fetched (could be valid or invalid)
      setUserIdFetched(true);
      if (userId) {
        router.replace('/dashboard'); // Navigate to dashboard if userId is valid
      } else {
        setLoading(false); // Stop loading if userId is invalid
      }
    }
  }, [userId, router]);

  const handleNavigateToGetStarted = () => {
    router.push('/getstarted_1'); // Navigate to the get started screen
  };


  // Show loading indicator while fetching userId
  if (!userIdFetched) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={{ fontSize: 24, marginTop: 20 }}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>LOADING VIDEO</Text>
      <Text style={{ fontSize: 16, textAlign: 'center', marginBottom: 20 }}>
        Loading animation is here.
      </Text>
      {!userId && ( // Only show the button if userId is invalid
        <Button title="Get started" onPress={handleNavigateToGetStarted} />
      )}
    </View>
  );
};

export default LoadingScreen;