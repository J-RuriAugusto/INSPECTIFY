import React, { useState, useEffect, useRef} from 'react';
import { View, Text, Image, TextInput, TouchableOpacity, TouchableWithoutFeedback, StyleSheet, ImageBackground, ScrollView, ActivityIndicator, Alert, Modal } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { useNavigation, CommonActions } from '@react-navigation/native';
// import Modal from 'react-native-modal'; // Only import Modal from react-native-modal
import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import * as Print from 'expo-print';
import Scanning from './scanning';
import ImageView from 'react-native-image-viewing';
import { useTranslation } from '../../../hooks/useTranslation';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useSettings } from '../Dashboard/settingsContext';
import Markdown from 'react-native-markdown-display';

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
    let recommendation = '';
    if(lang === "Cebuano"){
      recommendation = recommendations.cebuano;
    }
    else if(lang === "Tagalog"){
      recommendation = recommendations.tagalog;
    }
    else {
      recommendation = recommendations.english;
    }

    if (recommendation.trim().startsWith("Error")) {
      return t('RECOMMENDATION_NOT_AVAILABLE') || "Recommendation is not available. Please try scanning the picture again later.";
    }

    // Process the recommendation text to ensure proper line breaks
    return recommendation
      .replace(/\r\n/g, '\n') // Convert Windows line endings to Unix
      .replace(/\n{3,}/g, '\n\n') // Replace 3 or more newlines with 2
      .trim(); // Trim leading/trailing whitespace
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
      // Delete both images from Cloudinary first
      try {
        const response = await axios.post(
          'https://flask-railway-sample-production.up.railway.app/delete_cloudinary_image',
          {
            urls: [plainImageUrl, annotatedImage] // Send both URLs
          },
          {
            headers: {
              'X-API-KEY': API_KEY,
              'Content-Type': 'application/json'
            }
          }
        );
        
        console.log('Cloudinary deletion response:', response.data);
      } catch (error) {
        console.error('Error deleting images from Cloudinary:', error);
        // Continue with report deletion even if image deletion fails
      }
      
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
            onPress: async () => { // Mark this onPress as async
              // Call deleteCloudinaryImages before dispatching the action
              try {
                await axios.post(
                  'https://flask-railway-sample-production.up.railway.app/delete_cloudinary_image',
                  {
                    urls: [plainImageUrl, annotatedImage]
                  },
                  {
                    headers: {
                      'X-API-KEY': API_KEY,
                      'Content-Type': 'application/json'
                    }
                  }
                );
                console.log('Images deleted from Cloudinary during beforeRemove.');
              } catch (error) {
                console.error('Error deleting images from Cloudinary during beforeRemove:', error);
                // Decide if you want to prevent navigation or just log the error
              }
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
    
      // Prepare the request data exactly as expected by the backend
      const requestData = {
        home_id: homeIdNumber,
        report_name: reportName || 'Untitled Report',
        url: imageUrl,
        autosave: settings.autoSave ? 1 : 0,
        context: {
          location: "University of the Philippines",
          coordinates: "123.90467, 10.41196",
          building_type: "Residential",
          construction_date: "Unknown"
        },
        expected_response: {
          condition: "",
          material: "",
          material_age: "",
          recommendations: {
            english: "",
            tagalog: "",
            cebuano: ""
          },
          damage_types: []
        }
      };
    
      // Log the data being sent
      console.log("Sending data:", JSON.stringify(requestData, null, 2));
    
      const response = await axios({
        method: 'post',
        url: 'https://flask-railway-sample-production.up.railway.app/createReport',
        data: requestData,
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': API_KEY,
          'Accept': 'application/json'
        },
        timeout: 60000, // Increase timeout to 60 seconds
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      });

      // Log the response for debugging
      console.log("Response status:", response.status);
      console.log("Response data:", response.data);

      if (response.status === 200 && response.data) {
        const reportData = response.data;
        
        // Set all the state values with proper fallbacks
        setReportID(Number(reportData.report_id));
        setAnnotatedImage(reportData.annotated_image || '');
        
        // Handle condition with proper fallback
        const condition = reportData.condition || 'No condition specified';
        setCondition(t(condition) || condition);
        
        // Handle material with proper fallback
        const material = reportData.material || 'Unknown';
        setMaterial(t(material) || material);
        
        // Handle material age with proper conversion
        const materialAge = reportData.material_age;
        setMaterialAge(materialAge ? String(materialAge) : '');
        
        // Handle recommendations with proper structure
        if (reportData.recommendations) {
          const recommendations = reportData.recommendations;
          
          // Process each language's recommendations to add manual styling
          const processRecommendations = (text: string): string => {
            if (!text) return '';
            
            // First, normalize all priority text variations
            let processed = text
              .replace(/Higher priority|High priority|Priority high|Priority 1|Priority one/gi, "Priority 1")
              .replace(/Medium priority|Priority medium|Priority 2|Priority two/gi, "Priority 2")
              .replace(/Lower priority|Priority low|Priority 3|Priority three/gi, "Priority 3")
              .replace(/Lowest priority|Priority lowest|Priority 4|Priority four/gi, 'Priority 4');

            // Split into sections based on priority
            const sections = processed.split(/(?=Priority \d+ -)/);

            const processedSections = sections.map(section => {
              // First, remove any duplicate priority text from the section
              section = section.replace(/(Priority \d+ - [^:]+)(?:\s*-\s*\1)/g, '$1');
              
              // Then extract header and subtext
              const match = section.match(/^(Priority \d+ - [^:]+)(?::\s*|\s+)(.*)$/s);
              if (match) {
                const header = match[1].trim();
                const subtext = match[2]
                  .replace(/^\s*:\s*/, '') // Remove leading colon and whitespace
                  .replace(/^\s+/, '') // Remove leading whitespace
                  .replace(/^Priority \d+ - [^:]+(?:\s*-\s*[^:]+)?:\s*/g, '') // Remove any duplicate priority text
                  .replace(/(Priority \d+ - [^:]+)(?:\s*-\s*\1)/g, '$1'); // Remove any remaining duplicates

                // Only the header is a markdown header, subtext is normal
                let result = `## ${header}\n`;
                if (subtext) {
                  // Add bullet points to each line of subtext
                  result += subtext
                    .split('\n')
                    .map(line => line.trim() ? `- ${line.trim()}` : '')
                    .join('\n');
                }
                return result;
              } else {
                // Fallback: treat as normal text
                return section;
              }
            });

            return processedSections
              .join('\n\n')
              .replace(/\n{3,}/g, '\n\n')
              .trim();
          };
          
          setRecommendations({
            english: processRecommendations(recommendations.english || ''),
            tagalog: processRecommendations(recommendations.tagalog || ''),
            cebuano: processRecommendations(recommendations.cebuano || '')
          });
        } else {
          setRecommendations({
            english: '',
            tagalog: '',
            cebuano: ''
          });
        }
        
        // Handle damage types with proper array structure
        const damageTypes = Array.isArray(reportData.damage_types) 
          ? reportData.damage_types.map((damage: string) => t(damage) || damage)
          : [];
        setDamageTypes(damageTypes);
        
        setDateCreated(reportData.date_created || '');
        setNotes(reportData.note || '');
        
        if (!settings.autoSave) {
          setFormattedResponse(reportData.formatted_response || []);
        }
        
        setReportCreationFailed(false);
        Alert.alert(t('SUCCESS'), t('REPORT_CREATED_SUCCESSFULLY'));
      } else {
        throw new Error(`Invalid response format: ${response.status}`);
      }

      return response;
    } catch (error) {
      console.error('Error creating report: ', error);
      setReportCreationFailed(true);
      
      let errorMessage = t('ERROR_CREATING_REPORT');
      if (axios.isAxiosError(error)) {
        // error is now typed as AxiosError
        if (error.response) {
          errorMessage = `Server error: ${error.response.status}`;
          console.error('Error response:', error.response.data);

          if (error.response.data) {
            console.error('Error details:', JSON.stringify(error.response.data, null, 2));
          }
        } else if (error.request) {
          if (error.code === 'ECONNABORTED') {
            errorMessage = t('REQUEST_TIMEOUT');
          } else {
            errorMessage = t('NO_SERVER_RESPONSE');
          }
          console.error('Request error:', error.request);
        } else {
          console.error('Error message:', error.message);
        }
      } else if (error instanceof Error) {
        // fallback for non-axios errors that are still Error objects
        console.error('Error message:', error.message);
      } else {
        // unknown error type (string, object, etc)
        console.error('Unknown error:', error);
      }     
      Alert.alert(
        t('ERROR'), 
        errorMessage,
        [
          { 
            text: t('GO_BACK'), 
            onPress: () => navigation.popToTop()
          },
          {
            text: t('RETRY'),
            onPress: () => {
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
    
        // Use the provided Cloudinary URL
        const logoBase64 = `https://res.cloudinary.com/dyk1pt3m0/image/upload/v1747717972/4e71edc6-3f82-4d38-86f4-b30d02dfd25c_hdhxcu.jpg`;
    
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
        ? `<div class="markdown-content">
            ${getCurrentRecommendation().split('\n').map(line => {
              // Handle headers
              if (line.startsWith('# ')) {
                return `<h1>${escapeHTML(line.substring(2))}</h1>`;
              } else if (line.startsWith('## ')) {
                return `<h2>${escapeHTML(line.substring(3))}</h2>`;
              } else if (line.startsWith('### ')) {
                return `<h3>${escapeHTML(line.substring(4))}</h3>`;
              }
              // Handle bullet points
              else if (line.startsWith('- ')) {
                return `<li>${escapeHTML(line.substring(2))}</li>`;
              }
              // Handle bold text
              else if (line.includes('**')) {
                return line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
              }
              // Handle italic text
              else if (line.includes('*')) {
                return line.replace(/\*(.*?)\*/g, '<em>$1</em>');
              }
              // Handle links
              else if (line.includes('[') && line.includes('](')) {
                return line.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>');
              }
              // Handle blockquotes
              else if (line.startsWith('> ')) {
                return `<blockquote>${escapeHTML(line.substring(2))}</blockquote>`;
              }
              // Regular paragraph
              else if (line.trim()) {
                return `<p>${escapeHTML(line)}</p>`;
              }
              return '';
            }).join('')}
          </div>`
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
                  font-size: 1.4rem;
                }
                h2 {
                  font-size: 1.2rem;
                  color: #2E86C1;
                  margin-top: 20px;
                  margin-bottom: 10px;
                  font-weight: 600;
                }
                h3 {
                  font-size: 1.1rem;
                  color: #2E86C1;
                  margin-top: 15px;
                  margin-bottom: 8px;
                  font-weight: 600;
                }
                .label { 
                  font-weight: bold; 
                  margin-top: 10px; 
                }
                ul { 
                  padding-left: 20px; 
                  margin-bottom: 15px;
                }
                li { 
                  margin-bottom: 5px;
                }
                .markdown-content {
                  margin: 15px 0;
                }
                .markdown-content p {
                  margin-bottom: 10px;
                }
                .markdown-content strong {
                  font-weight: bold;
                  color: #2E86C1;
                }
                .markdown-content em {
                  font-style: italic;
                  color: #666;
                }
                .markdown-content a {
                  color: #2E86C1;
                  text-decoration: underline;
                }
                .markdown-content blockquote {
                  border-left: 4px solid #2E86C1;
                  padding-left: 10px;
                  margin: 10px 0;
                  font-style: italic;
                  color: #666;
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
                <p><strong>${t('DATE')}</strong> ${formattedCurrentDate}</p>
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
              <div class="markdown-content">
                ${notes ? notes.split('\n').map(line => {
                  // Handle headers
                  if (line.startsWith('# ')) {
                    return `<h1>${escapeHTML(line.substring(2))}</h1>`;
                  } else if (line.startsWith('## ')) {
                    return `<h2>${escapeHTML(line.substring(3))}</h2>`;
                  } else if (line.startsWith('### ')) {
                    return `<h3>${escapeHTML(line.substring(4))}</h3>`;
                  }
                  // Handle bullet points
                  else if (line.startsWith('- ')) {
                    return `<li>${escapeHTML(line.substring(2))}</li>`;
                  }
                  // Handle bold text
                  else if (line.includes('**')) {
                    return line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                  }
                  // Handle italic text
                  else if (line.includes('*')) {
                    return line.replace(/\*(.*?)\*/g, '<em>$1</em>');
                  }
                  // Handle links
                  else if (line.includes('[') && line.includes('](')) {
                    return line.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>');
                  }
                  // Handle blockquotes
                  else if (line.startsWith('> ')) {
                    return `<blockquote>${escapeHTML(line.substring(2))}</blockquote>`;
                  }
                  // Regular paragraph
                  else if (line.trim()) {
                    return `<p>${escapeHTML(line)}</p>`;
                  }
                  return '';
                }).join('') : `<p>${t('NO_NOTES')}</p>`}
              </div>
    
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
              <View style={styles.recommendationContainer}>
                <Markdown style={{
                  body: styles.modalText,
                  heading1: { 
                    fontSize: wp('5%'), 
                    fontWeight: 'bold', 
                    marginBottom: hp('1%'), 
                    color: '#2E86C1',
                    borderBottomWidth: 2,
                    borderBottomColor: '#2E86C1',
                    paddingBottom: hp('0.5%')
                  },
                  heading2: { 
                    fontSize: wp('4.5%'), 
                    fontWeight: 'bold', 
                    marginBottom: hp('0.8%'), 
                    color: '#2E86C1',
                    marginTop: hp('1.5%')
                  },
                  heading3: { 
                    fontSize: wp('4%'), 
                    fontWeight: 'bold', 
                    marginBottom: hp('0.6%'), 
                    color: '#2E86C1',
                    marginTop: hp('1.2%')
                  },
                  bullet_list: { 
                    marginBottom: hp('1%'), 
                    paddingLeft: wp('5%')
                  },
                  list_item: { 
                    marginBottom: hp('0.8%'),
                    flexDirection: 'row',
                    alignItems: 'flex-start'
                  },
                  list_item_bullet: {
                    color: '#2E86C1',
                    fontSize: wp('4%'),
                    marginRight: wp('2%'),
                    lineHeight: wp('5%')
                  },
                  list_item_content: {
                    flex: 1,
                    fontSize: wp('4%'),
                    color: '#32373E',
                    lineHeight: wp('5%')
                  },
                  strong: { 
                    fontWeight: 'bold', 
                    color: '#2E86C1' 
                  },
                  em: { 
                    fontStyle: 'italic', 
                    color: '#666' 
                  },
                  link: { 
                    color: '#2E86C1', 
                    textDecorationLine: 'underline' 
                  },
                  paragraph: { 
                    marginBottom: hp('1%'), 
                    lineHeight: wp('5%'),
                    fontSize: wp('4%'),
                    color: '#32373E'
                  },
                  blockquote: { 
                    borderLeftWidth: 4,
                    borderLeftColor: '#2E86C1',
                    paddingLeft: wp('3%'),
                    marginVertical: hp('0.8%'),
                    fontStyle: 'italic',
                    color: '#666',
                    backgroundColor: '#f8f9fa',
                    padding: wp('3%'),
                    borderRadius: wp('2%')
                  }
                }}>
                  {getCurrentRecommendation()}
                </Markdown>
              </View>

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
              <View style={styles.notesContainer}>
                <Markdown style={{
                  body: styles.modalText,
                  heading1: { 
                    fontSize: wp('5%'), 
                    fontWeight: 'bold', 
                    marginBottom: hp('1%'), 
                    color: '#2E86C1',
                    borderBottomWidth: 2,
                    borderBottomColor: '#2E86C1',
                    paddingBottom: hp('0.5%')
                  },
                  heading2: { 
                    fontSize: wp('4.5%'), 
                    fontWeight: 'bold', 
                    marginBottom: hp('0.8%'), 
                    color: '#2E86C1',
                    marginTop: hp('1.5%')
                  },
                  heading3: { 
                    fontSize: wp('4%'), 
                    fontWeight: 'bold', 
                    marginBottom: hp('0.6%'), 
                    color: '#2E86C1',
                    marginTop: hp('1.2%')
                  },
                  bullet_list: { 
                    marginBottom: hp('1%'), 
                    paddingLeft: wp('5%')
                  },
                  list_item: { 
                    marginBottom: hp('0.8%'),
                    flexDirection: 'row',
                    alignItems: 'flex-start'
                  },
                  list_item_bullet: {
                    color: '#2E86C1',
                    fontSize: wp('4%'),
                    marginRight: wp('2%'),
                    lineHeight: wp('5%')
                  },
                  list_item_content: {
                    flex: 1,
                    fontSize: wp('4%'),
                    color: '#32373E',
                    lineHeight: wp('5%')
                  },
                  strong: { 
                    fontWeight: 'bold', 
                    color: '#2E86C1' 
                  },
                  em: { 
                    fontStyle: 'italic', 
                    color: '#666' 
                  },
                  link: { 
                    color: '#2E86C1', 
                    textDecorationLine: 'underline' 
                  },
                  paragraph: { 
                    marginBottom: hp('1%'), 
                    lineHeight: wp('5%'),
                    fontSize: wp('4%'),
                    color: '#32373E'
                  },
                  blockquote: { 
                    borderLeftWidth: 4,
                    borderLeftColor: '#2E86C1',
                    paddingLeft: wp('3%'),
                    marginVertical: hp('0.8%'),
                    fontStyle: 'italic',
                    color: '#666',
                    backgroundColor: '#f8f9fa',
                    padding: wp('3%'),
                    borderRadius: wp('2%')
                  }
                }}>
                  {notes || t('CLICK_EDIT')}
                </Markdown>
              </View>
  
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
                  onPress={async () => {
                    await saveReport();
                    navigation.dispatch(
                      CommonActions.reset({
                        index: 0,
                        routes: [{ name: 'Scan' }], // or 'Dashboard'
                      })
                    );
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.modalButtonText}>{t('SAVE_REPORT')}</Text>
                </TouchableOpacity>

                {/* Delete Report Button */}
                <TouchableOpacity 
                  style={[styles.modalButton, { backgroundColor: '#E55050' }]} 
                  onPress={async () => {
                    await deleteReport();
                    navigation.dispatch(
                      CommonActions.reset({
                        index: 0,
                        routes: [{ name: 'reportName' }], // Make sure 'Scan' matches your tab screen name
                      })
                    );
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
  backButton: { flexDirection: 'row', alignItems: 'center', right: wp('52%') },
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
  // conditionWrapper: { width: wp('40%'), alignSelf: 'center', backgroundColor: '#FFF', borderRadius: wp('4%'), padding: wp('3%'), marginBottom: hp('3%'), shadowColor: '#000', shadowOpacity: wp('0.3%'), shadowRadius: wp('4%'), elevation: wp('2%') },
  conditionWrapper: {
  alignSelf: 'center',            // aligns it to the left (or center if you prefer)
  backgroundColor: '#FFF',
  borderRadius: wp('4%'),
  paddingVertical: hp('1.5%'),
  paddingHorizontal: wp('3%'),
  marginBottom: hp('3%'),
  shadowColor: '#000',
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 3,
},
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
  notesInput: { backgroundColor: '#FFF', borderRadius: wp('5%'), shadowColor: '#000', shadowOpacity: wp('0.3%'), shadowRadius: wp('4%'), elevation: wp('2%'), flex: 1, fontSize: wp('4%'), color: '#32373E', fontFamily: 'Epilogue-Regular', marginTop: hp('1%'), marginBottom: hp('6%'), textAlign: 'left', padding: wp('4%'), minHeight: hp('10%') },
  editNotesInput: { backgroundColor: '#FFF', borderRadius: wp('5%'), flex: 1, fontSize: wp('4%'), color: '#32373E', fontFamily: 'Epilogue-Regular', textAlignVertical: 'top' },
  notesContainer: {
    backgroundColor: '#FFF',
    borderRadius: wp('5%'),
    padding: wp('4%'),
    marginBottom: hp('7%'),
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: wp('4%'),
    elevation: wp('2%'),
  },

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
  concText: { fontSize: 15, fontFamily: 'Epilogue-Medium', color: '#000', marginBottom: hp('2%') },
  recommendationContainer: {
    backgroundColor: '#FFF',
    borderRadius: wp('5%'),
    padding: wp('4%'),
    marginBottom: hp('2%'),
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: wp('4%'),
    elevation: wp('2%'),
  },
  modalText: {
    fontSize: wp('4%'),
    color: '#32373E',
    fontFamily: 'Epilogue-Regular',
    lineHeight: wp('5%'),
  },
});

export default PhotoDetails;
