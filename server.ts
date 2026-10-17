import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Initialize Google GenAI
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Types
export interface AgendaItem {
  id: number;
  title: string;
  datetime: string; // ISO 8601 string
  notes?: string;
  category: 'Trabalho' | 'Pessoal' | 'Cliente' | 'Urgente' | 'Saúde';
  priority: number; // 0 normal, 1 média, 2 alta
  completed: boolean;
  completedAt?: string;
  createdAt: string;
}

export interface ClientItem {
  id: number;
  name: string;
  phone?: string;
  email?: string;
  birthday?: string; // YYYY-MM-DD or MM-DD
  notes?: string;
  company?: string;
  status: 'Ativo' | 'Lead' | 'Pendente' | 'VIP';
  lastContact?: string;
}

export interface PiPackage {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  category: 'Ferramentas Web' | 'Produtividade' | 'Memória & IA' | 'Integrações' | 'Segurança';
  enabled: boolean;
  source: 'official' | 'community' | 'git';
  sourceUrl?: string;
  tools: { name: string; description: string }[];
  installCommand?: string;
}

export interface MemoryNote {
  id: number;
  key: string;
  value: string;
  category: string;
  updatedAt: string;
}

// Initial Data Seed (based on Kairós extensions & pi.dev package catalog)
let agendaItems: AgendaItem[] = [
  {
    id: 1,
    title: 'Reunião de Alinhamento com Cliente Marcos Silva',
    datetime: new Date(Date.now() + 1000 * 60 * 60 * 3).toISOString(), // hoje daqui 3h
    notes: 'Apresentar proposta de automação e implantação na VPS Dokploy.',
    category: 'Cliente',
    priority: 2,
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    title: 'Verificar status do servidor VPS Dokploy',
    datetime: new Date(Date.now() + 1000 * 60 * 60 * 6).toISOString(),
    notes: 'Checar certificados SSL e consumo de memória RAM dos containers.',
    category: 'Trabalho',
    priority: 1,
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 3,
    title: 'Ligar para Dra. Camila para felicitações',
    datetime: new Date(Date.now() + 1000 * 60 * 60 * 8).toISOString(),
    notes: 'Aniversário hoje! Mandar mensagem personalizada.',
    category: 'Pessoal',
    priority: 1,
    completed: false,
    createdAt: new Date().toISOString(),
  },
];

let clientItems: ClientItem[] = [
  {
    id: 1,
    name: 'Dra. Camila Nogueira',
    phone: '+55 11 98765-4321',
    email: 'camila.nogueira@clinica.com.br',
    birthday: '10-17', // Aniversário hoje!
    company: 'Clínica Nogueira Odonto',
    status: 'VIP',
    notes: 'Cliente de longa data. Usa o sistema Kairós para gestão de agendamentos.',
    lastContact: '2026-10-10',
  },
  {
    id: 2,
    name: 'Marcos Silva',
    phone: '+55 21 99876-1122',
    email: 'marcos@silvaengenharia.com',
    birthday: '10-22', // Aniversário em 5 dias
    company: 'Silva Engenharia & Automações',
    status: 'Ativo',
    notes: 'Reunião agendada hoje às 14h. Interessado no módulo de automação web.',
    lastContact: '2026-10-15',
  },
  {
    id: 3,
    name: 'Fernanda Rocha',
    phone: '+55 31 97654-3344',
    email: 'fernanda@rochatech.io',
    birthday: '11-04',
    company: 'Rocha Tech',
    status: 'Lead',
    notes: 'Pediu orçamento de agente de atendimento via WhatsApp.',
    lastContact: '2026-10-12',
  },
  {
    id: 4,
    name: 'Roberto Andrade',
    phone: '+55 41 98877-6655',
    email: 'roberto@andradelog.com.br',
    birthday: '10-18', // Amanhã
    company: 'Andrade Logística',
    status: 'Ativo',
    notes: 'Cliente que utiliza Kairós para conferência de planilhas e relatórios.',
    lastContact: '2026-10-14',
  },
];

