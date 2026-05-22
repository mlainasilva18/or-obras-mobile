import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { usePWAInstall } from '@/hooks/use-pwa-install';

export function PWAInstallBanner() {
  const { canInstall, isInstalled, install } = usePWAInstall();
  const [dismissed, setDismissed] = useState(false);

  if (Platform.OS !== 'web' || !canInstall || isInstalled || dismissed) return null;

  return (
    <View style={styles.banner}>
      <View style={styles.left}>
        <View style={styles.icon}>
          <Text style={styles.iconOR}>OR</Text>
        </View>
        <View>
          <Text style={styles.title}>Instalar OR Obras</Text>
          <Text style={styles.subtitle}>Acesse como app na área de trabalho</Text>
        </View>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.installBtn}
          onPress={install}
          activeOpacity={0.85}
        >
          <MaterialIcons name="download" size={16} color="#FFFFFF" />
          <Text style={styles.installBtnText}>Instalar App</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.dismissBtn}
          onPress={() => setDismissed(true)}
          activeOpacity={0.7}
        >
          <MaterialIcons name="close" size={18} color="#9E9E9E" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    paddingHorizontal: 20,
    paddingVertical: 10,
    zIndex: 200,
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  icon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#2E7D32',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconOR: { fontSize: 13, fontWeight: '900', color: '#FFFFFF' },
  title: { fontSize: 14, fontWeight: '700', color: '#1C1C1C' },
  subtitle: { fontSize: 12, color: '#9E9E9E' },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  installBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#2E7D32',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  installBtnText: { fontSize: 13, fontWeight: '700', color: '#FFFFFF' },
  dismissBtn: { padding: 4 },
});
