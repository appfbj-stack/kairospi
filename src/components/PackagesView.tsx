import React, { useState } from 'react';
import { 
  Package, 
  ExternalLink, 
  Check, 
  Plus, 
  Search, 
  ToggleLeft, 
  ToggleRight, 
  Layers, 
  ShieldCheck, 
  Terminal, 
  Sparkles, 
  Download,
  AlertCircle
} from 'lucide-react';
import { PiPackage } from '../types';

interface PackagesViewProps {
  packages: PiPackage[];
  onTogglePackage: (id: string) => Promise<void>;
  onInstallPackage: (packageNameOrUrl: string, category: string) => Promise<void>;
}

export const PackagesView: React.FC<PackagesViewProps> = ({
  packages,
  onTogglePackage,
  onInstallPackage,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [packageInput, setPackageInput] = useState('');
  const [packageCategory, setPackageCategory] = useState('Produtividade');
  const [isInstalling, setIsInstalling] = useState(false);
  const [installSuccessMessage, setInstallSuccessMessage] = useState<string | null>(null);

  const categories = [
    'all',
    'Produtividade',
    'Ferramentas Web',
    'Memória & IA',
    'Integrações',
    'Segurança',
  ];

  const handleInstallSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!packageInput.trim() || isInstalling) return;

    setIsInstalling(true);
    setInstallSuccessMessage(null);
    try {
      await onInstallPackage(packageInput.trim(), packageCategory);
      setInstallSuccessMessage(`Pacote "${packageInput.trim()}" instalado e integrado com sucesso ao Kairós!`);
      setPackageInput('');
      setTimeout(() => setInstallSuccessMessage(null), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsInstalling(false);
    }
  };

  const filteredPackages = packages.filter((pkg) => {
    if (searchTerm.trim()) {
      const match = pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pkg.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pkg.tools.some((t) => t.name.toLowerCase().includes(searchTerm.toLowerCase()));
      if (!match) return false;
    }

    if (selectedCategory !== 'all' && pkg.category !== selectedCategory) {
      return false;
    }

    return true;
  });

  const activeCount = packages.filter((p) => p.enabled).length;

  return (
    <div className="space-y-6 pb-20 lg:pb-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-['Plus_Jakarta_Sans']">
              Central de Pacotes pi.dev
            </h1>
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              {activeCount} ativos
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Gerencie e instale extensões do catálogo pi.dev para turbinar as ferramentas do assistente Kairós.
          </p>
        </div>

        <a
          href="https://pi.dev/packages?page=3"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-medium text-sky-300 bg-sky-950/60 border border-sky-800/80 rounded-xl hover:bg-sky-900/50 transition-colors whitespace-nowrap self-start sm:self-auto"
        >
          <span>Abrir pi.dev/packages</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Package Installer Form Card */}
      <section className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950/30 border border-slate-800 space-y-3">
        <div className="flex items-center gap-2 text-white font-semibold text-sm">
          <Download className="w-4 h-4 text-indigo-400" />
          <span>Instalar Novo Pacote do Ecossistema Pi</span>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          Informe o nome do pacote npm (ex: <code className="text-indigo-300 bg-slate-950 px-1 py-0.5 rounded font-mono">pi-zip</code>, <code className="text-indigo-300 bg-slate-950 px-1 py-0.5 rounded font-mono">pi-notion</code>) ou o link de repositório Git. O Kairós criará automaticamente os bindings para o assistente.
        </p>

        <form onSubmit={handleInstallSubmit} className="flex flex-col sm:flex-row gap-2 pt-1">
          <input
            type="text"
            value={packageInput}
            onChange={(e) => setPackageInput(e.target.value)}
            placeholder="Ex: pi-zip ou github.com/user/pi-extension"
            className="flex-1 px-3.5 py-2.5 text-xs sm:text-sm bg-slate-950 border border-slate-700 rounded-xl text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 min-h-[42px]"
          />

          <select
            value={packageCategory}
            onChange={(e) => setPackageCategory(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 min-h-[42px]"
          >
            <option value="Produtividade">Produtividade</option>
            <option value="Ferramentas Web">Ferramentas Web</option>
            <option value="Memória & IA">Memória & IA</option>
            <option value="Integrações">Integrações</option>
            <option value="Segurança">Segurança</option>
          </select>

          <button
            type="submit"
            disabled={!packageInput.trim() || isInstalling}
            className="px-4 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 rounded-xl transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap min-h-[42px] active:scale-95 shadow-sm shadow-indigo-600/30"
          >
            <Plus className="w-4 h-4" />
            <span>{isInstalling ? 'Instalando...' : 'Instalar Pacote'}</span>
          </button>
        </form>

        {installSuccessMessage && (
          <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{installSuccessMessage}</span>
          </div>
        )}
      </section>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filtrar pacotes ou ferramentas..."
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-900 border border-slate-800 rounded-xl text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          />
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat === 'all' ? 'Todos' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Packages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredPackages.map((pkg) => (
          <div
            key={pkg.id}
            className={`p-4 sm:p-5 rounded-2xl border transition-all space-y-3.5 flex flex-col justify-between ${
              pkg.enabled
                ? 'bg-slate-900/80 border-slate-700/80 shadow-xs'
                : 'bg-slate-950/60 border-slate-800/60 opacity-75'
            }`}
          >
            <div className="space-y-2.5">
              {/* Header with Title and Toggle */}
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-sm font-bold text-white">
                      {pkg.name}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                      v{pkg.version}
                    </span>
                    {pkg.source === 'git' && (
                      <span className="text-[10px] text-sky-400 bg-sky-950/60 px-1.5 py-0.5 rounded border border-sky-800/60">
                        Git
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <span>{pkg.author}</span>
                    <span>·</span>
                    <span className="text-indigo-300 font-medium">{pkg.category}</span>
                  </div>
                </div>

                {/* Toggle Button */}
                <button
                  onClick={() => onTogglePackage(pkg.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all shrink-0 min-h-[36px] ${
                    pkg.enabled
                      ? 'bg-emerald-950/50 border-emerald-700 text-emerald-300 hover:bg-emerald-900/40'
                      : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:bg-slate-700/60 hover:text-slate-200'
                  }`}
                  title={pkg.enabled ? 'Clique para desativar' : 'Clique para ativar no assistente'}
                >
                  <span className={`w-2 h-2 rounded-full ${pkg.enabled ? 'bg-emerald-400 shadow-xs shadow-emerald-400' : 'bg-slate-500'}`} />
                  <span>{pkg.enabled ? 'Ativo' : 'Inativo'}</span>
                </button>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-300 leading-relaxed">
                {pkg.description}
              </p>

              {/* Tools provided by this package */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Ferramentas Registradas ({pkg.tools.length}):
                </span>
                <div className="space-y-1">
                  {pkg.tools.map((t, idx) => (
                    <div
                      key={idx}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800/80 text-[11px] flex items-center justify-between gap-2"
                    >
                      <code className="text-indigo-400 font-mono font-medium">{t.name}</code>
                      <span className="text-slate-400 text-[10px] truncate max-w-[190px]">
                        {t.description}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer link */}
            <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500">
              <span className="font-mono text-[10px]">
                {pkg.installCommand || `pi install ${pkg.id}`}
              </span>
              <a
                href={`https://pi.dev/packages?name=${pkg.name}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-sky-400 flex items-center gap-1 transition-colors"
              >
                Docs <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
