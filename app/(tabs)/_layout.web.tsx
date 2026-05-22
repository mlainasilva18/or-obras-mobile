/**
 * Web-specific layout for (tabs) — replaces the mobile tab bar with
 * a sidebar + header layout for desktop/notebook screens.
 * Mobile layout is unchanged (app/(tabs)/_layout.tsx).
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Slot, useSegments } from 'expo-router';
import { WebLayout } from '@/components/web/WebLayout';
import { PWAInstallBanner } from '@/components/web/PWAInstallBanner';

const SCREEN_TITLES: Record<string, string> = {
  index: 'Dashboard',
  inspection: 'Inspeção FVS',
  reports: 'Relatórios',
  cadastros: 'Cadastros',
  settings: 'Configurações',
};

export default function WebTabLayout() {
  const segments = useSegments();
  const activeTab = segments[segments.length - 1] ?? 'index';
  const title = SCREEN_TITLES[activeTab] ?? 'OR Obras';

  return (
    <View style={styles.root}>
      <PWAInstallBanner />
      <WebLayout title={title}>
        <Slot />
      </WebLayout>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    height: '100%' as any,
    minHeight: '100vh' as any,
  },
});
