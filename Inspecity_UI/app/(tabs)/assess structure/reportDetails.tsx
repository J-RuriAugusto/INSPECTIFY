import React, { useState, useEffect } from 'react';
import { View, Text, Image, TextInput, TouchableOpacity, TouchableWithoutFeedback, StyleSheet, ImageBackground, ScrollView, ActivityIndicator, Alert, BackHandler, Modal } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
// import Modal from 'react-native-modal'; // Only import Modal from react-native-modal
import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import * as Print from 'expo-print';
import ImageView from 'react-native-image-viewing';
import { Asset } from 'expo-asset';

const ReportDetails = () => {
  const params = useLocalSearchParams();
  const navigation = useNavigation<any>();
  const router = useRouter();
  const reportID = parseInt(Array.isArray(params.report_id) ? params.report_id[0] : params.report_id, 10);
  const API_KEY = 'BT_1smAfCA4roEldR7S9LObSgdbZ7uGAF2HJvs5VQyY';

  const [editModalVisible, setEditNoteModalVisible] = useState(false);
  const [notes, setNotes] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [reportName, setReportName] = useState('');
  // const [locationName, setLocationName] = useState('');
  const [condition, setCondition] = useState('');
  const [annotatedImage, setAnnotatedImage] = useState('');
  const [material, setMaterial] = useState('');
  const [materialAge, setMaterialAge] = useState('');
  const [recommendations, setRecommendations] = useState('');
  const [damageTypes, setDamageTypes] = useState<string[]>([]);
  const [isImageModalVisible, setImageModalVisible] = useState(false);
  const [dateCreated, setDateCreated] = useState('');
  const [reportModalVisible, setReportModalVisible] = useState(false);

  const deleteReport = async () => {
    try {
      const response = await axios.delete(
        `https://flask-railway-sample-production.up.railway.app/reports/${reportID}`,
        {
          headers: {
            'X-API-KEY': API_KEY,
          },
        }
      );
  
      if (response.status === 200) {
        Alert.alert("Success", "Report deleted successfully");
        setReportModalVisible(false);
        // router.replace('../board/dashboard'); // Navigate back after deletion
        navigation.goBack();
      } else {
        Alert.alert("Error", "Failed to delete report");
      }
    } catch (error) {
      console.error("Error deleting report:", error);
      Alert.alert("Error", "An error occurred while deleting the report");
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      let isActive = true;
  
      if (reportID) {
        const fetchData = async () => {
          try {
            await fetchReportDetails(reportID);
            await fetchNotes(reportID);
          } catch (error) {
            if (isActive) {
              console.error('Error fetching data:', error);
            }
          }
        };
        fetchData();
      }
  
      return () => {
        isActive = false;
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

  const shareReportAsPDF = async () => {
    try {
      // Check if sharing is available on the device
      if (!(await Sharing.isAvailableAsync())) {
        alert("Sharing is not available on this device.");
        return;
      }
  
      // Use the provided base64 logo
      const logoBase64 = `data:image/png;base64,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`;
  
      // Format current date properly
      const currentDate = new Date();
      const formattedCurrentDate = currentDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
      });
  
      // Parse and validate damage types data
      const processedDamageTypes = processListData(damageTypes);
      const issuesHTML = generateListHTML(processedDamageTypes, 'No issues detected.');
  
      // Parse and validate recommendations data
      const processedRecommendations = typeof recommendations === 'string'
        ? recommendations.split('\n').filter(rec => rec.trim() !== '')
        : [];
      const recommendationsHTML = generateListHTML(processedRecommendations, 'No recommendations provided.');
  
      // Format report date properly
      const formattedReportDate = dateCreated 
        ? new Date(dateCreated).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })
        : formattedCurrentDate;
  
      // Generate HTML content with improved accessibility and semantic structure
      const htmlContent = generateReportHTML({
        logoBase64,
        reportName: reportName || 'Not specified',
        formattedDate: formattedCurrentDate,
        location: 'University of the Philippines',
        coordinates: '123.90467, 10.41196',
        condition: condition || 'Not specified',
        materialAge,
        issuesHTML,
        recommendationsHTML,
        notes: notes || 'No notes available.',
        annotatedImage,
        currentYear: currentDate.getFullYear()
      });
  
      // Generate PDF file with proper dimensions
      const { uri } = await Print.printToFileAsync({ 
        html: htmlContent,
        width: 612,   // US Letter width in points (8.5in)
        height: 792,  // US Letter height in points (11in)
        base64: false
      });
      
      // Share the PDF file
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Share Inspection Report',
        UTI: 'com.adobe.pdf'
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert(`Failed to generate the PDF report: ${error.message || 'Unknown error'}`);
    }
  };
  
  /**
   * Process array-like data into a clean array
   * @param {Array|string} data - The data to process
   * @returns {Array} - Processed array of items
   */
  const processListData = (data) => {
    if (Array.isArray(data)) {
      return data.filter(item => item && item.trim() !== '');
    } else if (typeof data === 'string') {
      return data.split('\n').filter(item => item && item.trim() !== '');
    }
    return [];
  };
  
  /**
   * Generate HTML for lists
   * @param {Array} items - List items
   * @param {string} emptyMessage - Message to show when list is empty
   * @returns {string} - HTML string
   */
  const generateListHTML = (items, emptyMessage) => {
    if (items.length > 0) {
      return `<ul>${items.map(item => `<li>${escapeHTML(item)}</li>`).join('')}</ul>`;
    }
    return `<p>${emptyMessage}</p>`;
  };
  
  /**
   * Escape HTML special characters to prevent XSS
   * @param {string} text - Text to escape
   * @returns {string} - Escaped HTML
   */
  const escapeHTML = (text) => {
    if (!text) return '';
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };
  
  /**
   * Generate the complete HTML report
   * @param {Object} data - Report data
   * @returns {string} - Complete HTML document
   */
  const generateReportHTML = ({
    logoBase64,
    reportName,
    formattedDate,
    location,
    coordinates,
    condition,
    materialAge,
    issuesHTML,
    recommendationsHTML,
    notes,
    annotatedImage,
    currentYear
  }) => {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Inspectify Hazard Assessment Report</title>
        <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          padding: 2rem 1.5rem;
          color: #333;
          line-height: 1.6;
          margin: 0;
          max-width: 800px;
          margin: 0 auto;
        }
        .report-container {
          margin-left: .75in;
          margin-right: .75in;
        }
        .header {
          position: running(header);
          display: flex;
          align-items: center;
          border-bottom: 2px solid #4CAF50;
          padding-bottom: 0.75rem;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
          width: 100%;
        }
        .header img {
          height: 60px;
          margin-right: 1rem;
        }
        .header-text {
          flex: 1;
          min-width: 200px;
        }
        .header-text h1 {
          font-size: 1.4rem;
          color: #2E86C1;
          margin: 0 0 0.25rem 0;
          font-weight: 600;
        }
        .meta {
          margin-bottom: 1.5rem;
          font-size: 0.875rem;
          color: #555;
          background: #f8f9fa;
          padding: 1rem;
          border-radius: 4px;
        }
        h2 {
          font-size: 1.2rem;
          color: #2E86C1;
          margin-top: 1.5rem;
          margin-bottom: 0.5rem;
          font-weight: 600;
          page-break-after: avoid;
        }
        section {
          margin-bottom: 1.25rem;
          page-break-inside: avoid;
        }
        p, li {
          font-size: 0.875rem;
          margin: 0.5rem 0;
        }
        ul {
          padding-left: 1.25rem;
          margin: 0.5rem 0;
        }
        li {
          margin-bottom: 0.25rem;
        }
        .image-container {
          margin: 1rem 0;
          text-align: center;
          page-break-inside: avoid;
        }
        .image-container img {
          max-width: 100%;
          max-height: 400px;
          border-radius: 8px;
          border: 1px solid #ddd;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .footer {
          font-size: 0.75rem;
          text-align: center;
          color: #777;
          margin-top: 2.5rem;
          padding-top: 1rem;
          border-top: 1px solid #eee;
          page-break-before: auto;
        }

        /* CSS for the header on every page */
        @page {
          margin: 1in;
        }
        
        @top-center {
          content: element(header);
        }

        @media print {
          body {
            padding: 0.5rem;
          }
          .report-container {
            margin-left: 1in;
            margin-right: 1in;
          }
          .header {
            margin-top: 0.5rem;
          }
        }
      </style>
    </head>
    <body>
      <div class="report-container">
        <div class="header" role="banner">
          <img src="${logoBase64}" alt="Inspectify Logo" />
          <div class="header-text">
            <h1>Inspectify Structural Assessment Report</h1>
            <p style="font-size: 0.875rem; color: #666;">Comprehensive structural assessment report</p>
          </div>
        </div>

        <div class="meta" role="contentinfo">
          <p><strong>Report For:</strong> ${escapeHTML(reportName)}</p>
          <p><strong>Date:</strong> ${formattedDate}</p>
          <p><strong>Location:</strong> ${escapeHTML(location)}</p>
          <p><strong>Coordinates:</strong> ${escapeHTML(coordinates)}</p>
        </div>

        <main role="main">
          <section aria-labelledby="condition-heading">
            <h2 id="condition-heading">Condition</h2>
            <p>${escapeHTML(condition)} ${materialAge ? `(Age: ${escapeHTML(materialAge)})` : ''}</p>
          </section>

          <section aria-labelledby="issues-heading">
            <h2 id="issues-heading">Detected Issues</h2>
            ${issuesHTML}
          </section>

          <section aria-labelledby="recommendations-heading">
            <h2 id="recommendations-heading">Recommendations</h2>
            ${recommendationsHTML}
          </section>

          <section aria-labelledby="notes-heading">
            <h2 id="notes-heading">Notes</h2>
            <p>${escapeHTML(notes)}</p>
          </section>

          ${annotatedImage ? `
          <section aria-labelledby="image-heading">
            <h2 id="image-heading">Scanned Image</h2>
            <div class="image-container">
              <img src="${annotatedImage}" alt="Annotated scan of the assessed area" />
            </div>
          </section>
          ` : ''}
        </main>

        <div class="footer" role="contentinfo">
          <p>This report was generated automatically by Inspectify. For official documentation, please consult a licensed structural engineer.</p>
          <p>© ${currentYear} Inspectify. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
    `;
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
            <TouchableOpacity style={styles.shareButton} onPress={shareReportAsPDF}>
              <Image source={require('../../../assets/images/share-icon.png')} style={styles.shareIcon} />
            </TouchableOpacity>
          </View>
          <Text style={styles.title}>Fetching Details</Text>
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
          visible={reportModalVisible}
          animationType="fade"
          transparent={true}
          onRequestClose={() => setReportModalVisible(false)}
        >
          <TouchableWithoutFeedback onPress={() => setReportModalVisible(false)}>
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Manage Report</Text>

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
          visible={editModalVisible}
          transparent={true}
          onRequestClose={() => setEditNoteModalVisible(false)}
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

        {/* Full Screen Image Viewer */}
        <ImageView
          images={[{ uri: annotatedImage }]}
          imageIndex={0}
          visible={isImageModalVisible}
          onRequestClose={() => setImageModalVisible(false)}
          backgroundColor="rgba(0, 0, 0, 0.9)"
          swipeToCloseEnabled={true}
          doubleTapToZoomEnabled={true}
          presentationStyle="overFullScreen" // Add this
          animationType="fade" // Add this
        />
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

export default ReportDetails;
