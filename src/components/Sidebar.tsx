import React from 'react';
import { 
  LayoutDashboard, 
  Sparkles, 
  Calendar, 
  Users, 
  Package, 
  Cake, 
  HardDrive, 
  CheckCircle2, 
  Plus,
  ExternalLink
} from 'lucide-react';
import { ActiveTab, PiPackage, ClientItem, AgendaItem } from '../types';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  packages: PiPackage[];
  upcomingBirthdays: ClientItem[];
  agenda: AgendaItem[];
  onOpenNewAgendaModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  packages,
  upcomingBirthdays,
  agenda,
  onOpenNewAgendaModal,
}) => {
  const activePackagesCount = packages.filter((p) => p.enabled).length;
  const pendingTasksCount = agenda.filter((a) => !a.completed).length;

  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 bg-slate-900/40 border-r border-slate-800/80 p-4 h-[calc(100vh-57px)] sticky top-[57px] justify-between">
      <div className="space-y-6">
        {/* Navigation list */}
        <div className="space-y-1">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-colors ${
              activeTab === 'dashboard'
                ? 'bg-indigo-600/15 text-indigo-400 font-semibold border border-indigo-500/20'
                : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <LayoutDashboard className="w-4 h-4 text-slate-400" />
              <span>Visão Geral</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('chat')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-colors ${
              activeTab === 'chat'
                ? 'bg-indigo-600 text-white font-semibold shadow-xs shadow-indigo-600/30'
                : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Assistente Kairós</span>
            </div>
            <span className="text-[10px] bg-indigo-500/30 text-indigo-200 px-1.5 py-0.5 rounded-md font-mono">
              IA
            </span>
          </button>

          <button
            onClick={() => setActiveTab('agenda')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-colors ${
              activeTab === 'agenda'
                ? 'bg-indigo-600/15 text-indigo-400 font-semibold border border-indigo-500/20'
                : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>Agenda de Tarefas</span>
            </div>
            {pendingTasksCount > 0 && (
              <span className="text-[11px] font-mono tabular-nums bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full">
                {pendingTasksCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('clients')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-colors ${
              activeTab === 'clients'
                ? 'bg-indigo-600/15 text-indigo-400 font-semibold border border-indigo-500/20'
                : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Users className="w-4 h-4 text-slate-400" />
              <span>Clientes & Contatos</span>
            </div>
            {upcomingBirthdays.length > 0 && (
              <div className="flex items-center gap-1 text-[10px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded-md">
                <Cake className="w-3 h-3" />
                <span className="font-mono">{upcomingBirthdays.length}</span>
              </div>
            )}
          </button>

          <button
            onClick={() => setActiveTab('packages')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-colors ${
              activeTab === 'packages'
                ? 'bg-indigo-600/15 text-indigo-400 font-semibold border border-indigo-500/20'
                : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Package className="w-4 h-4 text-slate-400" />
              <span>Pacotes pi.dev</span>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-md">
              {activePackagesCount} ativos
            </span>
          </button>
        </div>

        {/* Quick Agenda Add Card */}
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-200">Ação Rápida</span>
            <Plus className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Organize reuniões, entregas de clientes e alertas diários.
          </p>
          <button
            onClick={onOpenNewAgendaModal}
            className="w-full py-1.5 px-3 text-xs font-medium text-white bg-slate-800 hover:bg-slate-700/80 border border-slate-700 rounded-lg transition-colors flex items-center justify-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Adicionar Evento</span>
          </button>
        </div>

        {/* pi.dev ecosystem badge */}
        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 space-y-1.5">
          <div className="flex items-center justify-between text-slate-300 font-medium">
            <span className="flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5 text-sky-400" />
              Servidor VPS Dokploy
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
          </div>
          <p className="text-[10px] text-slate-500 leading-tight">
            Compatível com o catálogo de 5.000+ extensões do pi.dev.
          </p>
          <a
            href="https://pi.dev/packages?page=3"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[10px] text-sky-400 hover:underline pt-1"
          >
            Ver catálogo pi.dev <ExternalLink className="w-2.5 h-2.5" />
          </a>
        </div>
      </div>

      {/* Footer Info */}
      <div className="pt-4 border-t border-slate-800/60 text-[11px] text-slate-500 flex items-center justify-between">
        <span>Kairós v0.5.0 PWA</span>
        <span className="text-slate-400">Equipe Alves</span>
      </div>
    </aside>
  );
};
