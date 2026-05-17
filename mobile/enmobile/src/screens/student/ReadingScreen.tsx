import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Modal, TextInput, KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SHADOWS, SIZES } from '../../theme';
import { useAlert } from '../../components/CustomAlert';
import { passageApi, vocabApi, aiApi } from '../../services/api';
import { lookupWord } from '../../services/dictionaryApi';
import type { ReadingPassageResponse, RootStackParamList } from '../../types';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Reading'>;
  route: RouteProp<RootStackParamList, 'Reading'>;
};

export default function ReadingScreen({ navigation, route }: Props) {
  const { passageId, passageTitle } = route.params;
  const [passage, setPassage] = useState<ReadingPassageResponse | null>(null);
  const { showAlert } = useAlert();

  const [selectedWord, setSelectedWord] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [meaning, setMeaning] = useState('');
  const [example, setExample] = useState('');
  const [saving, setSaving] = useState(false);
  const [fetching, setFetching] = useState(false);

  const [aiModalVisible, setAiModalVisible] = useState(false);
  const [aiText, setAiText] = useState('');
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState('');

  useEffect(() => {
    passageApi.getById(passageId).then(setPassage).catch(() => {});
  }, [passageId]);

  const handleWordTap = async (word: string) => {
    const clean = word.replace(/[^a-zA-ZğüşöçıİĞÜŞÖÇ'-]/g, '');
    if (clean.length < 2) return;

    setSelectedWord(clean);
    setMeaning('');
    setExample('');
    setFetching(true);
    setModalVisible(true);

    try {
      const result = await lookupWord(clean);
      if (result.meaning) setMeaning(result.meaning);
      if (result.example) setExample(result.example);
    } catch {
    } finally {
      setFetching(false);
    }
  };

  const handleSaveWord = async () => {
    if (!meaning.trim()) {
      showAlert('Hata', 'Anlam gerekli.');
      return;
    }
    setSaving(true);
    try {
      await vocabApi.add({
        word: selectedWord,
        meaning: meaning.trim(),
        exampleSentence: example.trim() || undefined,
        passageId: passageId,
      });
      showAlert('Başarılı', `"${selectedWord}" kütüphanenize eklendi!`);
      setModalVisible(false);
    } catch (e: any) {
      showAlert('Hata', e?.response?.data?.message || 'Kelime eklenemedi.');
    } finally {
      setSaving(false);
    }
  };

  const explainWithAi = async () => {
    if (!aiText.trim()) {
      showAlert('Hata', 'Lütfen metinden bir bölüm yazın veya kopyalayın.');
      return;
    }
    setAiLoading(true);
    setAiResponse('');
    try {
      const res = await aiApi.analyzeText({ text: aiText, question: aiQuestion || 'Bu kısmı detaylı açıklar mısın?' });
      setAiResponse(res.reply);
    } catch (e) {
      setAiResponse('❌ Hata oluştu. Öğretmen şu an meşgul.');
    } finally {
      setAiLoading(false);
    }
  };

  if (!passage) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const words = passage.content.split(/(\s+)/);

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>{passageTitle}</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.infoBar}>
          <Ionicons name="information-circle-outline" size={18} color={COLORS.infoText} />
          <Text style={styles.infoText}>Bilmediğiniz kelimelere dokunarak kütüphanenize ekleyin</Text>
        </View>

        <View style={styles.contentCard}>
          <Text style={styles.contentText}>
            {words.map((word, idx) => {
              if (word.trim() === '') return <Text key={idx}>{word}</Text>;
              return (
                <Text
                  key={idx}
                  style={styles.tappableWord}
                  onPress={() => handleWordTap(word)}
                >
                  {word}
                </Text>
              );
            })}
          </Text>
        </View>
      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.85}
        onPress={() => {
          setAiText('');
          setAiQuestion('');
          setAiResponse('');
          setAiModalVisible(true);
        }}
      >
        <Ionicons name="sparkles" size={26} color={COLORS.white} />
        <View style={styles.fabBadge}>
          <Text style={styles.fabBadgeText}>AI Analiz</Text>
        </View>
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Kelime Ekle</Text>
            <View style={styles.wordBadge}><Text style={styles.wordBadgeText}>{selectedWord}</Text></View>

            {fetching ? (
              <View style={{ alignItems: 'center', paddingVertical: 32 }}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={{ marginTop: 12, color: COLORS.secondary, fontSize: 14 }}>Anlam ve örnek cümle getiriliyor...</Text>
              </View>
            ) : (
              <>
                <Text style={styles.label}>Anlam (Türkçe)</Text>
                <TextInput style={styles.input} placeholder="Kelimenin anlamını yazın" placeholderTextColor={COLORS.secondaryLight} value={meaning} onChangeText={setMeaning} />
                <Text style={[styles.label, { marginTop: 14 }]}>Örnek Cümle (opsiyonel)</Text>
                <TextInput style={[styles.input, { height: 70, textAlignVertical: 'top' }]} placeholder="Örnek bir cümle (opsiyonel)..." placeholderTextColor={COLORS.secondaryLight} multiline value={example} onChangeText={setExample} />
                <View style={styles.modalButtons}>
                  <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}><Text style={styles.cancelBtnText}>İptal</Text></TouchableOpacity>
                  <TouchableOpacity style={[styles.saveBtn, saving && { opacity: 0.7 }]} onPress={handleSaveWord} disabled={saving}>
                    {saving ? <ActivityIndicator color={COLORS.white} size="small" /> : <Text style={styles.saveBtnText}>Kaydet</Text>}
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      <Modal visible={aiModalVisible} transparent animationType="slide">
        <KeyboardAvoidingView behavior="padding" style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: '90%' }]}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="sparkles" size={20} color="#8B5CF6" />
                <Text style={[styles.modalTitle, { color: '#8B5CF6', marginBottom: 0 }]}>Metin Analizi</Text>
              </View>
              <TouchableOpacity onPress={() => setAiModalVisible(false)}>
                <Ionicons name="close" size={24} color={COLORS.secondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.label}>Anlamadığınız Kısım:</Text>
              <TextInput
                style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                placeholder="Metinden bir cümle veya paragraf yazın/yapıştırın..."
                placeholderTextColor={COLORS.secondaryLight}
                multiline value={aiText} onChangeText={setAiText} editable={!aiLoading}
              />

              <Text style={[styles.label, { marginTop: 12 }]}>Sorunuz (Opsiyonel):</Text>
              <TextInput
                style={styles.input}
                placeholder="Örn: Buradaki 'have been' yapısı nedir?"
                placeholderTextColor={COLORS.secondaryLight}
                value={aiQuestion} onChangeText={setAiQuestion} editable={!aiLoading}
              />

              <TouchableOpacity
                style={[styles.saveBtn, { backgroundColor: '#8B5CF6', marginTop: 16 }]}
                onPress={explainWithAi} disabled={aiLoading || !aiText.trim()}
              >
                {aiLoading ? <ActivityIndicator color="#FFF" size="small" /> : <Text style={styles.saveBtnText}>AI'a Sor</Text>}
              </TouchableOpacity>

              {aiResponse ? (
                <View style={styles.aiResponseBox}>
                  <Text style={styles.aiResponseText}>{aiResponse}</Text>
                </View>
              ) : null}
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
  scroll: { paddingBottom: 120 },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SIZES.padding, paddingTop: 56, paddingBottom: 12,
  },
  backBtn: { width: 40, height: 40, borderRadius: 14, backgroundColor: COLORS.surface, justifyContent: 'center', alignItems: 'center', ...SHADOWS.soft },
  headerTitle: { ...FONTS.h3, flex: 1, textAlign: 'center' },

  infoBar: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginHorizontal: SIZES.padding, marginBottom: 16, backgroundColor: COLORS.infoBg,
    borderRadius: 14, padding: 12,
  },
  infoText: { ...FONTS.bodySmall, fontSize: 12, color: COLORS.infoText, flex: 1 },

  contentCard: {
    marginHorizontal: SIZES.padding, backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius, padding: 24, ...SHADOWS.soft, borderWidth: 1, borderColor: COLORS.border,
  },
  contentText: { fontSize: 17, lineHeight: 30, color: COLORS.primary },
  tappableWord: { color: COLORS.primary },

  fab: {
    position: 'absolute', bottom: 32, right: SIZES.padding,
    width: 60, height: 60, borderRadius: 30, backgroundColor: '#8B5CF6',
    justifyContent: 'center', alignItems: 'center', ...SHADOWS.strong,
  },
  fabBadge: {
    position: 'absolute', top: -10, left: -20, backgroundColor: COLORS.white,
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, ...SHADOWS.soft,
  },
  fabBadgeText: { fontSize: 10, fontWeight: '700', color: '#8B5CF6' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: COLORS.white, borderTopLeftRadius: SIZES.radius, borderTopRightRadius: SIZES.radius,
    padding: SIZES.padding, paddingBottom: 40,
    ...SHADOWS.strong,
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalHandle: { width: 40, height: 4, backgroundColor: '#E2E8F0', borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  modalTitle: { ...FONTS.h2, marginBottom: 16 },

  wordBadge: { backgroundColor: COLORS.avatarPurple, alignSelf: 'flex-start', paddingHorizontal: 20, paddingVertical: 10, borderRadius: SIZES.radiusFull, marginBottom: 20 },
  wordBadgeText: { fontWeight: '700', fontSize: 18, color: '#6D28D9' },

  label: { ...FONTS.label, marginBottom: 8 },
  input: {
    backgroundColor: '#F8FAFC', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12,
    fontSize: 14, color: COLORS.primary, borderWidth: 1, borderColor: '#E2E8F0',
  },

  modalButtons: { flexDirection: 'row', gap: 12, marginTop: 24 },
  cancelBtn: { flex: 1, paddingVertical: 14, borderRadius: SIZES.radiusFull, backgroundColor: '#F1F5F9', alignItems: 'center' },
  cancelBtnText: { ...FONTS.label, color: COLORS.secondary },
  saveBtn: { flex: 1, paddingVertical: 14, borderRadius: SIZES.radiusFull, backgroundColor: COLORS.primary, alignItems: 'center', ...SHADOWS.medium },
  saveBtnText: { ...FONTS.button },

  aiResponseBox: {
    marginTop: 20, padding: 16, backgroundColor: '#F3E8FF', borderRadius: 16,
    borderWidth: 1, borderColor: '#D8B4FE',
  },
  aiResponseText: { fontSize: 15, lineHeight: 24, color: '#4C1D95' },
});
