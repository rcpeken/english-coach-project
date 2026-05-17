import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SHADOWS, SIZES } from '../../theme';
import { testApi, aiApi } from '../../services/api';
import type { TestResultResponse, RootStackParamList, AiWrongAnswer } from '../../types';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'TestResult'>;
  route: RouteProp<RootStackParamList, 'TestResult'>;
};

export default function TestResultScreen({ navigation, route }: Props) {
  const { resultId } = route.params;
  const [result, setResult] = useState<TestResultResponse | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState('');

  useEffect(() => {
    testApi.getResult(resultId).then(setResult).catch(() => {});
  }, [resultId]);

  const explainMistakesWithAi = async () => {
    if (!result || result.percentage === 100) return;

    const wrongAnswers: AiWrongAnswer[] = result.answers
      .filter(a => !a.correct)
      .map(a => ({
        questionText: a.questionText,
        selectedOption: a.selectedOption,
        correctOption: a.correctOption,
      }));

    if (wrongAnswers.length === 0) return;

    setAiLoading(true);
    setAiAnalysis('');
    try {
      const res = await aiApi.explainAnswers({
        testTitle: result.testTitle,
        wrongAnswers,
      });
      setAiAnalysis(res.reply);
    } catch (e) {
      setAiAnalysis('❌ Hata oluştu. Öğretmen şu an meşgul.');
    } finally {
      setAiLoading(false);
    }
  };

  if (!result) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const pctColor = result.percentage >= 80 ? COLORS.successText : result.percentage >= 60 ? COLORS.warningText : COLORS.errorText;
  const pctBg = result.percentage >= 80 ? COLORS.successBg : result.percentage >= 60 ? COLORS.warningBg : COLORS.errorBg;
  const hasMistakes = result.percentage < 100;

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Sonuç</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={[styles.scoreCard, { backgroundColor: pctBg }]}>
          <Text style={[styles.scorePercent, { color: pctColor }]}>{Math.round(result.percentage)}%</Text>
          <Text style={styles.scoreTitle}>{result.testTitle}</Text>
          <Text style={styles.scoreSub}>{result.score} / {result.totalQuestions} doğru</Text>
        </View>
        {hasMistakes && (
          <View style={styles.aiActionContainer}>
            <TouchableOpacity
              style={[styles.aiBtn, aiLoading && { opacity: 0.7 }]}
              activeOpacity={0.8}
              onPress={explainMistakesWithAi}
              disabled={aiLoading}
            >
              {aiLoading ? (
                <ActivityIndicator color={COLORS.white} size="small" />
              ) : (
                <>
                  <Ionicons name="sparkles" size={20} color={COLORS.white} />
                  <Text style={styles.aiBtnText}>Yanlışlarımı AI Öğretmenle İncele</Text>
                </>
              )}
            </TouchableOpacity>

            {aiAnalysis ? (
              <View style={styles.aiResultCard}>
                <View style={styles.aiResultHeader}>
                  <Ionicons name="sparkles" size={18} color="#6D28D9" />
                  <Text style={styles.aiResultTitle}>AI Analizi</Text>
                </View>
                <Text style={styles.aiResultText}>{aiAnalysis}</Text>
              </View>
            ) : null}
          </View>
        )}
        <Text style={styles.sectionTitle}>Detaylı Sonuçlar</Text>
        {result.answers.map((a, idx) => (
          <View key={a.questionId} style={[styles.answerCard, { borderLeftColor: a.correct ? COLORS.successText : COLORS.errorText }]}>
            <View style={styles.answerHeader}>
              <Text style={styles.answerNum}>Soru {idx + 1}</Text>
              <Ionicons
                name={a.correct ? 'checkmark-circle' : 'close-circle'}
                size={22}
                color={a.correct ? COLORS.successText : COLORS.errorText}
              />
            </View>
            <Text style={styles.answerQuestion}>{a.questionText}</Text>
            <View style={styles.answerRow}>
              <Text style={styles.answerLabel}>Cevabınız:</Text>
              <Text style={[styles.answerValue, { color: a.correct ? COLORS.successText : COLORS.errorText }]}>{a.selectedOption}</Text>
            </View>
            {!a.correct && (
              <View style={styles.answerRow}>
                <Text style={styles.answerLabel}>Doğru:</Text>
                <Text style={[styles.answerValue, { color: COLORS.successText }]}>{a.correctOption}</Text>
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
  scroll: { paddingBottom: 120 },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SIZES.padding, paddingTop: 56, paddingBottom: 16,
  },
  backBtn: { width: 40, height: 40, borderRadius: 14, backgroundColor: COLORS.surface, justifyContent: 'center', alignItems: 'center', ...SHADOWS.soft },
  headerTitle: { ...FONTS.h2 },

  scoreCard: {
    marginHorizontal: SIZES.padding, borderRadius: SIZES.radius, padding: 32, alignItems: 'center',
    ...SHADOWS.soft,
  },
  scorePercent: { fontSize: 56, fontWeight: '800' },
  scoreTitle: { ...FONTS.h3, marginTop: 8 },
  scoreSub: { ...FONTS.bodySmall, marginTop: 4 },

  aiActionContainer: {
    marginHorizontal: SIZES.padding, marginTop: 24,
  },
  aiBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: '#8B5CF6', paddingVertical: 16, borderRadius: SIZES.radius,
    ...SHADOWS.soft,
  },
  aiBtnText: { ...FONTS.button, fontSize: 13 },
  aiResultCard: {
    marginTop: 16, backgroundColor: '#F3E8FF', borderRadius: SIZES.radius, padding: 20,
    borderWidth: 1, borderColor: '#D8B4FE',
  },
  aiResultHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  aiResultTitle: { ...FONTS.h3, color: '#6D28D9' },
  aiResultText: { fontSize: 15, lineHeight: 24, color: '#4C1D95' },

  sectionTitle: { ...FONTS.h3, paddingHorizontal: SIZES.padding, marginTop: 28, marginBottom: 16 },

  answerCard: {
    marginHorizontal: SIZES.padding, marginBottom: 12, backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius, padding: 16, borderLeftWidth: 4,
    ...SHADOWS.soft,
  },
  answerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  answerNum: { ...FONTS.caption },
  answerQuestion: { ...FONTS.body, fontSize: 14, fontWeight: '500', marginBottom: 12 },
  answerRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  answerLabel: { ...FONTS.bodySmall, fontSize: 12 },
  answerValue: { fontWeight: '700', fontSize: 14 },
});
