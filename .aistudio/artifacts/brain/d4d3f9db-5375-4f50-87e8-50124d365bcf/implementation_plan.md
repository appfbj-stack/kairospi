# Kairós Super Assistente — PWA & Desktop Unificado com Pacotes Pi.dev

Um Super Assistente Pessoal e Profissional responsivo e instalável (PWA no celular e no computador), unificando a inteligência do Kairós com o ecossistema de pacotes modulares do **pi.dev**, agenda inteligente, gestão de clientes, lembretes de aniversários e respostas a dúvidas em linguagem natural.

---

### Decisões Críticas e Preferências do Usuário

> [!IMPORTANT]
> Com base na análise completa do repositório `desktop-pi-kairos` e nas opções selecionadas pelo usuário (Opções 2 e 3):

- **Arquitetura Unificada (PWA Único para Celular e Computador)**: 
  - Em vez de manter dois aplicativos isolados (um Electron e um PWA separado, o que geraria complexidade de manutenção e sincronização na VPS), será implementado um **PWA Responsivo de Primeira Classe**.
  - O aplicativo adapta-se automaticamente: no celular possui navegação ergonômica por *Thumb Zone* e abas inferiores; no desktop (PC) expande-se em layout multi-colunas com barra lateral expansível, atalhos de teclado e área de trabalho ampla.
  - Pode ser instalado diretamente no Windows/Mac/Linux (via Chrome/Edge) e no Android/iOS como aplicativo nativo através do Manifesto PWA e Service Worker.
- **Gerenciador de Pacotes do pi.dev**:
  - Catálogo nativo dos pacotes essenciais do ecossistema Pi (`pi-web-access`, `kairos-agenda`, `kairos-crm`, `kairos-memory`, `pi-condense`, `pi-zip`) com botões de ativação instantânea (toggle liga/desliga).
  - Instalador avançado permitindo adicionar pacotes customizados diretamente por link de repositório Git ou pacote npm do catálogo `pi.dev/packages`.
- **Escopo do Super Assistente**:
  - **Agenda Inteligente**: Registro de compromissos com data/hora em ISO 8601 por comando de voz ou texto, filtros por hoje/semana/mês.
  - **Lembretes e Aniversários**: Gestão de datas comemorativas de contatos e clientes com alertas de proximidade e sugestão de felicitações.
  - **Atendimento e Clientes (CRM Ágil)**: Ficha de contatos, histórico de atendimentos, anotações de clientes e pendências.
  - **IA Conversacional com Execução de Tools**: Compreensão de linguagem natural via Gemini para agendar, buscar, registrar clientes e tirar dúvidas em tempo real.

---

## 1. Visão Geral e Conceito Central

- **O que faz**: É a central inteligente do usuário. Ele pode digitar ou falar *"Lembre-se da reunião com o cliente Carlos amanhã às 15h"* ou *"Quais os aniversariantes desta semana?"*, e o assistente executa a ação, armazena no banco persistente e fornece feedback imediato. Além disso, o usuário pode explorar a loja de pacotes Pi e ativar extensões para expandir as ferramentas do agente.
- **Público-Alvo**: Profissionais autônomos, empresários e usuários que necessitam de um assistente na VPS acessível do computador do escritório e do celular na rua, mantendo tudo sincronizado.
- **Proposta de Valor**: Elimina o atrito de múltiplos apps; substitui anotações soltas por uma IA que agenda, monitora clientes, avisa aniversários e roda ferramentas modulares leves.

---

## 2. Experiência do Usuário e Design Visual

Adotando as diretrizes dos domínios **Mobile & Touch-First PWAs** e **SaaS & Dashboards**:

### Fluxos Principais
1. **Feed / Visão Geral do Dia**: Resumo imediato ao abrir — compromissos de hoje, aniversários próximos, clientes pendentes e barra de prompt rápido ("O que faremos agora?").
2. **Chat do Assistente (Interface Conversacional)**: Chat fluido com streaming, botões de ação gerados pela IA (ex: "Confirmar agendamento", "Enviar WhatsApp"), histórico e seleção de ferramentas ativas.
3. **Agenda & Calendário**: Visualização em lista cronológica e visão de calendário, alternadores de período (Hoje, Amanhã, Esta Semana, Mês), badges de status e botão flutuante/inferior de novo compromisso.
4. **Clientes & Aniversários (CRM)**: Lista de contatos pesquisável com chips de status, data de aniversário, atalho direto para WhatsApp/telefone e histórico de conversas.
5. **Central de Pacotes Pi (pi.dev)**: Galeria com cartões de extensões, documentação rápida da tool, status de ativação (Ligado/Desligado) e modal para instalar novos pacotes via Git/npm.

