import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Image,
  Text,
  View,
  TouchableOpacity,
  ImageBackground,
  Dimensions,
  ScrollView,
} from 'react-native';
import { useFonts } from 'expo-font';
import { useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useTranslation } from '../../../hooks/useTranslation';

const { width, height } = Dimensions.get('window');

const Questions = () => {
  const { t, translateFloodQuestions } = useTranslation();
  const initialQuestions = translateFloodQuestions();

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

      // Calculate score with the updated answers
      const updatedScore = updatedAnswers.filter((ans) => ans === 'Yes').length;

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
              score: updatedScore.toString(),
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

        <Text style={styles.categoryTitle}>{t('FLOOD')}</Text>

        <TouchableOpacity onPress={handleSkip}>
          <Text style={styles.skipText}>{t('SKIP')}</Text>
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
            <ScrollView contentContainerStyle={styles.scrollContent}>
              <Text style={styles.questionText}>
                {questionsQueue[questionIndex]}
              </Text>
            </ScrollView>
          </View>

          <View style={styles.optionsContainer}>
            <TouchableOpacity
              style={styles.optionButton}
              onPress={() => handleAnswer('Yes')}
            >
              <Text style={styles.optionText}>{t('YES')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.optionButton}
              onPress={() => handleAnswer('No')}
            >
              <Text style={styles.optionText}>{t('NO')}</Text>
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
    position:'absolute',
    textAlign: 'center',
    fontFamily: 'Epilogue-Bold',
    fontSize: width * 0.05,
    color: '#5CD2FF',
    left: '50%',
  },
  skipText: {
    fontFamily: 'Epilogue-Medium',
    fontSize: width * 0.040,
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
    fontSize: 23,
    color: '#030F1C',
    textAlign: 'center',
  },
questionContainer: {
  maxHeight: height * 0.35, // adjusted from minHeight
  width: '100%',
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
    fontSize: 15,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  scrollContent: {
  paddingHorizontal: 10,
  paddingVertical: 1,
},
});

export default Questions;
