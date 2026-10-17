import React from 'react';
import { LayoutDashboard, MessageSquare, Calendar, Users, Package } from 'lucide-react';
import { ActiveTab } from '../types';

interface BottomNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  unreadCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'dashboard' as ActiveTab, label: 'Início', icon: LayoutDashboard },
    { id: 'chat' as ActiveTab, label: 'Assistente', icon: MessageSquare, highlight: true },
    { id: 'agenda' as ActiveTab, label: 'Agenda', icon: Calendar },
    { id: 'clients' as ActiveTab, label: 'Clientes', icon: Users },
    { id: 'packages' as ActiveTab, label: 'Pacotes Pi', icon: Package },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-lg border-t border-slate-800/80 lg:hidden px-2 pb-[env(safe-area-inset-bottom)]">
      <div className="grid grid-cols-5 items-center h-16 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center min-h-[48px] min-w-[48px] rounded-xl transition-all relative ${
                isActive ? 'text-indigo-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.highlight && isActive && (
                <div className="absolute -top-1 w-8 h-1 bg-indigo-500 rounded-full shadow-sm shadow-indigo-500" />
              )}
              <div className={`p-1 rounded-lg ${isActive ? 'bg-indigo-500/10' : ''}`}>
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-[64px]">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
