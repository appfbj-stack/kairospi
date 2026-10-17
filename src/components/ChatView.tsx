import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  Mic, 
  MicOff, 
  Clock, 
  UserCheck, 
  Calendar, 
  CheckCircle2, 
  Cake, 
  RotateCcw, 
  Bot,
  User,
  ArrowRight
} from 'lucide-react';
import { ChatMessage, ActiveTab } from '../types';

interface ChatViewProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => Promise<void>;
  isLoading: boolean;
  onClearHistory: () => void;
  setActiveTab: (tab: ActiveTab) => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  messages,
  onSendMessage,
  isLoading,
  onClearHistory,
  setActiveTab,
}) => {
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Voice recognition setup
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.lang = 'pt-BR';
      recognition.interimResults = false;

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Reconhecimento de voz não suportado neste navegador.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error('Speech recognition error:', err);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    const text = inputText.trim();
    setInputText('');
    await onSendMessage(text);
  };

  const handleSuggestion = (prompt: string) => {
    onSendMessage(prompt);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-125px)] sm:h-[calc(100vh-120px)] lg:h-[calc(100vh-80px)] max-w-4xl mx-auto">
      {/* Chat Header Actions */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800/80 bg-slate-950/60 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-semibold text-slate-200">
            Kairós Conversacional · Gemini 3.8 Flash
          </span>
        </div>
        <button
          onClick={onClearHistory}
          className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-800/60 transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Limpar Chat</span>
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-lg shadow-indigo-500/10">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white font-['Plus_Jakarta_Sans']">
                Como posso ajudar seu dia hoje?
              </h3>
              <p className="text-xs text-slate-400 max-w-md leading-relaxed">
                Eu sou o Kairós. Agendo compromissos, lembro aniversários dos seus clientes e tiro qualquer dúvida sua em tempo real.
              </p>
            </div>

            {/* Quick Suggestions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-md pt-2">
              <button
                onClick={() => handleSuggestion('Agende uma reunião com cliente Marcos amanhã às 15h')}
                className="p-2.5 text-left text-xs bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 rounded-xl text-slate-300 transition-colors"
              >
                📅 "Reunião com Marcos amanhã às 15h"
              </button>
              <button
                onClick={() => handleSuggestion('Quem são os clientes aniversariantes desta semana?')}
                className="p-2.5 text-left text-xs bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 rounded-xl text-slate-300 transition-colors"
              >
                🎂 "Aniversariantes desta semana"
              </button>
              <button
                onClick={() => handleSuggestion('Cadastrar nova cliente: Dra. Beatriz Costa, fone 11 99999-8888, aniversário 15 de novembro')}
                className="p-2.5 text-left text-xs bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 rounded-xl text-slate-300 transition-colors"
              >
                👤 "Cadastrar cliente Dra. Beatriz"
              </button>
              <button
                onClick={() => handleSuggestion('Quais pacotes do pi.dev estão instalados no meu sistema?')}
                className="p-2.5 text-left text-xs bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 rounded-xl text-slate-300 transition-colors"
              >
                📦 "Quais pacotes Pi estão ativos?"
              </button>
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300 shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div className={`space-y-2 max-w-[85%] sm:max-w-[75%]`}>
                {/* Text bubble */}
                <div
                  className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-indigo-600 text-white rounded-tr-xs'
                      : 'bg-slate-900/90 border border-slate-800 text-slate-200 rounded-tl-xs shadow-xs'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>

                {/* Tool Invocations Feedback Cards */}
                {msg.toolInvocations && msg.toolInvocations.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    {msg.toolInvocations.map((inv, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-2">
                          {inv.tool.includes('agenda') ? (
                            <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                          ) : inv.tool.includes('birthday') ? (
                            <Cake className="w-3.5 h-3.5 text-amber-400" />
                          ) : (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          )}
                          <span className="font-mono text-[11px] text-slate-300 font-medium">
                            {inv.tool}
                          </span>
                        </div>

                        {inv.tool === 'agenda:add' && (
                          <button
                            onClick={() => setActiveTab('agenda')}
                            className="text-[10px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium"
                          >
                            Ver na Agenda <ArrowRight className="w-3 h-3" />
                          </button>
                        )}

                        {inv.tool === 'crm:add_client' && (
                          <button
                            onClick={() => setActiveTab('clients')}
                            className="text-[10px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium"
                          >
                            Ver em Clientes <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <span className="text-[10px] text-slate-500 block px-1">
                  {new Date(msg.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              {msg.role === 'user' && (
                <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))
        )}

        {isLoading && (
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300 shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 rounded-tl-xs flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" />
              <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.2s]" />
              <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.4s]" />
              <span className="text-xs text-slate-400 ml-1">Kairós processando...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input bar pinned at bottom with microphone & send button */}
      <div className="p-3 bg-slate-950/90 border-t border-slate-800/80 shrink-0">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          {/* Voice Input Button */}
          <button
            type="button"
            onClick={toggleListening}
            className={`p-2.5 rounded-xl border transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center ${
              isListening
                ? 'bg-rose-500/20 border-rose-500 text-rose-400 animate-pulse'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title={isListening ? 'Parar gravação' : 'Falar comando por voz'}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Text Input */}
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={isListening ? 'Ouvindo sua voz...' : 'Digite seu comando ou dúvida...'}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 text-xs sm:text-sm bg-slate-900 border border-slate-800 rounded-xl text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all min-h-[44px]"
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-40 disabled:hover:bg-indigo-600 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center shrink-0 active:scale-95"
            title="Enviar mensagem"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};