let piPackages: PiPackage[] = [
  {
    id: 'kairos-agenda',
    name: 'kairos-agenda',
    version: '0.2.0',
    description: 'Agenda pessoal e profissional nativa Kairós com interpretação ISO 8601 em linguagem natural.',
    author: 'Kairós Team',
    category: 'Produtividade',
    enabled: true,
    source: 'official',
    tools: [
      { name: 'agenda:add', description: 'Adiciona compromisso com data, hora, categoria e prioridade.' },
      { name: 'agenda:list', description: 'Lista compromissos por período (hoje, amanhã, semana, mês).' },
      { name: 'agenda:complete', description: 'Marca compromisso como concluído.' },
    ],
  },
  {
    id: 'kairos-crm',
    name: 'kairos-crm',
    version: '0.1.8',
    description: 'Gestão de clientes, histórico de contato, status e detecção proativa de aniversariantes.',
    author: 'Kairós Team',
    category: 'Produtividade',
    enabled: true,
    source: 'official',
    tools: [
      { name: 'crm:add_client', description: 'Cadastra ou atualiza ficha de cliente e data de nascimento.' },
      { name: 'crm:list_birthdays', description: 'Lista aniversariantes de hoje ou próximos dias.' },
      { name: 'crm:search_client', description: 'Busca clientes por nome, telefone ou empresa.' },
    ],
  },
  {
    id: 'pi-web-access',
    name: 'pi-web-access',
    version: '1.4.2',
    description: 'Pacote oficial do pi.dev para pesquisa web em tempo real, extração de páginas e resumos.',
    author: 'earendil-works / pi.dev',
    category: 'Ferramentas Web',
    enabled: true,
    source: 'official',
    sourceUrl: 'https://pi.dev/packages?page=3&name=pi-web-access',
    tools: [
      { name: 'web:search', description: 'Pesquisa informações atualizadas na web.' },
      { name: 'web:scrape', description: 'Extrai texto limpo de artigos e links.' },
    ],
  },
  {
    id: 'kairos-memory',
    name: 'kairos-memory',
    version: '0.3.1',
    description: 'Memória de longo prazo persistente para guardar preferências e regras do usuário.',
    author: 'Kairós Team',
    category: 'Memória & IA',
    enabled: true,
    source: 'official',
    tools: [
      { name: 'memory:save', description: 'Salva preferências, senhas de Wi-Fi, notas e fatos do usuário.' },
      { name: 'memory:recall', description: 'Recupera memórias salvas com base na intenção da consulta.' },
    ],
  },
  {
    id: 'pi-condense',
    name: 'pi-condense',
    version: '0.9.0',
    description: 'Compressão e sumarização automática de histórico de conversas longas do agente.',
    author: 'pi-ecosystem',
    category: 'Memória & IA',
    enabled: true,
    source: 'official',
    sourceUrl: 'https://pi.dev/packages?page=3&name=pi-condense',
    tools: [
      { name: 'condense:context', description: 'Resume conversas extensas mantendo entidades-chave.' },
    ],
  },
  {
    id: 'pi-zip',
    name: 'pi-zip',
    version: '1.0.3',
    description: 'Gerenciamento inteligente de pacotes zip e backups de workspace na VPS.',
    author: 'pi-dev',
    category: 'Produtividade',
    enabled: false,
    source: 'official',
    tools: [
      { name: 'zip:compress', description: 'Compacta arquivos de agendamento e logs.' },
    ],
  },
  {
    id: 'pi-nolo',
    name: 'pi-nolo',
    version: '0.5.1',
    description: 'Guarda de segurança com confirmação explícita para ações destrutivas ou exclusões.',
    author: 'pi-dev',
    category: 'Segurança',
    enabled: true,
    source: 'official',
    tools: [
      { name: 'security:confirm', description: 'Solicita confirmação antes de apagar registros.' },
    ],
  },
  {
    id: 'kairos-finance',
    name: 'kairos-finance',
    version: '0.1.2',
    description: 'Controle rápido de receitas, orçamentos emitidos e pagamentos de clientes.',
    author: 'Kairós Team',
    category: 'Integrações',
    enabled: false,
    source: 'official',
    tools: [
      { name: 'finance:add_record', description: 'Registra valor recebido ou a receber.' },
      { name: 'finance:summary', description: 'Exibe balanço de pagamentos do mês.' },
    ],
  },
];

let memoryNotes: MemoryNote[] = [
  {
    id: 1,
    key: 'preferencia_atendimento',
    value: 'Prefere que mensagens de clientes sejam confirmadas antes de enviar.',
    category: 'Geral',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 2,
    key: 'horario_trabalho',
    value: 'Atendimento prioritário das 08h às 18h de segunda a sexta.',
    category: 'Agenda',
    updatedAt: new Date().toISOString(),
  },
];

