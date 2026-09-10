"use client";

import React, { useState, useEffect, useRef } from "react";
import { Send, Book, Sparkles, MessageSquare, Plus, Trash2, Check, Copy, Table as TableIcon } from "lucide-react";
import { useTranslation } from "@/components/language/language-provider";

type Message = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  sources?: any[];
};

type Conversation = {
  id: string;
  title: string;
  updatedAt: string;
};

// Inline markdown formatter (bold, code, links, italics)
const renderInline = (text: string): React.ReactNode => {
  // First split by code blocks `...`
  const codeParts = text.split(/(`[^`]+`)/g);

  return codeParts.map((part, i) => {
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code
          key={i}
          className="font-mono text-xs px-1.5 py-0.5 rounded-md bg-primary-container/15 text-primary border border-primary-container/30 font-semibold"
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    // Now handle bold **...**
    const boldParts = part.split(/(\*\*[^*]+\*\*)/g);
    return boldParts.map((bPart, j) => {
      if (bPart.startsWith('**') && bPart.endsWith('**')) {
        return (
          <strong key={`${i}-${j}`} className="font-bold text-on-surface">
            {bPart.slice(2, -2)}
          </strong>
        );
      }

      // Handle italics *...*
      const italicParts = bPart.split(/(\*[^*]+\*)/g);
      return italicParts.map((iPart, k) => {
        if (iPart.startsWith('*') && iPart.endsWith('*') && iPart.length > 2) {
          return (
            <em key={`${i}-${j}-${k}`} className="italic text-on-surface-variant">
              {iPart.slice(1, -1)}
            </em>
          );
        }
        return <span key={`${i}-${j}-${k}`}>{iPart}</span>;
      });
    });
  });
};

// Markdown Table Parser
const parseTable = (lines: string[], keyPrefix: string | number) => {
  const tableRows = lines
    .map((l) => l.trim())
    .filter((l) => l.startsWith('|') && l.endsWith('|'))
    .map((l) =>
      l
        .slice(1, -1)
        .split('|')
        .map((c) => c.trim())
    );

  if (tableRows.length < 2) return null;

  // Filter out divider row (e.g. |---|---|)
  const isDivider = (row: string[]) => row.every((c) => /^:?-+:?$/.test(c));
  const header = tableRows[0];
  const rows = tableRows.slice(1).filter((row) => !isDivider(row));

  return (
    <div key={keyPrefix} className="my-4 overflow-hidden rounded-2xl border border-outline-variant/30 bg-surface-container-high/40 shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse min-w-[500px]">
          <thead className="bg-surface-container-highest/90 border-b border-outline-variant/30">
            <tr>
              {header.map((h, hIdx) => (
                <th key={hIdx} className="py-3 px-4 font-bold text-on-surface uppercase font-label-caps text-[11px] tracking-wider">
                  {renderInline(h)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/15 text-on-surface-variant">
            {rows.map((r, rIdx) => (
              <tr key={rIdx} className="hover:bg-surface-container-high/60 transition-colors">
                {r.map((cell, cIdx) => (
                  <td key={cIdx} className="py-3 px-4 leading-relaxed font-sans">
                    {renderInline(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Full Rich Markdown Parser
const renderMarkdown = (content: string) => {
  const codeBlockRegex = /(```[\s\S]*?```)/g;
  const parts = content.split(codeBlockRegex);

  return parts.map((part, index) => {
    // 1. Code Block
    if (part.startsWith('```')) {
      const firstLineEnd = part.indexOf('\n');
      const lang = part.slice(3, firstLineEnd).trim();
      const code = part.slice(firstLineEnd + 1, -3).trim();

      return (
        <div key={index} className="my-4 rounded-2xl overflow-hidden border border-outline-variant/30 bg-[#12141a] text-slate-200 shadow-md" dir="ltr">
          {lang && (
            <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-white/5 text-[10px] font-mono uppercase tracking-wider text-slate-400">
              <span>{lang}</span>
            </div>
          )}
          <pre className="p-4 overflow-x-auto text-xs font-mono leading-relaxed selection:bg-primary/30">
            <code>{code}</code>
          </pre>
        </div>
      );
    }

    // 2. Process non-code block text by paragraphs and tables
    const blocks = part.split(/\n\n+/);

    return (
      <div key={index} className="space-y-3.5">
        {blocks.map((block, bIdx) => {
          const rawLines = block.split('\n').map((l) => l.trimEnd());
          const trimmedBlock = block.trim();

          // Check if block is a Markdown Table
          const isTable = rawLines.length >= 2 && rawLines.every((l) => l.trim().startsWith('|') && l.trim().endsWith('|'));
          if (isTable) {
            const parsed = parseTable(rawLines, `${index}-${bIdx}`);
            if (parsed) return parsed;
          }

          // Check for Horizontal Rule
          if (/^(\*\*\*|---|___|• ---)$/.test(trimmedBlock)) {
            return <hr key={bIdx} className="my-4 border-t border-outline-variant/30" />;
          }

          // Check for Headings
          if (trimmedBlock.startsWith('#### ')) {
            return (
              <h4 key={bIdx} className="font-display font-bold text-sm text-on-surface mt-3 mb-1 text-primary-container">
                {renderInline(trimmedBlock.replace(/^####\s+/, ''))}
              </h4>
            );
          }
          if (trimmedBlock.startsWith('### ')) {
            return (
              <h3 key={bIdx} className="font-display font-bold text-base md:text-lg text-on-surface mt-4 mb-1.5 flex items-center gap-2">
                <span className="w-1.5 h-4 bg-primary-container rounded-full" />
                {renderInline(trimmedBlock.replace(/^###\s+/, ''))}
              </h3>
            );
          }
          if (trimmedBlock.startsWith('## ')) {
            return (
              <div key={bIdx} className="mt-5 mb-2 pb-1.5 border-b border-outline-variant/30">
                <h2 className="font-display font-bold text-lg md:text-xl text-on-surface flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary-container" />
                  {renderInline(trimmedBlock.replace(/^##\s+/, ''))}
                </h2>
              </div>
            );
          }
          if (trimmedBlock.startsWith('# ')) {
            return (
              <h1 key={bIdx} className="font-display font-bold text-xl md:text-2xl text-on-surface mt-5 mb-2 pb-2 border-b border-primary/20">
                {renderInline(trimmedBlock.replace(/^#\s+/, ''))}
              </h1>
            );
          }

          // Check for Blockquote
          if (rawLines.every((l) => l.trim().startsWith('>'))) {
            return (
              <blockquote key={bIdx} className="border-l-4 border-primary-container/80 pl-4 py-2 my-2 bg-primary-container/5 rounded-r-xl text-sm italic text-on-surface-variant">
                {rawLines.map((l, lIdx) => (
                  <p key={lIdx}>{renderInline(l.replace(/^>\s*/, ''))}</p>
                ))}
              </blockquote>
            );
          }

          // Check for Numbered List
          if (rawLines.every((l) => /^\d+\.\s+/.test(l.trim()))) {
            return (
              <ol key={bIdx} className="space-y-2.5 my-3 pl-1">
                {rawLines.map((l, lIdx) => {
                  const match = l.trim().match(/^(\d+)\.\s+(.*)$/);
                  const num = match ? match[1] : String(lIdx + 1);
                  const itemText = match ? match[2] : l;

                  return (
                    <li key={lIdx} className="flex items-start gap-3 text-sm text-on-surface-variant leading-relaxed">
                      <span className="w-5 h-5 rounded-full bg-primary-container/20 text-primary-container text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 border border-primary-container/30">
                        {num}
                      </span>
                      <div className="flex-1">{renderInline(itemText)}</div>
                    </li>
                  );
                })}
              </ol>
            );
          }

          // Check for Bulleted List
          if (rawLines.every((l) => /^[-*•]\s+/.test(l.trim()))) {
            return (
              <ul key={bIdx} className="space-y-2 my-3 pl-1">
                {rawLines.map((l, lIdx) => {
                  const itemText = l.trim().replace(/^[-*•]\s+/, '');
                  return (
                    <li key={lIdx} className="flex items-start gap-2.5 text-sm text-on-surface-variant leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary-container shrink-0 mt-2 shadow-[0_0_8px_rgba(57,255,20,0.4)]" />
                      <div className="flex-1">{renderInline(itemText)}</div>
                    </li>
                  );
                })}
              </ul>
            );
          }

          // Standard paragraph
          return (
            <p key={bIdx} className="text-sm md:text-[15px] leading-relaxed text-on-surface-variant">
              {renderInline(trimmedBlock)}
            </p>
          );
        })}
      </div>
    );
  });
};

export function TutorChat() {
  const { t, currentLanguage, translateDynamic } = useTranslation();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, pending]);

  async function fetchConversations() {
    try {
      const res = await fetch("/api/ai/tutor/conversations");
      if (res.ok) {
        const data = await res.json();
        setConversations(data.conversations || []);
      }
    } catch (e) {}
  }

  async function loadConversation(id: string) {
    setActiveConvId(id);
    setMessages([]);
    try {
      const res = await fetch(`/api/ai/tutor/conversations/${id}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch (e) {}
  }

  async function deleteConversation(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    try {
      await fetch(`/api/ai/tutor/conversations/${id}`, { method: "DELETE" });
      if (activeConvId === id) {
        setActiveConvId(null);
        setMessages([]);
      }
      fetchConversations();
    } catch (e) {}
  }

  function startNewChat() {
    setActiveConvId(null);
    setMessages([]);
    setInput("");
  }

  async function ask(e?: React.FormEvent, presetQuestion?: string) {
    if (e) e.preventDefault();
    const q = presetQuestion || input;
    if (!q.trim()) return;

    const tempMsg: Message = { id: "temp-user", role: "user", content: q };
    setMessages((prev) => [...prev, tempMsg]);
    setInput("");
    setPending(true);

    let currentConvId = activeConvId;

    try {
      if (!currentConvId) {
        try {
          const cRes = await fetch("/api/ai/tutor/conversations", { method: "POST" });
          if (cRes.ok) {
            const cData = await cRes.json();
            currentConvId = cData.conversation?.id || `conv-${Date.now()}`;
            setActiveConvId(currentConvId);
            if (cData.conversation) {
              setConversations((prev) => [cData.conversation, ...prev]);
            }
          } else {
            currentConvId = `conv-${Date.now()}`;
            setActiveConvId(currentConvId);
          }
        } catch {
          currentConvId = `conv-${Date.now()}`;
          setActiveConvId(currentConvId);
        }
      }

      const res = await fetch("/api/ai/tutor/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: currentConvId, message: q }),
      });
      const data = await res.json();
      
      if (data.message) {
        let aiContent = data.message.content;
        if (currentLanguage.code !== "en") {
          aiContent = await translateDynamic(aiContent, currentLanguage.code);
        }
        
        const translatedMsg = { ...data.message, content: aiContent };
        setMessages((prev) => [...prev.filter((m) => m.id !== "temp-user"), tempMsg, translatedMsg]);
      } else if (data.error) {
        setMessages((prev) => [
          ...prev.filter((m) => m.id !== "temp-user"),
          tempMsg,
          { id: "err", role: "assistant", content: `**Notice:** ${data.error}` },
        ]);
      }
      fetchConversations();
    } catch (err) {
      setMessages((prev) => [
        ...prev.filter((m) => m.id !== "temp-user"),
        tempMsg,
        { id: "err", role: "assistant", content: "**Notice:** The AI Tutor is ready to answer your questions. Please try submitting again." },
      ]);
    } finally {
      setPending(false);
    }
  }

  function copyText(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  const suggestedQuestions = [
    "How is Wholesale Price Index (WPI) calculated in India?",
    "Explain PLFS sampling design and multiplier weights.",
    "What are the mandatory Statistical Disclosure Control (SDC) rules?",
    "How do Laspeyres and Paasche index formulas differ in national accounts?",
  ];

  return (
    <div className="flex flex-col md:flex-row w-full h-full min-h-[650px] h-[75vh] border border-outline-variant/30 rounded-3xl overflow-hidden shadow-sm glass-panel">
      
      {/* Sidebar */}
      <div className="w-full md:w-64 lg:w-72 border-b md:border-b-0 md:border-r border-outline-variant/30 flex flex-col bg-surface-container-lowest/50 flex-shrink-0">
        <div className="p-4 border-b border-outline-variant/30">
          <button
            onClick={startNewChat}
            className="w-full py-2.5 px-4 rounded-xl bg-primary-container/10 hover:bg-primary-container/20 border border-primary-container/30 text-primary-container flex items-center justify-center gap-2 font-bold font-label-caps text-xs transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            {t("tutor.clearChat", "New Chat")}
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          <p className="text-xs font-label-caps text-on-surface-variant/50 px-2 py-2">
            {t("learner.recentActivity", "Recent Conversations")}
          </p>
          {conversations.length === 0 ? (
            <p className="text-sm text-on-surface-variant px-2 italic">{t("common.noData", "No previous chats.")}</p>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => loadConversation(conv.id)}
                className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors ${
                  activeConvId === conv.id ? "bg-surface-container border-l-2 border-primary-container" : "hover:bg-surface-container-low"
                }`}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <MessageSquare className={`w-4 h-4 flex-shrink-0 ${activeConvId === conv.id ? "text-primary-container" : "text-on-surface-variant"}`} />
                  <span className={`text-sm truncate ${activeConvId === conv.id ? "text-on-surface font-medium" : "text-on-surface-variant"}`}>
                    {conv.title}
                  </span>
                </div>
                <button
                  onClick={(e) => deleteConversation(conv.id, e)}
                  className="opacity-0 group-hover:opacity-100 hover:text-red-400 transition-opacity p-1 rounded-md hover:bg-surface-container-high"
                  title="Delete"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative bg-surface-container-lowest/30">
        
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
          {messages.length === 0 && !pending && (
            <div className="flex flex-col items-center justify-center h-full max-w-xl mx-auto text-center animate-fade-up py-8">
              <div className="w-16 h-16 rounded-2xl bg-primary-container/10 flex items-center justify-center mb-6 border border-primary-container/30 shadow-[0_0_25px_rgba(57,255,20,0.15)]">
                <Sparkles className="w-8 h-8 text-primary-container" />
              </div>
              <h2 className="text-2xl md:text-3xl font-display font-bold text-on-surface mb-2">
                {t("tutor.title", "StatIQ AI Statistical Tutor")}
              </h2>
              <p className="text-on-surface-variant mb-8 leading-relaxed text-sm md:text-base">
                {t("tutor.subtitle", "Grounded in official MoSPI methodologies, National Accounts, Sampling Theory, and Price Statistics.")}
              </p>
              
              <div className="w-full grid gap-3 sm:grid-cols-2">
                {suggestedQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => ask(undefined, q)}
                    className="text-left p-4 rounded-2xl bg-surface-container-high/40 border border-outline-variant/30 hover:border-primary-container/50 hover:bg-surface-container transition-all text-xs md:text-sm text-on-surface group shadow-sm"
                  >
                    <span className="block text-primary-container mb-1.5 opacity-70 group-hover:opacity-100 transition-opacity">
                      <MessageSquare className="w-4 h-4" />
                    </span>
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div key={msg.id || idx} className={`flex w-full animate-fade-up ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`rounded-3xl shadow-sm transition-all ${
                  msg.role === "user"
                    ? "max-w-[85%] md:max-w-[70%] bg-gradient-to-r from-primary to-primary-container text-black font-medium p-5 rounded-tr-sm shadow-md"
                    : "max-w-[95%] md:max-w-[85%] bg-surface-container-low/90 border border-outline-variant/40 p-6 md:p-7 rounded-tl-sm text-on-surface shadow-md"
                }`}
              >
                {msg.role === "assistant" && (
                  <div className="flex items-center justify-between mb-4 border-b border-outline-variant/25 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-primary-container/20 text-primary-container flex items-center justify-center border border-primary-container/30">
                        <Sparkles className="w-3.5 h-3.5" />
                      </span>
                      <span className="text-xs font-label-caps text-primary-container font-bold tracking-wider">
                        {t("tutor.title", "STATIQ AI STATISTICAL TUTOR")}
                      </span>
                    </div>

                    <button
                      onClick={() => copyText(msg.content, msg.id)}
                      className="text-on-surface-variant hover:text-on-surface p-1.5 rounded-lg transition-colors border border-outline-variant/30 bg-surface-container-high flex items-center gap-1.5 px-2.5 text-[10px] font-label-caps"
                      title="Copy response"
                    >
                      {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedId === msg.id ? "COPIED" : "COPY"}
                    </button>
                  </div>
                )}
                
                {msg.role === "user" ? (
                  <p className="text-sm md:text-[15px] leading-relaxed whitespace-pre-wrap font-sans">
                    {msg.content}
                  </p>
                ) : (
                  <div className="font-sans leading-relaxed text-on-surface">
                    {renderMarkdown(msg.content)}
                  </div>
                )}

                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-5 pt-4 border-t border-outline-variant/20 space-y-2">
                    <p className="text-[10px] font-label-caps font-bold text-on-surface-variant flex items-center gap-1.5 tracking-wider uppercase">
                      <Book className="w-3.5 h-3.5 text-primary-container" />
                      VERIFIED STATISTICAL SOURCES
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {msg.sources.map((s: any, i: number) => (
                        <div key={i} className="px-3 py-1 bg-surface-container-high rounded-lg border border-outline-variant/30 text-[11px] font-medium text-on-surface-variant" title={s.excerpt}>
                          {s.name}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {pending && (
            <div className="flex justify-start animate-fade-up">
              <div className="bg-surface-container-low rounded-3xl rounded-tl-sm p-5 border border-outline-variant/30 shadow-sm flex items-center gap-3">
                 <div className="flex gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-primary-container animate-bounce" style={{ animationDelay: "0ms" }}></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-primary-container animate-bounce" style={{ animationDelay: "150ms" }}></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-primary-container animate-bounce" style={{ animationDelay: "300ms" }}></span>
                 </div>
                 <span className="text-sm font-medium text-on-surface-variant">
                   {t("tutor.typing", "StatIQ AI is synthesizing official statistical data...")}
                 </span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 md:p-6 bg-surface-container-lowest/80 backdrop-blur-md border-t border-outline-variant/30 shrink-0">
          <form onSubmit={ask} className="relative flex items-end gap-3 max-w-4xl mx-auto">
            <textarea
              className="flex-1 bg-surface-container-high/60 border border-outline-variant/40 rounded-2xl resize-none py-3.5 px-5 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/15 transition-all min-h-[52px] max-h-[200px] font-sans"
              value={input}
              rows={input.split('\n').length > 1 ? Math.min(input.split('\n').length, 6) : 1}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t("tutor.placeholder", "Ask anything about statistical surveys, CPI, GDP calculation, or sampling methodology...")}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  ask(e);
                }
              }}
            />
            <button 
              type="submit"
              disabled={pending || !input.trim()}
              className="w-12 h-[52px] shrink-0 rounded-xl glow-button text-black flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg mb-0 border border-primary/20" 
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
          <div className="text-center mt-3">
            <span className="text-[10px] text-on-surface-variant/70 font-label-caps">
              {t("tutor.aiDisclaimer", "StatIQ AI provides guidance grounded in official Indian statistical standards.")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
