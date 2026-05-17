import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, TextInput, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, FONTS, SHADOWS, SIZES } from '../../theme';
import { useAlert } from '../../components/CustomAlert';
import { passageApi } from '../../services/api';
import type { ReadingPassageResponse, RootStackParamList } from '../../types';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Props = { navigation: NativeStackNavigationProp<RootStackParamList> };

export default function MyPassagesScreen({ navigation }: Props) {
  const [passages, setPassages] = useState<ReadingPassageResponse[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [assigningId, setAssigningId] = useState<number | null>(null);
  const [studentId, setStudentId] = useState('');
  const { showAlert } = useAlert();

  const load = async () => {
    try { setPassages(await passageApi.getMyPassages()); } catch {}
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const handleAssign = async (passageId: number) => {
    if (!studentId.trim()) { showAlert('Hata', 'Öğrenci ID gerekli.'); return; }
    try {
      await passageApi.assign(passageId, parseInt(studentId));
      showAlert('Başarılı', 'Metin atandı!');
      setAssigningId(null);
      setStudentId('');
    } catch (e: any) {
      showAlert('Hata', e?.response?.data?.message || 'Atama başarısız.');
    }
  };

  const renderItem = ({ item }: { item: ReadingPassageResponse }) => (
    <View style={styles.card}>
      <Text style={styles.cardCaption}>OKUMA METNİ</Text>
      <Text style={styles.cardTitle}>{item.title}</Text>
      <Text style={styles.cardContent} numberOfLines={3}>{item.content}</Text>

      {assigningId === item.id ? (
        <View style={styles.assignRow}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="Öğrenci ID"
            placeholderTextColor={COLORS.secondaryLight}
            keyboardType="numeric"
            value={studentId}
            onChangeText={setStudentId}
          />
          <TouchableOpacity style={styles.assignBtn} onPress={() => handleAssign(item.id)}>
            <Text style={styles.assignBtnText}>Ata</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setAssigningId(null)}>
            <Ionicons name="close" size={22} color={COLORS.secondary} />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={styles.manageBtn} onPress={() => setAssigningId(item.id)}>
          <Text style={styles.manageBtnText}>Öğrenciye Ata</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Metinlerim</Text>
        <Text style={styles.headerSub}>Oluşturduğun okuma metinleri</Text>
      </View>

      <FlatList
        data={passages}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="book-outline" size={48} color={COLORS.secondaryLight} />
            <Text style={styles.emptyText}>Henüz metin oluşturmadınız</Text>
          </View>
        }
        ListFooterComponent={
          <TouchableOpacity style={styles.createBtn} onPress={() => navigation.navigate('CreatePassage')} activeOpacity={0.85}>
            <Ionicons name="add-circle-outline" size={22} color={COLORS.primary} />
            <Text style={styles.createText}>Yeni Metin Oluştur</Text>
          </TouchableOpacity>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingHorizontal: SIZES.padding, paddingTop: 56, paddingBottom: 8 },
  headerTitle: { ...FONTS.h1 },
  headerSub: { ...FONTS.bodySmall, marginTop: 4 },

  list: { paddingHorizontal: SIZES.padding, paddingTop: 16, paddingBottom: 120 },

  card: {
    backgroundColor: COLORS.surface, borderRadius: SIZES.radius, padding: 20, marginBottom: 16,
    ...SHADOWS.soft, borderWidth: 1, borderColor: COLORS.cardBorder,
  },
  cardCaption: { ...FONTS.caption, marginBottom: 4 },
  cardTitle: { ...FONTS.h3, marginBottom: 8 },
  cardContent: { ...FONTS.bodySmall, lineHeight: 20, marginBottom: 16 },

  assignRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  input: {
    backgroundColor: COLORS.background, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 10,
    fontSize: 14, color: COLORS.primary, borderWidth: 1, borderColor: COLORS.border,
  },
  assignBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: SIZES.radiusFull },
  assignBtnText: { ...FONTS.button, fontSize: 12 },

  manageBtn: {
    backgroundColor: COLORS.primary, alignSelf: 'flex-start',
    paddingHorizontal: 20, paddingVertical: 10, borderRadius: SIZES.radiusFull,
  },
  manageBtnText: { ...FONTS.button, fontSize: 12 },

  empty: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { ...FONTS.bodySmall, marginTop: 12 },

  createBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 14, borderRadius: SIZES.radiusFull, borderWidth: 2, borderColor: COLORS.border,
    borderStyle: 'dashed', marginTop: 8,
  },
  createText: { ...FONTS.label },
});