// Helper: check birthdays
function getUpcomingBirthdays(daysAhead: number = 7) {
  const now = new Date();
  const currentMonth = now.getMonth() + 1; // 1-12
  const currentDay = now.getDate();

  return clientItems.filter((c) => {
    if (!c.birthday) return false;
    const parts = c.birthday.split('-');
    const bMonth = Number(parts.length === 3 ? parts[1] : parts[0]);
    const bDay = Number(parts.length === 3 ? parts[2] : parts[1]);

    if (bMonth === currentMonth && bDay === currentDay) {
      return true; // Hoje!
    }

    // Próximos dias
    for (let i = 1; i <= daysAhead; i++) {
      const checkDate = new Date();
      checkDate.setDate(now.getDate() + i);
      if (checkDate.getMonth() + 1 === bMonth && checkDate.getDate() === bDay) {
        return true;
      }
    }
    return false;
  });
}

// REST Endpoints
app.get('/api/data', (_req: Request, res: Response) => {
  res.json({
    agenda: agendaItems,
    clients: clientItems,
    packages: piPackages,
    memories: memoryNotes,
    upcomingBirthdays: getUpcomingBirthdays(7),
  });
});

// Agenda CRUD
app.post('/api/agenda', (req: Request, res: Response) => {
  const { title, datetime, category, priority, notes } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'Título do compromisso é obrigatório.' });
  }

  const newItem: AgendaItem = {
    id: Date.now(),
    title,
    datetime: datetime || new Date().toISOString(),
    category: category || 'Trabalho',
    priority: Number(priority) || 0,
    notes: notes || '',
    completed: false,
    createdAt: new Date().toISOString(),
  };

  agendaItems.unshift(newItem);
  res.status(201).json(newItem);
});

app.post('/api/agenda/:id/toggle', (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const item = agendaItems.find((a) => a.id === id);
  if (!item) return res.status(404).json({ error: 'Item não encontrado.' });

  item.completed = !item.completed;
  item.completedAt = item.completed ? new Date().toISOString() : undefined;
  res.json(item);
});

app.delete('/api/agenda/:id', (req: Request, res: Response) => {
  const id = Number(req.params.id);
  agendaItems = agendaItems.filter((a) => a.id !== id);
  res.json({ success: true, id });
});

// Client CRUD
app.post('/api/clients', (req: Request, res: Response) => {
  const { name, phone, email, birthday, company, notes, status } = req.body;
  if (!name) return res.status(400).json({ error: 'Nome do cliente é obrigatório.' });

  const newClient: ClientItem = {
    id: Date.now(),
    name,
    phone: phone || '',
    email: email || '',
    birthday: birthday || '',
    company: company || '',
    notes: notes || '',
    status: status || 'Ativo',
    lastContact: new Date().toISOString().split('T')[0],
  };

  clientItems.unshift(newClient);
  res.status(201).json(newClient);
});

app.delete('/api/clients/:id', (req: Request, res: Response) => {
  const id = Number(req.params.id);
  clientItems = clientItems.filter((c) => c.id !== id);
  res.json({ success: true, id });
});

// Pi Packages Endpoints
app.get('/api/pi/packages', (_req: Request, res: Response) => {
  res.json(piPackages);
});

app.post('/api/pi/packages/toggle', (req: Request, res: Response) => {
  const { packageId } = req.body;
  const pkg = piPackages.find((p) => p.id === packageId);
  if (!pkg) return res.status(404).json({ error: 'Pacote não encontrado.' });

  pkg.enabled = !pkg.enabled;
  res.json({ success: true, package: pkg });
});