### Identidade Visual e Tipografia
- **Paleta de Cores (Regra 60-30-10)**:
  - *Canvas (60%)*: Slate neutro profundo (`#0f172a` no tema escuro ou `#f8fafc` no tema claro) para evitar fadiga visual e garantir alto contraste ao ar livre no celular.
  - *Superfícies (30%)*: Cartões com bordas sutis (`border-slate-800`), sem acúmulo de pills decorativas.
  - *Acentos (10%)*: Azul índigo / safira (`#3b82f6` / `#6366f1`) para botões de ação e tabs ativas.
- **Tipografia**:
  - Display / Títulos: *Plus Jakarta Sans* (moderno, geométrico e confiável).
  - Corpo / Textos: *DM Sans* para legibilidade ótima em telas pequenas.
  - Números e Horários: `font-mono tabular-nums` para alinhamento perfeito de horas e datas.
- **Ergonomia Mobile**:
  - Touch target mínimo de 44x44px.
  - Barra de navegação inferior fixa com 4 seções principais (*Início*, *Chat*, *Agenda*, *Clientes*, *Pacotes*).
  - Em telas grandes (`lg:` $\ge 1024$px), a barra inferior converte-se em barra lateral elegante (*Sidebar*).

---

## 3. Decisões Técnicas e Arquitetura do Sistema

```
┌────────────────────────────────────────────────────────────────────────┐
│               CLIENTE MULTIPLATAFORMA (PWA & DESKTOP)                  │
│                                                                        │
│   [ Mobile PWA (iOS/Android) ]       [ Desktop PWA (Windows/Mac/Linux) ]│
│   • Bottom Navigation Bar (Thumb)    • Multi-Column Sidebar Layout     │
│   • Offline Cache & Service Worker   • Atalhos de Teclado & Telas Pro   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                         HTTPS / JSON API Routes
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   BACKEND FULL-STACK (VITE / NODE SERVER)              │
│                                                                        │
│  ┌───────────────────────┐  ┌────────────────────────────────────────┐ │
│  │   /api/assistant/chat │  │  Motor Gemini AI (@google/genai)        │ │
│  │   • Conversação       │  │  • Modelo: gemini-3.8-flash            │ │
│  │   • Tool Calling      │  │  • Function Declarations / Tools        │ │
│  └───────────┬───────────┘  └───────────────────┬────────────────────┘ │
│              │                                  │                      │
│              ▼                                  ▼                      │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │            ECOSSISTEMA DE EXTENSÕES & TOOLS (PI.DEV)              │ │
│  │  • kairos-agenda    (Agenda, datas ISO 8601, categorias)          │ │
│  │  • kairos-crm       (Clientes, contatos, aniversariantes)         │ │
│  │  • kairos-memory    (Preferências e memórias contextuais)         │ │
│  │  • pi-web-access    (Pesquisas e dados atualizados na web)        │ │
│  │  • pi-package-loader(Instalador dinâmico de pacotes do pi.dev)    │ │
│  └───────────────────────────────────┬───────────────────────────────┘ │
│                                      │                                 │
│                                      ▼                                 │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │           ARMAZENAMENTO PERSISTENTE (LOCALSTORAGE / JSON DB)      │ │
│  │  • agenda_items (compromissos, prioridades, conclusão)            │ │
│  │  • clients & birthdays (dados cadastrais, datas comemorativas)    │ │
│  │  • active_packages (estado dos pacotes instalados)                │ │
│  └───────────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Roteiro de Execução

1. **Configuração PWA & Assets**:
   - Configuração do manifesto PWA (`manifest.json` com nome curto $\le 12$ caracteres, tema escuro, modo standalone).
   - Service worker para suporte offline e inicialização instantânea.
   - Ícones PWA (192x192 e 512x512) e suporte a instalação no celular e no computador.

2. **Núcleo de Ferramentas & Pacotes Pi**:
   - Implementação das tools no padrão do repositório Kairós (`agenda:add`, `agenda:list`, `agenda:complete`, `crm:add_client`, `crm:list_birthdays`, `memory:save`).
   - Módulo de gerenciamento de pacotes do `pi.dev` com lista pré-carregada e campo para instalar novos via URL/npm.

3. **Backend com Gemini AI & Server Routes**:
   - Integração com `@google/genai` utilizando `gemini-3.8-flash` no servidor.
   - System instruction contextualizado em Português do Brasil com data/hora em tempo real.
   - Tool calling automático para que o assistente cadastre eventos, busque dados e responda dúvidas de forma proativa.

4. **Interface Unificada (Desktop & Mobile)**:
   - Tela de Início / Resumo com indicadores de aniversariantes e próximos compromissos.
   - Chat interativo com voz/texto, histórico e cards visuais de confirmação de agendamentos.
   - Visualizador completo de Agenda (filtros diário, semanal, mensal).
   - Gerenciador de Clientes & Aniversariantes com link para contato imediato.
   - Loja e Gerenciador de Pacotes Pi com status e detalhes.

5. **Validação & Testes**:
   - Verificação de responsividade em telas mobile (375px) e desktop (1440px).
   - Compilação limpa do applet com `compile_applet`.
