import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, FONTS, SHADOWS, SIZES } from '../../theme';
import { testApi } from '../../services/api';
import type { TestAssignment, RootStackParamList } from '../../types';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Props = { navigation: NativeStackNavigationProp<RootStackParamList> };

export default function MyAssignmentsScreen({ navigation }: Props) {
  const [assignments, setAssignments] = useState<TestAssignment[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try { setAssignments(await testApi.getMyAssignments()); } catch {}
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const renderItem = ({ item }: { item: TestAssignment }) => {
    const isPending = item.status === 'PENDING';
    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.85}
        onPress={() => isPending && navigation.navigate('SolveTest', { assignmentId: item.assignmentId, testId: item.testId })}
        disabled={!isPending}
      >
        <View style={[styles.iconCircle, { backgroundColor: isPending ? COLORS.warningBg : COLORS.successBg }]}>
          <Ionicons
            name={isPending ? 'time-outline' : 'checkmark-circle'}
            size={22}
            color={isPending ? COLORS.warningText : COLORS.successText}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>{item.testTitle}</Text>
          <Text style={styles.cardSub}>
            {isPending ? 'Bekliyor' : 'Tamamlandı'}
          </Text>
        </View>
        {isPending && (
          <View style={styles.solveBtn}>
            <Text style={styles.solveBtnText}>Çöz</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Testlerim</Text>
        <Text style={styles.headerSub}>Atanan testleri çöz</Text>
      </View>

      <FlatList
        data={assignments}
        keyExtractor={(item) => item.assignmentId.toString()}
        renderItem={renderItem}
        contentContainerStyle={[styles.list, { flexGrow: 1 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Image source={require('../../../assets/images/Woman 20.png')} style={{ width: 320, height: 320, marginBottom: 24, marginLeft: 30}} resizeMode="contain" />
            <Text style={{ fontSize: 20, fontWeight: '600', color: COLORS.secondary, textAlign: 'center' }}>Atanmış test bulunmuyor</Text>
          </View>
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
    backgroundColor: COLORS.surface, borderRadius: SIZES.radius, padding: 16,
    marginBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 14,
    ...SHADOWS.soft, borderWidth: 1, borderColor: COLORS.cardBorder,
  },
  iconCircle: { width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  cardTitle: { fontWeight: '700', fontSize: 14, color: COLORS.primary },
  cardSub: { ...FONTS.bodySmall, fontSize: 12, marginTop: 2 },

  solveBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 20, paddingVertical: 8, borderRadius: SIZES.radiusFull },
  solveBtnText: { ...FONTS.button, fontSize: 12 },

  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 80 },
  emptyText: { fontSize: 20, fontWeight: '600', color: COLORS.secondary, textAlign: 'center' },
});
