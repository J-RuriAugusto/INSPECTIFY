import React, { useState, useEffect } from 'react';
import { View, Text, Image, TextInput, TouchableOpacity, TouchableWithoutFeedback, StyleSheet, ImageBackground, ScrollView, ActivityIndicator, Alert, BackHandler } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Modal from 'react-native-modal'; // Only import Modal from react-native-modal
import axios from 'axios';
import * as FileSystem from 'expo-file-system';

const PhotoDetails = () => {
  const params = useLocalSearchParams();
  const navigation = useNavigation();
  const router = useRouter();
  const reportID = parseInt(Array.isArray(params.report_id) ? params.report_id[0] : params.report_id, 10);
  const API_KEY = 'BT_1smAfCA4roEldR7S9LObSgdbZ7uGAF2HJvs5VQyY';

  const [editModalVisible, setEditNoteModalVisible] = useState(false);
  const [notes, setNotes] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [reportName, setReportName] = useState('');
  const [condition, setCondition] = useState('');
  const [annotatedImage, setAnnotatedImage] = useState('');
  const [material, setMaterial] = useState('');
  const [materialAge, setMaterialAge] = useState('');
  const [recommendations, setRecommendations] = useState('');
  const [damageTypes, setDamageTypes] = useState<string[]>([]); // State for detected issues
  const [isImageModalVisible, setImageModalVisible] = useState(false); // State for full-screen image modal
  const [dateCreated, setDateCreated] = useState('');
  const [reportModalVisible, setReportModalVisible] = useState(false);

  const saveReport = () => {
    alert("Report Saved!");
    setReportModalVisible(false);
  };

  const deleteReport = () => {
    alert("Report Deleted!");
    setReportModalVisible(false);
  };

  useFocusEffect(
    React.useCallback(() => {
      if (reportID) {
        fetchReportDetails(reportID);
        fetchNotes(reportID);
      }

      return () => {
        // Cleanup if necessary
      };
    }, [reportID])
  );

  const fetchReportDetails = async (reportId:number) => {
    try {
      const response = await axios.get(`https://flask-railway-sample-production.up.railway.app/reports/${reportId}`, {
        headers: {
          'X-API-KEY': API_KEY,
        },
      });

      if (response.data) {
        setReportName(response.data.report_name)
        setAnnotatedImage(response.data.annotated_image);
        setCondition(response.data.condition);
        setMaterial(response.data.material);
        setMaterialAge(response.data.material_age);
        setRecommendations(response.data.recommendations);
        setDamageTypes(response.data.damage_types || []);
        setDateCreated(response.data.date_created);
      }
    } catch (error) {
      console.error('Error fetching report details: ', error);
      Alert.alert('Error', 'Failed to fetch report details');
    }
  };

  const fetchNotes = async (reportId: number) => {
    try {
      const response = await axios.get(
        `https://flask-railway-sample-production.up.railway.app/report/${reportId}/note`,
        {
          headers: {
            'X-API-KEY': API_KEY,
          },
        }
      );
  
      if (response.data && response.data.note) {
        setNotes(response.data.note); // Update the notes state with the fetched note
      }
    } catch (error) {
      console.error('Error fetching notes: ', error);
      Alert.alert('Error', 'Failed to fetch notes');
    }
  };

  const updateNote = async () => {
    if (!reportID) {
      Alert.alert("Error", "Report ID is missing.");
      return;
    }

    try {
      const response = await axios.put(
        `https://flask-railway-sample-production.up.railway.app/report/${reportID}/note`,
        { note: notes },
        {
          headers: {
            'X-API-KEY': API_KEY,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 200) {
        Alert.alert("Success", "Note updated successfully");
        setEditNoteModalVisible(false);
      } else {
        Alert.alert("Error", "Failed to update note");
      }
    } catch (error) {
      console.error("Error updating note:", error);
      Alert.alert("Error", "An error occurred while updating the note");
    }
  };

  const sharePhoto = async () => {
    if (!(await Sharing.isAvailableAsync())) {
      alert("Sharing is not available on this device");
      return;
    }
    await Sharing.shareAsync(annotatedImage);
  }; 

  if (!annotatedImage) {
    return (
      <ImageBackground source={require('../../../assets/images/background.png')} style={styles.background}>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <Image source={require('../../../assets/images/back-icon.png')} style={styles.backIcon} />
              <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.shareButton} onPress={sharePhoto}>
              <Image source={require('../../../assets/images/share-icon.png')} style={styles.shareIcon} />
            </TouchableOpacity>
          </View>
          <Text style={styles.title}>Fetching Details</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.replace('../dashboard/dashboard')}>
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

          {/* Save/Delete Report Button */}
          <TouchableOpacity onPress={() => setReportModalVisible(true)}>
            <Image source={require('../../../assets/images/save.png')} style={styles.reportIcon} />
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
              <Text style={styles.title}>
                {reportName ? reportName : "Living Room - Left Wall"}
              </Text>
              <Text style={styles.subtitle}>{dateCreated || 'Loading date...'}</Text>
  
              {/* Captured Image from Camera */}
              <View style={styles.imageWrapper}>
                <TouchableOpacity onPress={() => setImageModalVisible(true)}>
                  <Image source={{ uri: annotatedImage }} style={styles.capturedImage} />
                </TouchableOpacity>
                <Text style={styles.scannedImageText}>Scanned Image</Text>
              </View>

                {/* Condition Details */}
                <View style={styles.conditionWrapper}>
                  <Text style={styles.conditionText}>Overall Condition:</Text>
                  <Text style={styles.conditionBadge}>{condition}</Text>
                  <View style={styles.rowContainer}>
                    <Text style={styles.ageText}>Age:</Text>
                    <Text style={styles.ageNumText}>
                      {materialAge != null ? `${materialAge} years` : "N/A"}
                    </Text>
                  </View>
                </View>

  
              {/* Detected Issues */}
              <Text style={styles.sectionTitle}>Detected Issues:</Text>
              {damageTypes.map((damage, index) => (
                <Text key={index} style={styles.detailText}>• {damage}</Text>
              ))}


              <Text style={styles.sectionTitle}>Material:</Text>
              <View style={styles.rowContainer}>
                <Text style={styles.concText}>• {material} </Text>
              </View>
  
              <Text style={styles.sectionTitle}>Recommendations:</Text>
              <Text style={styles.detailText}>• {recommendations}</Text>
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
                  placeholder={notes ? notes : "Click edit note to add/edit a note."}
                  placeholderTextColor="#A0A0A0"
                  value={notes}
                  editable={false}
                  multiline
                />
            </View>
          </ScrollView>
          
        </View>
        
        <Modal
          isVisible={reportModalVisible}
          animationIn="fadeIn"
          animationOut="fadeOut"
          onBackdropPress={() => setReportModalVisible(false)}
        >
          <TouchableWithoutFeedback onPress={() => setReportModalVisible(false)}>
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Manage Report</Text>

                {/* Save Report Button */}
                <TouchableOpacity 
                  style={styles.modalButton} 
                  onPress={() => {
                    saveReport();
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.modalButtonText}>Save Report</Text>
                </TouchableOpacity>

                {/* Delete Report Button */}
                <TouchableOpacity 
                  style={[styles.modalButton, { backgroundColor: 'red' }]} 
                  onPress={() => {
                    deleteReport();
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.modalButtonText}>Delete Report</Text>
                </TouchableOpacity>

                {/* Close Button */}
                <TouchableOpacity 
                  style={styles.closeButton} 
                  onPress={() => setReportModalVisible(false)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>


        {/* Full Screen Image Modal */}
        <Modal 
          isVisible={isImageModalVisible} 
          onBackdropPress={() => setImageModalVisible(false)} 
          style={{ margin: 0, justifyContent: 'center', alignItems: 'center' }}
        >
          <View style={{ backgroundColor: 'white', padding: 10, borderRadius: 10 }}>
            <TouchableOpacity onPress={() => setImageModalVisible(false)}>
              <Text style={{ alignSelf: 'flex-end', padding: 10, fontSize: 18 }}>Close</Text>
            </TouchableOpacity>
            <Image 
              source={{ uri: annotatedImage }} 
              style={{ width: 300, height: 400, resizeMode: 'contain' }} 
            />
          </View>
        </Modal>

        {/* Edit Note Modal */}
        <Modal
          isVisible={editModalVisible} // Use isVisible instead of visible
          onBackdropPress={() => setEditNoteModalVisible(false)}
          style={styles.modalEditContainer}
        >
          <View style={styles.modalEditContainer}>
            
            {/* Floating Close Button */}
            <TouchableOpacity 
              style={styles.closeEditButton} 
              onPress={() => setEditNoteModalVisible(false)}
            >
              <Image 
                source={require('../../../assets/images/close-icon.png')}
                style={styles.closeEditButtonImage}
              />
            </TouchableOpacity>

            <View style={styles.modalEditContent}>
              <Text style={styles.modalEditTitle}>Edit Note</Text>
              
              <TextInput
                style={styles.editNotesInput}
                value={notes} 
                onChangeText={setNotes}
                placeholder="Enter your note here."
                placeholderTextColor="#A0A0A0"
                multiline
              />
              
              <TouchableOpacity 
                style={styles.saveButton} 
                onPress={updateNote}
              >
                <Text style={styles.saveButtonText}>Save Note</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Uploading Modal */}
          <Modal 
            isVisible={isUploading} 
            backdropOpacity={0.5}
            style={styles.uploadingModal}
          >
            <View style={styles.uploadingModalContent}>
              <ActivityIndicator size="large" color="#00A8E8" />
              <Text style={styles.uploadingText}>Uploading...</Text>
            </View>
          </Modal>
      </View>
    </ImageBackground>
  );  
};

const styles = StyleSheet.create({
  background: { flex: 1, resizeMode: 'cover', position: 'absolute', width: '100%', height: '100%' },
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0, 43, 91, 0.7)' },
  header: {
    position: 'absolute',
    top: '4%',
    zIndex: 10,
    right: '3%',
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
  backButton: { flexDirection: 'row', alignItems: 'center', right: '142%' },
  backIcon: { width: 30, height: 30, marginRight: 5 },
  backText: { fontSize: 17, fontFamily: 'Epilogue-Bold', color: '#FFFFFF' },
  shareButton: { padding: 5 },
  shareIcon: { width: 30, height: 30 },
  buttonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  imageContainer: {
    position: 'absolute',
    top: '5%',
    left: '50%',
    transform: [{ translateX: -150 }],
    zIndex: 9,
    alignItems: 'center'
  },
  houseImage: { width: 300, height: 250 },  
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
  scrollContent: { padding: 20 },
  detailsContainer: { flexGrow: 1 },
  title: { fontFamily: 'Epilogue-Bold', fontSize: 25, color: '#2B3C62', textAlign: 'center', marginTop: 30 },
  subtitle: { fontFamily: 'Epilogue-Regular', fontSize: 12, textAlign: 'center', color: '#32373E', marginTop: 3, marginBottom: 10 },
  capturedImage: {
    width: 200,
    height: 200,
    alignSelf: 'center',
    borderRadius: 10,
    backgroundColor: '#00A8E8'
  },
  imageWrapper: { alignSelf: 'center', justifyContent: 'center', marginVertical: 10 },
  scannedImageText: { marginTop: 5, fontFamily: 'Epilogue-Regular', fontSize: 10, color: '#000', textAlign: 'center'},  
  conditionWrapper: {
    width: '40%',
    alignSelf: 'center',
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5
  },
  ageNumText: {
    backgroundColor: '#B7B7B7',
    color: '#FFF',
    fontFamily: 'Epilogue-Medium',
    fontSize: 15,
    borderRadius: 15,
    paddingHorizontal: 9,
    paddingVertical: 2,
  }, 
  ageText: { fontSize: 15, fontFamily: 'Epilogue-Bold', color: '#071C34' },
  shopButton: {
    backgroundColor: '#ACD3FF',
    borderRadius: 15,
    alignSelf: 'center',
    paddingHorizontal: 9,
    paddingVertical: 5,
    width: '60%',
    marginBottom: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5
  },
  shopButtonText: { color: '#0B417D', fontSize: 15, fontFamily: 'Epilogue-Bold', textAlign: 'center' },
  rowContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 },
  conditionText: { fontFamily: 'Epilogue-Bold', fontSize: 15, textAlign: 'center', color: '#071C34' },
  conditionBadge: {
    backgroundColor: '#FFA500',
    fontFamily: 'Epilogue-Regular',
    textAlign: 'center',
    fontSize: 13,
    borderRadius: 15,
    marginVertical: 3,
  },
  detailText: { fontSize: 15, fontFamily: 'Epilogue-Medium', color: '#000', marginBottom: 10 },  
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
  concText: { fontSize: 15, fontFamily: 'Epilogue-Medium', color: '#000' },  
  editNotesInput: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    flex: 1,
    fontSize: 16,
    color: '#32373E',
    fontFamily: 'Epilogue-Regular',
    textAlignVertical: 'top',
  },
  editButton: {
    backgroundColor: '#B0EDEB',
    padding: 10,
    borderRadius: 15,
    paddingHorizontal: 9,
    paddingVertical: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5
  },
  editButtonText: { color: '#05173F', fontSize: 15, fontFamily: 'Epilogue-Bold' },
  modalEditContainer: { flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)', position: 'relative'},
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
  closeEditButtonImage: { width: 35, height: 35, resizeMode: 'contain'},
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
  saveButtonText: { color: '#05173F', fontSize: 18, fontFamily: 'Epilogue-Bold'},  
  reportIcon: {
    width: 30,
    height: 30,
  },
  uploadingModal: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadingModalContent: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  uploadingText: {
    marginTop: 10,
    fontSize: 18,
    fontFamily: 'Epilogue-Bold',
    color: '#002B5B',
  },
  fullScreenModal: {
    margin: 0, // Ensures full width and height
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  fullscreenModal: {
    margin: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenImage: {
    width: '100%',
    height: '100%',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Epilogue-Bold',
    marginBottom: 5,
  },
  modalButton: {
    backgroundColor: '#002B5B',
    padding: 12,
    borderRadius: 8,
    width: '80%',
    alignItems: 'center',
    marginVertical: 5,
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Epilogue-Bold',
  },
  closeButton: {
    padding: 5,
    borderRadius: 8,
    width: '80%',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    fontFamily: 'Epilogue-Medium',
    color: '#333',
  },
  notesInput: {
    backgroundColor: '#FFF',
    borderRadius: 15,
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
});

export default PhotoDetails;
