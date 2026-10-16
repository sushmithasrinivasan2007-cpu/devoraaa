import React, { useState, useRef, useEffect } from 'react';
import { Terminal, Send, Sparkles, CornerDownLeft, Copy, Check, RotateCcw, ShieldCheck, Zap } from 'lucide-react';
import { DraggableDial } from './DraggableDial';
import { TerminalReelConfig } from '../types';
import { api } from '../services/api';

interface TerminalReelProps {
  onAskSuccess?: (answer: string) => void;
  id?: string;
}

export const TerminalReel: React.FC<TerminalReelProps> = ({ onAskSuccess, id = "terminal-reel-main" }) => {
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [responseOutput, setResponseOutput] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<{ query: string; answer: string; time: string }[]>([
    {
      query: "What needs my attention today?",
      answer: "EXECUTIVE OPERATIONS BRIEF:\n• Overall attendance is at 95% with 2 repeat absences in Class 8B.\n• Science Lab 2 water pipe leakage requires verification with Rajesh Kumar.\n• 1 faculty medical leave request awaiting your sign-off.",
      time: "08:15 AM"
    }
  ]);

  const [dials, setDials] = useState<TerminalReelConfig>({
    style: 60, // Concise to Detailed
    length: 50, // Short to Long
    tone: 45, // Formal to Friendly
    priority: 65 // Normal to Urgent
  });

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        textareaRef.current?.focus();
        textareaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSubmit = async (queryToRun?: string) => {
    const activeQuery = queryToRun || inputQuery;
    if (!activeQuery.trim() || isLoading) return;

    setIsLoading(true);
    setResponseOutput(null);

    try {
      const res = await api.askAI(activeQuery, dials);
      setResponseOutput(res.answer);
      setHistory(prev => [
        {
          query: activeQuery,
          answer: res.answer,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        },
        ...prev.slice(0, 4)
      ]);
      if (onAskSuccess) onAskSuccess(res.answer);
    } catch (err: any) {
      setResponseOutput(`[TERMINAL ERROR]: Unable to retrieve campus data. ${err.message || 'System error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!responseOutput) return;
    navigator.clipboard.writeText(responseOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const samplePrompts = [
    { label: "Daily operations", query: "Summarize today's school operations." },
    { label: "Attendance", query: "How many students are absent today?" },
    { label: "Campus issues", query: "Show unresolved campus issues." },
    { label: "Pending requests", query: "Show pending requests needing review." },
    { label: "Generate notice", query: "Create a notice for tomorrow about the Science Showcase." }
  ];

  return (
    <div id={id} className="w-full max-w-6xl mx-auto space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#6B1E2B]/12 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-[#6B1E2B] text-[#FFF8EC] shadow-sm">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[#2B2020] flex items-center gap-2">
                Devora Terminal Reel
                <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#6B1E2B]/10 text-[#6B1E2B] border border-[#6B1E2B]/20">
                  GEMINI 3.8 FLASH ACTIVE
                </span>
              </h1>
              <p className="text-sm text-[#756565]">
                Your intelligent campus operations assistant. Retrieves live database state without fabrication.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto text-xs font-mono text-[#756565] bg-[#FFF8EC]/90 px-3 py-1.5 rounded-xl border border-[#6B1E2B]/15 shadow-xs backdrop-blur-md">
          <span className="text-[#9A8989]">Shortcut:</span>
          <kbd className="px-1.5 py-0.5 bg-[#E8DDCA] text-[#6B1E2B] font-bold rounded border border-[#6B1E2B]/20">Ctrl</kbd>
          <span>+</span>
          <kbd className="px-1.5 py-0.5 bg-[#E8DDCA] text-[#6B1E2B] font-bold rounded border border-[#6B1E2B]/20">K</kbd>
          <span className="text-[#9A8989]">to focus</span>
        </div>
      </div>

      {/* CENTERPIECE: HUGE TERMINAL REEL INPUT */}
      <div className="relative rounded-2xl bg-[#FFF8EC]/95 border-2 border-[#6B1E2B]/25 shadow-xl shadow-[#6B1E2B]/8 overflow-hidden group focus-within:border-[#6B1E2B] focus-within:shadow-[#6B1E2B]/15 transition-all backdrop-blur-xl">
        {/* Terminal Header Bar */}
        <div className="px-4 py-2.5 bg-[#E8DDCA]/70 border-b border-[#6B1E2B]/15 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#B94A55]" />
            <div className="w-3 h-3 rounded-full bg-[#C58A35]" />
            <div className="w-3 h-3 rounded-full bg-[#5F8F68]" />
            <span className="ml-2 text-xs font-mono text-[#756565] font-semibold tracking-wider">
              devora-reel // campus.supabase.cluster // port:3000
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-[#5F8F68]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#5F8F68]" />
            <span className="hidden sm:inline">Authorized Operations Session</span>
          </div>
        </div>

        {/* Input Body with Massive Stylized Monospace Typeface */}
        <div className="p-6">
          <div className="flex items-start gap-3.5">
            <span className="text-2xl sm:text-3xl font-mono text-[#6B1E2B] font-bold select-none pt-0.5">
              &gt;
            </span>

            <div className="relative flex-1">
              <textarea
                ref={textareaRef}
                id="terminal-reel-input"
                rows={3}
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
                placeholder="Ask the school anything... e.g. How many students are absent today?"
                className="w-full bg-transparent resize-none border-none outline-none font-mono text-lg sm:text-2xl text-[#2B2020] placeholder-[#9A8989] font-semibold tracking-wide leading-relaxed selection:bg-[#6B1E2B] selection:text-[#FFF8EC]"
              />

              {/* Terminal Cursor Simulation when empty or active */}
              <div className="pointer-events-none mt-1 flex items-center gap-1 text-xs font-mono text-[#756565]">
                <span className="font-semibold">COMMAND MODE</span>
                <span className="inline-block w-2 h-4 bg-[#6B1E2B] animate-terminal-blink" />
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="mt-4 pt-4 border-t border-[#6B1E2B]/12 flex flex-wrap items-center justify-between gap-3">
            {/* Suggested Prompt Chips */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono text-[#756565] font-semibold mr-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#6B1E2B]" /> Suggested:
              </span>
              {samplePrompts.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => {
                    setInputQuery(p.query);
                    handleSubmit(p.query);
                  }}
                  className="text-xs font-mono px-2.5 py-1 rounded-lg bg-[#E8DDCA]/50 hover:bg-[#FFF8EC] text-[#2B2020] hover:text-[#6B1E2B] border border-[#6B1E2B]/15 hover:border-[#6B1E2B]/40 transition-all cursor-pointer font-medium"
                >
                  &ldquo;{p.label}&rdquo;
                </button>
              ))}
            </div>

            {/* Execute Button */}
            <button
              type="button"
              id="terminal-execute-button"
              disabled={isLoading || !inputQuery.trim()}
              onClick={() => handleSubmit()}
              className="px-5 py-2.5 rounded-xl font-mono text-xs font-bold tracking-wider uppercase transition-all flex items-center gap-2 bg-[#6B1E2B] hover:bg-[#42121C] text-[#FFF8EC] shadow-md shadow-[#6B1E2B]/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer hover:-translate-y-0.5 active:translate-y-0"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#FFF8EC] border-t-transparent rounded-full animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>Dispatch Query</span>
                  <CornerDownLeft className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* AI RESPONSE TERMINAL OUTPUT PANEL */}
      {(responseOutput || isLoading) && (
        <div className="rounded-2xl bg-[#FFF8EC]/95 border border-[#6B1E2B]/20 p-5 shadow-xl shadow-[#6B1E2B]/8 transition-all backdrop-blur-xl">
          <div className="flex items-center justify-between pb-3 border-b border-[#6B1E2B]/12">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#6B1E2B]">
              <Zap className="w-4 h-4" />
              <span>TERMINAL REEL OUTPUT // REALTIME INTELLIGENCE</span>
            </div>
            {responseOutput && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 text-xs font-mono px-2.5 py-1 rounded-lg bg-[#E8DDCA]/60 hover:bg-[#FFF8EC] text-[#2B2020] border border-[#6B1E2B]/15 transition-colors cursor-pointer font-semibold"
                >
                  {copied ? <Check className="w-3 h-3 text-[#5F8F68]" /> : <Copy className="w-3 h-3 text-[#6B1E2B]" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
                <button
                  onClick={() => setResponseOutput(null)}
                  className="text-xs font-mono px-2.5 py-1 rounded-lg bg-[#E8DDCA]/60 hover:bg-[#FFF8EC] text-[#756565] hover:text-[#2B2020] border border-[#6B1E2B]/15 cursor-pointer font-semibold"
                >
                  Clear
                </button>
              </div>
            )}
          </div>

          <div className="pt-4 font-mono text-sm leading-relaxed whitespace-pre-wrap text-[#2B2020] font-medium">
            {isLoading ? (
              <div className="flex items-center gap-3 text-[#756565] py-4">
                <div className="w-4 h-4 border-2 border-[#6B1E2B] border-t-transparent rounded-full animate-spin" />
                <span>Interrogating campus database records and generating response...</span>
              </div>
            ) : (
              responseOutput
            )}
          </div>
        </div>
      )}

      {/* OVERSIZED HORIZONTAL DRAGGABLE DIALS */}
      <div className="p-5 rounded-2xl bg-[#FFF8EC]/90 border border-[#6B1E2B]/15 shadow-sm backdrop-blur-md">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-mono font-bold tracking-wider text-[#2B2020] uppercase">
              Terminal Reel Prompt Tuning Controls
            </h2>
            <span className="text-[11px] font-mono text-[#6B1E2B] bg-[#6B1E2B]/10 px-2.5 py-0.5 rounded-full border border-[#6B1E2B]/20 font-semibold">
              Horizontal Draggable Dials
            </span>
          </div>
          <button
            type="button"
            onClick={() => setDials({ style: 50, length: 50, tone: 50, priority: 50 })}
            className="flex items-center gap-1 text-xs font-mono text-[#756565] hover:text-[#6B1E2B] transition-colors cursor-pointer font-semibold"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Dials</span>
          </button>
        </div>

        {/* 4 Oversized Draggable Dials in Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <DraggableDial
            id="dial-style"
            label="STYLE"
            leftAnchor="Concise"
            rightAnchor="Detailed"
            value={dials.style}
            onChange={(val) => setDials(d => ({ ...d, style: val }))}
          />
          <DraggableDial
            id="dial-length"
            label="LENGTH"
            leftAnchor="Short"
            rightAnchor="Long"
            value={dials.length}
            onChange={(val) => setDials(d => ({ ...d, length: val }))}
          />
          <DraggableDial
            id="dial-tone"
            label="TONE"
            leftAnchor="Formal"
            rightAnchor="Friendly"
            value={dials.tone}
            onChange={(val) => setDials(d => ({ ...d, tone: val }))}
          />
          <DraggableDial
            id="dial-priority"
            label="PRIORITY"
            leftAnchor="Normal"
            rightAnchor="Urgent"
            value={dials.priority}
            onChange={(val) => setDials(d => ({ ...d, priority: val }))}
          />
        </div>
      </div>

      {/* Query History Log */}
      {history.length > 0 && (
        <div className="p-4 rounded-xl bg-[#FFF8EC]/90 border border-[#6B1E2B]/15 shadow-xs">
          <h3 className="text-xs font-mono uppercase tracking-wider text-[#756565] font-bold mb-3">
            Recent Terminal Reel Sessions
          </h3>
          <div className="space-y-2.5">
            {history.map((h, i) => (
              <div key={i} className="text-xs font-mono p-3 rounded-xl bg-[#E8DDCA]/40 border border-[#6B1E2B]/12">
                <div className="flex items-center justify-between text-[#6B1E2B] mb-1">
                  <span className="font-bold">&gt; {h.query}</span>
                  <span className="text-[#9A8989] text-[11px]">{h.time}</span>
                </div>
                <p className="text-[#2B2020] font-medium line-clamp-2">{h.answer}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