app.post('/api/pi/packages/install', (req: Request, res: Response) => {
  const { packageNameOrUrl, category } = req.body;
  if (!packageNameOrUrl) return res.status(400).json({ error: 'Identificador do pacote é obrigatório.' });

  const cleanName = packageNameOrUrl.replace(/^(https?:\/\/github\.com\/|npm:)/, '').replace(/\.git$/, '');
  const id = cleanName.toLowerCase().replace(/[^a-z0-9_-]/g, '-');

  // Check if exists
  const existing = piPackages.find((p) => p.id === id);
  if (existing) {
    existing.enabled = true;
    return res.json({ success: true, package: existing, message: 'Pacote já instalado e agora ativado!' });
  }

  const isGit = packageNameOrUrl.includes('github.com') || packageNameOrUrl.endsWith('.git');
  const newPkg: PiPackage = {
    id,
    name: cleanName.split('/').pop() || cleanName,
    version: '1.0.0',
    description: `Extensão instalada via ${isGit ? 'repositório Git' : 'catálogo pi.dev / npm'}: ${packageNameOrUrl}`,
    author: isGit ? cleanName.split('/')[0] : 'Comunidade Pi',
    category: (category as any) || 'Produtividade',
    enabled: true,
    source: isGit ? 'git' : 'community',
    sourceUrl: packageNameOrUrl,
    tools: [
      { name: `${id}:run`, description: `Executa as rotinas do pacote ${cleanName}.` },
      { name: `${id}:config`, description: `Configurações de ambiente do pacote ${cleanName}.` },
    ],
    installCommand: `pi install ${packageNameOrUrl}`,
  };

  piPackages.push(newPkg);
  res.status(201).json({ success: true, package: newPkg });
});

