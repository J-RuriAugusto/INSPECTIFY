import React, { useState } from 'react';
import { StyleSheet, Image, Text, View, TouchableOpacity, ImageBackground, Dimensions } from 'react-native';
import { useFonts } from 'expo-font';
import { useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';

const router = useRouter();
const { width, height } = Dimensions.get('window');

const Questions = () => {
  const [questionIndex, setQuestionIndex] = useState(0);
  const questions = [
    'Do you have an emergency kit with basic supplies (e.g., flashlight, first aid, food, water)?',
    'Do you have a family emergency plan in case of disasters?',
    'Do you know the nearest evacuation center in your area?',
    'Do you have a list of emergency contact numbers (e.g., barangay, hospital, fire station)?',
    'Do you have a battery-powered radio for updates during power outages?  ',
    'Do you store important documents (e.g., IDs, land titles) in a waterproof and fireproof container?',
    'Do you have a plan for securing your pets during disasters?',
    'Do you regularly check and maintain your emergency supplies? ',
    'Do you know how to turn off utilities (electricity, water, gas) in case of emergencies? ',
    'Do you have a backup power source (e.g., generator, power bank)? ',
    'Do you have a plan for evacuating elderly or disabled family members? ',
    'Do you have a fire extinguisher at home? ',
    'Do you regularly participate in community disaster drills?  ',
    'Do you have a plan for communicating with family members during disasters? ',
    'Do you know the basic first aid procedures (e.g., CPR, wound care)?',  
    ];

  const [fontsLoaded] = useFonts({
    'Epilogue-Black': require('../../../assets/fonts/Epilogue-Black.ttf'),
    'Archivo-Regular': require('../../../assets/fonts/Archivo-Regular.ttf'),
    'Epilogue-Bold': require('../../../assets/fonts/Epilogue-Bold.ttf'),
    'Epilogue-Medium': require('../../../assets/fonts/Archivo-Medium.ttf'),
  });

  const navigation = useNavigation();

  if (!fontsLoaded) return null;

  const [score, setScore] = useState(0);

  
  // Inside your component:
  const handleAnswer = (answer: string) => {
    if (answer === 'Yes') {
      setScore(prev => prev + 1);
    }
  
    if (questionIndex < questions.length - 1) {
      setQuestionIndex(prev => prev + 1);
    } else {
      router.push({
        pathname: '/Forms/general_results',
        params: { score: score.toString() }, // Must stringify numbers
      });
    }
  };
    

  return (
    <ImageBackground
      source={require('../../../assets/images/general_bg.png')}
      style={styles.container}
      resizeMode="cover"
    >
      {/* Top Header Row */}
        <View style={styles.headerRow}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <Image source={require('../../../assets/images/back-icon.png')} style={styles.backIcon} />
            </TouchableOpacity>

            <Text style={styles.categoryTitle}>GENERAL</Text>

            <TouchableOpacity onPress={() => {
                if (questionIndex < questions.length - 1) {
                    setQuestionIndex(prev => prev + 1);
                } else {
                    // Optionally, navigate or show a result/completion
                    console.log("Finished all questions");
                }
                }}>
                <Text style={styles.skipText}>SKIP</Text>
            </TouchableOpacity>
        </View>

      {/* Progress Bar */}
        <View style={styles.progressContainer}>
            <View
            style={[
                styles.progressBar,
                { width: `${((questionIndex + 1) / questions.length) * 100}%` },
            ]}
            />
        </View>

        {/* Modal-like Container for Questions */}
        <View style={styles.contentWrapper}>
            <View style={styles.modal}>
                <View style={styles.questionContainer}>
                    <Text style={styles.questionText}>{questions[questionIndex]}</Text>
                </View>

                <View style={styles.optionsContainer}>
                    <TouchableOpacity
                        style={styles.optionButton}
                        onPress={() => handleAnswer('Yes')}
                    >
                        <Text style={styles.optionText}>Yes</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.optionButton}
                        onPress={() => handleAnswer('No')}
                    >
                        <Text style={styles.optionText}>No</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  backButton: {
    left: width * 0.01,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backIcon: {
    width: width * 0.07,
    height: width * 0.07,
    marginRight: width * 0.01,
  },
  headerRow: {
    position: 'absolute',
    top: height * 0.05,
    left: 0,
    right: 0,
    paddingHorizontal: width * 0.05,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryTitle: {
    textAlign: 'center',
    fontFamily: 'Epilogue-Bold',
    fontSize: width * 0.05,
    color: '#5CD2FF',
  },
  skipText: {
    fontFamily: 'Epilogue-Medium',
    fontSize: width * 0.045,
    color: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressContainer: {
    top: height * 0.12,
    alignSelf: 'center',
    height: '1%',
    width: '75%',
    backgroundColor: '#ccc',
    borderRadius: 3,
    overflow: 'hidden',
    marginHorizontal: width * 0.05,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#030F1C',
    borderRadius: 3,
  },
  contentWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: height * 0.12,
    paddingHorizontal: width * 0.1,
  },  
  modal: {
    width: '100%',
    height: '90%',
    padding: '5%',
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },  
  questionText: {
    fontFamily: 'Epilogue-Bold',
    fontSize: width * 0.09,
    color: '#030F1C',
    textAlign: 'center',
  },
  questionContainer: {
    minHeight: height * 0.15, // Adjust as needed
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },  
  optionsContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '8%', // or marginVertical in optionButton
    marginTop: '10%', // space between question and buttons
  },  
  optionButton: {
    backgroundColor: '#030F1C',
    paddingVertical: '5%',
    paddingHorizontal: '40%',
    borderRadius: 15,
    // marginVertical: '1%'
  },
  optionText: {
    fontFamily: 'Epilogue-Bold',
    fontSize: 20,
    color: '#FFFFFF',
    textAlign: 'center',
  },
});

export default Questions;
