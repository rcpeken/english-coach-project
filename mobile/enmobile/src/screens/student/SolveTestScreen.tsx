import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SHADOWS, SIZES } from '../../theme';
import { useAlert } from '../../components/CustomAlert';
import { testApi } from '../../services/api';
import type { TestResponse, AnswerRequest, RootStackParamList } from '../../types';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'SolveTest'>;
  route: RouteProp<RootStackParamList, 'SolveTest'>;
};

export default function SolveTestScreen({ navigation, route }: Props) {
  const { assignmentId, testId } = route.params;
  const [test, setTest] = useState<TestResponse | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Map<number, string>>(new Map());
  const [submitting, setSubmitting] = useState(false);
  const { showAlert } = useAlert();

  useEffect(() => {
    testApi.getById(testId).then(setTest).catch(() => showAlert('Hata', 'Test yüklenemedi.'));
  }, [testId]);

  if (!test) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const question = test.questions[currentIdx];
  const totalQ = test.questions.length;
  const selected = answers.get(question.id);

  const selectOption = (opt: string) => {
    const newAnswers = new Map(answers);
    newAnswers.set(question.id, opt);
    setAnswers(newAnswers);
  };

  const goNext = () => {
    if (currentIdx < totalQ - 1) setCurrentIdx(currentIdx + 1);
  };
  const goPrev = () => {
    if (currentIdx > 0) setCurrentIdx(currentIdx - 1);
  };

  const handleSubmit = async () => {
    if (answers.size < totalQ) {
      showAlert('Dikkat', 'Tüm soruları cevaplayın.');
      return;
    }
    showAlert('Testi Gönder', 'Cevaplarınız gönderilecek. Emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Gönder', onPress: async () => {
          setSubmitting(true);
          try {
            const answerList: AnswerRequest[] = Array.from(answers.entries()).map(([questionId, selectedOption]) => ({
              questionId, selectedOption,
            }));
            const result = await testApi.submit(assignmentId, { answers: answerList });
            navigation.replace('TestResult', { resultId: result.id });
          } catch (e: any) {
            showAlert('Hata', e?.response?.data?.message || 'Gönderim başarısız.');
          } finally {
            setSubmitting(false);
          }
        },
      },
    ]);
  };

  const progress = ((currentIdx + 1) / totalQ) * 100;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="close" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={styles.headerTitle}>{test.title}</Text>
          <Text style={styles.headerSub}>{currentIdx + 1} / {totalQ}</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.questionCard}>
          <Text style={styles.questionNum}>Soru {currentIdx + 1}</Text>
          <Text style={styles.questionText}>{question.questionText}</Text>
        </View>
        {(['A', 'B', 'C', 'D'] as const).map((opt) => {
          const isSelected = selected === opt;
          return (
            <TouchableOpacity
              key={opt}
              style={[styles.optionCard, isSelected && styles.optionCardSelected]}
              onPress={() => selectOption(opt)}
              activeOpacity={0.8}
            >
              <View style={[styles.optionBadge, isSelected && styles.optionBadgeSelected]}>
                <Text style={[styles.optionBadgeText, isSelected && { color: COLORS.white }]}>{opt}</Text>
              </View>
              <Text style={[styles.optionText, isSelected && { color: COLORS.primary, fontWeight: '600' }]}>
                {question[`option${opt}` as keyof typeof question]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      <View style={styles.navRow}>
        <TouchableOpacity
          style={[styles.navBtn, currentIdx === 0 && { opacity: 0.3 }]}
          onPress={goPrev}
          disabled={currentIdx === 0}
        >
          <Ionicons name="arrow-back" size={20} color={COLORS.primary} />
          <Text style={styles.navBtnText}>Önceki</Text>
        </TouchableOpacity>

        {currentIdx === totalQ - 1 ? (
          <TouchableOpacity
            style={[styles.submitBtn, submitting && { opacity: 0.7 }]}
            onPress={handleSubmit}
            disabled={submitting}
            activeOpacity={0.8}
          >
            {submitting ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.submitText}>Testi Bitir</Text>}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.nextBtn} onPress={goNext} activeOpacity={0.8}>
            <Text style={styles.nextBtnText}>Sonraki</Text>
            <Ionicons name="arrow-forward" size={20} color={COLORS.white} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },

  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: SIZES.padding, paddingTop: 56, paddingBottom: 12,
  },
  backBtn: { width: 40, height: 40, borderRadius: 14, backgroundColor: COLORS.surface, justifyContent: 'center', alignItems: 'center', ...SHADOWS.soft },
  headerTitle: { ...FONTS.label },
  headerSub: { ...FONTS.bodySmall, fontSize: 12 },

  progressBar: {
    height: 4, backgroundColor: COLORS.accent, marginHorizontal: SIZES.padding, borderRadius: 2,
  },
  progressFill: {
    height: '100%', backgroundColor: COLORS.primary, borderRadius: 2,
  },

  scroll: { paddingHorizontal: SIZES.padding, paddingTop: 24, paddingBottom: 120 },

  questionCard: {
    backgroundColor: COLORS.surface, borderRadius: SIZES.radius, padding: 24, marginBottom: 20,
    ...SHADOWS.soft, borderWidth: 1, borderColor: COLORS.border,
  },
  questionNum: { ...FONTS.caption, marginBottom: 8 },
  questionText: { ...FONTS.body, fontSize: 17, fontWeight: '600', lineHeight: 26 },

  optionCard: {
    backgroundColor: COLORS.surface, borderRadius: 20, padding: 16, marginBottom: 12,
    flexDirection: 'row', alignItems: 'center', gap: 14,
    borderWidth: 2, borderColor: COLORS.border,
  },
  optionCardSelected: {
    borderColor: COLORS.primary, backgroundColor: '#F1F5F9',
  },
  optionBadge: {
    width: 40, height: 40, borderRadius: 14, backgroundColor: COLORS.background,
    justifyContent: 'center', alignItems: 'center',
  },
  optionBadgeSelected: { backgroundColor: COLORS.primary },
  optionBadgeText: { fontWeight: '700', fontSize: 15, color: COLORS.secondary },
  optionText: { ...FONTS.body, flex: 1 },

  navRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: SIZES.padding, paddingVertical: 16, paddingBottom: 40,
    backgroundColor: COLORS.surface, borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  navBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 12,
    borderRadius: SIZES.radiusFull, backgroundColor: COLORS.background,
  },
  navBtnText: { ...FONTS.label, fontSize: 13 },
  nextBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 24, paddingVertical: 12,
    borderRadius: SIZES.radiusFull, backgroundColor: COLORS.primary,
  },
  nextBtnText: { ...FONTS.button, fontSize: 13 },
  submitBtn: {
    paddingHorizontal: 28, paddingVertical: 12, borderRadius: SIZES.radiusFull,
    backgroundColor: COLORS.successText,
  },
  submitText: { ...FONTS.button, fontSize: 13 },
});
