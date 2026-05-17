import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions, Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, SIZES } from '../theme';

const { width: SW, height: SH } = Dimensions.get('window');

export interface AlertButton {
  text: string;
  style?: 'default' | 'cancel' | 'destructive';
  onPress?: () => void;
}

interface AlertConfig {
  title: string;
  message?: string;
  buttons?: AlertButton[];
  type?: 'success' | 'error' | 'warning' | 'info' | 'confirm';
}

interface AlertContextType {
  showAlert: (title: string, message?: string, buttons?: AlertButton[], type?: AlertConfig['type']) => void;
}

const AlertContext = createContext<AlertContextType>({ showAlert: () => {} });
export const useAlert = () => useContext(AlertContext);

const getAlertMeta = (type: AlertConfig['type'], title: string) => {
  const t = type || (
    /başarılı|başarı|eklendi|atandı|oluşturuldu|kayıt/i.test(title) ? 'success' :
    /hata|başarısız|eklenemedi|yüklenemedi|silinirken/i.test(title) ? 'error' :
    /dikkat|emin|sil|çıkar|gönder/i.test(title) ? 'confirm' :
    'info'
  );

  switch (t) {
    case 'success': return {
      icon: 'checkmark-circle' as const, color: '#16A34A',
      gradientCard: ['rgba(220,252,231,0.55)', 'rgba(187,247,208,0.3)', 'rgba(255,255,255,0.4)'] as [string, string, string],
      gradientIcon: ['rgba(220,252,231,0.9)', 'rgba(187,247,208,0.75)'] as [string, string],
      ring: 'rgba(22,163,74,0.18)',
    };
    case 'error': return {
      icon: 'alert-circle' as const, color: '#DC2626',
      gradientCard: ['rgba(254,226,226,0.55)', 'rgba(254,202,202,0.3)', 'rgba(255,255,255,0.4)'] as [string, string, string],
      gradientIcon: ['rgba(254,226,226,0.9)', 'rgba(254,202,202,0.75)'] as [string, string],
      ring: 'rgba(220,38,38,0.15)',
    };
    case 'warning': return {
      icon: 'warning' as const, color: '#D97706',
      gradientCard: ['rgba(255,251,235,0.55)', 'rgba(253,230,138,0.3)', 'rgba(255,255,255,0.4)'] as [string, string, string],
      gradientIcon: ['rgba(255,251,235,0.9)', 'rgba(253,230,138,0.75)'] as [string, string],
      ring: 'rgba(217,119,6,0.15)',
    };
    case 'confirm': return {
      icon: 'help-circle' as const, color: '#6D28D9',
      gradientCard: ['rgba(237,233,254,0.55)', 'rgba(221,214,254,0.3)', 'rgba(255,255,255,0.4)'] as [string, string, string],
      gradientIcon: ['rgba(237,233,254,0.9)', 'rgba(221,214,254,0.75)'] as [string, string],
      ring: 'rgba(109,40,217,0.15)',
    };
    default: return {
      icon: 'information-circle' as const, color: '#2563EB',
      gradientCard: ['rgba(219,234,254,0.55)', 'rgba(191,219,254,0.3)', 'rgba(255,255,255,0.4)'] as [string, string, string],
      gradientIcon: ['rgba(219,234,254,0.9)', 'rgba(191,219,254,0.75)'] as [string, string],
      ring: 'rgba(37,99,235,0.15)',
    };
  }
};

