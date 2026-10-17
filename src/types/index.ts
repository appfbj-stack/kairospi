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

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  toolInvocations?: {
    tool: string;
    result: any;
  }[];
}

export type ActiveTab = 'dashboard' | 'chat' | 'agenda' | 'clients' | 'packages';
