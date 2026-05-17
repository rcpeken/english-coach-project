import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SHADOWS, SIZES } from '../../theme';
import { useAlert } from '../../components/CustomAlert';
import { passageApi } from '../../services/api';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types';

type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'CreatePassage'> };

export default function CreatePassageScreen({ navigation }: Props) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const { showAlert } = useAlert();

  const handleCreate = async () => {
    if (!title.trim() || !content.trim()) {
      showAlert('Hata', 'Başlık ve içerik gerekli.');
      return;
    }
    setLoading(true);
    try {
      await passageApi.create({ title: title.trim(), content: content.trim() });
      showAlert('Başarılı', 'Okuma metni oluşturuldu!', [{ text: 'Tamam', onPress: () => navigation.goBack() }]);
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
          <Text style={styles.headerTitle}>Yeni Metin</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Başlık</Text>
          <TextInput style={styles.input} placeholder="Ör: The Lost City" placeholderTextColor={COLORS.secondaryLight} value={title} onChangeText={setTitle} />

          <Text style={[styles.label, { marginTop: 20 }]}>İçerik</Text>
          <TextInput
            style={[styles.input, styles.contentInput]}
            placeholder="İngilizce metni buraya yazın..."
            placeholderTextColor={COLORS.secondaryLight}
            multiline
            textAlignVertical="top"
            value={content}
            onChangeText={setContent}
          />
        </View>

        <TouchableOpacity
          style={[styles.submitBtn, loading && { opacity: 0.7 }]}
          onPress={handleCreate}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.submitText}>Metni Oluştur</Text>}
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
  contentInput: { height: 240, textAlignVertical: 'top', paddingTop: 14 },

  submitBtn: {
    marginHorizontal: SIZES.padding, marginTop: 24, backgroundColor: COLORS.primary,
    borderRadius: SIZES.radiusFull, paddingVertical: 16, alignItems: 'center', ...SHADOWS.medium,
  },
  submitText: { ...FONTS.button },
});
