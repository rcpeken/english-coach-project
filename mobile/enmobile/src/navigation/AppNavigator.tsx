import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { ActivityIndicator, View } from 'react-native';
import { COLORS } from '../theme';
import type { RootStackParamList } from '../types';

import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

import TeacherTabs from './TeacherTabs';
import CreateTestScreen from '../screens/teacher/CreateTestScreen';
import TestDetailScreen from '../screens/teacher/TestDetailScreen';
import TestResultsScreen from '../screens/teacher/TestResultsScreen';
import CreatePassageScreen from '../screens/teacher/CreatePassageScreen';
import MyStudentsScreen from '../screens/teacher/MyStudentsScreen';

import StudentTabs from './StudentTabs';
import SolveTestScreen from '../screens/student/SolveTestScreen';
import TestResultScreen from '../screens/student/TestResultScreen';
import ReadingScreen from '../screens/student/ReadingScreen';
import VocabularyReviewScreen from '../screens/student/VocabularyReviewScreen';
import AiChatScreen from '../screens/student/AiChatScreen';
import AiQuizScreen from '../screens/student/AiQuizScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      {!user ? (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      ) : user.role === 'TEACHER' ? (
        <>
          <Stack.Screen name="TeacherTabs" component={TeacherTabs} />
          <Stack.Screen name="CreateTest" component={CreateTestScreen} />
          <Stack.Screen name="TestDetail" component={TestDetailScreen} />
          <Stack.Screen name="TestResults" component={TestResultsScreen} />
          <Stack.Screen name="CreatePassage" component={CreatePassageScreen} />
          <Stack.Screen name="MyStudents" component={MyStudentsScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="StudentTabs" component={StudentTabs} />
          <Stack.Screen name="SolveTest" component={SolveTestScreen} />
          <Stack.Screen name="TestResult" component={TestResultScreen} />
          <Stack.Screen name="Reading" component={ReadingScreen} />
          <Stack.Screen name="VocabularyReview" component={VocabularyReviewScreen} />
          <Stack.Screen name="AiChat" component={AiChatScreen} />
          <Stack.Screen name="AiQuiz" component={AiQuizScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}
