import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList,
  KeyboardAvoidingView, Platform, ActivityIndicator, Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, SHADOWS, SIZES } from '../../theme';
import { aiApi } from '../../services/api';
import type { ChatMessage, RootStackParamList } from '../../types';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Props = { navigation: NativeStackNavigationProp<RootStackParamList> };

interface DisplayMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export default function AiChatScreen({ navigation }: Props) {
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const typingAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setMessages([{
      id: 'welcome',
      role: 'model',
      text: 'Merhaba! 👋 Ben senin AI İngilizce öğretmeninim. Bana İngilizce ile ilgili her şeyi sorabilirsin!\n\n💡 Birkaç öneri:\n• "Present perfect tense\'i açıklar mısın?"\n• "Travel kelimesiyle ilgili cümleler kur"\n• "Bir paragraf yazıp düzelt"\n\nHadi başlayalım! 🚀',
      timestamp: new Date(),
    }]);
  }, []);

  useEffect(() => {
    if (loading) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(typingAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
          Animated.timing(typingAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
        ])
      ).start();
    } else {
      typingAnim.setValue(0);
    }
  }, [loading]);

  const sendMessage = async () => {
    const msg = input.trim();
    if (!msg || loading) return;

    const userMsg: DisplayMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: msg,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const history: ChatMessage[] = messages
        .filter(m => m.id !== 'welcome')
        .map(m => ({ role: m.role, text: m.text }));

      const response = await aiApi.chat({
        messages: history,
        message: msg,
      });

      const aiMsg: DisplayMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: response.reply,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (e: any) {
      const errorMsg: DisplayMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: '❌ Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const renderMessage = ({ item }: { item: DisplayMessage }) => {
    const isUser = item.role === 'user';

    return (
      <View style={[s.msgRow, isUser && s.msgRowUser]}>
        {!isUser && (
          <View style={s.aiAvatar}>
            <Ionicons name="sparkles" size={16} color="#8B5CF6" />
          </View>
        )}
        <View style={[s.bubble, isUser ? s.bubbleUser : s.bubbleAi]}>
          <Text style={[s.bubbleText, isUser && s.bubbleTextUser]}>{item.text}</Text>
          <Text style={[s.bubbleTime, isUser && s.bubbleTimeUser]}>
            {item.timestamp.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>
    );
  };

  const typingOpacity = typingAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 1],
  });

  return (
    <KeyboardAvoidingView
      style={s.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <LinearGradient colors={['#8B5CF6', '#6D28D9']} style={s.headerAvatar}>
            <Ionicons name="sparkles" size={20} color="#FFF" />
          </LinearGradient>
          <View>
            <Text style={s.headerTitle}>AI Öğretmen</Text>
            <Text style={s.headerSub}>
              {loading ? 'yazıyor...' : 'çevrimiçi'}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate('AiQuiz')}
          style={s.quizBtn}
        >
          <Ionicons name="school-outline" size={20} color="#8B5CF6" />
        </TouchableOpacity>
      </View>
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={item => item.id}
        renderItem={renderMessage}
        contentContainerStyle={s.messageList}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
        ListFooterComponent={loading ? (
          <View style={s.typingRow}>
            <View style={s.aiAvatar}>
              <Ionicons name="sparkles" size={16} color="#8B5CF6" />
            </View>
            <Animated.View style={[s.typingBubble, { opacity: typingOpacity }]}>
              <Text style={s.typingText}>AI düşünüyor...</Text>
            </Animated.View>
          </View>
        ) : null}
      />
      <View style={s.inputWrapper}>
        <View style={s.inputRow}>
          <TextInput
            style={s.input}
            placeholder="Mesajınızı yazın..."
            placeholderTextColor={COLORS.secondaryLight}
            value={input}
            onChangeText={setInput}
            multiline
            maxLength={2000}
            editable={!loading}
          />
          <TouchableOpacity
            style={[s.sendBtn, (!input.trim() || loading) && s.sendBtnDisabled]}
            onPress={sendMessage}
            disabled={!input.trim() || loading}
            activeOpacity={0.7}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Ionicons name="send" size={20} color="#FFF" />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SIZES.padding, paddingTop: 56, paddingBottom: 16,
    backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.5)', justifyContent: 'center', alignItems: 'center',
  },
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerAvatar: {
    width: 40, height: 40, borderRadius: 20,
    justifyContent: 'center', alignItems: 'center',
  },
  headerTitle: { fontWeight: '700', fontSize: 16, color: COLORS.primary },
  headerSub: { fontSize: 12, color: COLORS.secondaryLight, marginTop: 1 },
  quizBtn: {
    width: 40, height: 40, borderRadius: 14,
    backgroundColor: '#EDE9FE', justifyContent: 'center', alignItems: 'center',
  },

  messageList: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  msgRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 12, gap: 8 },
  msgRowUser: { flexDirection: 'row-reverse' },
  aiAvatar: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#EDE9FE', justifyContent: 'center', alignItems: 'center',
    marginBottom: 4,
  },
  bubble: {
    maxWidth: '78%', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 12,
  },
  bubbleUser: {
    backgroundColor: '#1A1A1A', borderBottomRightRadius: 6,
  },
  bubbleAi: {
    backgroundColor: COLORS.surface, borderBottomLeftRadius: 6,
    borderWidth: 1, borderColor: COLORS.cardBorder,
  },
  bubbleText: { fontSize: 15, lineHeight: 22, color: COLORS.primary },
  bubbleTextUser: { color: '#FFFFFF' },
  bubbleTime: { fontSize: 10, color: COLORS.secondaryLight, marginTop: 6, alignSelf: 'flex-end' },
  bubbleTimeUser: { color: 'rgba(255,255,255,0.5)' },

  typingRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginBottom: 12 },
  typingBubble: {
    backgroundColor: COLORS.surface, borderRadius: 20, borderBottomLeftRadius: 6,
    paddingHorizontal: 16, paddingVertical: 12,
    borderWidth: 1, borderColor: COLORS.cardBorder,
  },
  typingText: { fontSize: 13, color: '#8B5CF6', fontStyle: 'italic' },

  inputWrapper: {
    paddingHorizontal: 16, paddingVertical: 12, paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    backgroundColor: COLORS.surface, borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 10 },
  input: {
    flex: 1, backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 24, paddingHorizontal: 18, paddingVertical: 12,
    fontSize: 15, color: COLORS.primary, maxHeight: 100,
    borderWidth: 1, borderColor: COLORS.border,
  },
  sendBtn: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: '#6D28D9', justifyContent: 'center', alignItems: 'center',
    ...SHADOWS.soft,
  },
  sendBtnDisabled: { opacity: 0.4 },
});
