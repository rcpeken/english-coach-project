import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, FONTS, SHADOWS, SIZES } from '../../theme';
import { useAlert } from '../../components/CustomAlert';
import { passageApi, getApiErrorMessage } from '../../services/api';
import type { ReadingPassageResponse, RootStackParamList } from '../../types';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Props = { navigation: NativeStackNavigationProp<RootStackParamList> };

export default function MyReadingsScreen({ navigation }: Props) {
  const [passages, setPassages] = useState<ReadingPassageResponse[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const { showAlert } = useAlert();

  const load = async () => { try { setPassages(await passageApi.getMyAssigned()); } catch {} };
  useFocusEffect(useCallback(() => { load(); }, []));
  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const handleDelete = (id: number) => {
    showAlert('Emin misin?', 'Atanmış bu metni silmek istediğine emin misin?', [
      { text: 'İptal', style: 'cancel' },
      { text: 'Sil', style: 'destructive', onPress: async () => {
        try {
          await passageApi.deleteAssignment(id);
          setPassages(prev => prev.filter(p => p.id !== id));
        } catch (e: any) {
          showAlert('Hata', getApiErrorMessage(e, 'Metin silinirken hata oluştu'));
        }
      }}
    ]);
  };

  return (
    <View style={s.container}>
      <View style={s.header}><Text style={FONTS.h1}>Okuma Metinleri</Text><Text style={[FONTS.bodySmall, { marginTop: 4 }]}>Hocandan gelen metinler</Text></View>
      <FlatList data={passages} keyExtractor={i => i.id.toString()} contentContainerStyle={[s.list, { flexGrow: 1 }]} showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => (
          <TouchableOpacity style={s.card} activeOpacity={0.85} onPress={() => navigation.navigate('Reading', { passageId: item.id, passageTitle: item.title })}>
            <View style={s.iconBox}><Ionicons name="book-outline" size={22} color={COLORS.secondary} /></View>
            <View style={{ flex: 1 }}>
              <Text style={s.title}>{item.title}</Text>
              <Text style={s.sub} numberOfLines={2}>{item.content}</Text>
            </View>
            <TouchableOpacity onPress={() => handleDelete(item.id)} style={{ padding: 8, marginRight: -8 }}>
              <Ionicons name="trash-outline" size={20} color={COLORS.error} />
            </TouchableOpacity>
            <Ionicons name="chevron-forward" size={18} color={COLORS.secondaryLight} />
          </TouchableOpacity>
        )}
        ListEmptyComponent={<View style={s.empty}><Image source={require('../../../assets/images/21.png')} style={{ width: 320, height: 320, marginBottom: 24 }} resizeMode="contain" /><Text style={{ fontSize: 20, fontWeight: '600', color: COLORS.secondary, textAlign: 'center' }}>Henüz atanmış metin yok</Text></View>}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingHorizontal: SIZES.padding, paddingTop: 56, paddingBottom: 8 },
  list: { paddingHorizontal: SIZES.padding, paddingTop: 16, paddingBottom: 120 },
  card: { backgroundColor: COLORS.surface, borderRadius: SIZES.radius, padding: 16, marginBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 14, ...SHADOWS.soft, borderWidth: 1, borderColor: COLORS.cardBorder },
  iconBox: { width: 48, height: 48, borderRadius: 16, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' },
  title: { fontWeight: '700', fontSize: 14, color: COLORS.primary },
  sub: { ...FONTS.bodySmall, fontSize: 12, marginTop: 2 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 80 },
});
