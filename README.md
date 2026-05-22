# OR Obras

**Sistema de Ficha de Verificação de Serviço (FVS) para construtoras.**

Aplicativo mobile (iOS/Android) e PWA web desenvolvido com Expo SDK 54, React Native e TypeScript.

---

## Funcionalidades

- **Dashboard** — visão geral de obras com indicadores de progresso e conformidade
- **Inspeção FVS** — matriz interativa com 7 status de inspeção, filtros e tooltip
- **Edificações** — cadastro hierárquico com locais e elementos (modo grupo e unitário)
- **Cadastros** — obras, serviços com etapas, responsáveis
- **Relatórios** — gráficos de pizza, gauge de conformidade e tabela de não conformidades
- **PWA** — instalável no iPhone (Safari), Android (Chrome) e desktop
- **100% offline** — todos os dados persistidos localmente via AsyncStorage

---

## Deploy no Vercel (sem terminal)

### Passo a passo

1. Acesse [vercel.com](https://vercel.com) e faça login com sua conta GitHub.

2. Clique em **"Add New Project"**.

3. Na lista de repositórios, localize **`or-obras-mobile`** e clique em **"Import"**.

4. Na tela de configuração do projeto, preencha os campos:

   | Campo | Valor |
   |---|---|
   | **Framework Preset** | `Other` |
   | **Build Command** | `npx expo export --platform web` |
   | **Output Directory** | `dist` |
   | **Install Command** | `pnpm install` |

5. Clique em **"Deploy"**.

6. Aguarde o build (aproximadamente 3–5 minutos). O Vercel fornecerá um link público no formato `https://or-obras-mobile.vercel.app`.

### Variáveis de ambiente

Este projeto não requer variáveis de ambiente para funcionar na versão web estática. Todos os dados são armazenados localmente no navegador do usuário.

### Domínio personalizado

Após o primeiro deploy, acesse **Settings → Domains** no painel do Vercel para adicionar um domínio próprio (ex: `orobras.com.br`).

---

## Desenvolvimento local

```bash
# Instalar dependências
pnpm install

# Iniciar servidor de desenvolvimento
pnpm dev

# Abrir no navegador
# http://localhost:8081
```

### Credenciais de demonstração

| Perfil | E-mail | Senha |
|---|---|---|
| Dono da Conta | `carlos@orengenharia.com.br` | `123456` |
| Inspetor | `ana@orengenharia.com.br` | `123456` |

---

## Tecnologias

- [Expo SDK 54](https://expo.dev)
- [React Native 0.81](https://reactnative.dev)
- [Expo Router 6](https://expo.github.io/router)
- [NativeWind 4](https://www.nativewind.dev) (Tailwind CSS)
- [TypeScript 5.9](https://www.typescriptlang.org)
- [AsyncStorage](https://react-native-async-storage.github.io/async-storage/)

---

## Estrutura do projeto

```
app/
  (auth)/         ← Telas de autenticação
  (tabs)/         ← Telas principais (Dashboard, Inspeção, Cadastros, Relatórios, Config)
  +html.tsx       ← Meta tags PWA (Apple, Chrome)
components/
  web/            ← Componentes otimizados para web/desktop
  EdificacoesScreen.tsx
lib/
  auth-context.tsx
  data-context.tsx
  storage.ts
  types.ts
public/
  manifest.json   ← PWA manifest
  sw.js           ← Service Worker (cache offline)
```

---

## Licença

Projeto proprietário — OR Engenharia. Todos os direitos reservados.
