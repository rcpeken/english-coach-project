import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, FONTS, SHADOWS, SIZES } from '../../theme';
import { useAlert } from '../../components/CustomAlert';
import { useAuth } from '../../context/AuthContext';
import { testApi, passageApi } from '../../services/api';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList, TestResponse, TestResultResponse } from '../../types';

type Props = { navigation: NativeStackNavigationProp<RootStackParamList> };

export default function TeacherDashboard({ navigation }: Props) {
  const { user, logout } = useAuth();
  const { showAlert } = useAlert();
  const [tests, setTests] = useState<TestResponse[]>([]);
  const [results, setResults] = useState<TestResultResponse[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const [t, r] = await Promise.all([testApi.getMyTests(), testApi.getResults()]);
      setTests(t);
      setResults(r);
    } catch (e) {
    }
  };

  useFocusEffect(useCallback(() => { loadData(); }, []));

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const pendingCount = results.length;
  const firstName = user?.fullName?.split(' ')[0] || 'Öğretmen';
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
            <Text style={styles.subGreeting}>Bugünkü dersler için hazır mısın?</Text>
          </View>
          <TouchableOpacity style={styles.avatar} onPress={() => showAlert(user?.fullName || '', `ID: ${user?.userId}\n${user?.email}`, [{ text: 'Kapat' }, { text: 'Çıkış Yap', style: 'destructive', onPress: logout }])}>
            <Text style={styles.avatarText}>{initials}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Image source={require('../../../assets/images/Books.png')} style={{ width: 50, height: 50, marginBottom: 12 }} resizeMode="contain" />
            <Text style={styles.statNumber}>{tests.length}</Text>
            <Text style={styles.statLabel}>Testler</Text>
          </View>
          <View style={styles.statCard}>
            <Image source={require('../../../assets/images/Evaluation.png')} style={{ width: 50, height: 50, marginBottom: 12 }} resizeMode="contain" />
            <Text style={styles.statNumber}>{results.length}</Text>
            <Text style={styles.statLabel}>Sonuçlar</Text>
          </View>
        </View>
        {pendingCount > 0 && (
          <TouchableOpacity
            style={styles.banner}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('TestResults')}
          >
            <View style={styles.bannerContent}>
              <Text style={styles.bannerTitle}>Değerlendir</Text>
              <Text style={styles.bannerSub}>{pendingCount} test sonucu bekliyor</Text>
              <View style={styles.bannerButton}>
                <Text style={styles.bannerButtonText}>Sonuçları Gör</Text>
              </View>
            </View>
            <View style={styles.bannerCircle} />
          </TouchableOpacity>
        )}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Son Testler</Text>
          <TouchableOpacity onPress={() => navigation.navigate('TeacherTabs')}>
            <Text style={styles.viewAll}>Tümünü Gör</Text>
          </TouchableOpacity>
        </View>

        {tests.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="document-text-outline" size={40} color={COLORS.secondaryLight} />
            <Text style={styles.emptyText}>Henüz test oluşturmadınız</Text>
          </View>
        ) : (
          tests.slice(0, 3).map((test) => (
            <TouchableOpacity
              key={test.id}
              style={styles.activityCard}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('TestDetail', { testId: test.id })}
            >
              <View style={styles.activityIcon}>
                <Ionicons name="checkmark-circle-outline" size={24} color={COLORS.secondaryLight} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.activityTitle}>{test.title}</Text>
                <Text style={styles.activitySub}>{test.questions?.length || 0} soru</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={COLORS.secondaryLight} />
            </TouchableOpacity>
          ))
        )}
        <TouchableOpacity
          style={styles.createBanner}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('CreateTest')}
        >
          <Text style={styles.createBannerTitle}>Yeni Test Oluştur</Text>
          <Text style={styles.createBannerSub}>Öğrencilerin için yeni bir sınav hazırla</Text>
          <View style={styles.createBannerIcon}>
            <Ionicons name="add" size={24} color={COLORS.primary} />
          </View>
        </TouchableOpacity>
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
    backgroundColor: COLORS.avatarTeal, justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: COLORS.white, ...SHADOWS.soft,
  },
  avatarText: { fontWeight: '700', fontSize: 14, color: COLORS.primary },

  statsRow: {
    flexDirection: 'row', gap: 16, paddingHorizontal: SIZES.padding, marginTop: 24,
  },
  statCard: {
    flex: 1, padding: 16, borderRadius: SIZES.radius, ...SHADOWS.soft,
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.cardBorder,
  },
  statIcon: {
    width: 40, height: 40, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginBottom: 12,
    backgroundColor: 'rgba(255,255,255,0.5)', borderWidth: 1, borderColor: COLORS.cardBorder,
  },
  statNumber: { ...FONTS.h2 },
  statLabel: { ...FONTS.bodySmall, marginTop: 2 },

  banner: {
    marginHorizontal: SIZES.padding, marginTop: 24, borderRadius: SIZES.radius,
    padding: 24, overflow: 'hidden',
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.cardBorder,
    ...SHADOWS.soft,
  },
  bannerContent: { position: 'relative', zIndex: 10 },
  bannerTitle: { ...FONTS.h2 },
  bannerSub: { ...FONTS.bodySmall, fontStyle: 'italic', marginTop: 2, marginBottom: 16 },
  bannerButton: {
    backgroundColor: 'rgba(255,255,255,0.7)', alignSelf: 'flex-start',
    paddingHorizontal: 24, paddingVertical: 10, borderRadius: SIZES.radiusFull,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.8)',
    ...SHADOWS.soft,
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
  viewAll: { ...FONTS.caption, color: COLORS.secondary },

  emptyCard: {
    marginHorizontal: SIZES.padding, backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius, padding: 32, alignItems: 'center',
    ...SHADOWS.soft, borderWidth: 1, borderColor: COLORS.border,
  },
  emptyText: { ...FONTS.bodySmall, marginTop: 12 },

  activityCard: {
    marginHorizontal: SIZES.padding, marginBottom: 12, backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 16,
    ...SHADOWS.soft, borderWidth: 1, borderColor: COLORS.cardBorder,
  },
  activityIcon: {
    width: 48, height: 48, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.5)',
    borderWidth: 1, borderColor: COLORS.cardBorder, justifyContent: 'center', alignItems: 'center',
  },
  activityTitle: { fontWeight: '700', fontSize: 14, color: COLORS.primary },
  activitySub: { ...FONTS.bodySmall, fontSize: 12, marginTop: 2 },

  createBanner: {
    marginHorizontal: SIZES.padding, marginTop: 24, padding: 32, borderRadius: SIZES.radius,
    alignItems: 'center',
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.cardBorder,
    ...SHADOWS.soft,
  },
  createBannerTitle: { ...FONTS.h3 },
  createBannerSub: { ...FONTS.bodySmall, marginTop: 4 },
  createBannerIcon: {
    marginTop: 16, width: 40, height: 40, borderRadius: SIZES.radiusFull,
    backgroundColor: 'rgba(255,255,255,0.6)', justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.8)',
    ...SHADOWS.soft,
  },
});
