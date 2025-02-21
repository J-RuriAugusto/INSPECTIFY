import React, { useState } from 'react';
import { View, Text, Image, TextInput, TouchableOpacity, StyleSheet, ImageBackground, Modal, FlatList, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useNavigation } from '@react-navigation/native';

const PhotoDetails = () => {
  const params = useLocalSearchParams();
  const navigation = useNavigation();
  const photo = params.photo as string;
  const [notes, setNotes] = useState('Hi, test Notes');
  
  // Modal state
  const [modalVisible, setModalVisible] = useState(false);

  // Dummy contact list
  const contacts = [
    { id: '1', name: 'Alice', image: require('../../../assets/images/user1.png') },
    { id: '2', name: 'Bob', image: require('../../../assets/images/user1.png') },
    { id: '3', name: 'Charlie', image: require('../../../assets/images/user1.png') },
    { id: '4', name: 'David', image: require('../../../assets/images/user1.png') },
    { id: '5', name: 'Emma', image: require('../../../assets/images/user1.png') },
  ];

  if (!photo) {
    return (
      <ImageBackground source={require('../../../assets/images/background.png')} style={styles.background}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <Image source={require('../../../assets/images/back-icon.png')} style={styles.backIcon} />
              <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>

            {/* Share Button */}
            <TouchableOpacity style={styles.shareButton} onPress={() => setModalVisible(true)}>
              <Image source={require('../../../assets/images/share-icon.png')} style={styles.shareIcon} />
            </TouchableOpacity>
          </View>

          <Text style={styles.title}>No photo provided!</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Image source={require('../../../assets/images/back-icon.png')} style={styles.backIcon} />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground source={require('../../../assets/images/background.png')} style={styles.background}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Image source={require('../../../assets/images/back-icon.png')} style={styles.backIcon} />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
  
          {/* Share Button */}
          <TouchableOpacity style={styles.shareButton} onPress={() => setModalVisible(true)}>
            <Image source={require('../../../assets/images/share-icon.png')} style={styles.shareIcon} />
          </TouchableOpacity>
        </View>
  
        {/* Image Container */}
        <View style={styles.imageContainer}>
          <Image source={require('../../../assets/images/house-details.png')} style={styles.houseImage} />
        </View>
  
        {/* Details Container with ScrollView */}
        <View style={styles.detailsWrapper}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.detailsContainer}>
              <Text style={styles.title}>Living Room - Left Wall</Text>
              <Text style={styles.subtitle}>December 13, 2024 • 9:00 AM</Text>
              <Image source={{ uri: photo }} style={styles.scannedImage} />
  
              <View style={styles.conditionContainer}>
                <Text style={styles.conditionText}>Condition:</Text>
                <Text style={styles.conditionBadge}>Moderate</Text>
              </View>
              <Text style={styles.detailText}>Length: 5 cm</Text>
              <Text style={styles.detailText}>Depth: 2 cm</Text>
  
              <Text style={styles.sectionTitle}>Detected Issues:</Text>
              <Text style={styles.detailText}>• Crack near the center</Text>
  
              <Text style={styles.sectionTitle}>Material:</Text>
              <Text style={styles.detailText}>• Concrete (Age: 20 years)</Text>
  
              <Text style={styles.sectionTitle}>Recommendations:</Text>
              <Text style={styles.detailText}>• Seal cracks using epoxy.</Text>
              <TouchableOpacity style={styles.shopButton}>
                <Text style={styles.shopButtonText}>Find Nearby Shops</Text>
              </TouchableOpacity>
  
              <View style={styles.notesContainer}>
                <Text style={styles.sectionTitle}>Notes</Text>
                <TextInput
                  style={styles.notesInput}
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="Enter your notes here"
                  placeholderTextColor="#A0A0A0"
                />
                <TouchableOpacity style={styles.editButton}>
                  <Text style={styles.editButtonText}>Edit Note</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>

        {/* Share Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Share With</Text>

              <FlatList
                data={contacts}
                horizontal
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity style={styles.contactItem}>
                    <Image source={item.image} style={styles.contactImage} />
                    <Text style={styles.contactText}>{item.name}</Text>
                  </TouchableOpacity>
                )}
              />

              <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </ImageBackground>
  );  
};

const styles = StyleSheet.create({
  background: { 
    flex: 1, 
    resizeMode: 'cover',
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  container: { 
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 43, 91, 0.7)'
  },
  header: {
    position: 'absolute',
    top: 40,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  input: {
    width: '90%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 20,
    backgroundColor: 'white',
  },
  backButton: { flexDirection: 'row', alignItems: 'center' },
  backIcon: { width: 30, height: 30, marginRight: 5 },
  backText: { fontSize: 17, color: '#FFFFFF' },
  shareButton: { padding: 5 },
  shareIcon: { width: 30, height: 30 },
  saveButton: { backgroundColor: '#007AFF', padding: 12, borderRadius: 8, width: '90%', alignItems: 'center' },
  buttonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },

  // Modal styles
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
  },
  modalContent: {
    backgroundColor: '#FFF',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    alignItems: 'center',
  },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15 },
  contactList: {
    flexDirection: 'row',
    paddingVertical: 10,
  },
  contactItem: {
    alignItems: 'center',
    marginHorizontal: 10,
  },
  contactImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  contactText: {
    marginTop: 5,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: '#002B5B',
    padding: 12,
    borderRadius: 8,
    width: '90%',
    alignItems: 'center',
  },
  closeButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  imageContainer: {
    position: 'absolute',
    top: 40,
    left: '50%',  // Move the left edge to the center of the screen
    transform: [{ translateX: -150 }], // Adjust based on half of the image width (250 / 2)
    zIndex: 10, // Ensure it's above the details container
    alignItems: 'center', // Center any child elements
  },
  houseImage: {
    width: 300,
    height: 250,
  },  
  detailsWrapper: {
    height: '69%',
    width: '100%',
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    paddingTop: 15,
  },   
  scrollContent: {
    padding: 20, 
  },
  detailsContainer: {
    flexGrow: 1, 
  },
  title: { fontSize: 20, fontWeight: 'bold', textAlign: 'center' },
  subtitle: { textAlign: 'center', color: '#888', marginBottom: 10 },
  scannedImage: { width: '100%', height: 200, borderRadius: 10, marginBottom: 10 },
  conditionContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  conditionText: { fontSize: 16, fontWeight: 'bold' },
  conditionBadge: { backgroundColor: '#FFD700', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, marginLeft: 10 },
  detailText: { fontSize: 16, marginBottom: 5 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 10 },
  shopButton: { backgroundColor: '#3B82F6', padding: 10, borderRadius: 10, marginTop: 10, alignItems: 'center' },
  shopButtonText: { color: '#FFF', fontSize: 16 },
  notesContainer: { marginTop: 20 },
  notesInput: { backgroundColor: '#EEE', padding: 10, borderRadius: 10, marginTop: 5 },
  editButton: { backgroundColor: '#22C55E', padding: 10, borderRadius: 10, marginTop: 10, alignItems: 'center' },
  editButtonText: { color: '#FFF', fontSize: 16 }
});

export default PhotoDetails;
