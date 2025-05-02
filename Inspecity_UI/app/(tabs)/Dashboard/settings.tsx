import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, Alert, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { useNavigation } from '@react-navigation/native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useSettings, defaultSettings } from './settingsContext'; // Add defaultSettings to the import
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

const Settings = () => {
  const navigation = useNavigation();
  const { settings, updateSettings } = useSettings();
  const [backupLocation, setBackupLocation] = useState<string | null>(settings.backupLocation);
  const [changesMade, setChangesMade] = useState(false);
  const [localSettings, setLocalSettings] = useState(settings);

  // Check for changes
  useEffect(() => {
    const isChanged =
      localSettings.darkMode !== settings.darkMode ||
      localSettings.language !== settings.language ||
      localSettings.reportFormat !== settings.reportFormat ||
      localSettings.autoSave !== settings.autoSave ||
      localSettings.backupLocation !== settings.backupLocation;
    setChangesMade(isChanged);
  }, [localSettings, settings]);

  const updateLocalSetting = (key: keyof typeof localSettings, value: any) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  const clearCache = async () => {
    Alert.alert(
      'Clear Cache',
      'Are you sure you want to clear all app data?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Data',
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              updateSettings(defaultSettings);
              setLocalSettings(defaultSettings);
              router.replace('../../../getstarted_1');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear cache');
              console.error(error);
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const chooseBackupLocation = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: '*/*' });
  
      if (result.canceled) return;
  
      const file = result.assets[0];
      setBackupLocation(file.uri);
      updateLocalSetting('backupLocation', file.uri);
  
      Alert.alert('Backup Location Selected', `Your backup will be saved to:\n${file.uri}`);
    } catch (error) {
      console.error('Error selecting backup location:', error);
      Alert.alert('Error', 'Failed to select backup location.');
    }
  };  

  const backupData = async () => {
    const location = localSettings.backupLocation || backupLocation;
    if (!location) {
      Alert.alert('Backup Error', 'Please select a backup location first.');
      return;
    }

    try {
      const backupFilePath = `${location}/inspectify_backup.json`;
      await FileSystem.writeAsStringAsync(backupFilePath, JSON.stringify({ data: 'Your backup data' }));
      Alert.alert('Backup Success', `Data has been backed up to:\n${backupFilePath}`);
    } catch (error) {
      console.error('Error backing up data:', error);
      Alert.alert('Error', 'Failed to save backup.');
    }
  };

  const saveChanges = () => {
    updateSettings(localSettings);
    Alert.alert('Settings Saved', 'Your changes have been saved successfully.');
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Settings</Text>

        {/* General */}
        <Text style={styles.sectionTitle}>General</Text>

        <View style={styles.optionRow}>
          <Text style={styles.optionText}>Dark Mode</Text>
          <Switch 
            value={localSettings.darkMode} 
            onValueChange={() => updateLocalSetting('darkMode', !localSettings.darkMode)} 
          />
        </View>

        <View style={styles.optionRow}>
          <Text style={styles.optionText}>Language</Text>
          <Picker
            selectedValue={localSettings.language}
            style={styles.picker}
            onValueChange={(itemValue) => updateLocalSetting('language', itemValue)}
          >
            <Picker.Item label="English" value="English" />
            <Picker.Item label="Tagalog" value="Tagalog" />
            <Picker.Item label="Cebuano" value="Cebuano" />
          </Picker>
        </View>

        {/* Inspection Preferences */}
        <Text style={styles.sectionTitle}>Inspection Preferences</Text>

        <View style={styles.optionRow}>
          <Text style={styles.optionText}>Default Report Format</Text>
          <Picker
            selectedValue={localSettings.reportFormat}
            style={styles.picker}
            onValueChange={(itemValue) => updateLocalSetting('reportFormat', itemValue)}
          >
            <Picker.Item label="PDF" value="PDF" />
            <Picker.Item label="DOCX" value="DOCX" />
            <Picker.Item label="PNG" value="PNG" />
            <Picker.Item label="JPEG" value="JPEG" />
          </Picker>
        </View>

        <View style={styles.optionRow}>
          <Text style={styles.optionText}>Auto-Save Inspections</Text>
          <Switch 
            value={localSettings.autoSave} 
            onValueChange={() => updateLocalSetting('autoSave', !localSettings.autoSave)} 
          />
        </View>

        {/* App Management */}
        <Text style={styles.sectionTitle}>App Management</Text>

        <TouchableOpacity style={styles.optionButton} onPress={clearCache}>
          <Text style={styles.optionText}>Clear Cache</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.optionButton} onPress={chooseBackupLocation}>
          <Text style={styles.optionText}>Choose Backup Location</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.optionButton} onPress={backupData}>
          <Text style={styles.optionText}>Backup Data</Text>
        </TouchableOpacity>

        {/* Help & Support */}
        <Text style={styles.sectionTitle}>Help & Support</Text>

        <TouchableOpacity style={styles.optionButton} onPress={() => Alert.alert('About Inspectify', 'Inspectify helps detect cracks in houses using AI.')}>
          <Text style={styles.optionText}>About Inspectify</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.optionButton} onPress={() => Alert.alert('Privacy Policy', 'Your data is safe and secure with Inspectify.')}>
          <Text style={styles.optionText}>Privacy Policy</Text>
        </TouchableOpacity>

        {/* Save Changes Button */}
        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: changesMade ? '#007AFF' : '#CCCCCC' }]}
          onPress={saveChanges}
          disabled={!changesMade}
        >
          <Text style={styles.saveButtonText}>Save Changes</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5'
  },
  scrollContainer: {
    padding: wp('5%'),        // replaces 20px
    paddingTop: hp('6.2%'),   // replaces 50px
  },
  title: {
    fontSize: wp('8%'),       // replaces 30px
    color: '#333',
    fontFamily: 'Epilogue-Black',
    marginBottom: hp('2.5%'), // replaces 20px
  },
  sectionTitle: {
    fontSize: wp('4.8%'),     // replaces 18px
    color: '#555',
    fontFamily: 'Epilogue-Bold',
    marginTop: hp('2.5%'),    // replaces 20px
    marginBottom: hp('0.6%'), // replaces 5px
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: wp('4%'),        // replaces 15px
    borderRadius: wp('3%'),
    marginBottom: hp('1.2%'),
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  optionText: {
    fontSize: wp('3.8%'),     // replaces 13.5px
    color: '#333',
    fontFamily: 'Epilogue-Bold',
  },
  picker: {
    backgroundColor: '#FFFFFF',
    color: '#333',
    width: wp('37%'),         // replaces 140px
    borderRadius: wp('3%'),
  },
  optionButton: {
    backgroundColor: '#FFFFFF',
    padding: wp('4%'),        // replaces 15px
    borderRadius: wp('3%'),
    marginBottom: hp('1.2%'),
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  saveButton: {
    padding: wp('4%'),        // replaces 15px
    borderRadius: wp('3%'),
    alignItems: 'center',
    marginTop: hp('2.5%'),    // replaces 20px
  },
  saveButtonText: {
    fontSize: wp('4.3%'),     // replaces 16px
    color: '#FFF',
    fontFamily: 'Epilogue-Bold',
  },
});

export default Settings;
