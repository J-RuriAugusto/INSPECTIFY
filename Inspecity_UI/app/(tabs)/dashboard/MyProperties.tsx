import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, FlatList, Image, Modal, TextInput } from 'react-native';
import { ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';

import { useRouter } from 'expo-router';
import { useFonts } from 'expo-font';
import { Swipeable } from 'react-native-gesture-handler';
import * as ImagePicker from 'expo-image-picker';

const MyProperties = () => {
  const router = useRouter();


  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [isAddModalVisible, setAddModalVisible] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [newProperty, setNewProperty] = useState({ 
    name: '', 
    location: '', 
    age: '', 
    primaryUse: '', 
    repairs: '', 
    repairDetails: '',
    image: null 
  });  
  const [properties, setProperties] = useState([
    { 
      id: '1', 
      name: 'Cozy Apartment', 
      location: 'New York, NY', 
      age: '10 years', 
      primaryUse: 'Residential', 
      repairs: 'Yes', 
      repairDetails: 'Roof repaired in 2020',
      type: 'Apartment',
      otherType: '',
      height: '3 floors',
      lotArea: '120 sqm',
      floorArea: '250 sqm',
      primaryMaterial: 'Concrete Hollow Blocks',
      otherPrimaryMaterial: '',
      roofingMaterial: 'GI Sheets (Yero)',
      otherRoofingMaterial: '',
      flooringMaterial: 'Tiles',
      otherFlooringMaterial: '',
      wallMaterial: 'Concrete',
      otherWallMaterial: '',
      ceilingMaterial: 'Gypsum Board',
      otherCeilingMaterial: '',
      image: require('../../../assets/images/property.png') 
    }
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
    setSelectedProperty({
      ...property,
      primaryMaterial: property.primaryMaterial || "Reinforced Concrete",
      otherPrimaryMaterial: property.otherPrimaryMaterial || "",
      roofingMaterial: property.roofingMaterial || "GI Sheets (Yero)",
      otherRoofingMaterial: property.otherRoofingMaterial || "",
      flooringMaterial: property.flooringMaterial || "Concrete",
      otherFlooringMaterial: property.otherFlooringMaterial || "",
      wallMaterial: property.wallMaterial || "Concrete",
      otherWallMaterial: property.otherWallMaterial || "",
      ceilingMaterial: property.ceilingMaterial || "Gypsum Board",
      otherCeilingMaterial: property.otherCeilingMaterial || ""
    });
    setEditModalVisible(true);
  };
  
  

  const saveChanges = () => {
    console.log('Updated Property:', selectedProperty);
    setEditModalVisible(false);
  };



  const handleDelete = (id) => {
    Alert.alert('Delete Property', 'Are you sure you want to delete this property?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', onPress: () => setProperties(properties.filter((prop) => prop.id !== id)), style: 'destructive' }
    ]);
  };


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


      <TouchableOpacity style={styles.addButton} onPress={() => router.push('/dashboard/addproperty_2')}>
        <Text style={styles.addButtonText}>Add Property</Text>
      </TouchableOpacity>


      <Modal
  visible={isEditModalVisible}
  animationType="slide"
  transparent={true}
  onRequestClose={() => setEditModalVisible(false)}
>
  <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
    <View style={styles.modalOverlay}>
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1 }} 
        keyboardShouldPersistTaps="handled"
      >
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

          <TextInput
            style={styles.input}
            value={selectedProperty?.age}
            onChangeText={(text) => setSelectedProperty({ ...selectedProperty, age: text })}
            placeholder="Age of the house (in years)"
            keyboardType="numeric"
          />

          <TextInput
            style={styles.input}
            value={selectedProperty?.primaryUse}
            onChangeText={(text) => setSelectedProperty({ ...selectedProperty, primaryUse: text })}
            placeholder="Primary use of the house (e.g., Residential, Rental, Commercial)"
          />

          <TextInput
            style={styles.input}
            value={selectedProperty?.repairs}
            onChangeText={(text) => setSelectedProperty({ ...selectedProperty, repairs: text })}
            placeholder="Has the house undergone repairs? (Yes/No)"
          />

          {(selectedProperty?.repairs || "").toLowerCase() === 'yes' && (

            <TextInput
              style={styles.input}
              value={selectedProperty?.repairDetails}
              onChangeText={(text) => setSelectedProperty({ ...selectedProperty, repairDetails: text })}
              placeholder="Specify repairs done"
            />
          )}

