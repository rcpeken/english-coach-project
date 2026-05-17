import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SHADOWS, SIZES } from '../../theme';
import { useAlert } from '../../components/CustomAlert';
import { testApi } from '../../services/api';
import type { QuestionRequest } from '../../types';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types';

type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'CreateTest'> };

const emptyQuestion: QuestionRequest = {
  questionText: '', optionA: '', optionB: '', optionC: '', optionD: '', correctOption: 'A',
};

export default function CreateTestScreen({ navigation }: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState<QuestionRequest[]>([{ ...emptyQuestion }]);
  const [loading, setLoading] = useState(false);
  const { showAlert } = useAlert();

  const updateQuestion = (index: number, field: keyof QuestionRequest, value: string) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  };

  const addQuestion = () => {
    setQuestions([...questions, { ...emptyQuestion }]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length <= 1) return;
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleCreate = async () => {
    if (!title.trim()) {
      showAlert('Hata', 'Test başlığı gerekli.');
      return;
    }
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.questionText.trim() || !q.optionA.trim() || !q.optionB.trim() || !q.optionC.trim() || !q.optionD.trim()) {
        showAlert('Hata', `Soru ${i + 1}: Tüm alanları doldurun.`);
        return;
      }
    }
    setLoading(true);
    try {
      await testApi.create({ title: title.trim(), description: description.trim(), questions });
      showAlert('Başarılı', 'Test oluşturuldu!', [{ text: 'Tamam', onPress: () => navigation.goBack() }]);
    } catch (e: any) {
      showAlert('Hata', e?.response?.data?.message || 'Bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Yeni Test</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.card}>
          <Text style={styles.label}>Test Başlığı</Text>
          <TextInput style={styles.input} placeholder="Ör: Unit 1 Vocabulary" placeholderTextColor={COLORS.secondaryLight} value={title} onChangeText={setTitle} />
          <Text style={[styles.label, { marginTop: 16 }]}>Açıklama (opsiyonel)</Text>
          <TextInput style={[styles.input, { height: 80, textAlignVertical: 'top' }]} placeholder="Test hakkında kısa bilgi..." placeholderTextColor={COLORS.secondaryLight} multiline value={description} onChangeText={setDescription} />
        </View>
        {questions.map((q, idx) => (
          <View key={idx} style={styles.card}>
            <View style={styles.questionHeader}>
              <Text style={styles.questionLabel}>Soru {idx + 1}</Text>
              {questions.length > 1 && (
                <TouchableOpacity onPress={() => removeQuestion(idx)}>
                  <Ionicons name="trash-outline" size={20} color={COLORS.error} />
                </TouchableOpacity>
              )}
            </View>
            <TextInput
              style={[styles.input, { marginBottom: 12 }]}
              placeholder="Soru metnini yazın..."
              placeholderTextColor={COLORS.secondaryLight}
              value={q.questionText}
              onChangeText={(v) => updateQuestion(idx, 'questionText', v)}
            />
            {(['A', 'B', 'C', 'D'] as const).map((opt) => (
              <View key={opt} style={styles.optionRow}>
                <TouchableOpacity
                  style={[styles.optionBadge, q.correctOption === opt && styles.optionBadgeActive]}
                  onPress={() => updateQuestion(idx, 'correctOption', opt)}
                >
                  <Text style={[styles.optionBadgeText, q.correctOption === opt && { color: COLORS.white }]}>{opt}</Text>
                </TouchableOpacity>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder={`Seçenek ${opt}`}
                  placeholderTextColor={COLORS.secondaryLight}
                  value={q[`option${opt}` as keyof QuestionRequest] as string}
                  onChangeText={(v) => updateQuestion(idx, `option${opt}` as keyof QuestionRequest, v)}
                />
              </View>
            ))}
          </View>
        ))}
        <TouchableOpacity style={styles.addBtn} onPress={addQuestion} activeOpacity={0.8}>
          <Ionicons name="add-circle-outline" size={22} color={COLORS.primary} />
          <Text style={styles.addBtnText}>Soru Ekle</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.submitBtn, loading && { opacity: 0.7 }]}
          onPress={handleCreate}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.submitText}>Testi Oluştur</Text>}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { paddingBottom: 120 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SIZES.padding, paddingTop: 56, paddingBottom: 16,
  },
  backBtn: { width: 40, height: 40, borderRadius: 14, backgroundColor: COLORS.surface, justifyContent: 'center', alignItems: 'center', ...SHADOWS.soft },
  headerTitle: { ...FONTS.h2 },

  card: {
    marginHorizontal: SIZES.padding, marginTop: 16, backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius, padding: 20, ...SHADOWS.soft, borderWidth: 1, borderColor: COLORS.border,
  },
  label: { ...FONTS.label, marginBottom: 8 },
  input: {
    backgroundColor: '#F8FAFC', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12,
    fontSize: 14, color: COLORS.primary, borderWidth: 1, borderColor: '#E2E8F0',
  },

  questionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  questionLabel: { ...FONTS.h3, fontSize: 16 },

  optionRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  optionBadge: {
    width: 36, height: 36, borderRadius: 12, backgroundColor: '#F1F5F9',
    justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#CBD5E1',
  },
  optionBadgeActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  optionBadgeText: { fontWeight: '700', fontSize: 13, color: COLORS.secondary },

  addBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    marginHorizontal: SIZES.padding, marginTop: 16, paddingVertical: 14,
    borderRadius: SIZES.radiusFull, borderWidth: 2, borderColor: COLORS.border, borderStyle: 'dashed',
  },
  addBtnText: { ...FONTS.label },

  submitBtn: {
    marginHorizontal: SIZES.padding, marginTop: 24, backgroundColor: COLORS.primary,
    borderRadius: SIZES.radiusFull, paddingVertical: 16, alignItems: 'center', ...SHADOWS.medium,
  },
  submitText: { ...FONTS.button },
});
