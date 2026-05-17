import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, FONTS, SHADOWS, SIZES } from '../../theme';
import { useAlert } from '../../components/CustomAlert';
import { testApi } from '../../services/api';
import type { TestResultResponse, RootStackParamList } from '../../types';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'TestResults'> };

export default function TestResultsScreen({ navigation }: Props) {
  const [results, setResults] = useState<TestResultResponse[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const { showAlert } = useAlert();

  const load = async () => { try { setResults(await testApi.getResults()); } catch {} };
  useFocusEffect(useCallback(() => { load(); }, []));
  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const handleDelete = (id: number, title: string) => {
    showAlert('Sonuç Sil', `"${title}" sonucu silinsin mi?`, [
      { text: 'İptal', style: 'cancel' },
      { text: 'Sil', style: 'destructive', onPress: async () => {
        try { await testApi.deleteResult(id); setResults(results.filter(r => r.id !== id)); } catch (e: any) {
          showAlert('Hata', e?.response?.data?.message || 'Silme başarısız.');
        }
      }},
    ]);
  };

  const getScoreColor = (pct: number) => pct >= 80 ? COLORS.successText : pct >= 60 ? COLORS.warningText : COLORS.errorText;

  const renderItem = ({ item }: { item: TestResultResponse }) => (
    <View style={s.card}>
      <View style={s.cardLeft}>
        <View style={[s.iconCircle, { backgroundColor: item.percentage >= 80 ? COLORS.successBg : item.percentage >= 60 ? COLORS.warningBg : COLORS.errorBg }]}>
          <Ionicons name={item.percentage >= 80 ? 'checkmark-circle' : item.percentage >= 60 ? 'time' : 'close-circle'} size={20} color={getScoreColor(item.percentage)} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.cardTitle}>{item.testTitle}</Text>
          <Text style={s.cardSub}>{item.studentName} • {item.score}/{item.totalQuestions} doğru</Text>
        </View>
      </View>
      <View style={s.cardRight}>
        <Text style={[s.score, { color: getScoreColor(item.percentage) }]}>{Math.round(item.percentage)}%</Text>
        <TouchableOpacity onPress={() => handleDelete(item.id, item.testTitle)} style={s.deleteBtn}>
          <Ionicons name="trash-outline" size={16} color={COLORS.error} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.headerTitle}>Test Sonuçları</Text>
          <Text style={s.headerSub}>Öğrencilerin performansını takip et</Text>
        </View>
      </View>

      <FlatList data={results} keyExtractor={i => i.id.toString()} renderItem={renderItem} contentContainerStyle={s.list} showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={<View style={s.empty}><Ionicons name="analytics-outline" size={48} color={COLORS.secondaryLight} /><Text style={s.emptyText}>Henüz test sonucu yok</Text></View>}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: SIZES.padding, paddingTop: 56, paddingBottom: 8 },
  backBtn: { width: 40, height: 40, borderRadius: 14, backgroundColor: COLORS.surface, justifyContent: 'center', alignItems: 'center', ...SHADOWS.soft },
  headerTitle: { ...FONTS.h2 },
  headerSub: { ...FONTS.bodySmall, marginTop: 2 },

  list: { paddingHorizontal: SIZES.padding, paddingTop: 16, paddingBottom: 120 },

  card: { backgroundColor: COLORS.surface, borderRadius: SIZES.radius, padding: 16, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', ...SHADOWS.soft, borderWidth: 1, borderColor: COLORS.cardBorder },
  cardLeft: { flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1 },
  iconCircle: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  cardTitle: { fontWeight: '700', fontSize: 14, color: COLORS.primary },
  cardSub: { ...FONTS.bodySmall, fontSize: 12, marginTop: 2 },

  cardRight: { alignItems: 'flex-end', gap: 8 },
  score: { fontSize: 18, fontWeight: '800' },
  deleteBtn: { padding: 4 },

  empty: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { ...FONTS.bodySmall, marginTop: 12 },
});
