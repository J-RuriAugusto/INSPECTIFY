import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, FlatList, Image, Modal, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useFonts } from 'expo-font';
import { Swipeable } from 'react-native-gesture-handler';
import { useNavigation } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

const MyProperties = () => {
  const router = useRouter();
  const navigation = useNavigation();
  
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);

  const [fontsLoaded] = useFonts({
    'Epilogue-Black': require('../../../assets/fonts/Epilogue-Black.ttf'),
    'Archivo-Regular': require('../../../assets/fonts/Archivo-Regular.ttf'),
    'Epilogue-Bold': require('../../../assets/fonts/Epilogue-Bold.ttf'),
  });

  if (!fontsLoaded) {
    return null;
  }

  const properties = [
    { id: '1', name: 'Cozy Apartment', location: 'New York, NY', image: require('../../../assets/images/property.png') },
    { id: '2', name: 'Luxury Villa', location: 'Los Angeles, CA', image: require('../../../assets/images/property.png') },
    { id: '3', name: 'Beach House', location: 'Miami, FL', image: require('../../../assets/images/property.png') },
    { id: '4', name: 'Mountain Cabin', location: 'Aspen, CO', image: require('../../../assets/images/property.png') },
  ];

  const handleEdit = (property) => {
    setSelectedProperty(property);
    setEditModalVisible(true);
  };

  const saveChanges = () => {
    console.log('Updated Property:', selectedProperty);
    setEditModalVisible(false);
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedProperty({ ...selectedProperty, image: { uri: result.uri } });
    }
  };

  const renderLeftActions = (id) => (
    <TouchableOpacity 
      style={[styles.swipeAction, styles.deleteAction]} 
      onPress={() => handleDelete(id)}
    >
      <Text style={styles.swipeText}>Delete</Text>
    </TouchableOpacity>
  );

  const renderRightActions = (property) => (
    <TouchableOpacity 
      style={[styles.swipeAction, styles.editAction]} 
      onPress={() => handleEdit(property)}
    >
      <Text style={styles.swipeText}>Edit</Text>
    </TouchableOpacity>
  );

  const handleDelete = (id) => {
    Alert.alert('Delete Property', `Are you sure you want to delete this property?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', onPress: () => console.log(`Deleted property ${id}`), style: 'destructive' }
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Properties</Text>
      <Text style={styles.subtitle}>Manage and inspect your houses with ease.</Text>

      <FlatList
        data={properties}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Swipeable 
            renderLeftActions={() => renderLeftActions(item.id)}
            renderRightActions={() => renderRightActions(item)}
          >
            <TouchableOpacity onPress={() => router.push(`/dashboard/dashboard`)}>
              <View style={styles.propertyItem}>
                <Image source={item.image} style={styles.propertyImage} />
                <View style={styles.propertyInfo}>
                  <Text style={styles.propertyText}>{item.name}</Text>
                  <Text style={styles.propertyLocation}>{item.location}</Text>
                </View>
              </View>
            </TouchableOpacity>

          </Swipeable>
        )}
      />

      {/* Edit Property Modal */}
      <Modal
        visible={isEditModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Property</Text>

            <TouchableOpacity onPress={pickImage}>
              <Image 
                source={selectedProperty?.image} 
                style={styles.modalImage} 
              />
              <Text style={styles.changeImageText}>Change Image</Text>
            </TouchableOpacity>

            <TextInput
              style={styles.input}
              value={selectedProperty?.name}
              onChangeText={(text) => setSelectedProperty({ ...selectedProperty, name: text })}
              placeholder="Property Name"
            />

            <TextInput
              style={styles.input}
              value={selectedProperty?.location}
              onChangeText={(text) => setSelectedProperty({ ...selectedProperty, location: text })}
              placeholder="Location"
            />

            <TouchableOpacity style={styles.saveButton} onPress={saveChanges}>
              <Text style={styles.saveText}>Save Changes</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelButton} onPress={() => setEditModalVisible(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0B417D', paddingTop: 50 },
  title: { fontSize: 30, color: '#FFFFFF', fontFamily: 'Epilogue-Black', marginTop: 40 },
  subtitle: { fontSize: 15, color: '#00A8E8', marginBottom: 20, fontFamily: 'Archivo-Regular' },
  propertyItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#08294E', borderRadius: 10, marginVertical: 5, width: 320, alignSelf: 'center' },
  propertyImage: { width: 70, height: 80, borderTopLeftRadius: 10, borderBottomLeftRadius: 10, marginRight: 15 },
  propertyInfo: { flex: 1 },
  propertyText: { fontSize: 18, color: '#7DBAFF', fontFamily: 'Epilogue-Bold' },
  propertyLocation: { fontSize: 14, color: '#B0C4DE', fontFamily: 'Archivo-Regular', marginTop: 3 },
  swipeAction: { justifyContent: 'center', alignItems: 'center', width: 100, height: '85%', borderRadius: 10, marginTop: 5 },
  deleteAction: { backgroundColor: '#D11A2A' },
  editAction: { backgroundColor: '#007BFF' },
  swipeText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },

  // Modal styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: 300, backgroundColor: 'white', padding: 20, borderRadius: 10, alignItems: 'center' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15 },
  modalImage: { width: 120, height: 120, borderRadius: 10, marginBottom: 10 },
  changeImageText: { color: '#007BFF', fontSize: 16 },
  input: { width: '100%', backgroundColor: '#f0f0f0', padding: 10, marginVertical: 5, borderRadius: 5 },
  saveButton: { backgroundColor: '#007BFF', padding: 12, borderRadius: 5, marginTop: 10 },
  saveText: { color: 'white', fontWeight: 'bold' },
  cancelButton: { marginTop: 10 },
  cancelText: { color: '#D11A2A', fontSize: 16 }
});

export default MyProperties;
