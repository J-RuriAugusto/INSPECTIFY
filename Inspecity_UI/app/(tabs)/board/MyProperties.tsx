import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, FlatList, Image, Modal, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useFonts } from 'expo-font';
import { Swipeable } from 'react-native-gesture-handler';
import * as ImagePicker from 'expo-image-picker';

const MyProperties = () => {
  const router = useRouter();
  
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [isAddModalVisible, setAddModalVisible] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [newProperty, setNewProperty] = useState({ name: '', location: '', image: null });
  const [properties, setProperties] = useState([
    { id: '1', name: 'Cozy Apartment', location: 'New York, NY', image: require('../../../assets/images/property.png') },
    { id: '2', name: 'Luxury Villa', location: 'Los Angeles, CA', image: require('../../../assets/images/property.png') },
  ]);

  const [fontsLoaded] = useFonts({
    'Epilogue-Black': require('../../../assets/fonts/Epilogue-Black.ttf'),
    'Archivo-Regular': require('../../../assets/fonts/Archivo-Regular.ttf'),
    'Epilogue-Bold': require('../../../assets/fonts/Epilogue-Bold.ttf'),
  });

  if (!fontsLoaded) {
    return null;
  }

  const handleEdit = (property) => {
    setSelectedProperty(property);
    setEditModalVisible(true);
  };

  const saveChanges = () => {
    console.log('Updated Property:', selectedProperty);
    setEditModalVisible(false);
  };

 

  // const renderLeftActions = (id) => (
  //   <TouchableOpacity 
  //     style={[styles.swipeAction, styles.deleteAction]} 
  //     onPress={() => handleDelete(id)}
  //   >
  //     <Text style={styles.swipeText}>Delete</Text>
  //   </TouchableOpacity>
  // );

  // const renderRightActions = (property) => (
  //   <TouchableOpacity 
  //     style={[styles.swipeAction, styles.editAction]} 
  //     onPress={() => handleEdit(property)}
  //   >
  //     <Text style={styles.swipeText}>Edit</Text>
  //   </TouchableOpacity>
  // );

  const handleDelete = (id) => {
    Alert.alert('Delete Property', 'Are you sure you want to delete this property?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', onPress: () => setProperties(properties.filter((prop) => prop.id !== id)), style: 'destructive' }
    ]);
  };

// const handleAddProperty = () => {
//   if (newProperty.name && newProperty.location) {
//     setProperties([...properties, { id: Date.now().toString(), ...newProperty }]);
//     setNewProperty({ name: '', location: '', image: null });
//     setAddModalVisible(false);
//   } else {
//     Alert.alert('Error', 'Please enter both name and location.');
//   }
// };

const pickImage = async (isNew = false) => {
  let result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.All,
    allowsEditing: true,
    aspect: [4, 3],
    quality: 1,
  });

  if (!result.canceled) {
    if (isNew) {
      setNewProperty({ ...newProperty, image: { uri: result.uri } });
    } else {
      setSelectedProperty({ ...selectedProperty, image: { uri: result.uri } });
    }
  }
};
  

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Properties</Text>
      <FlatList
        data={properties}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Swipeable renderRightActions={() => (
            <View style={styles.swipeActions}>
              <TouchableOpacity style={styles.editAction} onPress={() => handleEdit(item)}>
                <Text style={styles.swipeText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteAction} onPress={() => handleDelete(item.id)}>
                <Text style={styles.swipeText}>Delete</Text>
              </TouchableOpacity>
            </View>
          )}>
            <TouchableOpacity onPress={() => router.push(`/board/dashboard`)}>
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

      {/* <TouchableOpacity style={styles.addButton} onPress={() => setAddModalVisible(true)}>
        <Text style={styles.addButtonText}>Add Property</Text>
      </TouchableOpacity> */}

      <TouchableOpacity style={styles.addButton} onPress={() => router.push('/board/addproperty_2')}>
        <Text style={styles.addButtonText}>Add Property</Text>
      </TouchableOpacity>

{/* Add Property Modal
<Modal
visible={isAddModalVisible}
animationType="slide"
transparent={true}
onRequestClose={() => setAddModalVisible(false)}
>
<View style={styles.modalOverlay}>
  <View style={styles.modalContent}>
    <Text style={styles.modalTitle}>Add New Property</Text>

    <TouchableOpacity onPress={() => pickImage(true)}>
      <Image 
        source={newProperty.image || require('../../../assets/images/property.png')} 
        style={styles.modalImage} 
      />
      <Text style={styles.changeImageText}>Select Image</Text>
    </TouchableOpacity>

    <TextInput
      style={styles.input}
      value={newProperty.name}
      onChangeText={(text) => setNewProperty({ ...newProperty, name: text })}
      placeholder="Property Name"
    />

    <TextInput
      style={styles.input}
      value={newProperty.location}
      onChangeText={(text) => setNewProperty({ ...newProperty, location: text })}
      placeholder="Location"
    />

    <TouchableOpacity style={styles.saveButton} onPress={handleAddProperty}>
      <Text style={styles.saveText}>Add Property</Text>
    </TouchableOpacity>

    <TouchableOpacity style={styles.cancelButton} onPress={() => setAddModalVisible(false)}>
      <Text style={styles.cancelText}>Cancel</Text>
    </TouchableOpacity>
  </View>
</View>
</Modal> */}


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
  container: { flex: 1, backgroundColor: '#0B417D', paddingTop: 50, paddingHorizontal: 20, paddingBottom: 30 },
  title: { fontSize: 30, color: '#FFFFFF', fontFamily: 'Epilogue-Black', textAlign: 'center', marginBottom: 20 },
  propertyItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#08294E', borderRadius: 10, marginVertical: 5, padding: 0 },
  propertyImage: { width: 70, height: 80, borderRadius: 10, marginRight: 15 },
  propertyInfo: { flex: 1 },
  propertyText: { fontSize: 18, color: '#7DBAFF', fontFamily: 'Epilogue-Bold' },
  propertyLocation: { fontSize: 14, color: '#B0C4DE', fontFamily: 'Archivo-Regular' },
  swipeActions: { flexDirection: 'row' },
  editAction: { marginTop: 5, height: 80, backgroundColor: '#007BFF', padding: 15, marginRight: 5, borderRadius: 5 },
  deleteAction: { marginTop: 5, height: 80, backgroundColor: '#D11A2A', padding: 15, borderRadius: 5 },
  swipeText: { marginTop: 15, color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', textAlign: 'center' },
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { width: 300, backgroundColor: 'white', padding: 20, borderRadius: 10, alignItems: 'center' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  modalImage: { width: 100, height: 100, borderRadius: 10, marginBottom: 10 },
  changeImageText: { color: '#007BFF', fontSize: 16 },
  input: { width: '100%', padding: 10, marginVertical: 5, borderRadius: 5, backgroundColor: '#f0f0f0' },
  saveButton: { backgroundCoslor: '#007BFF', padding: 12, borderRadius: 5 },
  saveText: { color: 'white', fontWeight: 'bold' },
  cancelButton: { marginTop: 10 },
  cancelText: { color: '#D11A2A', fontSize: 16 },
  addButton: { 
    backgroundColor: '#007BFF', 
    padding: 12, 
    borderRadius: 5, 
    marginTop: -100, 
    alignSelf: 'center', 
    width: 200, 
    alignItems: 'center' 
  },
  addButtonText: { 
    color: 'white', 
    fontWeight: 'bold', 
    textAlign: 'center' 
  },
  });

export default MyProperties;




