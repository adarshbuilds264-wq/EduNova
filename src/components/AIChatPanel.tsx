import React, { useEffect, useRef, useState } from 'react';
import { Send, Trash2, Sparkles, AlertCircle } from 'lucide-react';
import type { ChatMessage } from '../types';
import { api } from '../services/api';

interface AIChatPanelProps {
  examId: number;
  compact?: boolean;
}

const SUGGESTED_PROMPTS = [
  'Which students are currently failing or at academic risk?',
  'Compare class averages across all five subjects.',
  'Draft constructive mentor feedback for our lowest-scoring students.',
  'Who are the top 3 performers and what is their score margin?',
];

export const AIChatPanel: React.FC<AIChatPanelProps> = ({ examId, compact = false }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: 'Hello. I am AcadLedger AI, connected directly to your live student, subject, and examination records. Ask me to identify at-risk students, compare subject averages, or draft parent/student feedback reports.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [model, setModel] = useState<'gemini-4-hydrogen' | 'gemini-3.1-flash-lite'>('gemini-4-hydrogen');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    scrollEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (textOverride?: string) => {
    const content = (textOverride ?? input).trim();
    if (!content || loading) return;

    setError(null);
    if (!textOverride) setInput('');

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const historyPayload = messages
      .filter((m) => m.id !== 'welcome')
      .map((m) => ({ role: m.role, text: m.text }));

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await api.aiChat({
        history: historyPayload,
        message: content,
        model,
        examId,
      });

      const assistantMsg: ChatMessage = {
        id: `m-${Date.now()}`,
        role: 'model',
        text: res.reply,
        model: res.model,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      setError(err?.message || 'Unable to reach Gemini AI service.');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setError(null);
    setMessages([
      {
        id: 'welcome',
        role: 'model',
        text: 'Conversation reset. Ask any question about student marks, grades, or subject pass rates.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <div
      className={`flex flex-col bg-white border border-slate-200 rounded-xl overflow-hidden ${
        compact ? 'h-full' : 'h-[calc(100vh-8.5rem)]'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-4 px-5 py-3.5 border-b border-slate-200 bg-slate-50/70">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#0F1E3D] text-white flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-display text-sm font-semibold text-slate-900">
              AcadLedger Academic Advisor
            </h3>
            <p className="text-xs text-slate-500">Multi-turn analysis grounded in live SQL &amp; Python results</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            aria-label="Select Gemini model"
            value={model}
            onChange={(e) => setModel(e.target.value as 'gemini-4-hydrogen' | 'gemini-3.1-flash-lite')}
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#5B3DF5]"
          >
            <option value="gemini-4-hydrogen">Gemini 4 Hydrogen (Balanced)</option>
            <option value="gemini-3.1-flash-lite">Gemini 3.1 Flash Lite (Fast)</option>
          </select>
          <button
            type="button"
            onClick={handleClear}
            title="Clear chat history"
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 whitespace-nowrap"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear
          </button>
        </div>
      </div>

      {/* Scrollable Thread */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-[#F8FAFC]">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className="flex items-center gap-2 mb-1 text-xs text-slate-500">
              <span className="font-medium text-slate-700">
                {msg.role === 'user' ? 'You' : 'Academic Advisor'}
              </span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">{msg.timestamp}</span>
              {msg.model && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono text-slate-400">{msg.model}</span>
                </>
              )}
            </div>
            <div
              className={`max-w-[82%] rounded-xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === 'user'
                  ? 'bg-[#0F1E3D] text-white'
                  : 'bg-white border border-slate-200 text-slate-800'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-start">
            <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500">
              Analyzing academic records and preparing response...
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">AI Request Error</p>
              <p className="mt-0.5">{error}</p>
            </div>
          </div>
        )}
        <div ref={scrollEndRef} />
      </div>

      {/* Suggested Prompts */}
      <div className="px-5 py-2.5 border-t border-slate-200 bg-white flex flex-wrap gap-2">
        {SUGGESTED_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => sendMessage(prompt)}
            disabled={loading}
            className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-700 hover:border-[#5B3DF5] hover:text-[#5B3DF5] transition-colors disabled:opacity-50 text-left"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage();
        }}
        className="flex items-center gap-2.5 px-5 py-3.5 border-t border-slate-200 bg-white"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about student grades, failed subjects, cohort trends, or mentoring plans..."
          className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5B3DF5]"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="inline-flex items-center gap-2 rounded-lg bg-[#5B3DF5] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#4C30D6] transition-colors disabled:opacity-50 whitespace-nowrap"
        >
          <Send className="w-4 h-4" />
          Send
        </button>
      </form>
    </div>
  );
};
