import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SHADOWS, SIZES } from '../../theme';
import { useAlert } from '../../components/CustomAlert';
import { testApi } from '../../services/api';
import type { TestResponse, RootStackParamList } from '../../types';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'TestDetail'>;
  route: RouteProp<RootStackParamList, 'TestDetail'>;
};

export default function TestDetailScreen({ navigation, route }: Props) {
  const { testId } = route.params;
  const [test, setTest] = useState<TestResponse | null>(null);
  const [studentId, setStudentId] = useState('');
  const [assigning, setAssigning] = useState(false);
  const { showAlert } = useAlert();

  useEffect(() => {
    testApi.getById(testId).then(setTest).catch(() => showAlert('Hata', 'Test yüklenemedi.'));
  }, [testId]);

  const handleAssign = async () => {
    if (!studentId.trim()) {
      showAlert('Hata', 'Öğrenci ID gerekli.');
      return;
    }
    setAssigning(true);
    try {
      await testApi.assign(testId, parseInt(studentId));
      showAlert('Başarılı', 'Test öğrenciye atandı!');
      setStudentId('');
    } catch (e: any) {
      showAlert('Hata', e?.response?.data?.message || 'Atama başarısız.');
    } finally {
      setAssigning(false);
    }
  };

  if (!test) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Test Detayı</Text>
          <TouchableOpacity onPress={() => showAlert('Testi Sil', 'Bu test ve tüm verileri silinecek. Emin misiniz?', [
            { text: 'İptal', style: 'cancel' },
            { text: 'Sil', style: 'destructive', onPress: async () => {
              try { await testApi.deleteTest(testId); navigation.goBack(); } catch (e: any) {
                showAlert('Hata', e?.response?.data?.message || 'Silme başarısız.');
              }
            }},
          ])} style={styles.backBtn}>
            <Ionicons name="trash-outline" size={22} color={COLORS.error} />
          </TouchableOpacity>
        </View>
        <View style={styles.titleCard}>
          <Text style={styles.testTitle}>{test.title}</Text>
          {test.description ? <Text style={styles.testDesc}>{test.description}</Text> : null}
          <View style={styles.metaRow}>
            <View style={styles.metaBadge}>
              <Ionicons name="help-circle-outline" size={14} color={COLORS.secondary} />
              <Text style={styles.metaText}>{test.questions?.length || 0} Soru</Text>
            </View>
          </View>
        </View>
        <View style={styles.assignCard}>
          <Text style={styles.sectionTitle}>Öğrenciye Ata</Text>
          <View style={styles.assignRow}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Öğrenci ID"
              placeholderTextColor={COLORS.secondaryLight}
              keyboardType="numeric"
              value={studentId}
              onChangeText={setStudentId}
            />
            <TouchableOpacity
              style={[styles.assignBtn, assigning && { opacity: 0.7 }]}
              onPress={handleAssign}
              disabled={assigning}
            >
              {assigning ? <ActivityIndicator color={COLORS.white} size="small" /> : <Text style={styles.assignBtnText}>Ata</Text>}
            </TouchableOpacity>
          </View>
        </View>
        <Text style={[styles.sectionTitle, { paddingHorizontal: SIZES.padding, marginTop: 24 }]}>Sorular</Text>
        {test.questions?.map((q, idx) => (
          <View key={q.id} style={styles.questionCard}>
            <Text style={styles.questionNum}>Soru {idx + 1}</Text>
            <Text style={styles.questionText}>{q.questionText}</Text>
            <View style={styles.optionsGrid}>
              {(['A', 'B', 'C', 'D'] as const).map((opt) => (
                <View key={opt} style={styles.optionItem}>
                  <View style={styles.optionCircle}>
                    <Text style={styles.optionLetter}>{opt}</Text>
                  </View>
                  <Text style={styles.optionText}>{q[`option${opt}` as keyof typeof q]}</Text>
                </View>
              ))}
            </View>
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

  titleCard: {
    marginHorizontal: SIZES.padding, backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius, padding: 24, ...SHADOWS.soft, borderWidth: 1, borderColor: COLORS.border,
  },
  testTitle: { ...FONTS.h2, fontSize: 24 },
  testDesc: { ...FONTS.bodySmall, fontStyle: 'italic', marginTop: 4 },
  metaRow: { flexDirection: 'row', marginTop: 16, gap: 12 },
  metaBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: COLORS.background, paddingHorizontal: 12, paddingVertical: 6, borderRadius: SIZES.radiusFull,
  },
  metaText: { ...FONTS.bodySmall, fontSize: 12 },

  assignCard: {
    marginHorizontal: SIZES.padding, marginTop: 16, backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius, padding: 20, ...SHADOWS.soft, borderWidth: 1, borderColor: COLORS.border,
  },
  sectionTitle: { ...FONTS.h3, marginBottom: 12 },
  assignRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  input: {
    backgroundColor: '#F8FAFC', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12,
    fontSize: 14, color: COLORS.primary, borderWidth: 1, borderColor: '#E2E8F0',
  },
  assignBtn: {
    backgroundColor: COLORS.primary, paddingHorizontal: 24, paddingVertical: 12,
    borderRadius: SIZES.radiusFull,
  },
  assignBtnText: { ...FONTS.button, fontSize: 13 },

  questionCard: {
    marginHorizontal: SIZES.padding, marginTop: 12, backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius, padding: 20, ...SHADOWS.soft, borderWidth: 1, borderColor: COLORS.border,
  },
  questionNum: { ...FONTS.caption, marginBottom: 8 },
  questionText: { ...FONTS.body, fontWeight: '600', marginBottom: 16 },

  optionsGrid: { gap: 8 },
  optionItem: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  optionCircle: {
    width: 32, height: 32, borderRadius: 10, backgroundColor: COLORS.background,
    justifyContent: 'center', alignItems: 'center',
  },
  optionLetter: { fontWeight: '700', fontSize: 13, color: COLORS.secondary },
  optionText: { ...FONTS.body, fontSize: 14, flex: 1 },
});
