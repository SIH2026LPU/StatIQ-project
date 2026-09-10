"use client";

import { useState, useEffect, useRef } from "react";
import { Send, Book, Sparkles, MessageSquare, Plus, Trash2, Check, Copy } from "lucide-react";
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

// Safe simple markdown parser
const renderMarkdown = (content: string) => {
  const codeBlockRegex = /(```[\s\S]*?```)/g;
  const parts = content.split(codeBlockRegex);

  return parts.map((part, index) => {
    if (part.startsWith('```')) {
      const code = part.replace(/^```[\w]*\n/, '').replace(/```$/, '');
      return (
        <pre key={index} className="bg-surface-container-highest p-4 rounded-xl overflow-x-auto text-sm my-4 text-on-surface font-mono border border-outline-variant/30 shadow-inner" dir="ltr">
          {code}
        </pre>
      );
    }

    const paragraphs = part.split('\n\n');
    return (
      <div key={index} className="space-y-3">
        {paragraphs.map((p, i) => {
          const lines = p.split('\n');
          if (lines.every(l => l.trim().startsWith('-') || l.trim().startsWith('*'))) {
            return (
              <ul key={i} className="list-disc pl-5 space-y-1 my-2">
                {lines.map((l, j) => {
                  const text = l.replace(/^[\-\*]\s+/, '');
                  return <li key={j}>{renderInline(text)}</li>;
                })}
              </ul>
            );
          }
          return <p key={i} className="leading-relaxed">{renderInline(p)}</p>;
        })}
      </div>
    );
  });
};

