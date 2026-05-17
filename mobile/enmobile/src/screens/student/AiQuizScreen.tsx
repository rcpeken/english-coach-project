import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView,
  ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SHADOWS, SIZES } from '../../theme';
import { aiApi } from '../../services/api';
import type { RootStackParamList } from '../../types';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Props = { navigation: NativeStackNavigationProp<RootStackParamList> };

export default function AiQuizScreen({ navigation }: Props) {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [quizText, setQuizText] = useState('');

  const generateQuiz = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    try {
      const response = await aiApi.generateQuiz({ topic: topic.trim(), count: 5 });
      setQuizText(response.reply);
    } catch (e: any) {
      setQuizText('❌ Quiz oluşturulamadı. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={s.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>AI Pratik Quiz</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        <View style={s.card}>
          <Text style={s.label}>Hangi konuda pratik yapmak istersin?</Text>
          <View style={s.inputRow}>
            <TextInput
              style={s.input}
              placeholder="Örn: animals, present perfect, food..."
              placeholderTextColor={COLORS.secondaryLight}
              value={topic}
              onChangeText={setTopic}
              editable={!loading}
            />
            <TouchableOpacity
              style={[s.generateBtn, (!topic.trim() || loading) && { opacity: 0.5 }]}
              onPress={generateQuiz}
              disabled={!topic.trim() || loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Ionicons name="flash" size={20} color="#FFF" />
              )}
            </TouchableOpacity>
          </View>
        </View>
        {quizText ? (
          <View style={s.resultCard}>
            <Text style={s.resultText}>{quizText}</Text>
          </View>
        ) : (
          !loading && (
            <View style={s.emptyState}>
              <View style={s.iconCircle}>
                <Ionicons name="school-outline" size={40} color="#8B5CF6" />
              </View>
              <Text style={s.emptyTitle}>Kendi Quizini Yarat</Text>
              <Text style={s.emptyText}>
                İstediğin herhangi bir kelime veya gramer konusunda sonsuz pratik testi oluşturabilirsin.
              </Text>
            </View>
          )
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { paddingBottom: 60 },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SIZES.padding, paddingTop: 56, paddingBottom: 16,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 14,
    backgroundColor: COLORS.surface, justifyContent: 'center', alignItems: 'center',
    ...SHADOWS.soft,
  },
  headerTitle: { ...FONTS.h2 },

  card: {
    marginHorizontal: SIZES.padding, backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius, padding: 20,
    ...SHADOWS.soft, borderWidth: 1, borderColor: COLORS.cardBorder,
  },
  label: { ...FONTS.label, marginBottom: 12 },
  inputRow: { flexDirection: 'row', gap: 10 },
  input: {
    flex: 1, backgroundColor: COLORS.background,
    borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12,
    fontSize: 15, color: COLORS.primary,
    borderWidth: 1, borderColor: COLORS.border,
  },
  generateBtn: {
    width: 48, height: 48, borderRadius: 14,
    backgroundColor: '#8B5CF6', justifyContent: 'center', alignItems: 'center',
    ...SHADOWS.soft,
  },

  resultCard: {
    marginHorizontal: SIZES.padding, marginTop: 24,
    backgroundColor: COLORS.surface, borderRadius: SIZES.radius, padding: 24,
    ...SHADOWS.soft, borderWidth: 1, borderColor: COLORS.cardBorder,
  },
  resultText: { fontSize: 16, lineHeight: 26, color: COLORS.primary },

  emptyState: { alignItems: 'center', marginTop: 60, paddingHorizontal: 40 },
  iconCircle: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: '#EDE9FE',
    justifyContent: 'center', alignItems: 'center', marginBottom: 20,
  },
  emptyTitle: { ...FONTS.h3, marginBottom: 8, textAlign: 'center' },
  emptyText: { ...FONTS.bodySmall, textAlign: 'center', lineHeight: 22 },
});
