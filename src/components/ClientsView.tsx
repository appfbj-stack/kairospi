import React, { useState } from 'react';
import { 
  Users, 
  Cake, 
  Search, 
  Plus, 
  Phone, 
  Mail, 
  Building, 
  MessageSquare, 
  Trash2, 
  X, 
  Check, 
  Gift,
  ExternalLink
} from 'lucide-react';
import { ClientItem } from '../types';

interface ClientsViewProps {
  clients: ClientItem[];
  onAddClient: (client: Omit<ClientItem, 'id' | 'lastContact'>) => void;
  onDeleteClient: (id: number) => void;
}

export const ClientsView: React.FC<ClientsViewProps> = ({
  clients,
  onAddClient,
  onDeleteClient,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [birthdayMonth, setBirthdayMonth] = useState('10');
  const [birthdayDay, setBirthdayDay] = useState('17');
  const [hasBirthday, setHasBirthday] = useState(true);
  const [company, setCompany] = useState('');
  const [status, setStatus] = useState<'Ativo' | 'Lead' | 'Pendente' | 'VIP'>('Ativo');
  const [notes, setNotes] = useState('');

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const bday = hasBirthday
      ? `${birthdayMonth.padStart(2, '0')}-${birthdayDay.padStart(2, '0')}`
      : undefined;

    onAddClient({
      name: name.trim(),
      phone: phone.trim() || undefined,
      email: email.trim() || undefined,
      birthday: bday,
      company: company.trim() || undefined,
      status,
      notes: notes.trim() || undefined,
    });

    setName('');
    setPhone('');
    setEmail('');
    setCompany('');
    setNotes('');
    setIsModalOpen(false);
  };

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentDay = now.getDate();

  const handleCopyGreeting = (client: ClientItem) => {
    const text = `Olá ${client.name.split(' ')[0]}! Aqui é a equipe Alves / Kairós. Desejamos a você um felicíssimo aniversário, repleto de saúde, conquistas e prosperidade! Parabéns pelo seu dia! 🎉🎂`;
    navigator.clipboard.writeText(text);
    setCopiedId(client.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const filteredClients = clients.filter((c) => {
    if (searchTerm.trim()) {
      const match = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.company && c.company.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (c.phone && c.phone.includes(searchTerm));
      if (!match) return false;
    }

    if (statusFilter !== 'all' && c.status !== statusFilter) {
      return false;
    }

    return true;
  });

  return (
    <div className="space-y-6 pb-20 lg:pb-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-['Plus_Jakarta_Sans']">
            Clientes & Aniversários (Kairós CRM)
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Cadastre contatos, datas comemorativas e estreite o relacionamento com seus clientes.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors shadow-sm shadow-indigo-600/30 whitespace-nowrap min-h-[44px] sm:min-h-[38px] active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Cliente</span>
        </button>
      </div>

      {/* Search & Status Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome, telefone ou empresa..."
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-900 border border-slate-800 rounded-xl text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          />
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl overflow-x-auto">
          {['all', 'VIP', 'Ativo', 'Lead', 'Pendente'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {st === 'all' ? 'Todos' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Clients Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredClients.length === 0 ? (
          <div className="col-span-full p-8 text-center rounded-2xl bg-slate-900/40 border border-slate-800 text-slate-500 text-xs sm:text-sm space-y-2">
            <Users className="w-8 h-8 mx-auto text-slate-600 mb-2" />
            <p>Nenhum cliente encontrado com os filtros atuais.</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="text-indigo-400 hover:underline font-medium inline-block"
            >
              Cadastrar novo contato
            </button>
          </div>
        ) : (
          filteredClients.map((client) => {
            // Check birthday status
            let isBirthdayToday = false;
            let isBirthdayThisMonth = false;
            if (client.birthday) {
              const parts = client.birthday.split('-');
              const bMonth = Number(parts.length === 3 ? parts[1] : parts[0]);
              const bDay = Number(parts.length === 3 ? parts[2] : parts[1]);
              isBirthdayToday = bMonth === currentMonth && bDay === currentDay;
              isBirthdayThisMonth = bMonth === currentMonth;
            }

            return (
              <div
                key={client.id}
                className={`p-4 rounded-2xl border transition-all space-y-3 ${
                  isBirthdayToday
                    ? 'bg-amber-950/20 border-amber-800/80 shadow-md shadow-amber-950/20'
                    : 'bg-slate-900/60 border-slate-800/90 hover:border-slate-700'
                }`}
              >
                {/* Top header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-bold text-white">
                        {client.name}
                      </h3>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        client.status === 'VIP'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : client.status === 'Ativo'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : client.status === 'Lead'
                          ? 'bg-sky-500/20 text-sky-300'
                          : 'bg-slate-700/50 text-slate-300'
                      }`}>
                        {client.status}
                      </span>
                    </div>

                    {client.company && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <Building className="w-3.5 h-3.5 text-slate-500" />
                        <span>{client.company}</span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => onDeleteClient(client.id)}
                    className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-800 transition-colors shrink-0"
                    title="Excluir cliente"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Birthday Banner */}
                {client.birthday && (
                  <div className={`p-2.5 rounded-xl flex items-center justify-between text-xs ${
                    isBirthdayToday
                      ? 'bg-amber-500/20 text-amber-200 border border-amber-500/30 font-semibold'
                      : isBirthdayThisMonth
                      ? 'bg-indigo-950/40 text-indigo-200 border border-indigo-900/40'
                      : 'bg-slate-950/60 text-slate-400 border border-slate-800/60'
                  }`}>
                    <div className="flex items-center gap-2">
                      <Cake className={`w-4 h-4 ${isBirthdayToday ? 'text-amber-400 animate-bounce' : 'text-slate-400'}`} />
                      <span>Aniversário: <strong className="font-mono">{client.birthday}</strong></span>
                      {isBirthdayToday && <span className="ml-1 text-amber-300 font-bold">Hoje! 🎉</span>}
                    </div>

                    <button
                      onClick={() => handleCopyGreeting(client)}
                      className="px-2 py-1 text-[11px] font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors flex items-center gap-1"
                      title="Copiar mensagem personalizada de felicitação"
                    >
                      {copiedId === client.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Gift className="w-3 h-3 text-amber-400" />
                          <span>Felicitar IA</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Contact info & Notes */}
                <div className="space-y-1.5 text-xs text-slate-300">
                  {client.phone && (
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-slate-400">
                        <Phone className="w-3.5 h-3.5 text-slate-500" />
                        <span className="font-mono">{client.phone}</span>
                      </span>
                      <a
                        href={`https://wa.me/${client.phone.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1"
                      >
                        Abrir WhatsApp <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                  )}

                  {client.email && (
                    <div className="flex items-center gap-2 text-slate-400">
                      <Mail className="w-3.5 h-3.5 text-slate-500" />
                      <span className="truncate">{client.email}</span>
                    </div>
                  )}

                  {client.notes && (
                    <p className="text-[11px] text-slate-400 pt-1 leading-relaxed border-t border-slate-800/60">
                      {client.notes}
                    </p>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* New Client Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h2 className="text-base font-bold text-white font-['Plus_Jakarta_Sans']">
                Cadastrar Novo Cliente
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Carlos Eduardo de Souza"
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-950 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    WhatsApp / Telefone
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Ex: +55 11 98888-7777"
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-950 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Status do Cliente
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-950 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  >
                    <option value="Ativo">Ativo</option>
                    <option value="VIP">VIP</option>
                    <option value="Lead">Lead</option>
                    <option value="Pendente">Pendente</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Empresa / Ocupação
                  </label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Ex: Souza Advocacia"
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-950 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    E-mail
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="carlos@empresa.com"
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-950 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                </div>
              </div>

              {/* Birthday inputs */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-200 flex items-center gap-1.5">
                    <Cake className="w-3.5 h-3.5 text-amber-400" />
                    Data de Aniversário
                  </span>
                  <label className="flex items-center gap-1.5 text-[11px] text-slate-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasBirthday}
                      onChange={(e) => setHasBirthday(e.target.checked)}
                      className="rounded accent-indigo-600"
                    />
                    Ativar lembrete
                  </label>
                </div>

                {hasBirthday && (
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <span className="text-[10px] text-slate-400 block mb-0.5">Dia</span>
                      <select
                        value={birthdayDay}
                        onChange={(e) => setBirthdayDay(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-100"
                      >
                        {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                          <option key={d} value={String(d)}>
                            Dia {d}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 block mb-0.5">Mês</span>
                      <select
                        value={birthdayMonth}
                        onChange={(e) => setBirthdayMonth(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-100"
                      >
                        {[
                          'Janeiro (01)', 'Fevereiro (02)', 'Março (03)', 'Abril (04)',
                          'Maio (05)', 'Junho (06)', 'Julho (07)', 'Agosto (08)',
                          'Setembro (09)', 'Outubro (10)', 'Novembro (11)', 'Dezembro (12)',
                        ].map((m, idx) => (
                          <option key={idx + 1} value={String(idx + 1)}>
                            {m}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Notas / Histórico do Cliente
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Preferências, pendências ou histórico de compras..."
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-950 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors shadow-sm shadow-indigo-600/30"
                >
                  Salvar Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
