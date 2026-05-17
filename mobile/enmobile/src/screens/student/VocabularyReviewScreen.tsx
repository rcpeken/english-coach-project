import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, FONTS, SHADOWS, SIZES } from '../../theme';
import { vocabApi } from '../../services/api';
import type { VocabularyWordResponse, RootStackParamList } from '../../types';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'VocabularyReview'> };

export default function VocabularyReviewScreen({ navigation }: Props) {
  const [words, setWords] = useState<VocabularyWordResponse[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [showMeaning, setShowMeaning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState(false);

  useFocusEffect(useCallback(() => {
    setLoading(true);
    vocabApi.getForReview().then(w => { setWords(w); setCurrentIdx(0); setShowMeaning(false); }).catch(() => {}).finally(() => setLoading(false));
  }, []));

  if (loading) return <View style={s.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>;

  if (words.length === 0 || currentIdx >= words.length) {
    return (
      <View style={s.center}>
        <View style={s.doneCard}>
          <Image source={require('../../../assets/images/17.png')} style={{ width: 250, height: 250, marginBottom: 24 }} resizeMode="contain" />
          <Text style={s.doneTitle}>Tebrikler!</Text>
          <Text style={s.doneSub}>Tekrar edilecek kelime kalmadı</Text>
          <TouchableOpacity style={s.doneBtn} onPress={() => navigation.goBack()}>
            <Text style={FONTS.button}>Geri Dön</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const word = words[currentIdx];
  const remaining = words.length - currentIdx;

  const handleReview = async (knewIt: boolean) => {
    setReviewing(true);
    try {
      await vocabApi.markReviewed(word.id, knewIt);
    } catch {}
    setReviewing(false);
    setShowMeaning(false);
    setCurrentIdx(currentIdx + 1);
  };

  return (
    <View style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={FONTS.h3}>Kelime Tekrarı</Text>
        <View style={s.countBadge}><Text style={s.countText}>{remaining}</Text></View>
      </View>
      <View style={s.progressBar}>
        <View style={[s.progressFill, { width: `${((currentIdx) / words.length) * 100}%` }]} />
      </View>
      <View style={s.cardContainer}>
        <TouchableOpacity style={s.card} activeOpacity={0.9} onPress={() => setShowMeaning(!showMeaning)}>
          <Text style={s.cardWord}>{word.word}</Text>
          {showMeaning ? (
            <View style={s.meaningBox}>
              <Text style={s.cardMeaning}>{word.meaning}</Text>
              {word.exampleSentence ? <Text style={s.cardExample}>"{word.exampleSentence}"</Text> : null}
            </View>
          ) : (
            <Text style={s.tapHint}>Anlamı görmek için dokun</Text>
          )}
        </TouchableOpacity>
      </View>
      <View style={s.actions}>
        <TouchableOpacity
          style={[s.actionBtn, { backgroundColor: COLORS.errorBg }]}
          onPress={() => handleReview(false)}
          disabled={reviewing}
        >
          <Ionicons name="close-circle" size={28} color={COLORS.errorText} />
          <Text style={[s.actionText, { color: COLORS.errorText }]}>Bilmiyorum</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.actionBtn, { backgroundColor: COLORS.successBg }]}
          onPress={() => handleReview(true)}
          disabled={reviewing}
        >
          <Ionicons name="checkmark-circle" size={28} color={COLORS.successText} />
          <Text style={[s.actionText, { color: COLORS.successText }]}>Biliyorum</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background, padding: SIZES.padding },

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SIZES.padding, paddingTop: 56, paddingBottom: 12 },
  backBtn: { width: 40, height: 40, borderRadius: 14, backgroundColor: COLORS.surface, justifyContent: 'center', alignItems: 'center', ...SHADOWS.soft },
  countBadge: { backgroundColor: COLORS.avatarAmber, paddingHorizontal: 14, paddingVertical: 6, borderRadius: SIZES.radiusFull },
  countText: { fontWeight: '700', fontSize: 14, color: COLORS.primary },

  progressBar: { height: 4, backgroundColor: COLORS.accent, marginHorizontal: SIZES.padding, borderRadius: 2 },
  progressFill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: 2 },

  cardContainer: { flex: 1, justifyContent: 'center', paddingHorizontal: SIZES.padding },
  card: { backgroundColor: COLORS.surface, borderRadius: SIZES.radius, padding: 40, alignItems: 'center', ...SHADOWS.medium, borderWidth: 1, borderColor: COLORS.border },
  cardWord: { fontSize: 32, fontWeight: '800', color: COLORS.primary, marginBottom: 20 },
  tapHint: { ...FONTS.bodySmall, fontSize: 13 },
  meaningBox: { alignItems: 'center' },
  cardMeaning: { fontSize: 20, fontWeight: '600', color: COLORS.secondary, textAlign: 'center' },
  cardExample: { ...FONTS.bodySmall, fontStyle: 'italic', marginTop: 12, textAlign: 'center', lineHeight: 20 },

  actions: { flexDirection: 'row', gap: 16, paddingHorizontal: SIZES.padding, paddingBottom: 50, paddingTop: 20 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 18, borderRadius: SIZES.radius },
  actionText: { fontWeight: '700', fontSize: 15 },

  doneCard: { backgroundColor: COLORS.surface, borderRadius: SIZES.radius, padding: 40, alignItems: 'center', ...SHADOWS.medium },
  doneTitle: { ...FONTS.h1, marginTop: 16 },
  doneSub: { ...FONTS.bodySmall, marginTop: 4 },
  doneBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 32, paddingVertical: 14, borderRadius: SIZES.radiusFull, marginTop: 24 },
});