// GEMINI ASSISTANT CHAT ROUTE
app.post('/api/assistant/chat', async (req: Request, res: Response) => {
  try {
    const { message, history } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Mensagem inválida.' });
    }

    if (!ai) {
      // Fallback local smart response if no API key is provided
      const localReply = handleLocalAssistant(message);
      return res.json({
        reply: localReply.text,
        toolCalls: localReply.toolCalls,
        updatedData: {
          agenda: agendaItems,
          clients: clientItems,
          packages: piPackages,
          upcomingBirthdays: getUpcomingBirthdays(7),
        },
      });
    }

    // Enabled packages tools definition
    const activePackages = piPackages.filter((p) => p.enabled);
    const hasAgenda = activePackages.some((p) => p.id === 'kairos-agenda');
    const hasCrm = activePackages.some((p) => p.id === 'kairos-crm');
    const hasMemory = activePackages.some((p) => p.id === 'kairos-memory');
    const hasWeb = activePackages.some((p) => p.id === 'pi-web-access');

    // Function declarations
    const functionDeclarations: any[] = [];

    if (hasAgenda) {
      functionDeclarations.push(
        {
          name: 'agenda_add',
          description: 'Cadastra um novo compromisso ou tarefa na agenda pessoal do Kairós.',
          parameters: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: 'Título claro do compromisso ou tarefa' },
              datetime: { type: Type.STRING, description: 'Data e hora no formato ISO 8601 (ex: 2026-10-18T14:00:00)' },
              category: { type: Type.STRING, description: 'Categoria: Trabalho, Pessoal, Cliente, Urgente, Saúde' },
              priority: { type: Type.INTEGER, description: 'Prioridade: 0 (normal), 1 (média), 2 (alta)' },
              notes: { type: Type.STRING, description: 'Anotações complementares ou orientações' },
            },
            required: ['title', 'datetime'],
          },
        },
        {
          name: 'agenda_list',
          description: 'Consulta os compromissos agendados por período.',
          parameters: {
            type: Type.OBJECT,
            properties: {
              period: { type: Type.STRING, description: 'Período desejado: today (hoje), tomorrow (amanhã), week (semana), month (mês), all (todos)' },
            },
          },
        },
        {
          name: 'agenda_complete',
          description: 'Marca um compromisso como concluído pelo ID ou busca de título.',
          parameters: {
            type: Type.OBJECT,
            properties: {
              query: { type: Type.STRING, description: 'Palavra-chave do compromisso a concluir' },
            },
            required: ['query'],
          },
        }
      );
    }

    if (hasCrm) {
      functionDeclarations.push(
        {
          name: 'crm_add_client',
          description: 'Cadastra ou atualiza um cliente, contato ou aniversariante no Kairós CRM.',
          parameters: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING, description: 'Nome completo do cliente ou contato' },
              phone: { type: Type.STRING, description: 'Telefone ou WhatsApp' },
              email: { type: Type.STRING, description: 'E-mail do cliente' },
              birthday: { type: Type.STRING, description: 'Data de aniversário (formato MM-DD ou YYYY-MM-DD)' },
              company: { type: Type.STRING, description: 'Empresa ou ramo de atividade' },
              notes: { type: Type.STRING, description: 'Observações, preferências ou histórico' },
              status: { type: Type.STRING, description: 'Status: Ativo, Lead, VIP, Pendente' },
            },
            required: ['name'],
          },
        },
        {
          name: 'crm_list_birthdays',
          description: 'Lista os aniversariantes de hoje ou dos próximos dias.',
          parameters: {
            type: Type.OBJECT,
            properties: {
              daysAhead: { type: Type.INTEGER, description: 'Quantos dias à frente verificar (padrão 7 dias)' },
            },
          },
        }
      );
    }

    if (hasMemory) {
      functionDeclarations.push({
        name: 'memory_save',
        description: 'Grava um fato importante, preferência ou nota do usuário na memória persistente.',
        parameters: {
          type: Type.OBJECT,
          properties: {
            key: { type: Type.STRING, description: 'Identificador do fato (ex: preferencia_cliente, meta_mes)' },
            value: { type: Type.STRING, description: 'O que deve ser lembrado com riqueza de detalhes' },
            category: { type: Type.STRING, description: 'Categoria da memória' },
          },
          required: ['key', 'value'],
        },
      });
    }

    const todayDateISO = new Date().toISOString();
    const todayStr = new Date().toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const systemInstruction = `
Você é o Kairós Super Assistente Pessoal e Profissional (versão PWA & Desktop), desenvolvido pela equipe Alves.
Seu lema: "Você pede. O Kairós faz."
Hoje é: ${todayStr} (${todayDateISO}).

SEU PROPÓSITO:
- Ser o braço direito do usuário no celular e no computador.
- Gerenciar com perfeição a agenda, lembretes de compromissos e tarefas.
- Cuidar dos clientes, registrando aniversários, contatos e lembrando de felicitá-los.
- Utilizar o ecossistema de pacotes modulares do pi.dev para expandir suas capacidades.
- Responder dúvidas, redigir mensagens para clientes e orientar na produtividade diária.

DIRETRIZES DE RESPOSTA:
1. Seja assertivo, ágil, educado e execute as ferramentas (Function Calling) sempre que o usuário pedir para agendar, cadastrar clientes, listar compromissos ou checar aniversários.
2. Sempre converta expressões relativas de tempo ("amanhã às 15h", "hoje às 18:30", "próxima terça") para ISO 8601 exato com base na data de hoje (${todayDateISO}).
3. Ao cadastrar compromissos ou clientes, forneça uma resposta calorosa confirmando os detalhes principais.
4. Fale em Português do Brasil natural e profissional.
`;

    // Build chat contents
    const contents: any[] = [];
    if (Array.isArray(history)) {
      for (const h of history.slice(-6)) {
        if (h.role === 'user' || h.role === 'assistant') {
          contents.push({
            role: h.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: h.content || '' }],
          });
        }
      }
    }
    contents.push({
      role: 'user',
      parts: [{ text: message }],
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
        tools: functionDeclarations.length > 0 ? [{ functionDeclarations }] : undefined,
      },
    });

    const toolCallsExecuted: any[] = [];
    const functionCalls = response.functionCalls;

    if (functionCalls && functionCalls.length > 0) {
      for (const call of functionCalls) {
        const name = call.name;
        const args = (call.args || {}) as Record<string, any>;
        if (name === 'agenda_add') {
          const newItem: AgendaItem = {
            id: Date.now(),
            title: args.title as string,
            datetime: args.datetime as string || new Date().toISOString(),
            category: (args.category as any) || 'Trabalho',
            priority: Number(args.priority) || 1,
            notes: (args.notes as string) || '',
            completed: false,
            createdAt: new Date().toISOString(),
          };
          agendaItems.unshift(newItem);
          toolCallsExecuted.push({ tool: 'agenda:add', result: newItem });
        } else if (name === 'agenda_list') {
          toolCallsExecuted.push({ tool: 'agenda:list', result: agendaItems.slice(0, 10) });
        } else if (name === 'agenda_complete') {
          const q = (args.query as string || '').toLowerCase();
          const target = agendaItems.find((a) => a.title.toLowerCase().includes(q) && !a.completed);
          if (target) {
            target.completed = true;
            target.completedAt = new Date().toISOString();
            toolCallsExecuted.push({ tool: 'agenda:complete', result: target });
          }
        } else if (name === 'crm_add_client') {
          const newClient: ClientItem = {
            id: Date.now(),
            name: args.name as string,
            phone: (args.phone as string) || '',
            email: (args.email as string) || '',
            birthday: (args.birthday as string) || '',
            company: (args.company as string) || '',
            notes: (args.notes as string) || '',
            status: (args.status as any) || 'Ativo',
            lastContact: new Date().toISOString().split('T')[0],
          };
          clientItems.unshift(newClient);
          toolCallsExecuted.push({ tool: 'crm:add_client', result: newClient });
        } else if (name === 'crm_list_birthdays') {
          const birthdays = getUpcomingBirthdays(Number(args.daysAhead) || 7);
          toolCallsExecuted.push({ tool: 'crm:list_birthdays', result: birthdays });
        } else if (name === 'memory_save') {
          const mem: MemoryNote = {
            id: Date.now(),
            key: args.key as string,
            value: args.value as string,
            category: (args.category as string) || 'Geral',
            updatedAt: new Date().toISOString(),
          };
          memoryNotes.unshift(mem);
          toolCallsExecuted.push({ tool: 'memory:save', result: mem });
        }
      }
    }

    let replyText = response.text || '';
    if (!replyText && toolCallsExecuted.length > 0) {
      const first = toolCallsExecuted[0];
      if (first.tool === 'agenda:add') {
        replyText = `Agendado com sucesso! "${first.result.title}" registrado para ${new Date(first.result.datetime).toLocaleString('pt-BR')}.`;
      } else if (first.tool === 'crm:add_client') {
        replyText = `Cliente "${first.result.name}" salvo no Kairós CRM com sucesso!`;
      } else if (first.tool === 'agenda:complete') {
        replyText = `Compromisso "${first.result.title}" marcado como concluído!`;
      } else {
        replyText = 'Ação executada com sucesso pelo Kairós.';
      }
    }

    return res.json({
      reply: replyText,
      toolCalls: toolCallsExecuted,
      updatedData: {
        agenda: agendaItems,
        clients: clientItems,
        packages: piPackages,
        upcomingBirthdays: getUpcomingBirthdays(7),
      },
    });
  } catch (error: any) {
    console.error('Error in /api/assistant/chat:', error);
    return res.status(500).json({
      error: 'Erro ao processar mensagem com o assistente.',
      details: error?.message || String(error),
    });
  }
});

