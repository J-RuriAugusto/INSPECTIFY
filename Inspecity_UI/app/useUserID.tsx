import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useUserId = () => {
  const [userId, setUserId] = useState<string | null>(null); // Declare state with type string | null

  useEffect(() => {
    const checkUserId = async () => {
      const storedUserId = await AsyncStorage.getItem('userId');
      console.log('Stored userId:', storedUserId);
      setUserId(storedUserId); // Now TypeScript knows that storedUserId can be string | null
    };

    checkUserId();
  }, []);

  return userId;
};

export default useUserId;
