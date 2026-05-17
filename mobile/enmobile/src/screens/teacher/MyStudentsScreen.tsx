import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl,
  TextInput, ActivityIndicator, Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, FONTS, SHADOWS, SIZES } from '../../theme';
import { useAlert } from '../../components/CustomAlert';
import { studentApi, testApi, passageApi } from '../../services/api';
import type { StudentResponse, TestResponse, ReadingPassageResponse, RootStackParamList } from '../../types';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Props = { navigation: NativeStackNavigationProp<RootStackParamList> };

const AVATAR_COLORS = [
  COLORS.avatarBlue, COLORS.avatarGreen, COLORS.avatarPurple,
  COLORS.avatarOrange, COLORS.avatarRose, COLORS.avatarTeal,
];

export default function MyStudentsScreen({ navigation }: Props) {
  const [students, setStudents] = useState<StudentResponse[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [studentId, setStudentId] = useState('');
  const [adding, setAdding] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const { showAlert } = useAlert();

  const [assignModal, setAssignModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentResponse | null>(null);
  const [tests, setTests] = useState<TestResponse[]>([]);
  const [passages, setPassages] = useState<ReadingPassageResponse[]>([]);
  const [assignTab, setAssignTab] = useState<'test' | 'passage'>('test');
  const [assigning, setAssigning] = useState<number | null>(null);

  const load = async () => {
    try { setStudents(await studentApi.getMyStudents()); } catch {}
  };

  useFocusEffect(useCallback(() => { load(); }, []));
  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const handleAdd = async () => {
    const id = parseInt(studentId.trim());
    if (!id || isNaN(id)) { showAlert('Hata', 'Geçerli bir öğrenci ID girin.'); return; }
    setAdding(true);
    try {
      await studentApi.addStudent(id);
      setStudentId('');
      setShowAddModal(false);
      await load();
      showAlert('Başarılı', 'Öğrenci listenize eklendi!');
    } catch (e: any) {
      showAlert('Hata', e?.response?.data?.message || e?.response?.data || 'Öğrenci eklenemedi.');
    } finally { setAdding(false); }
  };

  const handleRemove = (student: StudentResponse) => {
    showAlert('Öğrenci Çıkar', `"${student.fullName}" listenizden çıkarılsın mı?`, [
      { text: 'İptal', style: 'cancel' },
      { text: 'Çıkar', style: 'destructive', onPress: async () => {
        try { await studentApi.removeStudent(student.id); await load(); } catch (e: any) {
          showAlert('Hata', e?.response?.data?.message || 'Silme başarısız.');
        }
      }},
    ]);
  };

  const openAssignModal = async (student: StudentResponse) => {
    setSelectedStudent(student);
    setAssignTab('test');
    setAssignModal(true);
    try {
      const [t, p] = await Promise.all([testApi.getMyTests(), passageApi.getMyPassages()]);
      setTests(t);
      setPassages(p);
    } catch {}
  };

  const handleAssignTest = async (testId: number) => {
    if (!selectedStudent) return;
    setAssigning(testId);
    try {
      await testApi.assign(testId, selectedStudent.id);
      showAlert('Başarılı', `Test "${selectedStudent.fullName}" adlı öğrenciye atandı!`);
    } catch (e: any) {
      showAlert('Hata', e?.response?.data?.message || 'Atama başarısız.');
    } finally { setAssigning(null); }
  };

  const handleAssignPassage = async (passageId: number) => {
    if (!selectedStudent) return;
    setAssigning(passageId);
    try {
      await passageApi.assign(passageId, selectedStudent.id);
      showAlert('Başarılı', `Metin "${selectedStudent.fullName}" adlı öğrenciye atandı!`);
    } catch (e: any) {
      showAlert('Hata', e?.response?.data?.message || 'Atama başarısız.');
    } finally { setAssigning(null); }
  };

  const getAvatarColor = (id: number) => AVATAR_COLORS[id % AVATAR_COLORS.length];
  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  const renderStudent = ({ item }: { item: StudentResponse }) => (
    <View style={s.card}>
      <View style={s.cardTop}>
        <View style={[s.avatar, { backgroundColor: getAvatarColor(item.id) }]}>
          <Text style={s.avatarText}>{getInitials(item.fullName)}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.cardName}>{item.fullName}</Text>
          <Text style={s.cardEmail}>{item.email}</Text>
          <View style={s.idRow}>
            <Text style={s.idLabel}>ID:</Text>
            <Text style={s.idValue}>{item.id}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => handleRemove(item)} style={s.removeBtn}>
          <Ionicons name="close" size={18} color={COLORS.error} />
        </TouchableOpacity>
      </View>
      <View style={s.cardActions}>
        <TouchableOpacity style={s.assignAction} onPress={() => openAssignModal(item)}>
          <Ionicons name="paper-plane-outline" size={16} color={COLORS.primary} />
          <Text style={s.assignActionText}>Test / Metin Ata</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={s.container}>
      <View style={s.header}>
        <View>
          <Text style={s.headerTitle}>Öğrencilerim</Text>
          <Text style={s.headerSub}>{students.length} öğrenci</Text>
        </View>
        <TouchableOpacity style={s.addButton} onPress={() => setShowAddModal(true)}>
          <Ionicons name="person-add" size={20} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={students}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderStudent}
        contentContainerStyle={s.list}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={s.empty}>
            <View style={s.emptyIcon}>
              <Ionicons name="people-outline" size={48} color={COLORS.secondaryLight} />
            </View>
            <Text style={s.emptyTitle}>Henüz öğrenci eklenmedi</Text>
            <Text style={s.emptySub}>Öğrenci ID'si girerek öğrencilerinizi ekleyin</Text>
            <TouchableOpacity style={s.emptyBtn} onPress={() => setShowAddModal(true)}>
              <Ionicons name="person-add-outline" size={18} color={COLORS.white} />
              <Text style={s.emptyBtnText}>Öğrenci Ekle</Text>
            </TouchableOpacity>
          </View>
        }
      />

      <Modal visible={showAddModal} transparent animationType="slide">
        <View style={s.modalOverlay}>
          <View style={s.modalContent}>
            <View style={s.modalHandle} />
            <Text style={s.modalTitle}>Öğrenci Ekle</Text>
            <Text style={s.modalSub}>Öğrencinin ID numarasını girerek listenize ekleyin</Text>

            <View style={s.modalInfoBar}>
              <Ionicons name="information-circle-outline" size={16} color={COLORS.infoText} />
              <Text style={s.modalInfoText}>Öğrenci ID'sini öğrencinin profil sayfasında bulabilirsiniz</Text>
            </View>

            <Text style={s.label}>Öğrenci ID</Text>
            <TextInput
              style={s.input}
              placeholder="Ör: 5"
              placeholderTextColor={COLORS.secondaryLight}
              keyboardType="numeric"
              value={studentId}
              onChangeText={setStudentId}
              autoFocus
            />

            <View style={s.modalButtons}>
              <TouchableOpacity style={s.cancelBtn} onPress={() => { setShowAddModal(false); setStudentId(''); }}>
                <Text style={s.cancelBtnText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.confirmBtn, adding && { opacity: 0.7 }]}
                onPress={handleAdd}
                disabled={adding}
              >
                {adding ? <ActivityIndicator color={COLORS.white} size="small" /> : <Text style={s.confirmBtnText}>Ekle</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <Modal visible={assignModal} transparent animationType="slide">
        <View style={s.modalOverlay}>
          <View style={[s.modalContent, { maxHeight: '80%' }]}>
            <View style={s.modalHandle} />
            <View style={s.assignHeader}>
              <Text style={s.modalTitle}>{selectedStudent?.fullName}</Text>
              <TouchableOpacity onPress={() => setAssignModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.secondary} />
              </TouchableOpacity>
            </View>
            <Text style={s.modalSub}>Test veya metin atayın</Text>
            <View style={s.tabRow}>
              <TouchableOpacity
                style={[s.tab, assignTab === 'test' && s.tabActive]}
                onPress={() => setAssignTab('test')}
              >
                <Text style={[s.tabText, assignTab === 'test' && s.tabTextActive]}>Testler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.tab, assignTab === 'passage' && s.tabActive]}
                onPress={() => setAssignTab('passage')}
              >
                <Text style={[s.tabText, assignTab === 'passage' && s.tabTextActive]}>Metinler</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={assignTab === 'test' ? (tests as any[]) : (passages as any[])}
              keyExtractor={(item) => item.id.toString()}
              showsVerticalScrollIndicator={false}
              style={{ maxHeight: 400 }}
              ListEmptyComponent={
                <View style={{ padding: 40, alignItems: 'center' }}>
                  <Text style={FONTS.bodySmall}>
                    {assignTab === 'test' ? 'Henüz test oluşturmadınız' : 'Henüz metin oluşturmadınız'}
                  </Text>
                </View>
              }
              renderItem={({ item }) => (
                <View style={s.assignItem}>
                  <View style={s.assignItemIcon}>
                    <Ionicons
                      name={assignTab === 'test' ? 'document-text-outline' : 'book-outline'}
                      size={20}
                      color={COLORS.secondary}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.assignItemTitle}>{item.title}</Text>
                    {assignTab === 'test' && 'questions' in item && (
                      <Text style={s.assignItemSub}>{(item as TestResponse).questions?.length || 0} soru</Text>
                    )}
                  </View>
                  <TouchableOpacity
                    style={[s.assignItemBtn, assigning === item.id && { opacity: 0.7 }]}
                    onPress={() => assignTab === 'test' ? handleAssignTest(item.id) : handleAssignPassage(item.id)}
                    disabled={assigning === item.id}
                  >
                    {assigning === item.id
                      ? <ActivityIndicator color={COLORS.white} size="small" />
                      : <Text style={s.assignItemBtnText}>Ata</Text>
                    }
                  </TouchableOpacity>
                </View>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: SIZES.padding, paddingTop: 56, paddingBottom: 8,
  },
  headerTitle: { ...FONTS.h1 },
  headerSub: { ...FONTS.bodySmall, marginTop: 4 },
  addButton: {
    width: 44, height: 44, borderRadius: 16, backgroundColor: COLORS.primary,
    justifyContent: 'center', alignItems: 'center', ...SHADOWS.medium,
  },

  list: { paddingHorizontal: SIZES.padding, paddingTop: 16, paddingBottom: 120 },

  card: {
    backgroundColor: COLORS.surface, borderRadius: SIZES.radius, padding: 20, marginBottom: 14,
    ...SHADOWS.soft, borderWidth: 1, borderColor: COLORS.cardBorder,
  },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
  avatar: {
    width: 52, height: 52, borderRadius: 18, justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { fontWeight: '700', fontSize: 16, color: COLORS.primary },
  cardName: { fontWeight: '700', fontSize: 16, color: COLORS.primary },
  cardEmail: { ...FONTS.bodySmall, fontSize: 12, marginTop: 2 },
  idRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  idLabel: { fontSize: 11, color: COLORS.secondaryLight },
  idValue: { fontSize: 12, fontWeight: '700', color: COLORS.secondary },
  removeBtn: {
    width: 32, height: 32, borderRadius: 10, backgroundColor: COLORS.errorBg,
    justifyContent: 'center', alignItems: 'center',
  },

  cardActions: { marginTop: 14, borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 14 },
  assignAction: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 10, borderRadius: SIZES.radiusFull,
    backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border,
  },
  assignActionText: { ...FONTS.label, fontSize: 13 },

  empty: { alignItems: 'center', paddingVertical: 60 },
  emptyIcon: {
    width: 80, height: 80, borderRadius: 24, backgroundColor: COLORS.accent,
    justifyContent: 'center', alignItems: 'center', marginBottom: 16,
  },
  emptyTitle: { ...FONTS.h3, marginBottom: 4 },
  emptySub: { ...FONTS.bodySmall, textAlign: 'center', paddingHorizontal: 40 },
  emptyBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 24,
    backgroundColor: COLORS.primary, paddingHorizontal: 24, paddingVertical: 12,
    borderRadius: SIZES.radiusFull, ...SHADOWS.medium,
  },
  emptyBtnText: { ...FONTS.button },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: COLORS.white, borderTopLeftRadius: SIZES.radius, borderTopRightRadius: SIZES.radius,
    padding: SIZES.padding, paddingBottom: 40,
    ...SHADOWS.strong,
  },
  modalHandle: {
    width: 40, height: 4, backgroundColor: '#E2E8F0', borderRadius: 2,
    alignSelf: 'center', marginBottom: 20,
  },
  modalTitle: { ...FONTS.h2 },
  modalSub: { ...FONTS.bodySmall, marginTop: 4, marginBottom: 16 },

  modalInfoBar: {
    flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: COLORS.infoBg,
    borderRadius: 14, padding: 12, marginBottom: 20,
  },
  modalInfoText: { ...FONTS.bodySmall, fontSize: 12, color: COLORS.infoText, flex: 1 },

  label: { ...FONTS.label, marginBottom: 8 },
  input: {
    backgroundColor: '#F8FAFC', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 18, fontWeight: '700', color: COLORS.primary, borderWidth: 1, borderColor: '#E2E8F0',
    textAlign: 'center',
  },

  modalButtons: { flexDirection: 'row', gap: 12, marginTop: 24 },
  cancelBtn: {
    flex: 1, paddingVertical: 14, borderRadius: SIZES.radiusFull,
    backgroundColor: '#F1F5F9', alignItems: 'center',
  },
  cancelBtnText: { ...FONTS.label, color: COLORS.secondary },
  confirmBtn: {
    flex: 1, paddingVertical: 14, borderRadius: SIZES.radiusFull,
    backgroundColor: COLORS.primary, alignItems: 'center', ...SHADOWS.medium,
  },
  confirmBtnText: { ...FONTS.button },

  assignHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  tabRow: { flexDirection: 'row', gap: 8, marginBottom: 16, marginTop: 10 },
  tab: {
    flex: 1, paddingVertical: 12, borderRadius: SIZES.radiusSmall,
    backgroundColor: '#F8FAFC', alignItems: 'center',
    borderWidth: 1, borderColor: '#E2E8F0',
  },
  tabActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  tabText: { ...FONTS.label, fontSize: 13, color: COLORS.secondary },
  tabTextActive: { color: COLORS.white },

  assignItem: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 14, borderRadius: SIZES.radiusSmall, backgroundColor: '#F8FAFC',
    marginBottom: 8, borderWidth: 1, borderColor: '#E2E8F0',
  },
  assignItemIcon: {
    width: 40, height: 40, borderRadius: 12, backgroundColor: COLORS.white,
    justifyContent: 'center', alignItems: 'center', ...SHADOWS.soft,
  },
  assignItemTitle: { fontWeight: '600', fontSize: 14, color: COLORS.primary },
  assignItemSub: { ...FONTS.bodySmall, fontSize: 11, marginTop: 2 },
  assignItemBtn: {
    backgroundColor: COLORS.primary, paddingHorizontal: 18, paddingVertical: 8,
    borderRadius: SIZES.radiusFull,
  },
  assignItemBtnText: { ...FONTS.button, fontSize: 12 },
});
