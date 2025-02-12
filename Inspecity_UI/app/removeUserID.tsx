import AsyncStorage from '@react-native-async-storage/async-storage';

// Function to remove userID from AsyncStorage
const removeUserID = async () => {
  try {
    await AsyncStorage.removeItem('userID');
    console.log('UserID removed from AsyncStorage');
  } catch (error) {
    console.error('Error removing userID:', error);
  }
};


export default removeUserID;