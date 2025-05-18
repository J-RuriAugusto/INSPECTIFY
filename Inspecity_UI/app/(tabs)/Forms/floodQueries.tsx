import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Image,
  Text,
  View,
  TouchableOpacity,
  ImageBackground,
  Dimensions,
} from 'react-native';
import { useFonts } from 'expo-font';
import { useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');

const Questions = () => {
  const initialQuestions = [
    // HAZARD
    'Is your house located within 100 meters of a river, creek, canal, or estero?',
    'Has your community experienced flooding within the last 2 years?',
    'Is your house situated at a lower elevation than the road, causing water to flow into it during rains?',
    'Does your street flood even during light rain (e.g., ankle-deep water)?',
    'Is there a dam, large lake, or reservoir within 1 kilometer of your home?',

    // VULNERABILITY
    'Does any amount of water enter your home during heavy rain, including minor leaks or major flooding?',
    'Is your house made of light materials (e.g., wood, bamboo, or thin sheets) that can be damaged by floodwater?',
    'Are important items like documents, appliances, or food stored on the floor or below waist level?',
    'Is your family unfamiliar with evacuation routes or flood safety plans in your barangay?',
    'Are there children, elderly, pregnant women, or persons with disabilities in your household?',

    // EXPOSURE
    'Is there a clogged drainage system or canal within 50 meters of your house?',
    'Is your area mostly concrete, preventing water from soaking into the ground?',
    'Is there ongoing construction within 200 meters that could block natural water flow?',
    'Are there large trees, signs, or weak structures nearby that could fall during a flood?',
    'When it floods in your area, does it take more than 12 hours for the water to subside?',
  ];

  const [questionsQueue, setQuestionsQueue] = useState(initialQuestions);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>(Array(initialQuestions.length).fill(''));
  const [skippedIndices, setSkippedIndices] = useState<number[]>([]);

  // Calculate score dynamically based on answers to avoid double counting
  const score = answers.filter((ans) => ans === 'Yes').length;

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
      const currentIndex = questionIndex;

      // Store answer at the original question index
      const updatedAnswers = [...answers];
      updatedAnswers[currentIndex] = answer;
      setAnswers(updatedAnswers);

      console.log(`Answered Question ${currentIndex + 1}: ${answer}`);
      console.log('Updated Answers:', updatedAnswers);

      // If this question was skipped before and now answered, remove from skipped
      if (skippedIndices.includes(currentIndex)) {
        setSkippedIndices(skippedIndices.filter((i) => i !== currentIndex));
      }

      // Move to next question
      const nextIndex = findNextUnansweredQuestion(currentIndex + 1, updatedAnswers, skippedIndices);
      if (nextIndex !== -1) {
        setQuestionIndex(nextIndex);
      } else {
        // If no more unanswered questions, check if skipped questions remain
        if (skippedIndices.length > 0) {
          setQuestionIndex(skippedIndices[0]);
        } else {
          // All done - navigate to results
          router.push({
            pathname: '/Forms/flood_results',
            params: {
              score: score.toString(),
              answers: JSON.stringify(updatedAnswers),
            },
          });
        }
      }
    };

    // Helper to find next unanswered question index after current
    const findNextUnansweredQuestion = (startIdx: number, answersArr: string[], skippedArr: number[]) => {
      for (let i = startIdx; i < answersArr.length; i++) {
        if (answersArr[i] === '') return i;
      }
      // Also check skipped questions
      for (let i = 0; i < answersArr.length; i++) {
        if (skippedArr.includes(i) && answersArr[i] === 'Skipped') {
          return i;
        }
      }
      return -1; // none found
    };

    const handleSkip = () => {
      const currentIndex = questionIndex;

      // Mark question as skipped
      const updatedAnswers = [...answers];
      updatedAnswers[currentIndex] = 'Skipped';
      setAnswers(updatedAnswers);

      console.log(`Skipped Question ${currentIndex + 1}`);
      console.log('Updated Answers:', updatedAnswers);

      if (!skippedIndices.includes(currentIndex)) {
        setSkippedIndices([...skippedIndices, currentIndex]);
      }

      // Move to next unanswered question
      const nextIndex = findNextUnansweredQuestion(currentIndex + 1, updatedAnswers, skippedIndices);
      if (nextIndex !== -1) {
        setQuestionIndex(nextIndex);
      } else {
        // If no more questions, but skipped remain, show first skipped
        if (skippedIndices.length > 0) {
          setQuestionIndex(skippedIndices[0]);
        } else {
          // All answered/skipped, go to results
          router.push({
            pathname: '/Forms/flood_results',
            params: {
              score: score.toString(),
              answers: JSON.stringify(updatedAnswers),
            },
          });
        }
      }
    };

  return (
    <ImageBackground
      source={require('../../../assets/images/flood_bg.png')}
      style={styles.container}
      resizeMode="cover"
    >
      {/* Top Header Row */}
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Image
            source={require('../../../assets/images/back-icon.png')}
            style={styles.backIcon}
          />
        </TouchableOpacity>

        <Text style={styles.categoryTitle}>FLOOD</Text>

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

      {/* Modal-like Container for Questions */}
      <View style={styles.contentWrapper}>
        <View style={styles.modal}>
          <View style={styles.questionContainer}>
            <Text style={styles.questionText}>
              {questionsQueue[questionIndex]}
            </Text>
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
