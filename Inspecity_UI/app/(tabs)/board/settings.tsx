import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, Alert, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { useNavigation } from '@react-navigation/native';


const Settings = () => {
  const navigation = useNavigation();

  // Initial state
  const initialSettings = {
    darkMode: false,
    language: 'English',
    reportFormat: 'PDF',
    autoSave: false,
    backupLocation: null,
  };

  const [settings, setSettings] = useState(initialSettings);
  const [backupLocation, setBackupLocation] = useState(null);
  const [changesMade, setChangesMade] = useState(false);

  // Check for changes
  useEffect(() => {
    const isChanged =
      settings.darkMode !== initialSettings.darkMode ||
      settings.language !== initialSettings.language ||
      settings.reportFormat !== initialSettings.reportFormat ||
      settings.autoSave !== initialSettings.autoSave ||
      settings.backupLocation !== initialSettings.backupLocation;
    setChangesMade(isChanged);
  }, [settings]);

  const updateSetting = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const clearCache = () => {
    Alert.alert('Clear Cache', 'Are you sure you want to clear cache?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', onPress: () => console.log('Cache Cleared'), style: 'destructive' },
    ]);
  };

  const chooseBackupLocation = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: '*/*' });
      if (result.canceled) return;
      setBackupLocation(result.uri);
      updateSetting('backupLocation', result.uri);
      Alert.alert('Backup Location Selected', `Your backup will be saved to:\n${result.uri}`);
    } catch (error) {
      console.error('Error selecting backup location:', error);
      Alert.alert('Error', 'Failed to select backup location.');
    }
  };

  const backupData = async () => {
    if (!backupLocation) {
      Alert.alert('Backup Error', 'Please select a backup location first.');
      return;
    }

    try {
      const backupFilePath = `${backupLocation}/inspectify_backup.json`;
      await FileSystem.writeAsStringAsync(backupFilePath, JSON.stringify({ data: 'Your backup data' }));
      Alert.alert('Backup Success', `Data has been backed up to:\n${backupFilePath}`);
    } catch (error) {
      console.error('Error backing up data:', error);
      Alert.alert('Error', 'Failed to save backup.');
    }
  };

  const saveChanges = () => {
    Alert.alert('Settings Saved', 'Your changes have been saved successfully.');
    
    initialSettings.darkMode = settings.darkMode;
    initialSettings.language = settings.language;
    initialSettings.reportFormat = settings.reportFormat;
    initialSettings.autoSave = settings.autoSave;
    initialSettings.backupLocation = settings.backupLocation;

    setChangesMade(false);

    // Navigate back to dashboard
    navigation.goBack(); // or navigation.navigate('Dashboard');
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Settings</Text>

        {/* General */}
        <Text style={styles.sectionTitle}>General</Text>

        <View style={styles.optionRow}>
          <Text style={styles.optionText}>Dark Mode</Text>
          <Switch value={settings.darkMode} onValueChange={() => updateSetting('darkMode', !settings.darkMode)} />
        </View>

        <View style={styles.optionRow}>
          <Text style={styles.optionText}>Language</Text>
          <Picker
            selectedValue={settings.language}
            style={styles.picker}
            onValueChange={(itemValue) => updateSetting('language', itemValue)}
          >
            <Picker.Item label="English" value="English" />
            <Picker.Item label="Spanish" value="Spanish" />
            <Picker.Item label="French" value="French" />
          </Picker>
        </View>

        {/* Inspection Preferences */}
        <Text style={styles.sectionTitle}>Inspection Preferences</Text>

        <View style={styles.optionRow}>
          <Text style={styles.optionText}>Default Report Format</Text>
          <Picker
            selectedValue={settings.reportFormat}
            style={styles.picker}
            onValueChange={(itemValue) => updateSetting('reportFormat', itemValue)}
          >
            <Picker.Item label="PDF" value="PDF" />
            <Picker.Item label="DOCX" value="DOCX" />
            <Picker.Item label="PNG" value="PNG" />
            <Picker.Item label="JPEG" value="JPEG" />
          </Picker>
        </View>

        <View style={styles.optionRow}>
          <Text style={styles.optionText}>Auto-Save Inspections</Text>
          <Switch value={settings.autoSave} onValueChange={() => updateSetting('autoSave', !settings.autoSave)} />
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
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  scrollContainer: { padding: 20, paddingTop: 50 },
  title: { fontSize: 30, color: '#333', fontFamily: 'Epilogue-Black', marginBottom: 20 },
  sectionTitle: { fontSize: 18, color: '#555', fontFamily: 'Epilogue-Bold', marginTop: 20, marginBottom: 5 },
  optionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 15, borderRadius: 10, marginBottom: 10, shadowColor: '#000', shadowOpacity: 0.1, shadowOffset: { width: 0, height: 2 }, elevation: 3 },
  optionText: { fontSize: 13.5, color: '#333', fontFamily: 'Epilogue-Bold' },
  picker: { backgroundColor: '#FFFFFF', color: '#333', width: 140, borderRadius: 10 },
  optionButton: { backgroundColor: '#FFFFFF', padding: 15, borderRadius: 10, marginBottom: 10, shadowColor: '#000', shadowOpacity: 0.1, shadowOffset: { width: 0, height: 2 }, elevation: 3 },
  saveButton: { padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 20 },
  saveButtonText: { fontSize: 16, color: '#FFF', fontFamily: 'Epilogue-Bold' },
});

export default Settings;
