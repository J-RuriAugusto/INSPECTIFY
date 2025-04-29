import React, { useState } from 'react';
import { View, Text, Image, TextInput, TouchableOpacity, TouchableWithoutFeedback, StyleSheet, ImageBackground, Modal, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { useNavigation } from '@react-navigation/native';
import * as Print from 'expo-print';
import { useFonts } from 'expo-font';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const PhotoDetails = () => {
  // const [fontsLoaded] = useFonts({
  //   'Epilogue-Black': require('../../../assets/fonts/Epilogue-Black.ttf'),
  //   'Archivo-Regular': require('../../../assets/fonts/Archivo-Regular.ttf'),
  //   'Epilogue-Bold': require('../../../assets/fonts/Epilogue-Bold.ttf'),
  // });

  // if (!fontsLoaded) {
  //   return null; 
  // }

  const params = useLocalSearchParams();
  const navigation = useNavigation<any>();
  const photo = params.photo as string;
  const [editModalVisible, setEditNoteModalVisible] = useState(false);
  const [notes, setNotes] = useState('');
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const reportDate = "December 13, 2024 • 9:00 AM";
  const condition = "Moderate";
  const age = "20 years";
  const issues = ["Crack near the center"];
  const recommendations = ["Seal cracks using epoxy."];


  const saveReport = () => {
    alert("Report Saved!");
    setReportModalVisible(false);
    navigation.popToTop();
  };

  const deleteReport = () => {
    alert("Report Deleted!");
    setReportModalVisible(false);
    navigation.popToTop();
  };
  
  const shareReportAsPDF = async () => {
    if (!(await Sharing.isAvailableAsync())) {
      alert("Sharing is not available on this device");
      return;
    }
  
    // Convert issues and recommendations into <li> elements
    const issuesHTML = issues.map(issue => `<li>${issue}</li>`).join('');
    const recommendationsHTML = recommendations.map(rec => `<li>${rec}</li>`).join('');
  
    const htmlContent = `
      <html>
        <head>
          <style>
            body { font-family: Arial; padding: 20px; }
            h1 { color: #2E86C1; }
            img { margin-top: 10px; border-radius: 10px; }
            ul { padding-left: 20px; }
            .label { font-weight: bold; margin-top: 10px; }
          </style>
        </head>
        <body>
          <h1>Living Room - Left Wall</h1>
          <p><span class="label">Date:</span> ${reportDate}</p>
  
          <h2>Condition</h2>
          <p>${condition} (Age: ${age})</p>
  
          <h2>Detected Issues</h2>
          <ul>${issuesHTML}</ul>
  
          <h2>Recommendations</h2>
          <ul>${recommendationsHTML}</ul>
  
          <h2>Notes</h2>
          <p>${notes || 'No notes added.'}</p>
  
          <h2>Scanned Image</h2>
          ${photo ? `<img src="${photo}" width="300"/>` : '<p>No image available</p>'}
        </body>
      </html>
    `;
  
    const { uri } = await Print.printToFileAsync({ html: htmlContent });
  
    await Sharing.shareAsync(uri);
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

            {/* Save/Delete Report Button */}
            <TouchableOpacity onPress={() => setReportModalVisible(true)}>
              <Image source={require('../../../assets/images/save.png')} style={styles.reportIcon} />
            </TouchableOpacity>
            
            {/* Share Button */}
            <TouchableOpacity style={styles.shareButton} onPress={shareReportAsPDF}>
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

          {/* Save/Delete Report Button */}
          <TouchableOpacity onPress={() => setReportModalVisible(true)}>
            <Image source={require('../../../assets/images/save.png')} style={styles.reportIcon} />
          </TouchableOpacity>
  
          {/* Share Button */}
          <TouchableOpacity style={styles.shareButton} onPress={shareReportAsPDF}>
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
                  <View style={styles.rowContainer}>
                    <Text style={styles.ageText}>Age:</Text><Text style={styles.ageNumText}>20 years</Text>
                  </View>
                </View>

  
              <Text style={styles.sectionTitle}>Detected Issues:</Text>
              <Text style={styles.detailText}>• Crack near the center</Text>
              <Text style={styles.sectionTitle}>Recommendations:</Text>
              <Text style={styles.detailText}>• Seal cracks using epoxy.</Text>
              <TouchableOpacity 
                style={styles.shopButton} 
                onPress={() => navigation.navigate('Shops')}
              >
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
                  placeholder="Click edit note to add/edit a note."
                  placeholderTextColor="#A0A0A0"
                  value={notes}
                  editable={false}
                  multiline
                />
            </View>
          </ScrollView>
        </View>

        <Modal
          animationType="fade"
          transparent={true}
          visible={reportModalVisible}
          onRequestClose={() => setReportModalVisible(false)}
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
                onPress={() => setEditNoteModalVisible(false)}
              >
                <Text style={styles.saveButtonText}>Save Note</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </ImageBackground>
  );  
};

const styles = StyleSheet.create({
  // Background & Container
  background: { flex: 1, resizeMode: 'cover', position: 'absolute', width: wp('100%'), height: hp('100%') },
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0, 43, 91, 0.7)' },

  // Header
  header: { position: 'absolute', top: hp('3%'), right: wp('3%'), zIndex: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  backButton: { flexDirection: 'row', alignItems: 'center', right: wp('52%') },
  backIcon: { width: wp('8%'), height: hp('4%'), marginRight: wp('1.5%') },
  backText: { fontSize: wp('4.5%'), fontFamily: 'Epilogue-Bold', color: '#FFF' },
  shareButton: { padding: wp('2%') },
  shareIcon: { width: wp('8%'), height: wp('8%') },

  // Image Display
  imageContainer: { position: 'absolute', top: hp('3%'), left: wp(1), zIndex: 9, alignItems: 'center' },
  houseImage: { width: wp('100%'), height: hp('35%') },
  capturedImage: { width: wp('55%'), height: wp('55%'), alignSelf: 'center', borderRadius: 10, backgroundColor: '#00A8E8' },
  imageWrapper: { alignSelf: 'center', justifyContent: 'center', marginVertical: 10 },
  scannedImageText: { marginTop: hp('1%'), fontFamily: 'Epilogue-Regular', fontSize: wp('2.5%'), color: '#000', textAlign: 'center' },

  // Details Section
  detailsWrapper: { height: hp('69%'), width: wp('100%'), backgroundColor: '#F6F6F6', borderTopLeftRadius: wp('6%'), borderTopRightRadius: wp('6%'), overflow: 'hidden', position: 'absolute', bottom: 0, paddingTop: hp('3%') },
  scrollContent: { padding: wp('5%') },
  detailsContainer: { flexGrow: 1 },
  title: { fontFamily: 'Epilogue-Bold', fontSize: wp('6.5%'), color: '#2B3C62', textAlign: 'center' },
  subtitle: { fontFamily: 'Epilogue-Regular', fontSize: wp('3%'), textAlign: 'center', color: '#32373E', marginTop: hp('1%'), marginBottom: hp('2%') },
  detailText: { fontSize: wp('4%'), fontFamily: 'Epilogue-Medium', color: '#000', marginBottom: hp('2%') },

  // Condition & Tags
  conditionWrapper: { width: wp('40%'), alignSelf: 'center', backgroundColor: '#FFF', borderRadius: wp('4%'), padding: wp('3%'), marginBottom: hp('3%'), shadowColor: '#000', shadowOpacity: wp('0.3%'), shadowRadius: wp('4%'), elevation: wp('2%') },
  conditionText: { fontFamily: 'Epilogue-Bold', fontSize: wp('4%'), textAlign: 'center', color: '#071C34' },
  conditionBadge: { backgroundColor: '#FFA500', fontFamily: 'Epilogue-Regular', textAlign: 'center', fontSize: wp('3.5%'), borderRadius: wp('5%'), marginVertical: hp('0.5%') },
  ageText: { fontSize: wp('4%'), fontFamily: 'Epilogue-Bold', color: '#071C34' },
  ageNumText: { backgroundColor: '#B7B7B7', color: '#FFF', fontFamily: 'Epilogue-Medium', fontSize: wp('4%'), borderRadius: wp('5%'), paddingHorizontal: wp('3.5'), paddingVertical: hp('0.1%') },
  sectionTitle: { color: '#FFF', fontSize: wp('4%'), fontFamily: 'Epilogue-Bold', marginBottom: hp('1%'), backgroundColor: '#0B417D', borderRadius: wp('5%'), paddingHorizontal: wp('4%'), paddingVertical: hp('0.1%'), alignSelf: 'flex-start', shadowColor: '#000', shadowOpacity: wp('0.3%'), shadowRadius: wp('4%'), elevation: wp('1%') },

  // Buttons
  shopButton: { backgroundColor: '#ACD3FF', borderRadius: wp('5%'), alignSelf: 'center', paddingHorizontal: wp('8%'), paddingVertical: hp('0.5%'), marginBottom: hp('2%'), shadowColor: '#000', shadowOpacity: wp('0.3%'), shadowRadius: wp('4%'), elevation: wp('1.5%') },
  shopButtonText: { color: '#0B417D', fontSize: wp('4%'), fontFamily: 'Epilogue-Bold', textAlign: 'center' },
  editButton: { backgroundColor: '#B0EDEB', marginBottom: hp('1%'), borderRadius: wp('5%'), paddingHorizontal: wp('4%'), paddingVertical: hp('0.1%'), shadowColor: '#000', shadowOpacity: wp('0.3%'), shadowRadius: wp('4%'), elevation: wp('1%') },
  editButtonText: { color: '#05173F', fontSize: wp('4%'), fontFamily: 'Epilogue-Bold' },
  saveButton: { position: 'absolute', bottom: -hp('5.5%'), right: 0, backgroundColor: '#ADE792', borderRadius: wp('5%'), alignItems: 'center', paddingHorizontal: wp('5%'), paddingVertical: hp('0.3%') },
  saveButtonText: { color: '#05173F', fontSize: wp('5%'), fontFamily: 'Epilogue-Bold' },

  // Inputs
  notesInput: { backgroundColor: '#FFF', borderRadius: wp('5%'), shadowColor: '#000', shadowOpacity: wp('0.3%'), shadowRadius: wp('4%'), elevation: wp('2%'), flex: 1, fontSize: wp('4%'), color: '#32373E', fontFamily: 'Epilogue-Regular', marginTop: hp('1%'), marginBottom: hp('6%')},
  editNotesInput: { backgroundColor: '#FFF', borderRadius: wp('5%'), flex: 1, fontSize: wp('4%'), color: '#32373E', fontFamily: 'Epilogue-Regular', textAlignVertical: 'top' },

  // Row Layouts
  rowContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: hp('0.1%') },

  // Modal Edit
  modalEditContainer: { flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)', position: 'relative' },
  modalEditContent: { backgroundColor: '#FFF', padding: wp('5%'), borderRadius: wp('5%'), alignItems: 'center', height: hp('60%'), width: wp('90%'), alignSelf: 'center' },
  modalEditTitle: { fontSize: wp('5%'), fontWeight: 'bold' },
  closeEditButton: { position: 'absolute', top: hp('13.5%'), right: wp('3%'), width: wp('13%'), height: wp('13%'), alignItems: 'center', justifyContent: 'center' },
  closeEditButtonImage: { width: wp('9%'), height: wp('9%'), resizeMode: 'contain' },

  // Report Modal
  reportIcon: { width: wp('8%'), height: wp('8%') },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' },
  modalContent: { width: wp('80%'), backgroundColor: '#fff', padding: wp('5%'), borderRadius: wp('3%'), alignItems: 'center' },
  modalTitle: { fontSize: wp('4.5%'), fontFamily: 'Epilogue-Bold', marginBottom: hp('2%') },
  modalButton: { backgroundColor: '#002B5B', padding: wp('3%'), borderRadius: wp('3%'), width: wp('60%'), alignItems: 'center', marginVertical: wp('1%') },
  modalButtonText: { color: '#FFF', fontSize: wp('4%'), fontFamily: 'Epilogue-Bold' },
  closeButton: { paddingTop: hp('1%'), alignItems: 'center' },
  closeButtonText: { fontSize: wp('4%'), fontFamily: 'Epilogue-Medium' },
});

export default PhotoDetails;
