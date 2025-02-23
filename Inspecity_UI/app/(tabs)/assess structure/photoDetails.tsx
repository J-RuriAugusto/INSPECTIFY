import React, { useState } from 'react';
import { View, Text, Image, TextInput, TouchableOpacity, StyleSheet, ImageBackground, Modal, FlatList, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import * as Sharing from 'expo-sharing';
// import Share from 'react-native-share';
import { useNavigation } from '@react-navigation/native';

const PhotoDetails = () => {
  const params = useLocalSearchParams();
  const navigation = useNavigation();
  const photo = params.photo as string;
  
  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditNoteModalVisible] = useState(false);
  const [notes, setNotes] = useState('');
  // Dummy contact list
  const contacts = [
    { id: '1', name: 'Alice', image: require('../../../assets/images/user1.png') },
    { id: '2', name: 'Bob', image: require('../../../assets/images/user1.png') },
    { id: '3', name: 'Charlie', image: require('../../../assets/images/user1.png') },
    { id: '4', name: 'David', image: require('../../../assets/images/user1.png') },
    { id: '5', name: 'Emma', image: require('../../../assets/images/user1.png') },
  ];


  const sharePhoto = async () => {
    if (!(await Sharing.isAvailableAsync())) {
      alert("Sharing is not available on this device");
      return;
    }
    await Sharing.shareAsync(photo);
  };  

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
            <TouchableOpacity style={styles.shareButton} onPress={sharePhoto}>
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
          <TouchableOpacity style={styles.shareButton} onPress={sharePhoto}>
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
  
              {/* Captured Image from Camera */}
                <View style={styles.imageWrapper}>
                  <Image source={{ uri: photo }} style={styles.capturedImage} />
                  <Text style={styles.scannedImageText}>Scanned Image</Text>
                </View>

                {/* Condition Details */}
                <View style={styles.conditionWrapper}>
                  <Text style={styles.conditionText}>Condition:</Text>
                  <Text style={styles.conditionBadge}>Moderate</Text>
                </View>

  
              <Text style={styles.sectionTitle}>Detected Issues:</Text>
              <Text style={styles.detailText}>• Crack near the center</Text>
  
              <Text style={styles.sectionTitle}>Material:</Text>
              <Text style={styles.detailText}>• Concrete (Age: 20 years)</Text>
  
              <Text style={styles.sectionTitle}>Recommendations:</Text>
              <Text style={styles.detailText}>• Seal cracks using epoxy.</Text>
              <TouchableOpacity style={styles.shopButton}>
                <Text style={styles.shopButtonText}>Find Nearby Shops</Text>
              </TouchableOpacity>
  
              <View style={styles.rowContainer}>
                <Text style={styles.sectionTitle}>Notes</Text>
                <TouchableOpacity style={styles.editButton} onPress={() => setEditNoteModalVisible(true)}>
                  <Text style={styles.editButtonText}>Edit Note</Text>
                </TouchableOpacity>
              </View>
                <TextInput
                  style={styles.notesInput}
                  placeholder="Click edit note to add/edit a note..."
                  placeholderTextColor="#A0A0A0"
                  value={notes}
                  editable={false}
                  multiline
                />
            </View>
          </ScrollView>
        </View>

        {/* Edit Note Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={editModalVisible}
          onRequestClose={() => setEditNoteModalVisible(false)}
        >
          <View style={styles.modalEditContainer}>
            
            {/* Floating Close Button */}
            <TouchableOpacity 
              style={styles.closeEditButton} 
              onPress={() => setEditNoteModalVisible(false)}
            >
              <Image 
                source={require('../../../assets/images/close-icon.png')}  // Change the path to your image
                style={styles.closeEditButtonImage}
              />
            </TouchableOpacity>

            <View style={styles.modalEditContent}>
              <Text style={styles.modalEditTitle}>Edit Note</Text>
              
              <TextInput
                style={styles.editNotesInput}
                value={notes} 
                onChangeText={setNotes}
                placeholder="Enter your note here..."
                placeholderTextColor="#A0A0A0"
                multiline
              />
              
              <TouchableOpacity 
                style={styles.saveButton} 
                onPress={() => setEditNoteModalVisible(false)}
              >
                <Text style={styles.saveButtonText}>Save Note</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>


        {/* Share Modal */}
        {/* <Modal
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
                  <TouchableOpacity style={styles.contactItem} onPress={sharePhoto}>
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
        </Modal> */}
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
  buttonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },

  // Share Modal styles
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
    left: '50%',
    transform: [{ translateX: -150 }],
    zIndex: 10,
    alignItems: 'center'
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
  capturedImage: {
    width: 200,
    height: 200,
    alignSelf: 'center',
    borderRadius: 10,
    backgroundColor: '#00A8E8'
  },
  imageWrapper: {
    alignSelf: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  scannedImageText: {
    marginTop: 5,
    fontFamily: 'Epilogue-Regular',
    fontSize: 10,
    color: '#071C34',
    textAlign: 'center'
  },  
  conditionWrapper: {
    width: '40%',
    alignSelf: 'center',
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 5,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5
  },
  conditionText: {
    fontFamily: 'Epilogue-Bold',
    fontSize: 15,
    textAlign: 'center',
    color: '#071C34'
  },
  conditionBadge: {
    backgroundColor: '#FFA500',
    fontFamily: 'Epilogue-Regular',
    textAlign: 'center',
    fontSize: 13,
    borderRadius: 15,
    marginVertical: 3,
  },
  detailText: {
    fontSize: 15,
    fontFamily: 'Epilogue-Medium',
    color: '#000',
    marginBottom: 10,
  },  
  sectionTitle: {
    color: '#FFF',
    fontSize: 15,
    fontFamily: 'Epilogue-Bold',
    marginBottom: 5,
    backgroundColor: '#0B417D',
    borderRadius: 15,
    paddingHorizontal: 9,
    paddingVertical: 5,
    alignSelf: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5
  },  
  shopButton: { backgroundColor: '#ACD3FF', borderRadius: 15, alignSelf: 'center', paddingHorizontal: 9, paddingVertical: 5, width: '60%', marginBottom: 5,   // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5},
  shopButtonText: { color: '#0B417D', fontSize: 15, fontFamily: 'Epilogue-Bold', textAlign: 'center' },
  rowContainer: {
    flexDirection: 'row', 
    justifyContent: 'space-between', // Pushes "Edit Note" to the right
    alignItems: 'center', // Align items in the same row
    marginBottom: 10
  },
  notesInput: { backgroundColor: '#FFF', borderRadius: 15,  // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    flex: 1,
    fontSize: 16,
    color: '#32373E',
    fontFamily: 'Epilogue-Regular',
  },
  editNotesInput: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    flex: 1,
    fontSize: 16,
    color: '#32373E',
    fontFamily: 'Epilogue-Regular',
    textAlignVertical: 'top',
  },
  editButton: { backgroundColor: '#B0EDEB', padding: 10, borderRadius: 15, paddingHorizontal: 9, paddingVertical: 5,   // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5
  },
  editButtonText: { color: '#05173F', fontSize: 15, fontFamily: 'Epilogue-Bold' },
  modalEditContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    position: 'relative'
  },
  modalEditContent: {
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    height: '60%',
    width: '90%',
    alignSelf: 'center'
  },
  modalEditTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15 },
  closeEditButton: {
    position: 'absolute',
    top: 100,
    right: 10,
    width: 50,
    height: 50,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeEditButtonImage: {
    width: 35,  // Adjust based on your image size
    height: 35,
    resizeMode: 'contain',  // Ensures it fits well
  },
  saveButton: {
    position: 'absolute',
    bottom: -50,
    right: 0,
    backgroundColor: '#ADE792',
    borderRadius: 8,
    width: '40%',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 5
  },
  saveButtonText: {
    color: '#05173F',
    fontSize: 18,
    fontFamily: 'Epilogue-Bold',
  },  
});

export default PhotoDetails;