export function AlertProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);
  const [active, setActive] = useState(false);
  const [config, setConfig] = useState<AlertConfig>({ title: '' });

  const scaleAnim = useRef(new Animated.Value(0.7)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const showAlert = useCallback((title: string, message?: string, buttons?: AlertButton[], type?: AlertConfig['type']) => {
    setConfig({ title, message, buttons, type });
    setActive(true);
    setVisible(true);
  }, []);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 120, friction: 8 }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
      ]).start();
    } else {
      scaleAnim.setValue(0.7);
      opacityAnim.setValue(0);
    }
  }, [visible]);

  const dismiss = (onPress?: () => void) => {
    Animated.parallel([
      Animated.timing(scaleAnim, { toValue: 0.7, duration: 150, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
    ]).start(() => {
      setVisible(false);
      setActive(false);
      onPress?.();
    });
  };

  const meta = getAlertMeta(config.type, config.title);
  const buttons = config.buttons && config.buttons.length > 0
    ? config.buttons
    : [{ text: 'Tamam', style: 'default' as const }];

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}
      {active && (
        <Animated.View style={[s.portal, { opacity: opacityAnim }]} pointerEvents={visible ? 'auto' : 'none'}>
          <TouchableOpacity style={s.backdrop} activeOpacity={1} onPress={() => {
            if (buttons.length === 1) dismiss(buttons[0].onPress);
          }} />
          <View style={s.centerWrap} pointerEvents="box-none">
            <Animated.View style={[s.cardOuter, { transform: [{ scale: scaleAnim }] }]}>
              <BlurView intensity={70} tint="light" style={s.blurLayer}>
                <LinearGradient
                  colors={meta.gradientCard}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFillObject}
                />
                <View style={[s.decoCircle, s.deco1, { backgroundColor: meta.ring }]} />
                <View style={[s.decoCircle, s.deco2, { backgroundColor: meta.ring }]} />
                <View style={s.content}>
                  <View style={[s.iconOuter, { backgroundColor: meta.ring }]}>
                    <LinearGradient colors={meta.gradientIcon} style={s.iconInner}>
                      <Ionicons name={meta.icon} size={30} color={meta.color} />
                    </LinearGradient>
                  </View>

                  <Text style={s.title}>{config.title}</Text>
                  {config.message ? <Text style={s.message}>{config.message}</Text> : null}

                  <View style={s.divider} />
                  <View style={[s.btnRow, buttons.length === 1 && { justifyContent: 'center' }]}>
                    {buttons.map((btn, i) => {
                      const isDestructive = btn.style === 'destructive';
                      const isCancel = btn.style === 'cancel';
                      const isPrimary = !isDestructive && !isCancel;

                      return (
                        <TouchableOpacity
                          key={i}
                          style={[
                            s.btn,
                            isPrimary && s.btnPrimary,
                            isDestructive && s.btnDestructive,
                            isCancel && s.btnCancel,
                            buttons.length === 1 && { flex: 0, minWidth: 160 },
                          ]}
                          activeOpacity={0.7}
                          onPress={() => dismiss(btn.onPress)}
                        >
                          <Text style={[
                            s.btnText,
                            isCancel && { color: COLORS.secondary },
                          ]}>
                            {btn.text}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

              </BlurView>
            </Animated.View>
          </View>
        </Animated.View>
      )}
    </AlertContext.Provider>
  );
}

const s = StyleSheet.create({
  portal: {
    ...StyleSheet.absoluteFillObject,
    elevation: 999,
    zIndex: 999,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15,23,35,0.4)',
  },
  centerWrap: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center', alignItems: 'center', padding: 32,
  },

  cardOuter: {
    width: SW - 56, maxWidth: 360,
    borderRadius: 32, overflow: 'hidden',
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.8)',
    shadowColor: '#1F2687', shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15, shadowRadius: 30, elevation: 10,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  blurLayer: {
    width: '100%',
  },

  decoCircle: { position: 'absolute', borderRadius: 999, opacity: 0.8 },
  deco1: { width: 160, height: 160, top: -60, right: -50 },
  deco2: { width: 100, height: 100, bottom: -40, left: -30 },

  content: {
    padding: 28, alignItems: 'center', position: 'relative', zIndex: 10,
  },

  iconOuter: {
    width: 76, height: 76, borderRadius: 38,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 20,
  },
  iconInner: {
    width: 60, height: 60, borderRadius: 30,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.8)',
    backgroundColor: 'rgba(255,255,255,0.5)',
  },

  title: {
    fontSize: 20, fontWeight: '700', color: COLORS.primary,
    textAlign: 'center', marginBottom: 6, letterSpacing: -0.3,
  },
  message: {
    fontSize: 14, color: COLORS.secondary, textAlign: 'center',
    lineHeight: 22, paddingHorizontal: 10,
  },

  divider: {
    width: '80%', height: 1,
    backgroundColor: 'rgba(255,255,255,0.5)',
    marginVertical: 20,
  },

  btnRow: {
    flexDirection: 'row', gap: 10, width: '100%',
  },
  btn: {
    flex: 1, paddingVertical: 14, borderRadius: SIZES.radiusFull,
    alignItems: 'center', justifyContent: 'center',
  },
  btnPrimary: {
    backgroundColor: 'rgba(26,26,26,0.9)',
  },
  btnDestructive: {
    backgroundColor: 'rgba(220,38,38,0.9)',
  },
  btnCancel: {
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,1)',
  },
  btnText: {
    fontSize: 14, fontWeight: '700', color: COLORS.white,
  },
});
