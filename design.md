# OR Obras — Plano de Design de Interface

## Identidade Visual

- **Nome:** OR Obras
- **Tagline:** "Qualidade e precisão em cada inspeção"
- **Paleta de cores:**
  - Principal (botões, destaques): Verde `#2E7D32`
  - Principal escuro (hover/press): Verde escuro `#1B5E20`
  - Fundo: Branco `#FFFFFF`
  - Texto principal: Preto `#1C1C1C`
  - Texto secundário: Cinza escuro `#424242`
  - Divisores/bordas: Cinza claro `#E0E0E0`
  - Sucesso/Conforme: Verde `#2E7D32`
  - Alerta/Não Conforme: Vermelho `#E53935`
  - Exceção: Amarelo `#F9A825`
  - Não Avaliado: Cinza médio `#9E9E9E`
  - Liberado com Concessão: Azul `#1565C0`
- **Tipografia:**
  - Títulos: Montserrat Bold (via Google Fonts)
  - Textos: Inter Regular/Medium
  - Códigos: Roboto Mono Regular

## Lista de Telas

### Autenticação
1. **Login** — E-mail + senha, botão Google OAuth, link "Esqueci minha senha"
2. **Cadastro/Convite** — Formulário de criação de senha via link de convite
3. **Recuperação de Senha** — Campo de e-mail + botão enviar

### Navegação Principal (Tab Bar)
- Aba 1: Dashboard (Home)
- Aba 2: Inspeção (FVS)
- Aba 3: Relatórios
- Aba 4: Cadastros
- Aba 5: Configurações

### Dashboard (Home)
- Resumo de obras ativas
- Cards de progresso por obra (% conformes, não conformes, não avaliados)
- Atalhos rápidos para inspeção recente
- Indicador de status de conexão (online/offline)

### Módulo de Inspeção (FVS)
- **Seleção de Contexto** — Seletores em cascata: Obra → Torre → Pavimento → Serviço
- **Matriz de Inspeção** — Tabela com scroll horizontal (locais) e vertical (etapas), células coloridas por status
- **Menu de Célula** (modal bottom sheet) — Seleção de status, observação, observação de tratamento, anexar arquivo, informações adicionais
- **Tooltip de Célula** (long press) — Usuário, data/hora, local, etapa, status, observações
- **Filtros de Status** — Checkboxes para os 7 status disponíveis
- **Resumo da Seleção** — Painel recolhível na parte inferior

### Cadastros
- **Lista de Obras** — Cards com nome, status (Em andamento/Concluída/Pausada), torres
- **Detalhe de Obra** — Dados da obra, torres/blocos, pavimentos, locais
- **Cadastro de Obra** — Formulário: nome, endereço, datas, status
- **Cadastro de Torres/Blocos** — Vinculados à obra
- **Cadastro de Pavimentos** — Vinculados à torre
- **Cadastro de Locais** — Individual ou em massa (APTO 01 a APTO 20)
- **Lista de Serviços** — Código + nome, etapas
- **Cadastro de Serviço** — Código, nome, etapas (descrição, verificação, tolerância)
- **Lista de Responsáveis** — Nome, cargo, e-mail, telefone, obras vinculadas

### Relatórios
- **Gráfico de Não Conformidades** — Pizza com distribuição de status, filtros por período/obra/torre/serviço, exportar PNG/PDF
- **Gráfico de Progresso** — Pizza/gauge com % conformes/não conformes/não avaliados/exceção, filtros, exportar PNG/PDF

### Configurações
- **Perfil do Usuário** — Nome, cargo, foto, e-mail
- **Gerenciamento de Usuários** (apenas Dono) — Lista de usuários, ativar/desativar, vincular obras
- **Armazenamento em Nuvem** — Conectar Google Drive / Microsoft SharePoint, status de conexão, log de sincronizações
- **Plano de Acesso** — Informações do plano atual (Livre/Pró/Empresa)
- **Sobre** — Versão do app, tagline

## Fluxos Principais

### Fluxo de Inspeção
1. Usuário acessa aba "Inspeção"
2. Seleciona Obra → Torre → Pavimento → Serviço
3. Visualiza matriz de inspeção
4. Toca em célula → bottom sheet com opções de status
5. Seleciona status → célula muda de cor instantaneamente
6. Dados salvos localmente (AsyncStorage) e sincronizados ao servidor quando online

### Fluxo de Cadastro de Obra
1. Usuário acessa aba "Cadastros" → "Obras"
2. Toca no botão "+" para nova obra
3. Preenche formulário (nome, endereço, datas, status)
4. Salva → obra aparece na lista
5. Acessa obra → adiciona torres → pavimentos → locais

### Fluxo de Relatório
1. Usuário acessa aba "Relatórios"
2. Seleciona tipo de gráfico
3. Aplica filtros (obra, torre, período, serviço)
4. Toca "Gerar Gráfico"
5. Visualiza gráfico com legenda interativa
6. Exporta como PNG ou PDF

## Decisões de Layout

- Orientação: retrato (portrait), uso com uma mão
- Tab bar na parte inferior com 5 abas
- Cards com sombra leve e bordas arredondadas (border-radius: 12px)
- Botões primários: fundo verde `#2E7D32`, texto branco, cantos arredondados (border-radius: 8px)
- Cabeçalhos de tela com título centralizado e botão de ação à direita
- Matriz de inspeção com células de tamanho fixo (48x48px), scroll horizontal e vertical
- Status cells: cores sólidas com ícone de status no centro
- Bottom sheets para ações contextuais (seleção de status, filtros)
- Indicador de sincronização offline no canto superior direito
