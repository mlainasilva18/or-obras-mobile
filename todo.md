# OR Obras — TODO

## Identidade Visual e Configuração
- [x] Gerar logo OR Obras (letras OR verde + Obras preto)
- [x] Atualizar assets/images/icon.png, splash-icon.png, favicon.png, android-icon-foreground.png
- [x] Configurar tema de cores no theme.config.js (verde #2E7D32, vermelho #E53935, amarelo #F9A825, etc.)
- [x] Atualizar app.config.ts com nome, slug e logoUrl

## Navegação e Estrutura
- [x] Configurar Tab Bar com 5 abas: Dashboard, Inspeção, Relatórios, Cadastros, Configurações
- [x] Mapear ícones MaterialIcons para todas as abas
- [x] Criar estrutura de rotas para todas as telas

## Módulo 1 — Autenticação
- [x] Tela de Login (e-mail + senha)
- [x] Contexto de autenticação com AsyncStorage (persistência local)
- [x] Hierarquia de usuários: Dono, Administrador, Inspetor, Visualizador
- [x] Controle de acesso por perfil (rotas protegidas)
- [x] Dados de demonstração com 2 usuários pré-cadastrados
- [ ] Tela de Cadastro via convite (link de convite) — versão futura
- [ ] Tela de Recuperação de Senha — versão futura

## Módulo 2 — Cadastros Base
- [x] Lista de Obras (cards com status)
- [x] Formulário de Cadastro/Edição de Obra
- [x] Cadastro de Torres/Blocos vinculados à obra
- [x] Cadastro de Pavimentos vinculados à torre
- [x] Cadastro de Locais/Ambientes (individual e em massa)
- [x] Lista de Serviços com código e nome
- [x] Formulário de Cadastro/Edição de Serviço com etapas
- [x] Cadastro de etapas (descrição, método de verificação, tolerância)
- [x] Lista de Responsáveis pela Inspeção
- [x] Formulário de Cadastro/Edição de Responsável

## Módulo 3 — Inspeção FVS
- [x] Tela de seleção de contexto (Obra → Torre → Pavimento → Serviço)
- [x] Matriz de inspeção com scroll horizontal e vertical
- [x] Células coloridas por status (7 status disponíveis)
- [x] Toque em célula → modal com opções de status
- [x] Seleção de status na célula
- [x] Adicionar observação de texto livre
- [x] Adicionar observação de tratamento
- [x] Long press em célula → tooltip com detalhes completos
- [x] Filtros por status via checkboxes
- [x] Botão "Exibir/Ocultar etapas revisadas"
- [x] Painel recolhível "Resumo da Seleção"
- [ ] Anexar arquivo (foto ou PDF) via image picker — versão futura
- [ ] Seleção múltipla de locais com ações em lote — versão futura

## Módulo 4 — Relatórios e Gráficos
- [x] Gráfico de pizza — distribuição de status das etapas
- [x] Filtros: obra e torre
- [x] Legenda clicável no gráfico de pizza
- [x] Gráfico de progresso (gauge de conformidade %)
- [ ] Exportar gráfico como PNG — versão futura
- [ ] Exportar gráfico como PDF com logo OR Obras — versão futura

## Módulo 5 — Armazenamento e Configurações
- [x] Modo offline com AsyncStorage
- [x] Indicador visual de status de conexão (online/offline)
- [x] Tela de Configurações com sub-seções
- [x] Tela de Perfil do Usuário (editar nome, cargo, telefone)
- [x] Tela de Armazenamento em Nuvem (Google Drive / SharePoint - UI placeholder)
- [x] Tela de Plano de Acesso
- [x] Tela Sobre o App
- [ ] Sincronização automática ao restaurar conexão — versão futura
- [ ] Tela de Gerenciamento de Usuários (apenas Dono) — versão futura

## Dashboard
- [x] Cards de resumo de obras ativas
- [x] Indicadores de progresso por obra
- [x] Atalhos rápidos para inspeção, relatórios e cadastros
- [x] Indicador de sincronização pendente e status de conexão

## Versão Web / PWA (Desktop)
- [x] Layout web com sidebar fixa, header e área de conteúdo
- [x] Detecção de plataforma (Platform.OS === 'web') em todas as telas
- [x] WebDashboard com KPIs, cards de obras, gráfico de barra e últimas inspeções
- [x] WebInspection com tabela FVS, drawer lateral, seleção múltipla e ação em lote
- [x] WebCadastros com abas, formulários modais e árvore hierárquica
- [x] WebReports com gráfico gauge SVG, gráfico de pizza SVG, barras e tabela de NCs
- [x] WebSettings com sidebar de seções, perfil, integrações, planos e sistema
- [x] PWAInstallBanner com detecção de beforeinstallprompt
- [x] Service Worker para cache offline (sw.js)
- [x] manifest.json com ícones 192x512 e tema verde
- [x] Layout web específico (app/(tabs)/_layout.web.tsx) com Slot e PWAInstallBanner
- [x] Responsividade: sidebar recolhível em telas menores
