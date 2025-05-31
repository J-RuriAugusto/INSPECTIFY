import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, FlatList, Image, Modal, TextInput, KeyboardAvoidingView,Platform, ScrollView,} from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useFocusEffect, useRouter } from 'expo-router';
import { useFonts } from 'expo-font';
import * as Location from 'expo-location';
import { Swipeable } from 'react-native-gesture-handler';
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';
import { ActivityIndicator } from 'react-native';
import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import useUserID from "../../useUserID";

interface Property {
  id: number;
  name: string;
  location: string;
  image: any;
  latitude?: number;
  longitude?: number;
  home_age?: string;
  primaryUse?: string;
  repairDetails?: string;
  renovations?: string;
  type?: string;
  otherType?: string;
  num_floor?: string;
  lot_area?: string;
  floor_area?: string;
  primaryMaterial?: string;
  otherPrimaryMaterial?: string;
  roofingMaterial?: string;
  otherRoofingMaterial?: string;
  flooringMaterial?: string;
  otherFlooringMaterial?: string;
  wallMaterial?: string;
  otherWallMaterial?: string;
  ceilingMaterial?: string;
  otherCeilingMaterial?: string;
}

const MyProperties = () => {
  const router = useRouter();
  
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [isAddModalVisible, setAddModalVisible] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const userId = useUserID();
  const API_KEY = '***REMOVED***';
  
  const HOUSE_TYPES = [
    { label: "Single-detached", value: "single" },
    { label: "Townhouse", value: "town" },
    { label: "Apartment", value: "apartment" },
    { label: "Stilt house", value: "stilt" }
  ];

  const PRIMARY_MATERIALS = [
    { label: "Reinforced concrete", value: "reinforced" },
    { label: "Concrete hollow blocks", value: "concrete" },
    { label: "Wood", value: "wood" },
    { label: "Bamboo", value: "bamboo" },
    { label: "Mixed Material", value: "mixed" }
  ];

  const ROOFING_MATERIALS = [
    { label: "GI sheets (yero)", value: "yero" },
    { label: "Clay tiles", value: "clay" },
    { label: "Concrete slab", value: "slab" },
    { label: "Nipa/Bamboo", value: "nipa" },
    { label: "Asphalt shingles", value: "asphalt" }
  ];

  const FLOORING_MATERIALS = [
    { label: "Concrete", value: "concrete" },
    { label: "Wood", value: "wood" },
    { label: "Tiles", value: "tiles" },
    { label: "Vinyl", value: "vinyl" }
  ];

  const WALL_MATERIALS = [
    { label: "Concrete", value: "concrete" },
    { label: "Wood", value: "wood" },
    { label: "Bamboo", value: "bamboo" }
  ];

  const CEILING_MATERIALS = [
    { label: "Gypsum board", value: "gypsum" },
    { label: "Wood", value: "wood" },
    { label: "PVC", value: "pvc" }
  ];

  const [newProperty, setNewProperty] = useState<Omit<Property, 'id'> & { image: any }>({ 
    name: '', 
    location: '', 
    image: null 
  });

  const [isUploading, setIsUploading] = useState(false);

  const uploadImageToCloudinary = async (uri: string) => {
    try {
      setIsUploading(true);
      console.log(`Home image uri: ${uri}`)
      const fileInfo = await FileSystem.getInfoAsync(uri);
      if (!fileInfo.exists) {
        throw new Error(`File does not exist at path: ${uri}`);
      }

      const fileBase64 = await FileSystem.readAsStringAsync(uri, { 
        encoding: FileSystem.EncodingType.Base64 
      });

      const formData = new FormData();
      formData.append('file', `data:image/jpeg;base64,${fileBase64}`);
      formData.append('upload_preset', 'Inspectify_images');
      formData.append('cloud_name', 'dyk1pt3m0');

      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/dyk1pt3m0/image/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return response.data.secure_url;
    } catch (error) {
      console.error('Error uploading image: ', error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const [fontsLoaded] = useFonts({
    'Epilogue-Black': require('../../../assets/fonts/Epilogue-Black.ttf'),
    'Archivo-Regular': require('../../../assets/fonts/Archivo-Regular.ttf'),
    'Epilogue-Bold': require('../../../assets/fonts/Epilogue-Bold.ttf'),
  });

  const setDefaultHomeAndNavigate = async (homeId: number) => {
    try {
      const response = await fetch(`https://flask-railway-sample-production.up.railway.app/homes/set_default/${homeId}`, {
        method: 'PUT',
        headers: {
          'X-API-KEY': API_KEY,
          'Content-Type': 'application/json',
        },
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      console.log('Default home set:', data);
      
      // Navigate to dashboard after successfully setting default home
      router.push('/(tabs)/Dashboard/board');
      
    } catch (error) {
      console.error('Error setting default home:', error);
      Alert.alert('Error', 'Failed to set default home. Please try again.');
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      const fetchHomes = async () => {
        try {
          const response = await fetch(`https://flask-railway-sample-production.up.railway.app/homes/${userId}`, {
            headers: {
              'X-API-KEY': API_KEY,
              'Content-Type': 'application/json',
            },
          });
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const data = await response.json();
          console.log(data);
          
          const transformedProperties = await Promise.all(data.map(async (home: any) => {
            let locationText = "Location not available";
            
            if (home.latitude && home.longitude) {
              try {
                const reverseGeocode = await Location.reverseGeocodeAsync({
                  latitude: home.latitude,
                  longitude: home.longitude
                });
                
                if (reverseGeocode.length > 0) {
                  const { city, region, street, name, district } = reverseGeocode[0];
                  locationText = [
                    name,
                    street,
                    district,
                    city,
                    region
                  ].filter(Boolean).join(', ');
                }
              } catch (error) {
                console.warn("Reverse geocoding failed:", error);
                locationText = `${home.latitude.toFixed(4)}, ${home.longitude.toFixed(4)}`;
              }
            }
            console.log("hey")
            console.log(home.home_age)
            
            const backendType = home.type_of_home || '';
            const isStandardType = HOUSE_TYPES.some(type => type.value === backendType);
            
            const backendPrimaryMaterial = home.primary_home_material || '';
            const isStandardPrimaryMaterial = PRIMARY_MATERIALS.some(mat => mat.value === backendPrimaryMaterial);
            
            const backendRoofingMaterial = home.roof_material || '';
            const isStandardRoofing = ROOFING_MATERIALS.some(mat => mat.value === backendRoofingMaterial);

            const backendFlooring = home.floor_material || '';
            const isStandardFlooring = FLOORING_MATERIALS.some(type => type.value === backendFlooring);
          
            const backendWallMaterial = home.wall_material || '';
            const isStandardWallMaterial = WALL_MATERIALS.some(mat => mat.value === backendWallMaterial);
          
            const backendCeilingMaterial = home.ceiling_material || '';
            const isStandardCeilingMaterial = CEILING_MATERIALS.some(mat => mat.value === backendCeilingMaterial);
          
            return {
              id: home.home_id,
              name: home.home_name,
              location: locationText,
              latitude: home.latitude,
              longitude: home.longitude,
              home_age: home.home_age?.toString() || '',
              primaryUse: home.primary_home_use || '',
              renovations: home.renovations || '',
              type: isStandardType ? backendType : 'other',
              otherType: isStandardType ? '' : backendType,
              num_floor: home.num_floor?.toString() || '',
              lot_area: home.lot_area?.toString() || '',
              floor_area: home.floor_area?.toString() || '',
              primaryMaterial: isStandardPrimaryMaterial ? backendPrimaryMaterial : 'mixed',
              otherPrimaryMaterial: isStandardPrimaryMaterial ? '' : backendPrimaryMaterial,
              roofingMaterial: isStandardRoofing ? backendRoofingMaterial : 'other',
              otherRoofingMaterial: isStandardRoofing ? '' : backendRoofingMaterial,
              flooringMaterial: isStandardFlooring ? backendFlooring : 'other',
              otherFlooringMaterial: isStandardFlooring ? '' : backendFlooring,
              wallMaterial: isStandardWallMaterial ? backendWallMaterial : 'other',
              otherWallMaterial: isStandardWallMaterial ? '' : backendWallMaterial,
              ceilingMaterial: isStandardCeilingMaterial ? backendCeilingMaterial : 'other',
              otherCeilingMaterial: isStandardCeilingMaterial ? '' : backendCeilingMaterial,
              image: home.home_img 
                ? { uri: home.home_img } 
                : require('../../../assets/images/property.png'),
            };
          }));
          
          setProperties(transformedProperties);
          setLoading(false);
        } catch (err) {
          setLoading(false);
          console.error("Failed to fetch homes:", err);
          
          if (err instanceof Error) {
            setError(err.message);
          } else {
            setError("An unknown error occurred");
          }
        }
      };
      
      fetchHomes();
  
      return () => {
        // Optional cleanup function
      };
    }, [userId]) // Add dependencies here
  );

  if (!fontsLoaded) {
    return null;
  }

  // Update function parameters
  const handleEdit = (property: Property) => {
    setSelectedProperty(property);
    setEditModalVisible(true);
  };

  const saveChanges = () => {
    console.log('Updated Property:', selectedProperty);
    setEditModalVisible(false);
  };

  const handleDelete = async (id: number) => {
    Alert.alert(
      'Delete Property', 
      'Are you sure you want to delete this property?', 
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          onPress: async () => {
            setIsDeleting(true);
            try {
              console.log(`id of home to be deleted: ${id}`)
              const response = await fetch(`https://flask-railway-sample-production.up.railway.app/homes/${id}`, {
                method: 'DELETE',
                headers: {
                  'X-API-KEY': API_KEY,
                  'Content-Type': 'application/json',
                },
              });
  
              if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
              }
  
              const result = await response.json();
              console.log('Delete successful:', result);
              
              // Update local state to remove the deleted home
              setProperties(properties.filter((prop) => prop.id !== id));
              
              // Show success message
              Alert.alert('Success', 'Property deleted successfully');
            } catch (error) {
              console.error('Error deleting property:', error);
              Alert.alert('Error', 'Failed to delete property. Please try again.');
            } finally {
              setIsDeleting(false);
            }
          }, 
          style: 'destructive' 
        }
      ]
    );
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });
  
      if (!result.canceled && result.assets && result.assets.length > 0 && selectedProperty) {
        setSelectedProperty({ 
          ...selectedProperty, 
          image: { uri: result.assets[0].uri } 
        });
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };
  
  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Loading properties...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Error loading properties</Text>
        <Text style={{ color: 'white' }}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Properties</Text>
      <FlatList
        data={properties}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }: { item: Property }) => (
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
            <TouchableOpacity onPress={() => setDefaultHomeAndNavigate(item.id)}>
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

      <TouchableOpacity style={styles.addButton} onPress={() => router.push('./addproperty_2')}>
        <Text style={styles.addButtonText}>Add Property</Text>
      </TouchableOpacity>

<Modal
  visible={isEditModalVisible}
  animationType="slide"
  transparent={true}
  onRequestClose={() => setEditModalVisible(false)}
>
  <KeyboardAvoidingView 
    behavior={Platform.OS === "ios" ? "padding" : "height"} 
    style={{ flex: 1 }}
  >
    <View style={styles.modalOverlay}>
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1 }} 
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Edit Property</Text>

          <TouchableOpacity onPress={() => pickImage()}>
            <Image 
              source={selectedProperty?.image} 
              style={styles.modalImage} 
            />
            <Text style={styles.changeImageText}>Change Image</Text>
          </TouchableOpacity>

          <TextInput
            style={styles.input}
            value={selectedProperty?.name}
            onChangeText={(text) => {
              if (selectedProperty) {
                setSelectedProperty({ ...selectedProperty, name: text });
              }
            }}
            placeholder="Property Name"
          />

          <TextInput
            style={styles.input}
            value={selectedProperty?.location}
            onChangeText={(text) => {
              if (selectedProperty) {
                setSelectedProperty({ ...selectedProperty, location: text });
              }
            }}
            placeholder="Location"
          />

          <TextInput
            style={styles.input}
            value={selectedProperty?.home_age}
            onChangeText={(text) => {
              if (selectedProperty) {
                setSelectedProperty({ ...selectedProperty, home_age: text });
              }
            }}
            placeholder="Age of the house (in years)"
            keyboardType="numeric"
          />

          <TextInput
            style={styles.input}
            value={selectedProperty?.primaryUse}
            onChangeText={(text) => {
              if (selectedProperty) {
                setSelectedProperty({ ...selectedProperty, primaryUse: text });
              }
            }}
            placeholder="Primary use of the house (e.g., Residential, Rental, Commercial)"
          />

          <TextInput
            style={styles.input}
            value={selectedProperty?.renovations}
            onChangeText={(text) => {
              if (selectedProperty) {
                setSelectedProperty({ ...selectedProperty, renovations: text });
              }
            }}
            placeholder="Has the house undergone repairs?"
          />

          {/* {(selectedProperty?.repairs || "").toLowerCase() === 'yes' && (
            <TextInput
              style={styles.input}
              value={selectedProperty?.repairDetails}
              onChangeText={(text) => {
                if (selectedProperty) {
                  setSelectedProperty({ ...selectedProperty, repairDetails: text });
                }
              }}
              placeholder="Specify repairs done"
            />
          )} */}

          <Text style={styles.label}>Type of House</Text>
          <Picker
            selectedValue={selectedProperty?.type}
            style={styles.picker}
            onValueChange={(itemValue) => {
              if (selectedProperty) {
                setSelectedProperty({ 
                  ...selectedProperty, 
                  type: itemValue,
                  otherType: itemValue === 'other' ? selectedProperty.otherType : ''
                });
              }
            }}
          >
            {HOUSE_TYPES.map((type) => (
              <Picker.Item key={type.value} label={type.label} value={type.value} />
            ))}
            <Picker.Item label="Other" value="other" />
          </Picker>

          {selectedProperty?.type === "other" && (
            <TextInput
              style={styles.input}
              value={selectedProperty?.otherType}
              onChangeText={(text) => {
                if (selectedProperty) {
                  setSelectedProperty({ ...selectedProperty, otherType: text });
                }
              }}
              placeholder="Specify type of house"
            />
          )}

          <Text style={styles.label}>Height of House</Text>
          <TextInput
            style={styles.input}
            value={selectedProperty?.num_floor}
            onChangeText={(text) => {
              if (selectedProperty) {
                setSelectedProperty({ ...selectedProperty, num_floor: text });
              }
            }}
            placeholder="Number of floors"
          />

          <Text style={styles.label}>Estimated Lot Area (sqm)</Text>
          <TextInput
            style={styles.input}
            value={selectedProperty?.lot_area}
            onChangeText={(text) => {
              if (selectedProperty) {
                setSelectedProperty({ ...selectedProperty, lot_area: text });
              }
            }}
            placeholder="Enter estimated lot area in sqm"
            keyboardType="numeric"
          />

          <Text style={styles.label}>Estimated Floor Area (sqm)</Text>
          <TextInput
            style={styles.input}
            value={selectedProperty?.floor_area}
            onChangeText={(text) => {
              if (selectedProperty) {
                setSelectedProperty({ ...selectedProperty, floor_area: text });
              }
            }}
            placeholder="Enter estimated floor area in sqm"
            keyboardType="numeric"
          />

          <Text style={styles.label}>Primary Material of the House</Text>
          <Picker
            selectedValue={selectedProperty?.primaryMaterial}
            style={styles.picker}
            onValueChange={(itemValue) => {
              if (selectedProperty) {
                setSelectedProperty({ 
                  ...selectedProperty, 
                  primaryMaterial: itemValue,
                  otherPrimaryMaterial: itemValue === 'mixed' ? selectedProperty.otherPrimaryMaterial : ''
                });
              }
            }}
          >
            {PRIMARY_MATERIALS.map((material) => (
              <Picker.Item 
                key={material.value} 
                label={material.label} 
                value={material.value} 
              />
            ))}
          </Picker>

          {selectedProperty?.primaryMaterial === "mixed" && (
            <TextInput
              style={styles.input}
              value={selectedProperty?.otherPrimaryMaterial}
              onChangeText={(text) => {
                if (selectedProperty) {
                  setSelectedProperty({ ...selectedProperty, otherPrimaryMaterial: text });
                }
              }}
              placeholder="Specify material"
            />
          )}

          <Text style={styles.label}>Primary Roofing Material</Text>
          <Picker
            selectedValue={selectedProperty?.roofingMaterial}
            style={styles.picker}
            onValueChange={(itemValue) => {
              if (selectedProperty) {
                setSelectedProperty({ 
                  ...selectedProperty, 
                  roofingMaterial: itemValue,
                  otherRoofingMaterial: itemValue === 'other' ? selectedProperty.otherRoofingMaterial : ''
                });
              }
            }}
          >
            {ROOFING_MATERIALS.map((material) => (
              <Picker.Item key={material.value} label={material.label} value={material.value} />
            ))}
            <Picker.Item label="Other" value="other" />
          </Picker>

          {selectedProperty?.roofingMaterial === "other" && (
            <TextInput
              style={styles.input}
              value={selectedProperty?.otherRoofingMaterial}
              onChangeText={(text) => {
                if (selectedProperty) {
                  setSelectedProperty({ ...selectedProperty, otherRoofingMaterial: text });
                }
              }}
              placeholder="Specify roofing material"
            />
          )}

          <Text style={styles.label}>Flooring Material</Text>
          <Picker
            selectedValue={selectedProperty?.flooringMaterial}
            style={styles.picker}
            onValueChange={(itemValue) => {
              if (selectedProperty) {
                setSelectedProperty({ 
                  ...selectedProperty, 
                  flooringMaterial: itemValue,
                  otherFlooringMaterial: itemValue === 'other' ? selectedProperty.otherFlooringMaterial : ''
                });
              }
            }}
          >
            {FLOORING_MATERIALS.map((type) => (
              <Picker.Item key={type.value} label={type.label} value={type.value} />
            ))}
            <Picker.Item label="Other" value="other" />
          </Picker>

          {selectedProperty?.flooringMaterial === "other" && (
            <TextInput
              style={styles.input}
              value={selectedProperty?.otherFlooringMaterial}
              onChangeText={(text) => {
                if (selectedProperty) {
                  setSelectedProperty({ ...selectedProperty, otherFlooringMaterial: text });
                }
              }}
              placeholder="Specify flooring material"
            />
          )}

          <Text style={styles.label}>Wall Material</Text>
          <Picker
            selectedValue={selectedProperty?.wallMaterial}
            style={styles.picker}
            onValueChange={(itemValue) => {
              if (selectedProperty) {
                setSelectedProperty({ 
                  ...selectedProperty, 
                  wallMaterial: itemValue,
                  otherWallMaterial: itemValue === 'other' ? selectedProperty.otherWallMaterial : ''
                });
              }
            }}
          >
            {WALL_MATERIALS.map((material) => (
              <Picker.Item key={material.value} label={material.label} value={material.value} />
            ))}
            <Picker.Item label="Other" value="other" />
          </Picker>

          {selectedProperty?.wallMaterial === "other" && (
            <TextInput
              style={styles.input}
              value={selectedProperty?.otherWallMaterial}
              onChangeText={(text) => {
                if (selectedProperty) {
                  setSelectedProperty({ ...selectedProperty, otherWallMaterial: text });
                }
              }}
              placeholder="Specify wall material"
            />
          )}

          <Text style={styles.label}>Ceiling Material</Text>
          <Picker
            selectedValue={selectedProperty?.ceilingMaterial}
            style={styles.picker}
            onValueChange={(itemValue) => {
              if (selectedProperty) {
                setSelectedProperty({ 
                  ...selectedProperty, 
                  ceilingMaterial: itemValue,
                  otherCeilingMaterial: itemValue === 'other' ? selectedProperty.otherCeilingMaterial : ''
                });
              }
            }}
          >
            {CEILING_MATERIALS.map((material) => (
              <Picker.Item key={material.value} label={material.label} value={material.value} />
            ))}
            <Picker.Item label="Other" value="other" />
          </Picker>

          {selectedProperty?.ceilingMaterial === "other" && (
            <TextInput
              style={styles.input}
              value={selectedProperty?.otherCeilingMaterial}
              onChangeText={(text) => {
                if (selectedProperty) {
                  setSelectedProperty({ ...selectedProperty, otherCeilingMaterial: text });
                }
              }}
              placeholder="Specify ceiling material"
            />
          )}

          <TouchableOpacity 
            style={styles.saveButton} 
            onPress={async () => {
              try {
                if (!selectedProperty) return;
                
                let imageUrl = null;
                
                // Check if the image is a new one (has a uri property and it's not from assets)
                if (selectedProperty.image?.uri && !selectedProperty.image?.uri.includes('file://')) {
                  // This is an existing URL, no need to upload
                  imageUrl = selectedProperty.image.uri;
                } else if (selectedProperty.image?.uri) {
                  // This is a new image that needs to be uploaded
                  imageUrl = await uploadImageToCloudinary(selectedProperty.image.uri);
                }
                
                const typeToSend = selectedProperty.type === 'other' 
                  ? selectedProperty.otherType 
                  : selectedProperty.type;
                const primaryMaterialToSend = selectedProperty.primaryMaterial === 'mixed' 
                  ? selectedProperty.otherPrimaryMaterial 
                  : selectedProperty.primaryMaterial;
                const roofingMaterialToSend = selectedProperty.roofingMaterial === 'other' 
                  ? selectedProperty.otherRoofingMaterial 
                  : selectedProperty.roofingMaterial;
                const flooringToSend = selectedProperty.flooringMaterial === 'other' 
                  ? selectedProperty.otherFlooringMaterial 
                  : selectedProperty.flooringMaterial;
                const wallMaterialToSend = selectedProperty.wallMaterial === 'other' 
                  ? selectedProperty.otherWallMaterial 
                  : selectedProperty.wallMaterial;
                const ceilingMaterialToSend = selectedProperty.ceilingMaterial === 'other' 
                  ? selectedProperty.otherCeilingMaterial 
                  : selectedProperty.ceilingMaterial;
                
                const response = await fetch(`https://flask-railway-sample-production.up.railway.app/homes/${selectedProperty.id}`, {
                  method: 'PUT',
                  headers: {
                    'X-API-KEY': API_KEY,
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    latitude: selectedProperty.latitude,
                    longitude: selectedProperty.longitude, 
                    home_name: selectedProperty.name,
                    home_age: selectedProperty.home_age,
                    primary_home_use: selectedProperty.primaryUse,
                    renovations: selectedProperty.renovations,
                    type_of_home: typeToSend,
                    num_floor: selectedProperty.num_floor,
                    lot_area: selectedProperty.lot_area,
                    floor_area: selectedProperty.floor_area,
                    primary_home_material: primaryMaterialToSend,
                    roof_material: roofingMaterialToSend,
                    floor_material: flooringToSend,
                    wall_material: wallMaterialToSend,
                    ceiling_material: ceilingMaterialToSend,
                    home_img: imageUrl || null, // Send the new image URL or null
                  }),
                });
                
                if (!response.ok) {
                  throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const update = JSON.stringify({
                  latitude: selectedProperty.latitude,
                  longitude: selectedProperty.longitude, 
                  home_name: selectedProperty.name,
                  home_age: selectedProperty.home_age,
                  primary_home_use: selectedProperty.primaryUse,
                  renovations: selectedProperty.renovations,
                  type_of_home: typeToSend,
                  num_floor: selectedProperty.num_floor,
                  lot_area: selectedProperty.lot_area,
                  floor_area: selectedProperty.floor_area,
                  primary_home_material: primaryMaterialToSend,
                  roof_material: roofingMaterialToSend,
                  floor_material: flooringToSend,
                  wall_material: wallMaterialToSend,
                  ceiling_material: ceilingMaterialToSend,
                  home_img: imageUrl || null,})
                
                console.log(`changes: ${update}`)

                const result = await response.json();
                console.log('Update successful:', result);
                
                // Update the local state to reflect the changes
                setProperties(properties.map(prop => 
                  prop.id === selectedProperty.id 
                    ? { ...selectedProperty, image: imageUrl ? { uri: imageUrl } : selectedProperty.image }
                    : prop
                ));
                
                setEditModalVisible(false);
                Alert.alert('Success', 'Property updated successfully');
              } catch (error) {
                console.error('Error updating property:', error);
                Alert.alert('Error', 'Failed to update property. Please try again.');
              }
            }}
            disabled={isUploading}
          >
            {isUploading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.saveText}>Save Changes</Text>
            )}
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
  container: {
    flex: 1,
    backgroundColor: '#0B417D',
    paddingTop: hp('6%'),
    paddingHorizontal: wp('5%'),
    paddingBottom: hp('4%')
  },
  title: {
    fontSize: wp('7.5%'),
    color: '#FFFFFF',
    fontFamily: 'Epilogue-Black',
    textAlign: 'center',
    marginBottom: hp('2.5%')
  },
  propertyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#08294E',
    borderRadius: wp('2.5%'),
    marginVertical: hp('0.8%'),
    padding: 0
  },
  propertyImage: {
    width: wp('18%'),
    height: hp('10%'),
    borderRadius: wp('2.5%'),
    marginRight: wp('4%')
  },
  propertyInfo: {
    flex: 1
  },
  propertyText: {
    fontSize: wp('4.5%'),
    color: '#7DBAFF',
    fontFamily: 'Epilogue-Bold'
  },
  propertyLocation: {
    fontSize: wp('3.5%'),
    color: '#B0C4DE',
    fontFamily: 'Archivo-Regular'
  },
  swipeActions: {
    flexDirection: 'row'
  },
  editAction: {
    marginTop: hp('0.8%'),
    height: hp('10%'),
    backgroundColor: '#007BFF',
    padding: wp('4%'),
    marginRight: wp('1.5%'),
    borderRadius: wp('1.5%')
  },
  deleteAction: {
    marginTop: hp('0.8%'),
    height: hp('10%'),
    backgroundColor: '#E55050',
    padding: wp('4%'),
    borderRadius: wp('1.5%')
  },
  swipeText: {
    marginTop: hp('2%'),
    color: '#FFFFFF',
    fontSize: wp('4%'),
    fontWeight: 'bold',
    textAlign: 'center'
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)'
  },
  modalContent: {
    width: wp('75%'),
    backgroundColor: 'white',
    padding: wp('5%'),
    borderRadius: wp('2.5%'),
    alignItems: 'center'
  },
  modalTitle: {
    fontSize: wp('5%'),
    fontWeight: 'bold',
    marginBottom: hp('1.2%')
  },
  modalImage: {
    width: wp('25%'),
    height: wp('25%'),
    borderRadius: wp('2.5%'),
    marginBottom: hp('1.5%')
  },
  changeImageText: {
    color: '#007BFF',
    fontSize: wp('4%')
  },
  input: {
    width: '100%',
    padding: wp('3%'),
    marginVertical: hp('0.8%'),
    borderRadius: wp('1.5%'),
    backgroundColor: '#f0f0f0'
  },
  saveButton: {
    backgroundColor: '#007BFF',
    padding: hp('1.5%'),
    borderRadius: wp('1.5%')
  },
  saveText: {
    color: 'white',
    fontWeight: 'bold'
  },
  cancelButton: {
    marginTop: hp('1.5%')
  },
  cancelText: {
    color: '#D11A2A',
    fontSize: wp('4%')
  },
  addButton: {
    backgroundColor: '#007BFF',
    padding: hp('1.5%'),
    borderRadius: wp('1.5%'),
    marginTop: -hp('12%'),
    alignSelf: 'center',
    width: wp('50%'),
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
    borderRadius: wp('1.5%'),
    marginVertical: hp('0.8%')
  },
  label: {
    fontSize: wp('4%'),
    fontWeight: 'bold',
    marginTop: hp('1.5%'),
    alignSelf: 'flex-start'
  },
});

export default MyProperties;