import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Preencha o e-mail e a senha.');
      return;
    }
    setError('');
    setLoading(true);
    const result = await login(email.trim(), password);
    setLoading(false);
    if (!result.success) {
      setError(result.error ?? 'Erro ao fazer login.');
    }
  };

  const fillDemo = (type: 'owner' | 'inspector') => {
    if (type === 'owner') {
      setEmail('carlos@orengenharia.com.br');
    } else {
      setEmail('ana@orengenharia.com.br');
    }
    setPassword('123456');
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {/* Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logoBox}>
            <Text style={styles.logoOR}>OR</Text>
            <Text style={styles.logoObras}>Obras</Text>
          </View>
          <Text style={styles.tagline}>Qualidade e precisão em cada inspeção</Text>
        </View>

        {/* Form */}
        <View style={styles.card}>
          <Text style={styles.title}>Entrar</Text>

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <Text style={styles.label}>E-mail</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="seu@email.com.br"
            placeholderTextColor="#9E9E9E"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="next"
          />

          <Text style={styles.label}>Senha</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            placeholderTextColor="#9E9E9E"
            secureTextEntry
            returnKeyType="done"
            onSubmitEditing={handleLogin}
          />

          <TouchableOpacity
            style={[styles.btn, loading && styles.btnDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>Entrar</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Demo credentials */}
        <View style={styles.demoBox}>
          <Text style={styles.demoTitle}>Acesso de demonstração</Text>
          <View style={styles.demoRow}>
            <TouchableOpacity style={styles.demoBtn} onPress={() => fillDemo('owner')} activeOpacity={0.7}>
              <Text style={styles.demoBtnText}>Dono da Conta</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.demoBtn} onPress={() => fillDemo('inspector')} activeOpacity={0.7}>
              <Text style={styles.demoBtnText}>Inspetor</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.demoHint}>Senha: 123456</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#FFFFFF' },
  container: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  logoContainer: { alignItems: 'center', marginBottom: 32 },
  logoBox: { alignItems: 'center', marginBottom: 8 },
  logoOR: { fontSize: 56, fontWeight: '900', color: '#2E7D32', lineHeight: 60 },
  logoObras: { fontSize: 28, fontWeight: '700', color: '#1C1C1C', lineHeight: 32 },
  tagline: { fontSize: 13, color: '#424242', textAlign: 'center', fontStyle: 'italic' },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 20,
  },
  title: { fontSize: 22, fontWeight: '700', color: '#1C1C1C', marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: '#424242', marginBottom: 4, marginTop: 12 },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1C1C1C',
    backgroundColor: '#FAFAFA',
  },
  btn: {
    backgroundColor: '#2E7D32',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  errorBox: { backgroundColor: '#FFEBEE', borderRadius: 8, padding: 10, marginBottom: 8 },
  errorText: { color: '#E53935', fontSize: 13 },
  demoBox: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  demoTitle: { fontSize: 13, fontWeight: '600', color: '#424242', marginBottom: 10 },
  demoRow: { flexDirection: 'row', gap: 10, marginBottom: 8 },
  demoBtn: {
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#2E7D32',
  },
  demoBtnText: { color: '#2E7D32', fontSize: 13, fontWeight: '600' },
  demoHint: { fontSize: 12, color: '#9E9E9E' },
});
