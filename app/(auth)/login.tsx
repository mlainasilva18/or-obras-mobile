import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { useAuth } from '@/lib/auth-context';

export default function LoginScreen() {
  const { login, setupOwnerPassword, needsFirstSetup } = useAuth();

  // Login state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // First setup state
  const [ownerName, setOwnerName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Forgot password
  const [showForgot, setShowForgot] = useState(false);

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

  const handleSetupOwner = async () => {
    if (!ownerName.trim()) {
      setError('Informe seu nome completo.');
      return;
    }
    if (newPassword.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }
    setError('');
    setLoading(true);
    const result = await setupOwnerPassword(ownerName.trim(), newPassword);
    setLoading(false);
    if (!result.success) {
      setError(result.error ?? 'Erro ao configurar senha.');
    }
  };

  // ---- Primeiro acesso: configurar senha do Dono ----
  if (needsFirstSetup) {
    return (
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.logoContainer}>
            <View style={styles.logoBox}>
              <Text style={styles.logoOR}>OR</Text>
              <Text style={styles.logoObras}>Obras</Text>
            </View>
            <Text style={styles.tagline}>Qualidade e precisão em cada inspeção</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.title}>Configurar Acesso</Text>
            <Text style={styles.subtitle}>
              Bem-vindo ao OR Obras! Configure sua senha para o primeiro acesso.
            </Text>
            <View style={styles.ownerEmailBox}>
              <Text style={styles.ownerEmailLabel}>Dono da Conta</Text>
              <Text style={styles.ownerEmail}>orengenharia.ce@gmail.com</Text>
            </View>

            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <Text style={styles.label}>Nome Completo</Text>
            <TextInput
              style={styles.input}
              value={ownerName}
              onChangeText={setOwnerName}
              placeholder="Seu nome completo"
              placeholderTextColor="#9E9E9E"
              autoCapitalize="words"
              returnKeyType="next"
            />

            <Text style={styles.label}>Criar Senha</Text>
            <TextInput
              style={styles.input}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Mínimo 6 caracteres"
              placeholderTextColor="#9E9E9E"
              secureTextEntry
              returnKeyType="next"
            />

            <Text style={styles.label}>Confirmar Senha</Text>
            <TextInput
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Repita a senha"
              placeholderTextColor="#9E9E9E"
              secureTextEntry
              returnKeyType="done"
              onSubmitEditing={handleSetupOwner}
            />

            <TouchableOpacity
              style={[styles.btn, loading && styles.btnDisabled]}
              onPress={handleSetupOwner}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.btnText}>Confirmar e Entrar</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // ---- Esqueci a senha ----
  if (showForgot) {
    return (
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.logoContainer}>
            <View style={styles.logoBox}>
              <Text style={styles.logoOR}>OR</Text>
              <Text style={styles.logoObras}>Obras</Text>
            </View>
          </View>
          <View style={styles.card}>
            <Text style={styles.title}>Recuperar Senha</Text>
            <Text style={styles.subtitle}>
              Para redefinir sua senha, entre em contato com o administrador do sistema ou acesse o e-mail cadastrado.
            </Text>
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                📧 Contato: orengenharia.ce@gmail.com
              </Text>
            </View>
            <TouchableOpacity
              style={styles.btnOutline}
              onPress={() => setShowForgot(false)}
              activeOpacity={0.85}
            >
              <Text style={styles.btnOutlineText}>Voltar ao Login</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // ---- Login normal ----
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
            style={styles.forgotBtn}
            onPress={() => setShowForgot(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.forgotText}>Esqueci minha senha</Text>
          </TouchableOpacity>

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

        <Text style={styles.footerNote}>
          Acesso apenas por convite do administrador.
        </Text>
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
  title: { fontSize: 22, fontWeight: '700', color: '#1C1C1C', marginBottom: 8 },
  subtitle: { fontSize: 13, color: '#616161', marginBottom: 16, lineHeight: 20 },
  ownerEmailBox: {
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#A5D6A7',
  },
  ownerEmailLabel: { fontSize: 11, fontWeight: '600', color: '#2E7D32', marginBottom: 2 },
  ownerEmail: { fontSize: 14, color: '#1C1C1C', fontWeight: '500' },
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
  btnOutline: {
    borderWidth: 1.5,
    borderColor: '#2E7D32',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  btnOutlineText: { color: '#2E7D32', fontSize: 16, fontWeight: '700' },
  errorBox: { backgroundColor: '#FFEBEE', borderRadius: 8, padding: 10, marginBottom: 8 },
  errorText: { color: '#E53935', fontSize: 13 },
  infoBox: { backgroundColor: '#F5F5F5', borderRadius: 8, padding: 14, marginVertical: 12 },
  infoText: { fontSize: 14, color: '#424242', lineHeight: 22 },
  forgotBtn: { alignSelf: 'flex-end', marginTop: 8 },
  forgotText: { fontSize: 13, color: '#2E7D32', fontWeight: '500' },
  footerNote: { fontSize: 12, color: '#9E9E9E', textAlign: 'center', marginTop: 8 },
});
