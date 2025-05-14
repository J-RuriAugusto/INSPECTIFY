import React, { useState } from 'react';
import { StyleSheet, Image, Text, View, TouchableOpacity, ImageBackground, Dimensions } from 'react-native';
import { useFonts } from 'expo-font';
import { useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');

const Questions = () => {
  const initialQuestions = [
    'Is your house located near a fault line or earthquake-prone area?',
    'Is your house built on soft or unstable soil (e.g., near a river or reclaimed land)?',
    'Is your house near a steep slope or hill that could collapse during an earthquake?',
    'Is your house made of weak materials (e.g., wood, hollow blocks without reinforcement)?',
    'Is your house more than 30 years old?',
    'Is your house located near a large body of water that could cause liquefaction?',
    'Is your house near a construction site or tall building that could collapse?',
    'Is your house located in an area with frequent small earthquakes?',
    'Is your house near a volcano or in a volcanic area?',
    'Is your house near a dam or reservoir that could fail during an earthquake?',
    'Is your house located in an area with poor building code enforcement?',
    'Is your house near a highway or bridge that could collapse during an earthquake?',
    'Is your house near a power plant or industrial area that could be hazardous during an earthquake?',
    'Is your house near a landfill or area with unstable ground?',
    'Is your house in an area where earthquakes have caused damage in the past?',
  ];

  const [questionsQueue, setQuestionsQueue] = useState(initialQuestions);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);

  const [fontsLoaded] = useFonts({
    'Epilogue-Black': require('../../../assets/fonts/Epilogue-Black.ttf'),
    'Archivo-Regular': require('../../../assets/fonts/Archivo-Regular.ttf'),
    'Epilogue-Bold': require('../../../assets/fonts/Epilogue-Bold.ttf'),
    'Epilogue-Medium': require('../../../assets/fonts/Archivo-Medium.ttf'),
  });

  const navigation = useNavigation();
  const router = useRouter();

  if (!fontsLoaded) return null;

  const handleAnswer = (answer: string) => {
    if (answer === 'Yes') {
      setScore((prev) => prev + 1);
    }

    const nextIndex = questionIndex + 1;

    if (nextIndex < questionsQueue.length) {
      setQuestionIndex(nextIndex);
    } else {
      router.push({
        pathname: '/Forms/earthquake_results',
        params: { score: (answer === 'Yes' ? score + 1 : score).toString() },
      });
    }
  };

  const handleSkip = () => {
    const skippedQuestion = questionsQueue[questionIndex];
    const updatedQueue = [
      ...questionsQueue.slice(0, questionIndex),
      ...questionsQueue.slice(questionIndex + 1),
      skippedQuestion,
    ];

    setQuestionsQueue(updatedQueue);
    if (questionIndex < updatedQueue.length - 1) {
      setQuestionIndex(questionIndex);
    } else {
      setQuestionIndex(updatedQueue.length - 1);
    }
  };

  return (
    <ImageBackground
      source={require('../../../assets/images/earthquake_bg.png')}
      style={styles.container}
      resizeMode="cover"
    >
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Image source={require('../../../assets/images/back-icon.png')} style={styles.backIcon} />
        </TouchableOpacity>

        <Text style={styles.categoryTitle}>EARTHQUAKE</Text>

        <TouchableOpacity onPress={handleSkip}>
          <Text style={styles.skipText}>SKIP</Text>
        </TouchableOpacity>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View
          style={[
            styles.progressBar,
            { width: `${((questionIndex + 1) / questionsQueue.length) * 100}%` },
          ]}
        />
      </View>

      {/* Question Modal */}
      <View style={styles.contentWrapper}>
        <View style={styles.modal}>
          <View style={styles.questionContainer}>
            <Text style={styles.questionText}>{questionsQueue[questionIndex]}</Text>
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
    fontSize: 25,
    color: '#030F1C',
    textAlign: 'center',
  },
  questionContainer: {
    minHeight: height * 0.15,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  optionsContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '8%',
    marginTop: '10%',
  },
  optionButton: {
    backgroundColor: '#030F1C',
    paddingVertical: '5%',
    paddingHorizontal: '40%',
    borderRadius: 15,
  },
  optionText: {
    fontFamily: 'Epilogue-Bold',
    fontSize: 20,
    color: '#FFFFFF',
    textAlign: 'center',
  },
});

export default Questions;
