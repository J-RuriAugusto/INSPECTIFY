import React, { useState, useEffect} from 'react';
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

const PhotoDetails = () => {
  const params = useLocalSearchParams();
  const navigation = useNavigation<any>();
  const router = useRouter();
  const photo = params.photo as string;
  const reportName = params.reportName as string;
  const homeId = params.homeId as string;
  const API_KEY = 'BT_1smAfCA4roEldR7S9LObSgdbZ7uGAF2HJvs5VQyY';
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
  const [recommendations, setRecommendations] = useState('');
  const [damageTypes, setDamageTypes] = useState<string[]>([]); // State for detected issues
  const [isImageModalVisible, setImageModalVisible] = useState(false); // State for full-screen image modal
  const [dateCreated, setDateCreated] = useState('');
  const [reportModalVisible, setReportModalVisible] = useState(false);

  const saveReport = () => {
    Alert.alert(
      "Report Status",
      "Your report is already saved.\nYou can turn off auto-save in settings.",
      [{ text: "OK", onPress: () => setReportModalVisible(false) }]
    );
    setReportModalVisible(false);
    navigation.popToTop();
  };

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
        setReportModalVisible(false);
        navigation.popToTop(); // Navigate back after deletion
      } else {
        Alert.alert("Error", "Failed to delete report");
      }
    } catch (error) {
      console.error("Error deleting report:", error);
      Alert.alert("Error", "An error occurred while deleting the report");
    }
  };

  useEffect(() => {
    if (photo) {
      uploadImageToCloudinary(photo);
    }
  }, [photo]);
  
  useEffect(() => {
    if (reportID) {
      fetchReportDetails(reportID);
    }
  }, [reportID]);

  const fetchReportDetails = async (reportId:number) => {
    try {
      const response = await axios.get(`https://flask-railway-sample-production.up.railway.app/reports/${reportId}`, {
        headers: {
          'X-API-KEY': API_KEY,
        },
      });

      if (response.data) {
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
      await createReport(imageUrl);
      setIsUploading(false);
    } catch (error) {
      console.error('Error uploading image: ', error);
      setIsUploading(false);
      Alert.alert('Error', 'Failed to upload image');
    }
  };

  const createReport = async (imageUrl: string) => {
    try {
      // Convert homeId to a number
      const homeIdNumber = parseInt(homeId, 10);
  
      // Log the data being sent
      console.log("Sending data:", {
        home_id: homeIdNumber,
        report_name: reportName,
        url: imageUrl,
      });
  
      const response = await axios.post('https://flask-railway-sample-production.up.railway.app/createReport', {
        home_id: homeIdNumber,
        report_name: reportName,
        url: imageUrl,
      }, {
        headers: {
          'Content-Type': 'application/json', // Ensure the correct content type
          'X-API-KEY': API_KEY,
        },
      });
  
      console.log("Response:", response.data);
  
      if (response.status === 200) {
        setReportID(Number(response.data.report_id));
        Alert.alert('Success', 'Report created successfully');
      } else {
        Alert.alert(
          'Error', 
          'Failed to create report',
          [
            { 
              text: "OK", 
              onPress: () => navigation.popToTop() // This will navigate to top when OK is pressed
            }
          ]
        );
      }
    } catch (error) {
      console.error('Error creating report: ', error);
      Alert.alert(
        'Error', 
        'An error occurred while creating the report',
        [
          { 
            text: "OK", 
            onPress: () => navigation.popToTop() // This will navigate to top when OK is pressed
          }
        ]
      );
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
        alert("Sharing is not available on this device");
        return;
      }
  
      // Use the provided base64 logo
      const logoBase64 = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAS4AAAFPCAMAAADENtOOAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAB+UExURQAAAAAQQBAQQAAYQAgYQAAVQAUVQAQYQAMWQAMaQAYWQAUYPgMYQAUYQAUXPgUXQAcXQAQWPgYWPgQYQAYYQAUXPgQXQAUXQAUWPwUYPwUWQAUYQAQXPwYXPwYXQAUXPwUYPwUYQAUWPwUXPwUXQAUXPwUYQAQXPwUXPwUXP+F4itwAAAApdFJOUwAQECAgMDBAUFBQX2Bgb3Bwf3+AgI+QkJ+foKCvr7C/v8DPz9Df4O/vF2qrGwAAB8ZJREFUeNrt3W1D2joAhmEqrGVayw4RwSkDxA7y///gweE52zANSUma0NzPVyfUy6cviSwZDEhSGa4WQxRMU+2krO9wMKyW/BUKZlqtYyiYcbUomF21KJhdtSiYXbUomGW1KJhdtSiYZbUomF21KJhltSjYn7ndSaNQsEOyF2mc5ZBqSYvsv1Etq6yGVIuCealWygVrU61kC9a2WmkWrH21EizYZdVKrWCXViupgplUa3d7X5//V1vPBRuVlVg4jajGud0xFAbVerk5HOuzQcGm/n6p1crJOaCowvIuMz6KmUm1jv/WpGC1n4IVL56s7GZXitqsWh8ng0HBpIeCmU0oeQezqVbAgk1lJ5k6rVaogg23sqNoH4WMqjX5/H0dF+xLLTuL5rBNqrUZKW/nXRbsy052mDp3W62uC9atVtNRt69WtwUb1rLj1JnjanVZsM61Dtd719XqrmD/yAD55rxaHRVsGEJL7jPn1eqmYIsgXHLhoVrHjH0WLEy5Dsk8VMv8V9CqYMHKdbx6ua+W34LdB+OShadq+SzYMhzX3Fe1PBZsL2NO22r5Klje8DutSoep1i212lfLU8HGSvHC+az2vvNqeSnYRPX9o4HzFN1Xy0fBhOKbf/j4q8kqQLU+rjcOC6biEj64HkNU66NgwuANZ0YvpRqPlj64RJhqfQy7TQqWXyvXZhTk7WfZNXK5rpZFwYrr4/JQLXcFi43LT7WcFSwyLm/VclSwqLh8VstNwWLi8lwtFwWLh8t/tSwK9jV2rk6qZV6whg9WRcLVVbUsCnYXL1eH1bqsYDFwdVutiwoWAVfn1bqgYMG5QlSrfcFCcwWqVtuCBeYSg6CxLlhQrm0+CB3LgoXkEoMIYlewcFwRVMu+YMG4xCCaGBUsC8kVTbWMCzYKyCUGkeV8wcJxRVYts4IF4xKDKHOmYIG4oqyWQcHCcIlBxNEVLARXxNU6V7AAXPNB9Bm9xsLl/kN2XjLZR8E1vxlcR0arCLiuBes9dXiuAVxwwQUXXHDBBRdccMEFF1xwwQUXXHDBBRdccMEFF1xwwQUXXHDBBRdccMEFF1xwwQUXXHB1miwvxWJb/9opZbdaVkUGV0NG5UyxtdN2cTeE67RVxUzz/3HqxRiu31alwSaHyw5LFjNXsTDd08lig8eecmXVq9Xys4siYa5sar9ZWN3BSRklVxss3cpt/eaqLtiGzjNYfFzFhfuqeQWLjctkB5eAYJFxOdpqdDZMgquSjqJefbJnXDPpLn7OyIi4Mrebb9d5r7ky5/tJT3vMlXnYfXvaXy4ve5VP+8o1k/IavCLh8rbn77iPXEYbd+3e5tX4/djysVibDiv3Wf+4DDYr34ji79VMCmG2+d6if1znLlybSrnwy+jeRCzrG5d+E9ud0CySYyA26RuX7ml+c3ZOeST0p/KPnnFptvw1XNhLW7FNz7hE82lo/Bqa/edT4dpaLVjfCJYIl/VyhA2LA6bB9dDmKlinyvXQ6qXGiXI9uRtMpcAl4IILLrjgggsuuOCCCy644IILLrjgggsuuOCCCy644IILLrjgggsuuOCCCy644IILLrjgggsuuODqhGspPGTVW67O4pDLe+CCCy644IILLrjgggsuuOCCCy644IILLrjgMucai4Apro6LEEIIIYQQQgghDrIixjlwSWIcuOCCCy644CJwwQUXXHDBReCCCy644IKLGHIVxDj8ZYcQQvqfoRDlMeP/Lv+jLHWU7H+KY36DeF965xrTjAIXXJdGten2D7iaUipQnuCCCy64rparbLwJwGXI9ZQ61wQumzSv7woXXHDBBRdcKUa1bMsELhuuEi64nGQJl01U2xAUcMEFV/dR7bORw2XDdVzqjNlURfZw2aThg4NwKZM1c+WKr2wT5xopTOqzX0o2BVyXcm3OnqfJptRcz+H6FKF5Fm1+xkg2j42TqbonWOZvPk2mDgavjcNJRth/5Kvma2XaXHtNg541zWMM9On6pLquzZPWynUPCxNmcE4y1j25lwwaDR67Nrrq7XmOaLo8jSQPXn/nVXvz22ueMlKMchRdGGJypT853Z75MO/ZEeNefyNI+Vr/qp+OV5YvT1ZrKPXP7cpbY7oXr3t55danujWumI74M9mZxzKZcS42jHJUo0b5kCjXQp6bclDurrbPKFfDdOmeemnLdfJY9Uy9tOU6eWhX73WY4M1xWCsl7k4GlcqzUU6TG1xvpTQZ4jxKvBq1Ps8tN+08uhwmpFXUDQq52aPs+xT1XTLVmjUtoLcxHCgdwaYpNKxY7BoFFI1puNh/3CKrXv9VOytmteanV356a6Jf0XG3mlVF/x7Esrycbc8sZqm+HNUGy2DutqvF7LDc12Fhq3x0kmsBOhxqXozLSiyW253Bz9zwOd1Lt+W+qvkYizT14AUum5FzVsNl8indAq5PF2vdJVnAdZJb7Ut/h8tqym8Fl80EafYKl9V08ne4rCbfBVy/7om3hq8/ruGSW/NB3eg5eS5h9Rb3ddJcG+v5Anuw3nBtWk3u2YL1hGvTeia0eK4T49qJm8umsM3Frp7rTbiYYs/vn996z/U2L2/cveVNUc3Xb73k+vkyL/MbL+98kxeHOe7508t6vf55mmvhej/Wt/XL01yU49z6ieFfjlVZXcRMiX0AAAAASUVORK5CYII=`;
  
      // Convert damageTypes (previously called issues) into <li> elements
      const processedDamageTypes = Array.isArray(damageTypes) 
      ? damageTypes.filter(item => item != null && String(item).trim() !== '')
      : [];
      
      const issuesHTML = processedDamageTypes.length > 0 
        ? `<ul>${processedDamageTypes.map(issue => `<li>${escapeHTML(issue)}</li>`).join('')}</ul>`
        : '<p>No issues detected</p>';
      
      // Split recommendations into an array if it's a string
      const processedRecommendations = recommendations 
      ? String(recommendations).split('\n').filter(rec => rec.trim() !== '')
      : [];
      
      const recommendationsHTML = processedRecommendations.length > 0
        ? `<ul>${processedRecommendations.map(rec => `<li>${escapeHTML(rec)}</li>`).join('')}</ul>`
        : '<p>No recommendations available</p>';
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
            <title>Inspectify Hazard Assessment Report</title>
            <style>
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
                <h1>Inspectify Structural Assessment Report</h1>
                <p>Comprehensive structural assessment report</p>
              </div>
            </div>
  
            <div class="meta">
              <p><strong>Report For:</strong> ${escapeHTML(reportName || 'Living Room - Left Wall')}</p>
              <p><strong>Date:</strong> ${formattedReportDate}</p>
              <p><strong>Location:</strong> University of the Philippines</p>
              <p><strong>Coordinates:</strong> 123.90467, 10.41196</p>
            </div>
  
            <h2>Condition</h2>
            <p>${escapeHTML(condition || 'No condition specified')} ${materialAge ? `(Age: ${escapeHTML(materialAge)})` : ''}</p>
  
            <h2>Detected Issues</h2>
            ${issuesHTML}
  
            <h2>Recommendations</h2>
            ${recommendationsHTML}
  
            <h2>Notes</h2>
            <p>${escapeHTML(notes || 'No notes added.')}</p>
  
            <h2>Scanned Image</h2>
            <div class="image-container">
              ${annotatedImage ? `<img src="${annotatedImage}" alt="Annotated scan of the assessed area" />` : '<p>No image available</p>'}
            </div>
  
            <div class="footer">
              <p>This report was generated automatically by Inspectify. For official documentation, please consult a licensed structural engineer.</p>
              <p>© ${currentDate.getFullYear()} Inspectify. All rights reserved.</p>
            </div>
          </body>
        </html>
      `;
  
      const { uri } = await Print.printToFileAsync({ 
        html: htmlContent,
        width: 612,   // US Letter width in points (8.5in)
        height: 792,  // US Letter height in points (11in)
        base64: false
      });
      
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Share Inspection Report',
        UTI: 'com.adobe.pdf'
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`Failed to generate the PDF report: ${errorMessage}`);
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
              <TouchableOpacity 
                style={styles.shopButton} 
                onPress={() => router.push('../../nearby_shops')}
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
          visible={reportModalVisible}
          animationType="fade"
          transparent={true}
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