// Fallback logic for when GEMINI_API_KEY is not configured yet
function handleLocalAssistant(message: string) {
  const lower = message.toLowerCase();
  const toolCalls: any[] = [];
  let text = '';

  if (lower.includes('agenda') || lower.includes('marcar') || lower.includes('reuni') || lower.includes('lembre')) {
    const newItem: AgendaItem = {
      id: Date.now(),
      title: message.replace(/^(agendar|marcar|lembre de|agende)\s+/i, '').trim() || 'Novo compromisso',
      datetime: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
      category: 'Trabalho',
      priority: 1,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    agendaItems.unshift(newItem);
    toolCalls.push({ tool: 'agenda:add', result: newItem });
    text = `Perfeito! Agendei "${newItem.title}" na sua agenda Kairós.`;
  } else if (lower.includes('aniversari') || lower.includes('aniversário')) {
    const bdays = getUpcomingBirthdays(7);
    toolCalls.push({ tool: 'crm:list_birthdays', result: bdays });
    if (bdays.length > 0) {
      text = `Temos ${bdays.length} aniversariante(s) próximo(s): ${bdays.map((b) => `${b.name} (${b.birthday})`).join(', ')}.`;
    } else {
      text = 'Nenhum aniversariante encontrado nos próximos 7 dias.';
    }
  } else if (lower.includes('cliente') && (lower.includes('novo') || lower.includes('cadastrar') || lower.includes('adicionar'))) {
    const newClient: ClientItem = {
      id: Date.now(),
      name: message.replace(/.*cliente\s+/i, '').trim() || 'Novo Cliente',
      company: 'Empresa',
      status: 'Ativo',
      lastContact: new Date().toISOString().split('T')[0],
    };
    clientItems.unshift(newClient);
    toolCalls.push({ tool: 'crm:add_client', result: newClient });
    text = `Cliente "${newClient.name}" cadastrado com sucesso no Kairós CRM.`;
  } else {
    text = `Olá! Sou o Kairós Super Assistente. Posso guardar sua agenda, monitorar clientes, avisar sobre aniversariantes e gerenciar seus pacotes do pi.dev. Como posso te ajudar agora?`;
  }

  return { text, toolCalls };
}

// Start Server with Vite middlewares in Dev, or Static Serve in Prod
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== 'true' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve('dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve('dist/index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Kairós Super Assistente PWA & Desktop rodando na porta ${PORT}`);
  });
}

startServer();