<Text style={styles.label}>Type of House</Text>
<Picker
  selectedValue={selectedProperty?.type}
  style={styles.picker}
  onValueChange={(itemValue) => setSelectedProperty({ ...selectedProperty, type: itemValue })}
>
  <Picker.Item label="Single-Detached" value="Single-Detached" />
  <Picker.Item label="Townhouse" value="Townhouse" />
  <Picker.Item label="Apartment" value="Apartment" />
  <Picker.Item label="Stilt House" value="Stilt House" />
  <Picker.Item label="Duplex" value="Duplex" />
  <Picker.Item label="Other" value="Other" />
</Picker>

{/* Show text input for "Other" only when "Other" is selected */}
{selectedProperty?.type === "Other" && (
  <TextInput
    style={styles.input}
    value={selectedProperty?.otherType}
    onChangeText={(text) => setSelectedProperty({ ...selectedProperty, otherType: text })}
    placeholder="Specify type of house"
  />
)}

<Text style={styles.label}>Height of House</Text>
<TextInput
  style={styles.input}
  value={selectedProperty?.height}
  onChangeText={(text) => setSelectedProperty({ ...selectedProperty, height: text })}
  placeholder="Number of floors or height in meters"
/>

<Text style={styles.label}>Estimated Lot Area (sqm)</Text>
<TextInput
  style={styles.input}
  value={selectedProperty?.lotArea}
  onChangeText={(text) => setSelectedProperty({ ...selectedProperty, lotArea: text })}
  placeholder="Enter estimated lot area in sqm"
  keyboardType="numeric"
/>

<Text style={styles.label}>Estimated Floor Area (sqm)</Text>
<TextInput
  style={styles.input}
  value={selectedProperty?.floorArea}
  onChangeText={(text) => setSelectedProperty({ ...selectedProperty, floorArea: text })}
  placeholder="Enter estimated floor area in sqm"
  keyboardType="numeric"
/>

{/* Primary Material of the House */}
<Text style={styles.label}>Primary Material of the House</Text>
<Picker
  selectedValue={selectedProperty?.primaryMaterial}
  style={styles.picker}
  onValueChange={(itemValue) => setSelectedProperty({ ...selectedProperty, primaryMaterial: itemValue })}
>
  <Picker.Item label="Reinforced Concrete" value="Reinforced Concrete" />
  <Picker.Item label="Concrete Hollow Blocks" value="Concrete Hollow Blocks" />
  <Picker.Item label="Wood" value="Wood" />
  <Picker.Item label="Bamboo" value="Bamboo" />
  <Picker.Item label="Mixed Material" value="Mixed Material" />
</Picker>

{selectedProperty?.primaryMaterial === "Mixed Material" && (
  <TextInput
    style={styles.input}
    value={selectedProperty?.otherPrimaryMaterial}
    onChangeText={(text) => setSelectedProperty({ ...selectedProperty, otherPrimaryMaterial: text })}
    placeholder="Specify material"
  />
)}

{/* Primary Roofing Material */}
<Text style={styles.label}>Primary Roofing Material</Text>
<Picker
  selectedValue={selectedProperty?.roofingMaterial}
  style={styles.picker}
  onValueChange={(itemValue) => setSelectedProperty({ ...selectedProperty, roofingMaterial: itemValue })}
