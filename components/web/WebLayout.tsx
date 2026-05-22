import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Platform } from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '@/lib/auth-context';
import { useNetwork } from '@/lib/network-context';
import { useResponsive } from '@/hooks/use-breakpoint';

// Only render on web
if (Platform.OS !== 'web') {
  throw new Error('WebLayout is web-only');
}

const NAV_ITEMS = [
  { key: 'index', label: 'Dashboard', icon: 'dashboard' as const, path: '/(tabs)/' },
  { key: 'inspection', label: 'Inspeção FVS', icon: 'fact-check' as const, path: '/(tabs)/inspection' },
  { key: 'reports', label: 'Relatórios', icon: 'bar-chart' as const, path: '/(tabs)/reports' },
  { key: 'cadastros', label: 'Cadastros', icon: 'folder-open' as const, path: '/(tabs)/cadastros' },
  { key: 'settings', label: 'Configurações', icon: 'settings' as const, path: '/(tabs)/settings' },
];

interface WebLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export function WebLayout({ children, title }: WebLayoutProps) {
  const { bp, isMobile, isTablet, isDesktop } = useResponsive();
  // Desktop: always expanded; Tablet: collapsed by default; Mobile: no sidebar
  const [sidebarExpanded, setSidebarExpanded] = useState(isDesktop);

  const router = useRouter();
  const segments = useSegments();
  const { user, logout } = useAuth();
  const { isOnline, pendingSync } = useNetwork();

  // Sync sidebar state when breakpoint changes
  useEffect(() => {
    if (isDesktop) setSidebarExpanded(true);
    else if (isTablet) setSidebarExpanded(false);
  }, [bp, isDesktop, isTablet]);

