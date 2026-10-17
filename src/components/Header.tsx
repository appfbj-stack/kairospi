import React from 'react';
import { Download, Sparkles, Plus, Clock } from 'lucide-react';
import { ActiveTab } from '../types';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenNewAgendaModal: () => void;
  isInstallable: boolean;
  installApp: () => void;
  isInstalled: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenNewAgendaModal,
  isInstallable,
  installApp,
  isInstalled,
}) => {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-4 px-4 sm:px-6 py-3.5 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80">
      {/* Zone 1: Single text element wordmark */}
      <div 
        onClick={() => setActiveTab('dashboard')} 
        className="flex items-center gap-2.5 cursor-pointer whitespace-nowrap shrink-0 group"
      >
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-400 p-[1px] shadow-sm shadow-indigo-500/20">
          <div className="w-full h-full bg-slate-950 rounded-[7px] flex items-center justify-center">
            <Clock className="w-4 h-4 text-sky-400 transition-transform group-hover:rotate-12" />
          </div>
        </div>
        <div className="flex flex-col">
          <span className="text-base font-bold tracking-tight text-white font-['Plus_Jakarta_Sans'] leading-none">
            Kairós
          </span>
          <span className="text-[10px] text-slate-400 font-medium tracking-wide">
            Super Assistente
          </span>
        </div>
      </div>

      {/* Zone 2: Desktop Navigation Links (hidden on mobile, shown on lg screens) */}
      <nav className="hidden lg:flex items-center gap-1 text-sm font-medium">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-3.5 py-1.5 rounded-lg transition-colors whitespace-nowrap text-xs font-medium ${
            activeTab === 'dashboard'
              ? 'bg-slate-800 text-white shadow-xs'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
          }`}
        >
          Visão Geral
        </button>
        <button
          onClick={() => setActiveTab('chat')}
          className={`px-3.5 py-1.5 rounded-lg transition-colors whitespace-nowrap text-xs font-medium flex items-center gap-1.5 ${
            activeTab === 'chat'
              ? 'bg-indigo-600 text-white shadow-xs shadow-indigo-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          Assistente IA
        </button>
        <button
          onClick={() => setActiveTab('agenda')}
          className={`px-3.5 py-1.5 rounded-lg transition-colors whitespace-nowrap text-xs font-medium ${
            activeTab === 'agenda'
              ? 'bg-slate-800 text-white shadow-xs'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
          }`}
        >
          Agenda
        </button>
        <button
          onClick={() => setActiveTab('clients')}
          className={`px-3.5 py-1.5 rounded-lg transition-colors whitespace-nowrap text-xs font-medium ${
            activeTab === 'clients'
              ? 'bg-slate-800 text-white shadow-xs'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
          }`}
        >
          Clientes & Aniversários
        </button>
        <button
          onClick={() => setActiveTab('packages')}
          className={`px-3.5 py-1.5 rounded-lg transition-colors whitespace-nowrap text-xs font-medium ${
            activeTab === 'packages'
              ? 'bg-slate-800 text-white shadow-xs'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
          }`}
        >
          Pacotes Pi.dev
        </button>
      </nav>

      {/* Zone 3: Actions */}
      <div className="flex items-center gap-2 shrink-0">
        {/* PWA Install Button when available */}
        {isInstallable && !isInstalled && (
          <button
            onClick={installApp}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-sky-300 bg-sky-950/60 border border-sky-800/80 rounded-lg hover:bg-sky-900/50 transition-colors whitespace-nowrap min-h-[36px]"
            title="Instalar Kairós no celular ou computador"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Instalar App</span>
          </button>
        )}

        {/* Quick Add Agenda Button */}
        <button
          onClick={onOpenNewAgendaModal}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 transition-colors shadow-sm shadow-indigo-600/30 whitespace-nowrap min-h-[36px] active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Compromisso</span>
        </button>
      </div>
    </header>
  );
};