>
  <Picker.Item label="GI Sheets (Yero)" value="GI Sheets (Yero)" />
  <Picker.Item label="Clay Tiles" value="Clay Tiles" />
  <Picker.Item label="Concrete Slab" value="Concrete Slab" />
  <Picker.Item label="Nipa/Bamboo" value="Nipa/Bamboo" />
  <Picker.Item label="Asphalt Shingles" value="Asphalt Shingles" />
  <Picker.Item label="Others" value="Others" />
</Picker>

{selectedProperty?.roofingMaterial === "Others" && (
  <TextInput
    style={styles.input}
    value={selectedProperty?.otherRoofingMaterial}
    onChangeText={(text) => setSelectedProperty({ ...selectedProperty, otherRoofingMaterial: text })}
    placeholder="Specify roofing material"
  />
)}

{/* Flooring Material */}
<Text style={styles.label}>Flooring Material</Text>
<Picker
  selectedValue={selectedProperty?.flooringMaterial}
  style={styles.picker}
  onValueChange={(itemValue) => setSelectedProperty({ ...selectedProperty, flooringMaterial: itemValue })}
>
  <Picker.Item label="Concrete" value="Concrete" />
  <Picker.Item label="Wood" value="Wood" />
  <Picker.Item label="Tiles" value="Tiles" />
  <Picker.Item label="Vinyl" value="Vinyl" />
  <Picker.Item label="Others" value="Others" />
</Picker>

{selectedProperty?.flooringMaterial === "Others" && (
  <TextInput
    style={styles.input}
    value={selectedProperty?.otherFlooringMaterial}
    onChangeText={(text) => setSelectedProperty({ ...selectedProperty, otherFlooringMaterial: text })}
    placeholder="Specify flooring material"
  />
)}

{/* Wall Material */}
<Text style={styles.label}>Wall Material</Text>
<Picker
  selectedValue={selectedProperty?.wallMaterial}
  style={styles.picker}
  onValueChange={(itemValue) => setSelectedProperty({ ...selectedProperty, wallMaterial: itemValue })}
>
  <Picker.Item label="Concrete" value="Concrete" />
  <Picker.Item label="Wood" value="Wood" />
  <Picker.Item label="Bamboo" value="Bamboo" />
  <Picker.Item label="Others" value="Others" />
</Picker>

{selectedProperty?.wallMaterial === "Others" && (
  <TextInput
    style={styles.input}
    value={selectedProperty?.otherWallMaterial}
    onChangeText={(text) => setSelectedProperty({ ...selectedProperty, otherWallMaterial: text })}
    placeholder="Specify wall material"
  />
)}

{/* Ceiling Material */}
<Text style={styles.label}>Ceiling Material</Text>
<Picker
  selectedValue={selectedProperty?.ceilingMaterial}
  style={styles.picker}
  onValueChange={(itemValue) => setSelectedProperty({ ...selectedProperty, ceilingMaterial: itemValue })}
>
  <Picker.Item label="Gypsum Board" value="Gypsum Board" />
  <Picker.Item label="Wood" value="Wood" />
  <Picker.Item label="PVC" value="PVC" />
  <Picker.Item label="Others" value="Others" />
</Picker>

{selectedProperty?.ceilingMaterial === "Others" && (
  <TextInput
    style={styles.input}
    value={selectedProperty?.otherCeilingMaterial}
    onChangeText={(text) => setSelectedProperty({ ...selectedProperty, otherCeilingMaterial: text })}
    placeholder="Specify ceiling material"
  />
)}



          <TouchableOpacity style={styles.saveButton} onPress={saveChanges}>
            <Text style={styles.saveText}>Save Changes</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelButton} onPress={() => setEditModalVisible(false)}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  </KeyboardAvoidingView>
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
  saveButton: { backgroundColor: '#007BFF', padding: 12, borderRadius: 5 },
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

  picker: {
    width: '100%',
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    marginVertical: 5
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10
  },
  
  });

export default MyProperties;