  // Register service worker
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  }, []);

  const activeTab = segments[segments.length - 1] ?? 'index';

  // Sidebar width: desktop=240 expanded, tablet=64 collapsed/240 expanded, mobile=0
  const sidebarW = isMobile ? 0 : sidebarExpanded ? 240 : 64;

  const handleNav = (path: string) => {
    router.push(path as any);
  };

  return (
    <View style={styles.root}>
      {/* ── Sidebar (tablet + desktop) ── */}
      {!isMobile && (
        <View style={[styles.sidebar, { width: sidebarW }]}>
          {/* Logo */}
          <View style={[styles.logoArea, !sidebarExpanded && styles.logoAreaCollapsed]}>
            <View style={styles.logoMark}>
              <Text style={styles.logoOR}>OR</Text>
            </View>
            {sidebarExpanded && (
              <View style={{ flex: 1 }}>
                <Text style={styles.logoObras}>Obras</Text>
                <Text style={styles.logoTagline}>Qualidade e precisão</Text>
              </View>
            )}
          </View>

          {/* Nav items */}
          <ScrollView style={styles.navScroll} showsVerticalScrollIndicator={false}>
            {NAV_ITEMS.map((item) => {
              const isActive = activeTab === item.key || (activeTab === '(tabs)' && item.key === 'index');
              return (
                <TouchableOpacity
                  key={item.key}
                  style={[
                    styles.navItem,
                    isActive && styles.navItemActive,
                    !sidebarExpanded && styles.navItemCollapsed,
                  ]}
                  onPress={() => handleNav(item.path)}
                  activeOpacity={0.75}
                >
                  <MaterialIcons
                    name={item.icon}
                    size={22}
                    color={isActive ? '#2E7D32' : '#616161'}
                  />
                  {sidebarExpanded && (
                    <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>
                      {item.label}
                    </Text>
                  )}
                  {isActive && <View style={styles.activeIndicator} />}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Collapse button — hidden on desktop when always expanded */}
          {!isDesktop && (
            <TouchableOpacity
              style={[styles.collapseBtn, !sidebarExpanded && styles.collapseBtnCollapsed]}
              onPress={() => setSidebarExpanded(!sidebarExpanded)}
              activeOpacity={0.7}
            >
              <MaterialIcons
                name={sidebarExpanded ? 'chevron-left' : 'chevron-right'}
                size={20}
                color="#9E9E9E"
              />
              {sidebarExpanded && <Text style={styles.collapseBtnText}>Recolher</Text>}
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* ── Main area ── */}
      <View style={styles.main}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {/* Hamburger: always on mobile, only when sidebar collapsed on tablet */}
            {(isMobile || isTablet) && (
              <TouchableOpacity
                style={styles.hamburger}
                onPress={() => {
                  if (isMobile) {
                    // Mobile: no sidebar, hamburger could open a drawer in the future
                  } else {
                    setSidebarExpanded(!sidebarExpanded);
                  }
                }}
                activeOpacity={0.7}
              >
                <MaterialIcons name="menu" size={22} color="#424242" />
              </TouchableOpacity>
            )}
            <Text style={[styles.headerTitle, isMobile && styles.headerTitleMobile]}>
              {title ?? 'OR Obras'}
            </Text>
          </View>
          <View style={styles.headerRight}>
            {/* Connection status — hide label on mobile */}
            <View style={[styles.connBadge, { backgroundColor: isOnline ? '#E8F5E9' : '#FFEBEE' }]}>
              <MaterialIcons
                name={isOnline ? 'wifi' : 'wifi-off'}
                size={14}
                color={isOnline ? '#2E7D32' : '#E53935'}
              />
              {!isMobile && (
                <Text style={[styles.connText, { color: isOnline ? '#2E7D32' : '#E53935' }]}>
                  {isOnline ? 'Online' : 'Offline'}
                </Text>
              )}
              {pendingSync && (
                <MaterialIcons name="sync" size={12} color="#F9A825" />
              )}
            </View>

            {/* Notifications */}
            {!isMobile && (
              <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7}>
                <MaterialIcons name="notifications-none" size={22} color="#424242" />
              </TouchableOpacity>
            )}

            {/* User chip */}
            <TouchableOpacity
              style={[styles.userChip, isMobile && styles.userChipMobile]}
              onPress={() => handleNav('/(tabs)/settings')}
              activeOpacity={0.8}
            >
              <View style={styles.userAvatar}>
                <Text style={styles.userAvatarText}>
                  {user?.name?.charAt(0)?.toUpperCase() ?? 'U'}
                </Text>
              </View>
              {!isMobile && (
                <>
                  <View>
                    <Text style={styles.userName}>{user?.name?.split(' ')[0] ?? 'Usuário'}</Text>
                    <Text style={styles.userRole}>{user?.position ?? user?.role ?? ''}</Text>
                  </View>
                  <MaterialIcons name="keyboard-arrow-down" size={16} color="#9E9E9E" />
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {children}
        </View>

        {/* ── Bottom nav bar (mobile only) ── */}
        {isMobile && (
          <View style={styles.bottomBar}>
            {NAV_ITEMS.map((item) => {
              const isActive = activeTab === item.key || (activeTab === '(tabs)' && item.key === 'index');
              return (
                <TouchableOpacity
                  key={item.key}
                  style={styles.bottomBarItem}
                  onPress={() => handleNav(item.path)}
                  activeOpacity={0.7}
                >
                  <MaterialIcons
                    name={item.icon}
                    size={24}
                    color={isActive ? '#2E7D32' : '#9E9E9E'}
                  />
                  <Text style={[styles.bottomBarLabel, isActive && styles.bottomBarLabelActive]}>
                    {item.label === 'Inspeção FVS' ? 'Inspeção' :
                     item.label === 'Configurações' ? 'Config' : item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    height: '100%' as any,
    minHeight: '100vh' as any,
  },
  sidebar: {
    backgroundColor: '#FFFFFF',
    borderRightWidth: 1,
    borderRightColor: '#E0E0E0',
    flexDirection: 'column',
    overflow: 'hidden',
    height: '100%' as any,
    minHeight: '100vh' as any,
    position: 'sticky' as any,
    top: 0,
    zIndex: 100,
  },
  logoArea: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  logoAreaCollapsed: {
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  logoMark: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#2E7D32',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  logoOR: { fontSize: 14, fontWeight: '900', color: '#FFFFFF' },
  logoObras: { fontSize: 13, fontWeight: '700', color: '#1C1C1C', lineHeight: 16 },
  logoTagline: { fontSize: 9, color: '#9E9E9E', lineHeight: 12 },
  navScroll: { flex: 1, paddingTop: 8 },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 13,
    marginHorizontal: 8,
    borderRadius: 10,
    marginBottom: 2,
    position: 'relative',
    minHeight: 44,
  },
  navItemCollapsed: {
    justifyContent: 'center',
    paddingHorizontal: 0,
    marginHorizontal: 8,
  },
  navItemActive: { backgroundColor: '#E8F5E9' },
  navLabel: { fontSize: 14, fontWeight: '500', color: '#616161', flex: 1 },
  navLabelActive: { color: '#2E7D32', fontWeight: '700' },
  activeIndicator: {
    position: 'absolute',
    right: 0,
    top: '50%' as any,
    transform: [{ translateY: -10 }],
    width: 3,
    height: 20,
    backgroundColor: '#2E7D32',
    borderRadius: 2,
  },
  collapseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    minHeight: 44,
  },
  collapseBtnCollapsed: {
    justifyContent: 'center',
    paddingHorizontal: 0,
  },
  collapseBtnText: { fontSize: 13, color: '#9E9E9E' },
  main: { flex: 1, flexDirection: 'column', overflow: 'hidden', minWidth: 0 },
  header: {
    height: 60,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    zIndex: 50,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 },
  hamburger: { padding: 4, minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1C1C1C' },
  headerTitleMobile: { fontSize: 16 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  connBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minHeight: 28,
  },
  connText: { fontSize: 12, fontWeight: '600' },
  iconBtn: { padding: 6, borderRadius: 8, minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  userChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F5F5F5',
    borderRadius: 24,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    minHeight: 44,
  },
  userChipMobile: {
    paddingHorizontal: 6,
    paddingVertical: 6,
    borderRadius: 20,
  },
  userAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#2E7D32',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatarText: { fontSize: 12, fontWeight: '800', color: '#FFFFFF' },
  userName: { fontSize: 13, fontWeight: '700', color: '#1C1C1C' },
  userRole: { fontSize: 10, color: '#9E9E9E' },
  content: {
    flex: 1,
    overflow: 'auto' as any,
    backgroundColor: '#F5F5F5',
  },
  // ── Bottom bar (mobile) ──
  bottomBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingBottom: 8,
    paddingTop: 6,
  },
  bottomBarItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    minHeight: 52,
    gap: 2,
  },
  bottomBarLabel: { fontSize: 10, color: '#9E9E9E', fontWeight: '500' },
  bottomBarLabelActive: { color: '#2E7D32', fontWeight: '700' },
});
