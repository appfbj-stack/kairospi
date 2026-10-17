import React, { useState } from 'react';
import { 
  Calendar, 
  Cake, 
  Users, 
  Package, 
  Sparkles, 
  ArrowRight, 
  Clock, 
  CheckCircle2, 
  Circle, 
  Plus, 
  Send, 
  Phone, 
  MessageSquareShare,
  Check,
  ChevronRight
} from 'lucide-react';
import { AgendaItem, ClientItem, PiPackage, ActiveTab } from '../types';

interface DashboardViewProps {
  agenda: AgendaItem[];
  clients: ClientItem[];
  packages: PiPackage[];
  upcomingBirthdays: ClientItem[];
  setActiveTab: (tab: ActiveTab) => void;
  onToggleAgenda: (id: number) => void;
  onOpenNewAgendaModal: () => void;
  onSendQuickChat: (message: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  agenda,
  clients,
  packages,
  upcomingBirthdays,
  setActiveTab,
  onToggleAgenda,
  onOpenNewAgendaModal,
  onSendQuickChat,
}) => {
  const [quickPrompt, setQuickPrompt] = useState('');
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const pendingAgenda = agenda.filter((a) => !a.completed);
  const activePackages = packages.filter((p) => p.enabled);

  const todayStr = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickPrompt.trim()) return;
    onSendQuickChat(quickPrompt.trim());
    setQuickPrompt('');
  };

  const handleCopyGreeting = (client: ClientItem) => {
    const text = `Olá ${client.name.split(' ')[0]}! Tudo bem? Aqui é do Kairós / Equipe Alves. Passando para desejar um feliz aniversário, muita saúde, sucesso e realizações para você! Grande abraço! 🎉🎂`;
    navigator.clipboard.writeText(text);
    setCopiedId(client.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-8 max-w-6xl mx-auto">
      {/* Hero Greeting & Quick Action Box */}
      <section className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 relative overflow-hidden">
        <div className="relative z-10 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <span className="text-xs font-medium text-indigo-400 capitalize">
                {todayStr}
              </span>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-['Plus_Jakarta_Sans'] mt-0.5">
                Olá! Seu assistente Kairós está ativo.
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-emerald-300 bg-emerald-950/60 border border-emerald-800/80 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                VPS Online
              </span>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Você pede, o Kairós faz. Digite ou dite um comando em linguagem natural para agendar reuniões, lembrar aniversários ou ativar ferramentas do pi.dev.
          </p>

          {/* Quick AI Command Input */}
          <form onSubmit={handleQuickSubmit} className="relative flex items-center">
            <div className="absolute left-3.5 text-indigo-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={quickPrompt}
              onChange={(e) => setQuickPrompt(e.target.value)}
              placeholder="Ex: 'Lembre-me de ligar para Marcos amanhã às 14h' ou 'Quem faz aniversário hoje?'"
              className="w-full pl-10 pr-24 py-3 text-xs sm:text-sm bg-slate-950/80 border border-slate-700/80 rounded-xl text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all shadow-inner"
            />
            <button
              type="submit"
              disabled={!quickPrompt.trim()}
              className="absolute right-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 rounded-lg transition-colors flex items-center gap-1 min-h-[32px]"
            >
              <span>Enviar</span>
              <Send className="w-3 h-3" />
            </button>
          </form>
        </div>
      </section>

      {/* 4-Item KPI / Summary Strip */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div 
          onClick={() => setActiveTab('agenda')}
          className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/90 hover:border-slate-700 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Compromissos</span>
            <Calendar className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-white">
            {pendingAgenda.length}
          </div>
          <span className="text-[11px] text-slate-500">Pendentes na agenda</span>
        </div>

        <div 
          onClick={() => setActiveTab('clients')}
          className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/90 hover:border-slate-700 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Aniversários</span>
            <Cake className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-amber-300">
            {upcomingBirthdays.length}
          </div>
          <span className="text-[11px] text-slate-500">Nesta semana</span>
        </div>

        <div 
          onClick={() => setActiveTab('clients')}
          className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/90 hover:border-slate-700 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Clientes & Leads</span>
            <Users className="w-4 h-4 text-sky-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-white">
            {clients.length}
          </div>
          <span className="text-[11px] text-slate-500">Cadastrados no CRM</span>
        </div>

        <div 
          onClick={() => setActiveTab('packages')}
          className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/90 hover:border-slate-700 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Pacotes Pi.dev</span>
            <Package className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-emerald-400">
            {activePackages.length} <span className="text-xs font-normal text-slate-500">/ {packages.length}</span>
          </div>
          <span className="text-[11px] text-slate-500">Extensões ativas</span>
        </div>
      </section>

      {/* Main Grid: Upcoming Birthdays Spotlight & Priority Agenda */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spotlight: Aniversariantes de Clientes */}
        <section className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800/90 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
                <Cake className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-semibold text-white">
                Aniversários Próximos
              </h2>
            </div>
            <button
              onClick={() => setActiveTab('clients')}
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium"
            >
              Ver clientes <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {upcomingBirthdays.length === 0 ? (
            <div className="p-6 text-center rounded-xl bg-slate-950/40 border border-slate-800/60 text-slate-500 text-xs">
              Nenhum aniversário cadastrado para os próximos 7 dias.
            </div>
          ) : (
            <div className="space-y-2.5">
              {upcomingBirthdays.map((client) => {
                const now = new Date();
                const isToday = client.birthday?.includes(`${now.getMonth() + 1 < 10 ? '0' : ''}${now.getMonth() + 1}-${now.getDate() < 10 ? '0' : ''}${now.getDate()}`);

                return (
                  <div
                    key={client.id}
                    className={`p-3.5 rounded-xl border transition-colors flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${
                      isToday
                        ? 'bg-amber-950/30 border-amber-800/60'
                        : 'bg-slate-950/50 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-100">
                          {client.name}
                        </span>
                        {isToday && (
                          <span className="text-[10px] font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full">
                            Hoje! 🎉
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                        {client.company && <span>{client.company}</span>}
                        {client.company && <span>·</span>}
                        <span className="font-mono">Data: {client.birthday}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                      <button
                        onClick={() => handleCopyGreeting(client)}
                        className="px-2.5 py-1 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1 min-h-[30px]"
                        title="Copiar mensagem personalizada de felicitação"
                      >
                        {copiedId === client.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400 text-[11px]">Copiado!</span>
                          </>
                        ) : (
                          <>
                            <MessageSquareShare className="w-3 h-3 text-indigo-400" />
                            <span className="text-[11px]">Mensagem IA</span>
                          </>
                        )}
                      </button>

                      {client.phone && (
                        <a
                          href={`https://wa.me/${client.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Olá ${client.name.split(' ')[0]}! Desejo um feliz aniversário com muita saúde e sucesso! Abraço da equipe!`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-emerald-400 bg-emerald-950/40 border border-emerald-800/60 hover:bg-emerald-900/50 rounded-lg transition-colors"
                          title="Enviar WhatsApp"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Priority Agenda Tasks */}
        <section className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800/90 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
                <Clock className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-semibold text-white">
                Compromissos Recentes
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenNewAgendaModal}
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5 font-medium"
              >
                <Plus className="w-3.5 h-3.5" /> Adicionar
              </button>
              <span className="text-slate-600">·</span>
              <button
                onClick={() => setActiveTab('agenda')}
                className="text-xs text-slate-400 hover:text-slate-200 font-medium"
              >
                Ver todos
              </button>
            </div>
          </div>

          {agenda.length === 0 ? (
            <div className="p-6 text-center rounded-xl bg-slate-950/40 border border-slate-800/60 text-slate-500 text-xs">
              Nenhum compromisso agendado. Use o botão acima para adicionar.
            </div>
          ) : (
            <div className="space-y-2">
              {agenda.slice(0, 4).map((item) => {
                const dateObj = new Date(item.datetime);
                const dateFormatted = !isNaN(dateObj.getTime())
                  ? dateObj.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) + ' às ' + dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
                  : item.datetime;

                return (
                  <div
                    key={item.id}
                    className={`p-3 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                      item.completed
                        ? 'bg-slate-950/30 border-slate-800/40 opacity-60'
                        : 'bg-slate-950/50 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <button
                        onClick={() => onToggleAgenda(item.id)}
                        className="mt-0.5 text-slate-400 hover:text-indigo-400 transition-colors"
                      >
                        {item.completed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Circle className="w-4 h-4" />
                        )}
                      </button>
                      <div>
                        <div className={`text-xs font-medium ${item.completed ? 'line-through text-slate-400' : 'text-slate-200'}`}>
                          {item.title}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                          <span className="font-mono tabular-nums">{dateFormatted}</span>
                          <span>·</span>
                          <span className="text-indigo-300/80">{item.category}</span>
                        </div>
                      </div>
                    </div>

                    {item.priority === 2 && !item.completed && (
                      <span className="text-[9px] font-bold uppercase tracking-wider text-rose-300 bg-rose-500/20 px-1.5 py-0.5 rounded shrink-0">
                        Urgente
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* Quick Access to Pi Packages */}
      <section className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-semibold text-white">
              Extensões Pi Ativas no PWA
            </h2>
          </div>
          <button
            onClick={() => setActiveTab('packages')}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
          >
            Gerenciar no pi.dev <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
          {activePackages.slice(0, 6).map((pkg) => (
            <div
              key={pkg.id}
              className="p-3 rounded-xl bg-slate-950/50 border border-slate-800 flex items-center justify-between text-xs"
            >
              <div>
                <span className="font-mono text-slate-200 font-medium">{pkg.name}</span>
                <p className="text-[10px] text-slate-400 truncate max-w-[180px] mt-0.5">{pkg.category}</p>
              </div>
              <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full font-mono">
                {pkg.tools.length} tools
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
