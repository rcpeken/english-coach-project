import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Modal, ActivityIndicator, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, FONTS, SHADOWS, SIZES } from '../../theme';
import { useAlert } from '../../components/CustomAlert';
import { vocabApi, aiApi } from '../../services/api';
import type { VocabularyWordResponse, RootStackParamList } from '../../types';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Props = { navigation: NativeStackNavigationProp<RootStackParamList> };

export default function VocabularyScreen({ navigation }: Props) {
  const [words, setWords] = useState<VocabularyWordResponse[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [aiModalVisible, setAiModalVisible] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiText, setAiText] = useState('');
  const [currentWord, setCurrentWord] = useState('');
  const { showAlert } = useAlert();

  const load = async () => { try { setWords(await vocabApi.getMyWords()); } catch {} };
  useFocusEffect(useCallback(() => { load(); }, []));
  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const handleDelete = (id: number, w: string) => {
    showAlert('Sil', `"${w}" silinsin mi?`, [
      { text: 'İptal', style: 'cancel' },
      { text: 'Sil', style: 'destructive', onPress: async () => {
        try { await vocabApi.delete(id); setWords(words.filter(x => x.id !== id)); } catch {}
      }},
    ]);
  };

  const loadAiExplanation = async (word: string) => {
    setCurrentWord(word);
    setAiText('');
    setAiModalVisible(true);
    setAiLoading(true);
    try {
      const res = await aiApi.explainWord({ word });
      setAiText(res.reply);
    } catch (e) {
      setAiText('❌ Öğretmen şu an meşgul, daha sonra tekrar deneyin.');
    } finally {
      setAiLoading(false);
    }
  };

  const lvlColor = (l: number) => l >= 4 ? COLORS.successText : l >= 2 ? COLORS.warningText : COLORS.errorText;
  const lvlBg = (l: number) => l >= 4 ? COLORS.successBg : l >= 2 ? COLORS.warningBg : COLORS.errorBg;

  const renderItem = ({ item }: { item: VocabularyWordResponse }) => (
    <View style={s.card}>
      <View style={s.row}>
        <View style={{ flex: 1 }}>
          <Text style={s.word}>{item.word}</Text>
          <Text style={s.meaning}>{item.meaning}</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <TouchableOpacity onPress={() => loadAiExplanation(item.word)}>
            <Ionicons name="sparkles" size={20} color="#8B5CF6" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDelete(item.id, item.word)}>
            <Ionicons name="trash-outline" size={20} color={COLORS.error} />
          </TouchableOpacity>
        </View>
      </View>
      {item.exampleSentence ? <Text style={s.example}>"{item.exampleSentence}"</Text> : null}
      <View style={s.bottom}>
        <View style={[s.badge, { backgroundColor: lvlBg(item.masteryLevel) }]}>
          <Text style={[s.badgeText, { color: lvlColor(item.masteryLevel) }]}>Seviye {item.masteryLevel}/5</Text>
        </View>
        <Text style={s.reviewCnt}>{item.reviewCount} tekrar</Text>
      </View>
    </View>
  );

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={FONTS.h1}>Kelime Kütüphanem</Text>
        <Text style={[FONTS.bodySmall, { marginTop: 4 }]}>{words.length} kelime</Text>
      </View>
      <FlatList
        data={words} keyExtractor={i => i.id.toString()} renderItem={renderItem}
        contentContainerStyle={[s.list, { flexGrow: 1 }]} showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListHeaderComponent={words.length > 0 ? (
          <TouchableOpacity style={s.reviewBtn} onPress={() => navigation.navigate('VocabularyReview')}>
            <Ionicons name="refresh-outline" size={22} color={COLORS.primary} />
            <Text style={FONTS.label}>Kelime Tekrarına Başla</Text>
          </TouchableOpacity>
        ) : null}
        ListEmptyComponent={<View style={s.empty}><Image source={require('../../../assets/images/17.png')} style={{ width: 320, height: 320, marginBottom: 39 }} resizeMode="contain" /><Text style={{ fontSize: 20, fontWeight: '600', color: COLORS.secondary, textAlign: 'center' }}>Henüz kelime eklemediniz</Text></View>}
      />
      <Modal visible={aiModalVisible} animationType="slide" transparent>
        <View style={s.modalOverlay}>
          <View style={s.modalContent}>
            <View style={s.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="sparkles" size={20} color="#8B5CF6" />
                <Text style={s.modalTitle}>{currentWord}</Text>
              </View>
              <TouchableOpacity onPress={() => setAiModalVisible(false)}>
                <Ionicons name="close" size={24} color={COLORS.secondary} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 400 }}>
              {aiLoading ? (
                <View style={{ paddingVertical: 40, alignItems: 'center' }}>
                  <ActivityIndicator size="large" color="#8B5CF6" />
                  <Text style={{ marginTop: 12, color: COLORS.secondary }}>AI inceliyor...</Text>
                </View>
              ) : (
                <Text style={s.aiText}>{aiText}</Text>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingHorizontal: SIZES.padding, paddingTop: 56, paddingBottom: 8 },
  list: { paddingHorizontal: SIZES.padding, paddingTop: 16, paddingBottom: 120 },
  reviewBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: '#D1FAE5', borderRadius: SIZES.radius, padding: 16, marginBottom: 16, ...SHADOWS.soft },
  card: { backgroundColor: COLORS.surface, borderRadius: SIZES.radius, padding: 18, marginBottom: 12, ...SHADOWS.soft, borderWidth: 1, borderColor: COLORS.cardBorder },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  word: { fontSize: 18, fontWeight: '700', color: COLORS.primary },
  meaning: { ...FONTS.bodySmall, marginTop: 4 },
  example: { ...FONTS.bodySmall, fontStyle: 'italic', marginTop: 10, lineHeight: 20 },
  bottom: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 14 },
  badge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: SIZES.radiusFull },
  badgeText: { fontSize: 11, fontWeight: '700' },
  reviewCnt: { ...FONTS.bodySmall, fontSize: 11 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 80 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: COLORS.white, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: SIZES.padding, paddingBottom: 40,
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { ...FONTS.h2, color: '#8B5CF6' },
  aiText: { fontSize: 15, lineHeight: 24, color: COLORS.primary },
});
