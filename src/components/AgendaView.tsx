import React, { useState } from 'react';
import { 
  Calendar, 
  Plus, 
  Search, 
  CheckCircle2, 
  Circle, 
  Trash2, 
  Clock, 
  AlertCircle, 
  Tag, 
  Check, 
  X,
  Filter
} from 'lucide-react';
import { AgendaItem } from '../types';

interface AgendaViewProps {
  agenda: AgendaItem[];
  onToggleAgenda: (id: number) => void;
  onDeleteAgenda: (id: number) => void;
  onAddAgenda: (item: Omit<AgendaItem, 'id' | 'completed' | 'createdAt'>) => void;
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
}

export const AgendaView: React.FC<AgendaViewProps> = ({
  agenda,
  onToggleAgenda,
  onDeleteAgenda,
  onAddAgenda,
  isModalOpen,
  setIsModalOpen,
}) => {
  const [filterPeriod, setFilterPeriod] = useState<'all' | 'today' | 'tomorrow' | 'week' | 'completed'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Form state
  const [newTitle, setNewTitle] = useState('');
  const [newDatetime, setNewDatetime] = useState('');
  const [newCategory, setNewCategory] = useState<'Trabalho' | 'Pessoal' | 'Cliente' | 'Urgente' | 'Saúde'>('Trabalho');
  const [newPriority, setNewPriority] = useState<number>(1);
  const [newNotes, setNewNotes] = useState('');

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onAddAgenda({
      title: newTitle.trim(),
      datetime: newDatetime ? new Date(newDatetime).toISOString() : new Date().toISOString(),
      category: newCategory,
      priority: newPriority,
      notes: newNotes.trim() || undefined,
    });

    setNewTitle('');
    setNewDatetime('');
    setNewNotes('');
    setIsModalOpen(false);
  };

  // Filter items
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const todayEnd = todayStart + 24 * 60 * 60 * 1000;
  const tomorrowEnd = todayEnd + 24 * 60 * 60 * 1000;
  const weekEnd = todayStart + 7 * 24 * 60 * 60 * 1000;

  const filteredItems = agenda.filter((item) => {
    // Search filter
    if (searchTerm.trim()) {
      const match = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.notes && item.notes.toLowerCase().includes(searchTerm.toLowerCase()));
      if (!match) return false;
    }

    if (filterPeriod === 'completed') {
      return item.completed;
    }

    if (filterPeriod === 'today') {
      const itemTime = new Date(item.datetime).getTime();
      return itemTime >= todayStart && itemTime < todayEnd;
    }

    if (filterPeriod === 'tomorrow') {
      const itemTime = new Date(item.datetime).getTime();
      return itemTime >= todayEnd && itemTime < tomorrowEnd;
    }

    if (filterPeriod === 'week') {
      const itemTime = new Date(item.datetime).getTime();
      return itemTime >= todayStart && itemTime < weekEnd;
    }

    return true;
  });

  return (
    <div className="space-y-5 pb-20 lg:pb-8 max-w-5xl mx-auto">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-['Plus_Jakarta_Sans']">
            Agenda & Compromissos Kairós
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Armazenamento sincronizado e suporte a datas em linguagem natural.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors shadow-sm shadow-indigo-600/30 whitespace-nowrap min-h-[44px] sm:min-h-[38px] active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Compromisso</span>
        </button>
      </div>

      {/* Search & Period Filter Tabs */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar compromisso ou categoria..."
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-900 border border-slate-800 rounded-xl text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          />
        </div>

        {/* Filter Segmented Control */}
        <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl overflow-x-auto">
          <button
            onClick={() => setFilterPeriod('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              filterPeriod === 'all'
                ? 'bg-slate-800 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setFilterPeriod('today')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              filterPeriod === 'today'
                ? 'bg-slate-800 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Hoje
          </button>
          <button
            onClick={() => setFilterPeriod('tomorrow')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              filterPeriod === 'tomorrow'
                ? 'bg-slate-800 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Amanhã
          </button>
          <button
            onClick={() => setFilterPeriod('week')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              filterPeriod === 'week'
                ? 'bg-slate-800 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Semana
          </button>
          <button
            onClick={() => setFilterPeriod('completed')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              filterPeriod === 'completed'
                ? 'bg-slate-800 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Concluídos
          </button>
        </div>
      </div>

      {/* Agenda List */}
      <div className="space-y-2.5">
        {filteredItems.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-slate-900/40 border border-slate-800 text-slate-500 text-xs sm:text-sm space-y-2">
            <Calendar className="w-8 h-8 mx-auto text-slate-600 mb-2" />
            <p>Nenhum compromisso encontrado para o filtro selecionado.</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="text-indigo-400 hover:underline font-medium inline-block"
            >
              Adicionar primeiro compromisso
            </button>
          </div>
        ) : (
          filteredItems.map((item) => {
            const dateObj = new Date(item.datetime);
            const dateFormatted = !isNaN(dateObj.getTime())
              ? dateObj.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' }) + ' às ' + dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
              : item.datetime;

            return (
              <div
                key={item.id}
                className={`p-4 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                  item.completed
                    ? 'bg-slate-950/40 border-slate-800/40 opacity-60'
                    : 'bg-slate-900/60 border-slate-800/90 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => onToggleAgenda(item.id)}
                    className="mt-1 text-slate-400 hover:text-indigo-400 transition-colors p-1"
                    title={item.completed ? 'Marcar como pendente' : 'Marcar como concluído'}
                  >
                    {item.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )}
                  </button>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className={`text-sm font-semibold ${item.completed ? 'line-through text-slate-400' : 'text-slate-100'}`}>
                        {item.title}
                      </h3>
                      {item.priority === 2 && !item.completed && (
                        <span className="text-[10px] font-bold uppercase text-rose-300 bg-rose-500/20 px-2 py-0.5 rounded">
                          Alta Prioridade
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-400 flex-wrap">
                      <span className="flex items-center gap-1 font-mono tabular-nums">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        {dateFormatted}
                      </span>
                      <span>·</span>
                      <span className="text-indigo-300 font-medium">
                        {item.category}
                      </span>
                    </div>

                    {item.notes && (
                      <p className="text-xs text-slate-400 pt-1 leading-relaxed">
                        {item.notes}
                      </p>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => onDeleteAgenda(item.id)}
                  className="text-slate-500 hover:text-rose-400 p-2 rounded-lg hover:bg-slate-800 transition-colors shrink-0"
                  title="Excluir compromisso"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* New Agenda Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h2 className="text-base font-bold text-white font-['Plus_Jakarta_Sans']">
                Novo Compromisso
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
                  Título da Tarefa ou Reunião *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ex: Reunião com Cliente Marcos"
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-950 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Data e Horário
                  </label>
                  <input
                    type="datetime-local"
                    value={newDatetime}
                    onChange={(e) => setNewDatetime(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-950 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Categoria
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-950 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  >
                    <option value="Trabalho">Trabalho</option>
                    <option value="Cliente">Cliente</option>
                    <option value="Pessoal">Pessoal</option>
                    <option value="Urgente">Urgente</option>
                    <option value="Saúde">Saúde</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Prioridade
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { val: 0, label: 'Normal' },
                    { val: 1, label: 'Média' },
                    { val: 2, label: 'Urgente' },
                  ].map((p) => (
                    <button
                      key={p.val}
                      type="button"
                      onClick={() => setNewPriority(p.val)}
                      className={`py-2 text-xs font-medium rounded-lg border transition-colors ${
                        newPriority === p.val
                          ? 'bg-indigo-600 border-indigo-500 text-white font-semibold'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Anotações / Detalhes
                </label>
                <textarea
                  rows={2}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Informações adicionais para o Kairós lembrar..."
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
                  Salvar Compromisso
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
