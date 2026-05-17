import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, FONTS, SHADOWS, SIZES } from '../../theme';
import { testApi } from '../../services/api';
import type { TestResponse, RootStackParamList } from '../../types';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Props = { navigation: NativeStackNavigationProp<RootStackParamList> };

export default function MyTestsScreen({ navigation }: Props) {
  const [tests, setTests] = useState<TestResponse[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try { setTests(await testApi.getMyTests()); } catch {}
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const renderItem = ({ item }: { item: TestResponse }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={() => navigation.navigate('TestDetail', { testId: item.id })}
    >
      <View style={styles.cardTop}>
        <View>
          <Text style={styles.cardCaption}>TEST</Text>
          <Text style={styles.cardTitle}>{item.title}</Text>
          {item.description ? <Text style={styles.cardSub}>{item.description}</Text> : null}
        </View>
      </View>
      <View style={styles.cardBottom}>
        <View style={styles.cardStat}>
          <Ionicons name="help-circle-outline" size={16} color={COLORS.secondary} />
          <Text style={styles.cardStatText}>{item.questions?.length || 0} Soru</Text>
        </View>
        <TouchableOpacity style={styles.manageBtn} onPress={() => navigation.navigate('TestDetail', { testId: item.id })}>
          <Text style={styles.manageBtnText}>Detay</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Testlerim</Text>
          <Text style={styles.headerSub}>Oluşturduğun testleri yönet</Text>
        </View>
      </View>

      <FlatList
        data={tests}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="document-text-outline" size={48} color={COLORS.secondaryLight} />
            <Text style={styles.emptyText}>Henüz test oluşturmadınız</Text>
          </View>
        }
        ListFooterComponent={
          <TouchableOpacity style={styles.createBtn} onPress={() => navigation.navigate('CreateTest')} activeOpacity={0.85}>
            <View style={styles.createIcon}>
              <Ionicons name="add" size={20} color={COLORS.primary} />
            </View>
            <Text style={styles.createText}>Yeni Test Oluştur</Text>
          </TouchableOpacity>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    paddingHorizontal: SIZES.padding, paddingTop: 56, paddingBottom: 8,
  },
  headerTitle: { ...FONTS.h1 },
  headerSub: { ...FONTS.bodySmall, marginTop: 4 },

  list: { paddingHorizontal: SIZES.padding, paddingTop: 16, paddingBottom: 120 },

  card: {
    backgroundColor: COLORS.surface, borderRadius: SIZES.radius, padding: 20, marginBottom: 16,
    ...SHADOWS.soft, borderWidth: 1, borderColor: COLORS.cardBorder,
  },
  cardTop: { marginBottom: 16 },
  cardCaption: { ...FONTS.caption, marginBottom: 4 },
  cardTitle: { ...FONTS.h3, fontSize: 18 },
  cardSub: { ...FONTS.bodySmall, fontStyle: 'italic', marginTop: 2 },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardStat: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  cardStatText: { ...FONTS.bodySmall, fontSize: 13 },
  manageBtn: {
    backgroundColor: COLORS.primary, paddingHorizontal: 20, paddingVertical: 8,
    borderRadius: SIZES.radiusFull,
  },
  manageBtnText: { ...FONTS.button, fontSize: 12 },

  empty: {
    alignItems: 'center', paddingVertical: 60,
  },
  emptyText: { ...FONTS.bodySmall, marginTop: 12 },

  createBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 14, borderRadius: SIZES.radiusFull, borderWidth: 2, borderColor: COLORS.border,
    borderStyle: 'dashed', marginTop: 8,
  },
  createIcon: {
    width: 28, height: 28, borderRadius: 10, backgroundColor: COLORS.background,
    justifyContent: 'center', alignItems: 'center',
  },
  createText: { ...FONTS.label },
});
