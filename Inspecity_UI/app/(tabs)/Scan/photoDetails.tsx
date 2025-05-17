import React, { useState, useEffect, useRef} from 'react';
import { View, Text, Image, TextInput, TouchableOpacity, TouchableWithoutFeedback, StyleSheet, ImageBackground, ScrollView, ActivityIndicator, Alert, Modal } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { useNavigation } from '@react-navigation/native';
// import Modal from 'react-native-modal'; // Only import Modal from react-native-modal
import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import * as Print from 'expo-print';
import Scanning from './scanning';
import ImageView from 'react-native-image-viewing';
import { useTranslation } from '../../../hooks/useTranslation';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useSettings } from '../Dashboard/settingsContext';

interface DamageDetection {
  box_2d: [number, number, number, number]; // [x1, y1, x2, y2]
  damage_type: string;
}

interface Recommendations {
  english: string;
  tagalog: string;
  cebuano: string;
}

const PhotoDetails = () => {
  const { t } = useTranslation();
  const { settings } = useSettings();
  const params = useLocalSearchParams();
  const navigation = useNavigation<any>();
  const router = useRouter();
  const photo = params.photo as string;
  const reportName = params.reportName as string;
  const homeId = params.homeId as string;
  const API_KEY = '***REMOVED***';
  console.log("ReportName: ")
  console.log(reportName)
  console.log("HomeID: ")
  console.log(homeId)
  console.log("Photo URI: ");
  console.log(photo);
  const [editModalVisible, setEditNoteModalVisible] = useState(false);
  const [notes, setNotes] = useState('');
  const [reportID, setReportID] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [condition, setCondition] = useState('');
  const [annotatedImage, setAnnotatedImage] = useState('');
  const [material, setMaterial] = useState('');
  const [materialAge, setMaterialAge] = useState('');
  const [recommendations, setRecommendations] = useState<Recommendations>({
    english: '',
    tagalog: '',
    cebuano: ''
  });
  const [plainImageUrl, setImageUrl] = useState('');
  const [damageTypes, setDamageTypes] = useState<string[]>([]); // State for detected issues
  const [isImageModalVisible, setImageModalVisible] = useState(false); // State for full-screen image modal
  const [dateCreated, setDateCreated] = useState('');
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [formattedResponse, setFormattedResponse] = useState<any[] | null>(null);
  const [inputHeight, setInputHeight] = useState(hp('10%')); // starting height
  const [reportCreationFailed, setReportCreationFailed] = useState(false);
  const [hasExplicitlySaved, setHasExplicitlySaved] = useState(false);
  const hasExplicitlySavedRef = useRef(false);

  const getCurrentRecommendation = () => {
    if (!recommendations) return '';
    
    // Default to English if language not set or not found
    const lang = settings.language;
    if(lang === "Cebuano"){
      return recommendations.cebuano
    }
    if(lang === "Tagalog"){
      return recommendations.tagalog
    }
    return recommendations.english;
  };
  
  const saveReport = async () => {
    setHasExplicitlySaved(true);
    hasExplicitlySavedRef.current = true;
    let message = t('SUCCESSFULLY_SAVED_REPORT')
    if(settings.autoSave){
      message = t('ALREADY_SAVED_REPORT');
    }
    else{
      try {
        // Convert homeId to a number
        const homeIdNumber = parseInt(homeId, 10);
      
        // Log the data being sent
        console.log("Sending data:", {
          home_id: homeIdNumber,
          report_name: reportName,
          url: plainImageUrl,
          annotated_image: annotatedImage,
          condition: condition,
          material: material,
          material_age: materialAge,
          recommendations: recommendations,
          note: notes,
        });
        console.log("formatted_response:", JSON.stringify(formattedResponse, null, 2));
      
        const response = await axios.post('https://flask-railway-sample-production.up.railway.app/saveReport', {
          home_id: homeIdNumber,
          report_name: reportName,
          url: plainImageUrl,
          annotated_image: annotatedImage,
          condition: condition,
          material: material,
          material_age: materialAge,
          recommendations: recommendations,
          formatted_response: formattedResponse || [], 
          note: notes,
        }, {
          headers: {
            'Content-Type': 'application/json',
            'X-API-KEY': API_KEY,
          },
        });
      
        console.log("Response:", response.data);
      
        if (response.status === 200) {
          setReportCreationFailed(false);
        } else {
          setReportCreationFailed(true); // Set failure state
          Alert.alert(
            'Error', 
            'Failed to save report',
          );
        }
      } catch (error) {
        console.error('Error saving report: ', error);
        setReportCreationFailed(true); // Set failure state
        Alert.alert(
          'Error', 
          'An error occurred while saving the report'
        );
      }
    }
    Alert.alert(
      t("REPORT_STATUS"),
      message,
      [{ text: "OK", onPress: () => setReportModalVisible(false) }]
    );
    setReportModalVisible(false);
  };

  const deleteReport = async () => {
    if(!settings.autoSave){
      setReportModalVisible(false);
      navigation.popToTop();
      return;
    }
    try {
      setHasExplicitlySaved(true);
      hasExplicitlySavedRef.current = true;
      const response = await axios.delete(
        `https://flask-railway-sample-production.up.railway.app/reports/${reportID}`,
        {
          headers: {
            'X-API-KEY': API_KEY,
          },
        }
      );
  
      if (response.status === 200) {
        setReportModalVisible(false);
        navigation.popToTop(); // Navigate back after deletion
      } else {
        Alert.alert(t('ERROR'), t('FAILED_REPORT_DELETE'));
      }
    } catch (error) {
      console.error("Error deleting report:", error);
      Alert.alert(t('ERROR'), t('DELETE_REPORT_ERROR'));
    }
  };

  useEffect(() => {
    if (photo) {
      uploadImageToCloudinary(photo);
    }
  }, [photo]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e: any) => {
      // If we don't have unsaved changes or the report is already saved, we don't need to do anything
      if (settings.autoSave || hasExplicitlySaved || hasExplicitlySavedRef.current) {
        return;
      }
  
      // Prevent default behavior of leaving the screen
      e.preventDefault();
  
      // Prompt the user before leaving
      Alert.alert(
        `${t('LEAVE_WITHOUT_SAVE')} "${reportName}" report?`, 
        t('THIS_WILL_BE_DELETED'),
        [
          {
            text: t('Cancel'),
            style: "cancel",
            onPress: () => {}
          },
          {
            text: t('DELETE'),
            style: "destructive",
            onPress: () => {
              navigation.dispatch(e.data.action);
            }
          },
          {
            text: t('SAVE'),
            onPress: () => {
              saveReport().then(() => {
                navigation.dispatch(e.data.action);
              });
            }
          }
        ]
      );
    });
  
    return unsubscribe;
  }, [navigation, reportID]);
  
  // Modify your back button press handler to use navigation.goBack() instead of navigation.popToTop()
  const handleBackPress = () => {
    if (settings.autoSave || hasExplicitlySaved) {
      navigation.goBack();
      return;
    }
  
    // Show the alert only if auto-save is off and user hasn't explicitly saved
    Alert.alert(
      t('LEAVE_WITHOUT_SAVE'),
      t('THIS_WILL_BE_DELETED'),
      [
        {
          text: t('CANCEL'),
          style: "cancel",
          onPress: () => {}
        },
        {
          text: t('DELETE'),
          style: "destructive",
          onPress: () => {
            navigation.goBack(); 
          }
        },
        {
          text: t('SAVE'),
          onPress: () => {
            saveReport();
            navigation.goBack();
          }
        }
      ]
    );
  };
  
  const handleFindNearbyShops = () => {
    router.push('/(tabs)/Shops');
  };
  
  // useEffect(() => {
  //   if (reportID) {
  //     fetchReportDetails(reportID);
  //   }
  // }, [reportID]);

  // const fetchReportDetails = async (reportId:number) => {
  //   try {
  //     const response = await axios.get(`https://flask-railway-sample-production.up.railway.app/reports/${reportId}`, {
  //       headers: {
  //         'X-API-KEY': API_KEY,
  //       },
  //     });

  //     if (response.data) {
  //       setAnnotatedImage(response.data.annotated_image);
  //       setCondition(response.data.condition);
  //       setMaterial(response.data.material);
  //       setMaterialAge(response.data.material_age);
  //       setRecommendations(response.data.recommendations);
  //       setDamageTypes(response.data.damage_types || []);
  //       setDateCreated(response.data.date_created);
  //       setNotes(response.data.note);
  //     }
  //   } catch (error) {
  //     console.error('Error fetching report details: ', error);
  //     Alert.alert('Error', 'Failed to fetch report details');
  //   }
  // };

  const uploadImageToCloudinary = async (uri: string) => {
    try {
      setIsUploading(true);
      console.log(`user image uri: ${uri}`)
  
      const fileInfo = await FileSystem.getInfoAsync(uri);
      if (!fileInfo.exists) {
        throw new Error(`File does not exist at path: ${uri}`);
      }
  
      const fileBase64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
  
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
  
      const imageUrl = response.data.secure_url;
      setImageUrl(imageUrl)
      await createReport(imageUrl);
      setIsUploading(false);
    } catch (error) {
      console.error('Error uploading image: ', error);
      setIsUploading(false);
      setReportCreationFailed(true);
      Alert.alert(
        'Error', 
        'Failed to upload image',
        [
          { 
            text: "Go Back", 
            onPress: () => navigation.popToTop()
          },
          {
            text: "Retry",
            onPress: () => uploadImageToCloudinary(photo)
          }
        ]
      );
    }
  };

  const createReport = async (imageUrl: string) => {
    try {
      // Convert homeId to a number
      const homeIdNumber = parseInt(homeId, 10);
    
      // Log the data being sent
      console.log("Sending datas:", {
        home_id: homeIdNumber,
        report_name: reportName,
        url: imageUrl,
        autosave: settings.autoSave,
      });
    
      const response = await axios.post('https://flask-railway-sample-production.up.railway.app/createReport', {
        home_id: homeIdNumber,
        report_name: reportName,
        url: imageUrl,
        autosave: settings.autoSave,
      }, {
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': API_KEY,
        },
      });
    
      console.log("Response:", response.data);
    
      if (response.status === 200) {
        setReportID(Number(response.data.report_id));
        setAnnotatedImage(response.data.annotated_image);
        setCondition(response.data.condition);
        setMaterial(response.data.material);
        setMaterialAge(response.data.material_age);
        setRecommendations(response.data.recommendations || {
          english: '',
          tagalog: '',
          cebuano: ''
        })
        setDamageTypes(response.data.damage_types || []);
        setDateCreated(response.data.date_created);
        setNotes(response.data.note);
        if (!settings.autoSave){
          setFormattedResponse(response.data.formatted_response);
        }
        setReportCreationFailed(false);

        Alert.alert(t('SUCCESS'), t('REPORT_CREATED_SUCCESSFULLY'));
      } else {
        setReportCreationFailed(true); // Set failure state
        Alert.alert(
          'Error', 
          'Failed to create report',
          [
            { 
              text: "Go Back", 
              onPress: () => navigation.popToTop()
            },
            {
              text: "Retry",
              onPress: () => {
                // Don't reupload image if it was successful
                if (imageUrl) {
                  createReport(imageUrl);
                } else {
                  uploadImageToCloudinary(photo);
                }
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error('Error creating report: ', error);
      setReportCreationFailed(true); // Set failure state
      Alert.alert(
        'Error', 
        'An error occurred while creating the report',
        [
          { 
            text: "Go Back", 
            onPress: () => navigation.popToTop()
          },
          {
            text: "Retry",
            onPress: () => {
              // Don't reupload image if it was successful
              if (imageUrl) {
                createReport(imageUrl);
              } else {
                uploadImageToCloudinary(photo);
              }
            }
          }
        ]
      );
    }
  };

  const updateNote = async () => {
    if (!reportID) {
      Alert.alert(t('SUCCESS'), t('UPDATED_NOTE_SUCCESSFULLY'));
      setEditNoteModalVisible(false);
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
        Alert.alert(t('SUCCESS'), t('UPDATED_NOTE_SUCCESSFULLY'));
        setEditNoteModalVisible(false);
      } else {
        Alert.alert(t('ERROR'), t('FAILED_NOTE_UPDATE'));
      }
    } catch (error) {
      console.error("Error updating note:", error);
      Alert.alert(t('ERROR'), t('ERROR_UPDATING_NOTE'));
    }
  };

  // const sharePhoto = async () => {
  //   if (!(await Sharing.isAvailableAsync())) {
  //     alert("Sharing is not available on this device");
  //     return;
  //   }
  //   await Sharing.shareAsync(photo);
  // };

  const shareReportAsPDF = async () => {
      try {
        if (!(await Sharing.isAvailableAsync())) {
          alert(t('UNAVAILABLE_SHARING'));
          return;
        }
    
        // Use the provided base64 logo
        const logoBase64 = `data:image/png;base64,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`;
    
        // Convert damageTypes (previously called issues) into <li> elements
        const processedDamageTypes = Array.isArray(damageTypes) 
        ? damageTypes.filter(item => item != null && String(item).trim() !== '')
        : [];
        
        const issuesHTML = processedDamageTypes.length > 0 
          ? `<ul>${processedDamageTypes.map(issue => `<li>${escapeHTML(issue)}</li>`).join('')}</ul>`
          : `<p>${t('NO_ISSUES')}</p>`;
        
        // Split recommendations into an array if it's a string
        const processedRecommendations = getCurrentRecommendation().length > 0
        ? getCurrentRecommendation().split('\n').filter(rec => rec.trim() !== '')
        : [];
        
        const recommendationsHTML = processedRecommendations.length > 0
        ? `<ul>${processedRecommendations.map(rec => `<li>${escapeHTML(rec)}</li>`).join('')}</ul>`
        : `<p>${t('NO_RECOMMENDATIONS')}</p>`;
        // Format dates properly
        const currentDate = new Date();
        const formattedCurrentDate = currentDate.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: 'numeric',
          minute: 'numeric',
          hour12: true
        });
    
        const formattedReportDate = dateCreated 
          ? new Date(dateCreated).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })
          : formattedCurrentDate;
    
        const htmlContent = `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>${t('REPORT_HAZARD_TITLE')}</title>
              <style>
                @page {
                  margin: 1in;
                }
                body { 
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                  padding: 20px;
                  color: #333;
                  line-height: 1.6;
                }
                .header {
                  display: flex;
                  align-items: center;
                  border-bottom: 2px solid #4CAF50;
                  padding-bottom: 15px;
                  margin-bottom: 20px;
                }
                .header img {
                  height: 60px;
                  margin-right: 15px;
                }
                .header-text h1 {
                  font-size: 1.4rem;
                  color: #2E86C1;
                  margin: 0 0 5px 0;
                  font-weight: 600;
                }
                .header-text p {
                  font-size: 0.875rem;
                  color: #666;
                  margin: 0;
                }
                .meta {
                  margin-bottom: 20px;
                  font-size: 0.875rem;
                  color: #555;
                  background: #f8f9fa;
                  padding: 15px;
                  border-radius: 4px;
                }
                h1 { 
                  color: #2E86C1; 
                  margin-bottom: 10px;
                }
                h2 {
                  font-size: 1.2rem;
                  color: #2E86C1;
                  margin-top: 20px;
                  margin-bottom: 10px;
                  font-weight: 600;
                }
                .label { 
                  font-weight: bold; 
                  margin-top: 10px; 
                }
                ul { 
                  padding-left: 20px; 
                }
                li { 
                  margin-bottom: 5px;
                }
                .image-container {
                  margin: 15px 0;
                  text-align: center;
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
                  margin-top: 30px;
                  padding-top: 15px;
                  border-top: 1px solid #eee;
                }
              </style>
            </head>
            <body>
              <div class="header">
                <img src="${logoBase64}" alt="Inspectify Logo" />
                <div class="header-text">
                  <h1>${t('REPORT_HAZARD_TITLE')}</h1>
                  <p>${t('COMPREHENSIVE ASSESSMENT')}</p>
                </div>
              </div>
    
              <div class="meta">
                <p><strong>${t('REPORT_FOR')}</strong> ${escapeHTML(reportName || 'Untitled')}</p>
                <p><strong>${t('DATE')}</strong> ${formattedReportDate}</p>
                <p><strong>${t('LOCATION_S')}</strong> University of the Philippines</p>
                <p><strong>${t('COORDINATES')}</strong> 123.90467, 10.41196</p>
              </div>
    
              <h2>${t('OVERALL_CONDITION')}</h2>
              <p>${escapeHTML(condition || 'No condition specified')} ${materialAge ? `(${t('Age')}: ${escapeHTML(materialAge)})` : ''}</p>
    
              <h2>${t('DETECTED_ISSUES')}</h2>
              ${issuesHTML}
    
              <h2>${t('RECOMMENDATIONS')}</h2>
              ${recommendationsHTML}
    
              <h2>${t('NOTES')}</h2>
              <p>${escapeHTML(notes || t('NO_NOTES'))}</p>
    
              <h2>${t('SCANNED_IMAGE')}</h2>
              <div class="image-container">
                ${annotatedImage ? `<img src="${annotatedImage}" alt=${t('ANNOTATED_SCAN')} />` : `<p>${t('NO_IMAGE_AVAILABLE')}</p>`}
              </div>
    
              <div class="footer">
                <p>${t('GENERATED_REPORT_DISCLAIMER')}</p>
                <p>© ${currentDate.getFullYear()} Inspectify. All rights reserved.</p>
              </div>
            </body>
          </html>
        `;
    
        // Format date for filename
        const isoString = currentDate.toISOString(); // e.g., "2025-05-17T12:34:56.789Z"

        const [date, time] = isoString.split('T');
        const formattedTime = time.split('.')[0].replace(/:/g, '-'); // "12-34-56"

        const formattedDateTime = `${date} | ${formattedTime}`; // "2025-05-17_12-34-56"
        const fileName = `Report Details ${formattedDateTime}.pdf`;

        const fileUri = `${FileSystem.documentDirectory}${fileName}`;

        // Generate PDF from HTML
        const { uri: tempUri } = await Print.printToFileAsync({
          html: htmlContent, // Replace with your actual HTML content
          base64: false,
        });

        // Rename/move the PDF to desired file name
        await FileSystem.moveAsync({
          from: tempUri,
          to: fileUri,
        });

        // Share the renamed PDF
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Share Report',
          UTI: 'com.adobe.pdf', // iOS support
        });
      } catch (error) {
        console.error("Error generating PDF:", error);
        const errorMessage = error instanceof Error ? error.message : t('UNKNOWN_ERROR');
        alert(`${t('PDF_ERROR')}: ${errorMessage}`);
      }
    };
  
  // Helper function to escape HTML
  const escapeHTML = (text: string) => {
    if (text === null || text === undefined) return '';
    if (typeof text !== 'string') {
      // Convert non-string values to string
      text = String(text);
    }
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };
  
  if (isUploading) {
    return (
      <Modal visible={true} transparent={false} animationType="fade">
        <Scanning photo={photo} />
      </Modal>
    );
  }

  if (!photo) {
    return (
      <ImageBackground source={require('../../../assets/images/background.png')} style={styles.background}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
            <Image source={require('../../../assets/images/back-icon.png')} style={styles.backIcon} />
            <Text style={styles.backText}>{t('BACK')}</Text>
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

          <Text style={styles.title}>{t('NO_PHOTO_PROVIDED')}</Text>
          <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
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
          <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
            <Image source={require('../../../assets/images/back-icon.png')} style={styles.backIcon} />
            <Text style={styles.backText}>{t('BACK')}</Text>
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
                {reportName ? reportName : t('UNTITLED')}
              </Text>
              <Text style={styles.subtitle}>{dateCreated || t('LOADING_DATE')}</Text>
  
              {/* Captured Image from Camera */}
              <View style={styles.imageWrapper}>
                <TouchableOpacity onPress={() => setImageModalVisible(true)}>
                  <Image source={{ uri: annotatedImage }} style={styles.capturedImage} />
                </TouchableOpacity>
                <Text style={styles.scannedImageText}>{t('SCANNED_IMAGE')}</Text>
              </View>

                {/* Condition Details */}
                <View style={styles.conditionWrapper}>
                  <Text style={styles.conditionText}>{t('OVERALL_CONDITION')}</Text>
                  <Text style={styles.conditionBadge}>{condition}</Text>
                  <View style={styles.rowContainer}>
                    <Text style={styles.ageText}>{t('AGE')}</Text>
                    <Text style={styles.ageNumText}>
                      {materialAge != null ? `${materialAge} ${t('YEARS')}` : "N/A"}
                    </Text>
                  </View>
                </View>

  
              {/* Detected Issues */}
              <Text style={styles.sectionTitle}>{t('DETECTED_ISSUES_2')}</Text>
              {damageTypes.map((damage, index) => (
                <Text key={index} style={styles.detailText}>• {damage}</Text>
              ))}


              <Text style={styles.sectionTitle}>{t('MATERIAL')}</Text>
              <View style={styles.rowContainer}>
                <Text style={styles.concText}>• {material} </Text>
              </View>
  
              <Text style={styles.sectionTitle}>{t('RECOMMENDATIONS')}</Text>
              <Text style={styles.detailText}>• {getCurrentRecommendation()}</Text>
              <TouchableOpacity 
                style={styles.shopButton} 
                onPress={handleFindNearbyShops}
              >
                <Text style={styles.shopButtonText}>{t('FIND_SHOPS')}</Text>
              </TouchableOpacity>
  
              <View style={styles.rowContainer}>
                <Text style={styles.sectionTitle}>{t('NOTES')}</Text>
                <TouchableOpacity style={styles.editButton} onPress={() => setEditNoteModalVisible(true)}>
                  <Text style={styles.editButtonText}>{t('EDIT_NOTE')}</Text>
                </TouchableOpacity>
              </View>
                <TextInput
                  style={[styles.notesInput, { height: inputHeight }]}
                  placeholder={notes ? notes : t('CLICK_EDIT')}
                  placeholderTextColor="#A0A0A0"
                  value={notes}
                  editable={false} // You can toggle this to true when in edit mode
                  multiline
                  onContentSizeChange={(e) =>
                    setInputHeight(e.nativeEvent.contentSize.height)
                  }
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
                <Text style={styles.modalTitle}>{t('MANAGE_REPORT')}</Text>

                {/* Save Report Button */}
                <TouchableOpacity 
                  style={styles.modalButton} 
                  onPress={() => {
                    saveReport();
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.modalButtonText}>{t('SAVE_REPORT')}</Text>
                </TouchableOpacity>

                {/* Delete Report Button */}
                <TouchableOpacity 
                  style={[styles.modalButton, { backgroundColor: 'red' }]} 
                  onPress={() => {
                    deleteReport();
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.modalButtonText}>{t('DELETE_REPORT')}</Text>
                </TouchableOpacity>

                {/* Close Button */}
                <TouchableOpacity 
                  style={styles.closeButton} 
                  onPress={() => setReportModalVisible(false)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.closeButtonText}>{t('CLOSE')}</Text>
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
              <Text style={styles.modalEditTitle}>{t('EDIT_NOTE')}</Text>
              
              <TextInput
                style={styles.editNotesInput}
                value={notes} 
                onChangeText={setNotes}
                placeholder={t('EDIT_NOTE_HERE')}
                placeholderTextColor="#A0A0A0"
                multiline
              />
              
              <TouchableOpacity 
                style={styles.saveButton} 
                onPress={updateNote}
              >
                <Text style={styles.saveButtonText}>{t('SAVE_NOTE')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Full Screen Image Viewer - NEW IMPLEMENTATION */}
        <ImageView
          images={[{ uri: annotatedImage }]}
          imageIndex={0}
          visible={isImageModalVisible}
          onRequestClose={() => setImageModalVisible(false)}
          backgroundColor="rgba(0, 0, 0, 0.9)"
          swipeToCloseEnabled={true}
          doubleTapToZoomEnabled={true}
        />

        {/* Scanning Animation Modal */}
          <Modal 
            visible={isUploading} 
            transparent={false}
            animationType="fade"
            onRequestClose={() => {}}
          >
            <Scanning photo={photo} />
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
  backButton: { flexDirection: 'row', alignItems: 'center', right: wp('45%') },
  backIcon: { width: wp('8%'), height: hp('4%'), marginRight: wp('2%') },
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
  detailsWrapper: { height: hp('69%'), width: wp('100%'), backgroundColor: '#F6F6F6', borderTopLeftRadius: wp('6%'), borderTopRightRadius: wp('6%'), overflow: 'hidden', position: 'absolute', bottom: 0, paddingTop: hp('3%'), paddingBottom: hp('3%') },
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
  notesInput: { backgroundColor: '#FFF', borderRadius: wp('5%'), shadowColor: '#000', shadowOpacity: wp('0.3%'), shadowRadius: wp('4%'), elevation: wp('2%'), flex: 1, fontSize: wp('4%'), color: '#32373E', fontFamily: 'Epilogue-Regular', marginTop: hp('1%'), marginBottom: hp('13%'), textAlign: 'left', padding: wp('4%'), minHeight: hp('10%') },
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
  concText: { fontSize: 15, fontFamily: 'Epilogue-Medium', color: '#000', marginBottom: hp('2%') }
});

export default PhotoDetails;