const renderInline = (text: string) => {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((chunk, j) => {
    if (chunk.startsWith('**') && chunk.endsWith('**')) {
      return <strong key={j} className="text-on-surface font-semibold">{chunk.slice(2, -2)}</strong>;
    }
    return <span key={j}>{chunk}</span>;
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

  // Load conversations on mount
  useEffect(() => {
    fetchConversations();
  }, []);

  // Scroll to bottom when messages change
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
            currentConvId = cData.conversation?.id || `local-conv-${Date.now()}`;
            setActiveConvId(currentConvId);
            if (cData.conversation) {
              setConversations(prev => [cData.conversation, ...prev]);
            }
          } else {
            currentConvId = `local-conv-${Date.now()}`;
            setActiveConvId(currentConvId);
          }
        } catch {
          currentConvId = `local-conv-${Date.now()}`;
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
        // If current language is not English, dynamically translate the AI response
        if (currentLanguage.code !== "en") {
          aiContent = await translateDynamic(aiContent, currentLanguage.code);
        }
        
        const translatedMsg = { ...data.message, content: aiContent };
        setMessages((prev) => [...prev.filter(m => m.id !== "temp-user"), tempMsg, translatedMsg]);
      } else if (data.error) {
        setMessages((prev) => [...prev.filter(m => m.id !== "temp-user"), tempMsg, { id: "err", role: "assistant", content: `**Error:** ${data.error}` }]);
      }
      fetchConversations();
    } catch (err) {
      setMessages((prev) => [...prev.filter(m => m.id !== "temp-user"), tempMsg, { id: "err", role: "assistant", content: "**Error:** The AI Tutor is temporarily unavailable." }]);
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
    "How do Laspeyres and Paasche index formulas differ in national accounts?"
  ];

  return (
    <div className="flex flex-col md:flex-row w-full h-full min-h-[600px] h-[70vh] border border-outline-variant/30 rounded-3xl overflow-hidden shadow-sm glass-panel">
      
      {/* Sidebar */}
      <div className="w-full md:w-64 lg:w-72 border-b md:border-b-0 md:border-r border-outline-variant/30 flex flex-col bg-surface-container-lowest/50 flex-shrink-0">
        <div className="p-4 border-b border-outline-variant/30">
          <button
            onClick={startNewChat}
            className="w-full py-2.5 px-4 rounded-xl bg-primary/10 hover:bg-primary/20 border border-primary/20 text-primary flex items-center justify-center gap-2 font-bold font-label-caps text-xs transition-colors shadow-sm"
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
            conversations.map(conv => (
              <div
                key={conv.id}
                onClick={() => loadConversation(conv.id)}
                className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors ${activeConvId === conv.id ? "bg-surface-container border-l-2 border-primary" : "hover:bg-surface-container-low"}`}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <MessageSquare className={`w-4 h-4 flex-shrink-0 ${activeConvId === conv.id ? "text-primary" : "text-on-surface-variant"}`} />
                  <span className={`text-sm truncate ${activeConvId === conv.id ? "text-on-surface font-medium" : "text-on-surface-variant"}`}>
                    {conv.title}
                  </span>
                </div>
                <button
                  onClick={(e) => deleteConversation(conv.id, e)}
                  className="opacity-0 group-hover:opacity-100 hover:text-error transition-opacity p-1 rounded-md hover:bg-surface-container-high"
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
            <div className="flex flex-col items-center justify-center h-full max-w-lg mx-auto text-center animate-fade-up">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 border border-primary/20">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-display font-bold text-on-surface mb-2">
                {t("tutor.title", "StatIQ AI Statistical Tutor")}
              </h2>
              <p className="text-on-surface-variant mb-8 leading-relaxed">
                {t("tutor.subtitle", "Grounded in official MoSPI methodologies, National Accounts, Sampling Theory, and Price Statistics.")}
              </p>
              
              <div className="w-full grid gap-3 sm:grid-cols-2">
                {suggestedQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => ask(undefined, q)}
                    className="text-left p-4 rounded-2xl bg-surface-container-high/40 border border-outline-variant/30 hover:border-primary/40 hover:bg-surface-container transition-all text-sm text-on-surface group shadow-sm"
                  >
                    <span className="block text-primary mb-1 opacity-70 group-hover:opacity-100 transition-opacity"><MessageSquare className="w-4 h-4" /></span>
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div key={msg.id || idx} className={`flex w-full animate-fade-up ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] md:max-w-[75%] rounded-2xl p-5 shadow-sm ${
                msg.role === "user" 
                  ? "bg-primary text-on-primary rounded-tr-sm" 
                  : "bg-surface-container-low border border-outline-variant/30 text-on-surface rounded-tl-sm"
              }`}>
                
                {msg.role === "assistant" && (
                  <div className="flex items-center justify-between mb-3 border-b border-outline-variant/20 pb-3">
                    <span className="text-xs font-label-caps text-primary flex items-center gap-1.5 font-bold">
                      <Sparkles className="w-3.5 h-3.5" /> {t("tutor.title", "STATIQ AI TUTOR")}
                    </span>
                    <button 
                      onClick={() => copyText(msg.content, msg.id)}
                      className="text-on-surface-variant hover:text-on-surface p-1 rounded-md transition-colors border border-outline-variant/30 bg-surface-container-high flex items-center gap-1.5 px-2 text-[10px] font-label-caps"
                      title="Copy response"
                    >
                      {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedId === msg.id ? "COPIED" : "COPY"}
                    </button>
                  </div>
                )}
                
                <div className="text-[15px] whitespace-pre-wrap font-sans leading-relaxed text-on-surface">
                  {renderMarkdown(msg.content)}
                </div>

                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-outline-variant/20 space-y-2">
                    <p className="text-[10px] font-label-caps font-bold text-on-surface-variant flex items-center gap-1.5">
                      <Book className="w-3.5 h-3.5" /> VERIFIED SOURCES
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {msg.sources.map((s: any, i: number) => (
                        <div key={i} className="px-2.5 py-1 bg-surface-container-high rounded-md border border-outline-variant/30 text-[11px] font-medium text-on-surface-variant" title={s.excerpt}>
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
            <div className="flex justify-start">
              <div className="bg-surface-container-low rounded-2xl rounded-tl-sm p-5 border border-outline-variant/30 shadow-sm flex items-center gap-3">
                 <div className="flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }}></span>
                    <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }}></span>
                    <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }}></span>
                 </div>
                 <span className="text-sm font-medium text-on-surface-variant">
                   {t("tutor.typing", "AI Tutor is formulating your response...")}
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
              className="flex-1 bg-surface-container-high/60 border border-outline-variant/40 rounded-2xl resize-none py-3.5 px-5 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all min-h-[52px] max-h-[200px] font-sans"
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
