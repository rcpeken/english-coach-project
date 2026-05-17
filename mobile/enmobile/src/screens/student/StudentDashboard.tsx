import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, FONTS, SHADOWS, SIZES } from '../../theme';
import { useAlert } from '../../components/CustomAlert';
import { useAuth } from '../../context/AuthContext';
import { testApi, passageApi, vocabApi } from '../../services/api';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList, TestAssignment, VocabularyWordResponse } from '../../types';

type Props = { navigation: NativeStackNavigationProp<RootStackParamList> };

export default function StudentDashboard({ navigation }: Props) {
  const { user, logout } = useAuth();
  const { showAlert } = useAlert();
  const [pending, setPending] = useState<TestAssignment[]>([]);
  const [vocabCount, setVocabCount] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const [p, v, r] = await Promise.all([
        testApi.getPending(),
        vocabApi.getMyWords(),
        vocabApi.getForReview(),
      ]);
      setPending(p);
      setVocabCount(v.length);
      setReviewCount(r.length);
    } catch {}
  };

  useFocusEffect(useCallback(() => { loadData(); }, []));

  const onRefresh = async () => { setRefreshing(true); await loadData(); setRefreshing(false); };

  const firstName = user?.fullName?.split(' ')[0] || 'Öğrenci';
  const initials = user?.fullName?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'OG';

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Merhaba, {firstName}</Text>
            <Text style={styles.subGreeting}>Bugün ne öğrenmek istersin?</Text>
          </View>
          <TouchableOpacity style={styles.avatar} onPress={() => showAlert(user?.fullName || '', `ID: ${user?.userId}\n${user?.email}`, [{ text: 'Kapat' }, { text: 'Çıkış Yap', style: 'destructive', onPress: logout }])}>
            <Text style={styles.avatarText}>{initials}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.idCard}>
          <View style={styles.idLeft}>
            <Ionicons name="id-card-outline" size={20} color={COLORS.infoText} />
            <Text style={styles.idLabel}>Öğrenci ID'n:</Text>
          </View>
          <View style={styles.idBadge}>
            <Text style={styles.idText}>{user?.userId}</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: 'rgba(254, 243, 199, 0.6)' }]}>
            <Image source={require('../../../assets/images/writing-with-notebook.png')} style={[styles.statIconImage, { transform: [{ scale: 2.3 }] }]} resizeMode="contain" />
            <Text style={styles.statNumber}>{pending.length}</Text>
            <Text style={styles.statLabel}>Bekleyen Test</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: 'rgba(204, 251, 241, 0.6)' }]}>
            <Image source={require('../../../assets/images/books-and-apple.png')} style={[styles.statIconImage, { transform: [{ scale: 1.25 }] }]} resizeMode="contain" />
            <Text style={styles.statNumber}>{vocabCount}</Text>
            <Text style={styles.statLabel}>Kelime</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: 'rgba(237, 233, 254, 0.6)' }]}>
            <Image source={require('../../../assets/images/researching.png')} style={[styles.statIconImage, { transform: [{ scale: 1.55 }] }]} resizeMode="contain" />
            <Text style={styles.statNumber}>{reviewCount}</Text>
            <Text style={styles.statLabel}>Tekrar</Text>
          </View>
        </View>

        {reviewCount > 0 && (
          <TouchableOpacity
            style={styles.reviewBanner}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('VocabularyReview')}
          >
            <View style={styles.bannerContent}>
              <Text style={styles.bannerTitle}>Kelime Tekrarı</Text>
              <Text style={styles.bannerSub}>{reviewCount} kelime tekrar zamanı geldi</Text>
              <View style={styles.bannerButton}>
                <Text style={styles.bannerButtonText}>Tekrar Başla</Text>
              </View>
            </View>
            <View style={styles.bannerCircle} />
          </TouchableOpacity>
        )}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Bekleyen Testler</Text>
          {pending.length > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{pending.length} Yeni</Text>
            </View>
          )}
        </View>

        {pending.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="checkmark-done-circle-outline" size={40} color={COLORS.secondaryLight} />
            <Text style={styles.emptyText}>Tüm testleri tamamladınız!</Text>
          </View>
        ) : (
          pending.slice(0, 3).map((a) => (
            <TouchableOpacity
              key={a.assignmentId}
              style={styles.testCard}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('SolveTest', { assignmentId: a.assignmentId, testId: a.testId })}
            >
              <View style={[styles.testIcon, { backgroundColor: COLORS.warningBg }]}>
                <Ionicons name="time-outline" size={22} color={COLORS.warningText} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.testTitle}>{a.testTitle}</Text>
                <Text style={styles.testSub}>Bekliyor</Text>
              </View>
              <View style={styles.startBtn}>
                <Text style={styles.startBtnText}>Çöz</Text>
              </View>
            </TouchableOpacity>
          ))
        )}

        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.actionCard} activeOpacity={0.85} onPress={() => navigation.navigate('AiChat')}>
            <View style={[styles.actionIconBg, { backgroundColor: '#EDE9FE' }]}>
              <Ionicons name="sparkles" size={24} color="#8B5CF6" />
            </View>
            <Text style={styles.actionText}>AI Öğretmen</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard} activeOpacity={0.85} onPress={() => navigation.navigate('VocabularyReview')}>
            <View style={[styles.actionIconBg, { backgroundColor: '#D1FAE5' }]}>
              <Ionicons name="refresh" size={24} color="#10B981" />
            </View>
            <Text style={styles.actionText}>Kelime Tekrar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { paddingBottom: 120 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    paddingHorizontal: SIZES.padding, paddingTop: 56, paddingBottom: 8,
  },
  greeting: { ...FONTS.h1 },
  subGreeting: { ...FONTS.bodySmall, marginTop: 4 },
  avatar: {
    width: 48, height: 48, borderRadius: SIZES.radiusFull,
    backgroundColor: COLORS.avatarPurple, justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: COLORS.white, ...SHADOWS.soft,
  },
  avatarText: { fontWeight: '700', fontSize: 14, color: '#6D28D9' },

  idCard: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginHorizontal: SIZES.padding, marginTop: 16, backgroundColor: 'rgba(255,255,255,0.4)',
    borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12,
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.7)',
  },
  idLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  idLabel: { fontSize: 13, fontWeight: '600', color: COLORS.infoText },
  idBadge: { backgroundColor: 'rgba(255,255,255,0.5)', paddingHorizontal: 16, paddingVertical: 6, borderRadius: SIZES.radiusFull, borderWidth: 1, borderColor: 'rgba(255,255,255,0.6)' },
  idText: { fontSize: 18, fontWeight: '800', color: COLORS.primary },

  statsRow: {
    flexDirection: 'row', gap: 12, paddingHorizontal: SIZES.padding, marginTop: 24,
  },
  statCard: {
    flex: 1, padding: 14, borderRadius: 20, alignItems: 'center', ...SHADOWS.soft,
    borderWidth: 1, borderColor: COLORS.cardBorder,
  },
  statNumber: { ...FONTS.h2, marginTop: 6 },
  statIconImage: { width: 48, height: 48 },
  statLabel: { fontSize: 11, color: COLORS.secondary, marginTop: 2 },

  reviewBanner: {
    marginHorizontal: SIZES.padding, marginTop: 24, borderRadius: SIZES.radius,
    padding: 24, overflow: 'hidden', backgroundColor: '#D1FAE5', ...SHADOWS.soft,
  },
  bannerContent: { position: 'relative', zIndex: 10 },
  bannerTitle: { ...FONTS.h2 },
  bannerSub: { ...FONTS.bodySmall, marginTop: 2, marginBottom: 16 },
  bannerButton: {
    backgroundColor: COLORS.white, alignSelf: 'flex-start',
    paddingHorizontal: 24, paddingVertical: 10, borderRadius: SIZES.radiusFull, ...SHADOWS.soft,
  },
  bannerButtonText: { ...FONTS.label, fontSize: 13 },
  bannerCircle: {
    position: 'absolute', right: -16, bottom: -16,
    width: 96, height: 96, borderRadius: 48, backgroundColor: 'rgba(255,255,255,0.3)',
  },

  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: SIZES.padding, marginTop: 32, marginBottom: 16,
  },
  sectionTitle: { ...FONTS.h3 },
  badge: { backgroundColor: '#FED7AA', paddingHorizontal: 12, paddingVertical: 4, borderRadius: SIZES.radiusFull },
  badgeText: { fontSize: 11, fontWeight: '700', color: '#C2410C', textTransform: 'uppercase', letterSpacing: 0.5 },

  emptyCard: {
    marginHorizontal: SIZES.padding, backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius, padding: 32, alignItems: 'center',
    ...SHADOWS.soft, borderWidth: 1, borderColor: COLORS.border,
  },
  emptyText: { ...FONTS.bodySmall, marginTop: 12 },

  testCard: {
    marginHorizontal: SIZES.padding, marginBottom: 12, backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14,
    ...SHADOWS.soft, borderWidth: 1, borderColor: COLORS.cardBorder,
  },
  testIcon: { width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  testTitle: { fontWeight: '700', fontSize: 14, color: COLORS.primary },
  testSub: { ...FONTS.bodySmall, fontSize: 12, marginTop: 2 },
  startBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: SIZES.radiusFull },
  startBtnText: { ...FONTS.button, fontSize: 12 },

  quickActions: {
    flexDirection: 'row', gap: 16, paddingHorizontal: SIZES.padding, marginTop: 24,
  },
  actionCard: {
    flex: 1, backgroundColor: COLORS.surface, borderRadius: SIZES.radius, padding: 20,
    alignItems: 'center', ...SHADOWS.soft, borderWidth: 1, borderColor: COLORS.border,
  },
  actionIconBg: {
    width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center',
    marginBottom: 8,
  },
  actionText: { ...FONTS.label, fontSize: 13 },
});
