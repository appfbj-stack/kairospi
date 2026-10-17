/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';
import { DashboardView } from './components/DashboardView';
import { ChatView } from './components/ChatView';
import { AgendaView } from './components/AgendaView';
import { ClientsView } from './components/ClientsView';
import { PackagesView } from './components/PackagesView';
import { usePWAInstall } from './hooks/usePWAInstall';
import { ActiveTab, AgendaItem, ClientItem, PiPackage, ChatMessage } from './types';
import { Download, Sparkles, X, Smartphone, Monitor } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [agenda, setAgenda] = useState<AgendaItem[]>([]);
  const [clients, setClients] = useState<ClientItem[]>([]);
  const [packages, setPackages] = useState<PiPackage[]>([]);
  const [upcomingBirthdays, setUpcomingBirthdays] = useState<ClientItem[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isNewAgendaModalOpen, setIsNewAgendaModalOpen] = useState(false);
  const [showInstallBanner, setShowInstallBanner] = useState(true);

  const { isInstallable, isInstalled, installApp } = usePWAInstall();

  // Load initial state from backend API
  const fetchData = async () => {
    try {
      const res = await fetch('/api/data');
      if (res.ok) {
        const data = await res.json();
        setAgenda(data.agenda || []);
        setClients(data.clients || []);
        setPackages(data.packages || []);
        setUpcomingBirthdays(data.upcomingBirthdays || []);
      }
    } catch (err) {
      console.warn('Backend data load error:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Send message to assistant
  const handleSendMessage = async (text: string) => {
    const userMsg: ChatMessage = {
      id: 'usr-' + Date.now(),
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsChatLoading(true);

    try {
      const history = messages.slice(-5).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}`);
      }

      const data = await res.json();

      const assistantMsg: ChatMessage = {
        id: 'ast-' + Date.now(),
        role: 'assistant',
        content: data.reply || 'Comando processado com sucesso pelo Kairós.',
        timestamp: new Date().toISOString(),
        toolInvocations: data.toolCalls,
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // Update state if returned by backend
      if (data.updatedData) {
        if (data.updatedData.agenda) setAgenda(data.updatedData.agenda);
        if (data.updatedData.clients) setClients(data.updatedData.clients);
        if (data.updatedData.packages) setPackages(data.updatedData.packages);
        if (data.updatedData.upcomingBirthdays) setUpcomingBirthdays(data.updatedData.upcomingBirthdays);
      }
    } catch (err) {
      console.error('Error sending chat message:', err);
      const errorMsg: ChatMessage = {
        id: 'err-' + Date.now(),
        role: 'assistant',
        content: 'Desculpe, ocorreu uma instabilidade ao conectar ao servidor do assistente. Tente novamente em instantes.',
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleQuickChat = (prompt: string) => {
    setActiveTab('chat');
    handleSendMessage(prompt);
  };

  // Agenda operations
  const handleToggleAgenda = async (id: number) => {
    // Optimistic UI update
    setAgenda((prev) =>
      prev.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item))
    );

    try {
      const res = await fetch(`/api/agenda/${id}/toggle`, { method: 'POST' });
      if (res.ok) {
        const updated = await res.json();
        setAgenda((prev) => prev.map((item) => (item.id === id ? updated : item)));
      }
    } catch (err) {
      console.error(err);
      fetchData();
    }
  };

  const handleDeleteAgenda = async (id: number) => {
    setAgenda((prev) => prev.filter((item) => item.id !== id));
    try {
      await fetch(`/api/agenda/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.error(err);
      fetchData();
    }
  };

  const handleAddAgenda = async (item: Omit<AgendaItem, 'id' | 'completed' | 'createdAt'>) => {
    try {
      const res = await fetch('/api/agenda', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
      if (res.ok) {
        const created = await res.json();
        setAgenda((prev) => [created, ...prev]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Client operations
  const handleAddClient = async (client: Omit<ClientItem, 'id' | 'lastContact'>) => {
    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(client),
      });
      if (res.ok) {
        const created = await res.json();
        setClients((prev) => [created, ...prev]);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteClient = async (id: number) => {
    setClients((prev) => prev.filter((c) => c.id !== id));
    try {
      await fetch(`/api/clients/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  // Package operations
  const handleTogglePackage = async (packageId: string) => {
    setPackages((prev) =>
      prev.map((p) => (p.id === packageId ? { ...p, enabled: !p.enabled } : p))
    );

    try {
      const res = await fetch('/api/pi/packages/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageId }),
      });
      if (res.ok) {
        const data = await res.json();
        setPackages((prev) => prev.map((p) => (p.id === packageId ? data.package : p)));
      }
    } catch (err) {
      console.error(err);
      fetchData();
    }
  };

  const handleInstallPackage = async (packageNameOrUrl: string, category: string) => {
    const res = await fetch('/api/pi/packages/install', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ packageNameOrUrl, category }),
    });

    if (!res.ok) {
      throw new Error('Falha ao instalar pacote.');
    }

    const data = await res.json();
    if (data.package) {
      setPackages((prev) => {
        const exists = prev.some((p) => p.id === data.package.id);
        return exists ? prev.map((p) => (p.id === data.package.id ? data.package : p)) : [...prev, data.package];
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['DM_Sans'] antialiased">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewAgendaModal={() => setIsNewAgendaModalOpen(true)}
        isInstallable={isInstallable}
        installApp={installApp}
        isInstalled={isInstalled}
      />

      {/* PWA Smart Install Banner (Non-intrusive) */}
      {isInstallable && !isInstalled && showInstallBanner && (
        <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-sky-950 border-b border-indigo-900/60 px-4 py-2 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-slate-200">
            <Smartphone className="w-4 h-4 text-sky-400 shrink-0" />
            <span>
              <strong>Kairós PWA:</strong> Instale o app no seu celular ou computador para acesso instantâneo e offline.
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={installApp}
              className="px-3 py-1 font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors flex items-center gap-1"
            >
              <Download className="w-3 h-3" />
              <span>Instalar</span>
            </button>
            <button
              onClick={() => setShowInstallBanner(false)}
              className="text-slate-400 hover:text-slate-200 p-1"
              title="Fechar banner"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Body */}
      <div className="flex-1 flex max-w-[1600px] w-full mx-auto">
        {/* Desktop Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          packages={packages}
          upcomingBirthdays={upcomingBirthdays}
          agenda={agenda}
          onOpenNewAgendaModal={() => setIsNewAgendaModalOpen(true)}
        />

        {/* Viewport Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <DashboardView
              agenda={agenda}
              clients={clients}
              packages={packages}
              upcomingBirthdays={upcomingBirthdays}
              setActiveTab={setActiveTab}
              onToggleAgenda={handleToggleAgenda}
              onOpenNewAgendaModal={() => setIsNewAgendaModalOpen(true)}
              onSendQuickChat={handleQuickChat}
            />
          )}

          {activeTab === 'chat' && (
            <ChatView
              messages={messages}
              onSendMessage={handleSendMessage}
              isLoading={isChatLoading}
              onClearHistory={() => setMessages([])}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'agenda' && (
            <AgendaView
              agenda={agenda}
              onToggleAgenda={handleToggleAgenda}
              onDeleteAgenda={handleDeleteAgenda}
              onAddAgenda={handleAddAgenda}
              isModalOpen={isNewAgendaModalOpen}
              setIsModalOpen={setIsNewAgendaModalOpen}
            />
          )}

          {activeTab === 'clients' && (
            <ClientsView
              clients={clients}
              onAddClient={handleAddClient}
              onDeleteClient={handleDeleteClient}
            />
          )}

          {activeTab === 'packages' && (
            <PackagesView
              packages={packages}
              onTogglePackage={handleTogglePackage}
              onInstallPackage={handleInstallPackage}
            />
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}
