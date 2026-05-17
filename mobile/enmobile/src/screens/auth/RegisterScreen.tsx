import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SHADOWS, SIZES } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { useAlert } from '../../components/CustomAlert';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types';

type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'Register'> };

export default function RegisterScreen({ navigation }: Props) {
  const { register } = useAuth();
  const { showAlert } = useAlert();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'TEACHER' | 'STUDENT'>('STUDENT');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      showAlert('Hata', 'Lütfen tüm alanları doldurun.');
      return;
    }
    setLoading(true);
    try {
      await register({ fullName: fullName.trim(), email: email.trim(), password, role });
    } catch (e: any) {
      showAlert('Kayıt Başarısız', e?.response?.data?.message || 'Bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.inner}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>Hesap Oluştur</Text>
          <Text style={styles.subtitle}>TNAP'a katıl ve öğrenmeye başla</Text>
        </View>

        <View style={styles.form}>

          <Text style={styles.label}>Rol Seçin</Text>
          <View style={styles.roleRow}>
            <TouchableOpacity
              style={[styles.roleButton, role === 'STUDENT' && styles.roleActive]}
              onPress={() => setRole('STUDENT')}
              activeOpacity={0.8}
            >
              <Text style={[styles.roleText, role === 'STUDENT' && styles.roleTextActive]}>
                🎓 Öğrenci
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.roleButton, role === 'TEACHER' && styles.roleActive]}
              onPress={() => setRole('TEACHER')}
              activeOpacity={0.8}
            >
              <Text style={[styles.roleText, role === 'TEACHER' && styles.roleTextActive]}>
                👨‍🏫 Öğretmen
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.label, { marginTop: 20 }]}>Ad Soyad</Text>
          <View style={styles.inputRow}>
            <Ionicons name="person-outline" size={20} color="#6366F1" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Ahmet Yılmaz"
              placeholderTextColor="#A0AEC0"
              value={fullName}
              onChangeText={setFullName}
            />
          </View>

          <Text style={[styles.label, { marginTop: 18 }]}>Email</Text>
          <View style={styles.inputRow}>
            <Ionicons name="mail-outline" size={20} color="#6366F1" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="ornek@email.com"
              placeholderTextColor="#A0AEC0"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <Text style={[styles.label, { marginTop: 18 }]}>Şifre</Text>
          <View style={styles.inputRow}>
            <Ionicons name="lock-closed-outline" size={20} color="#6366F1" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#A0AEC0"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <TouchableOpacity
            style={[styles.button, loading && { opacity: 0.7 }]}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.buttonText}>Kayıt Ol</Text>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.footer}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.footerText}>
            Zaten hesabın var mı? <Text style={styles.footerLink}>Giriş Yap</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  inner: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: SIZES.padding,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 2,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#334155',
    textAlign: 'center',
    lineHeight: 22,
  },
  form: {
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    ...SHADOWS.soft,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  roleRow: {
    flexDirection: 'row',
    gap: 12,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },
  roleActive: {
    borderColor: '#6366F1',
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
  },
  roleText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  roleTextActive: {
    color: '#4338CA',
    fontWeight: '700',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },
  inputIcon: {
    marginLeft: 14,
  },
  input: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 15,
    fontSize: 15,
    color: COLORS.primary,
  },
  button: {
    backgroundColor: '#6366F1',
    borderRadius: 50,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 28,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  footer: {
    alignItems: 'center',
    marginTop: 28,
  },
  footerText: {
    fontSize: 14,
    color: '#64748B',
  },
  footerLink: {
    color: '#6366F1',
    fontWeight: '700',
  },
});
