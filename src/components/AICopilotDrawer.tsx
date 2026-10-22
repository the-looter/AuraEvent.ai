import React, { useState, useRef, useEffect } from 'react';
import { EventPlan, AIMessage } from '../types/event';
import { Sparkles, Send, X, Bot, User, Copy, Check, ChevronRight } from 'lucide-react';
import { askCopilotAI } from '../services/geminiService';

interface AICopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  event: EventPlan;
}

export const AICopilotDrawer: React.FC<AICopilotDrawerProps> = ({
  isOpen,
  onClose,
  event,
}) => {
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: 'm-1',
      sender: 'assistant',
      content: `Hello! I am your real-time Gemini AI Copilot. I have live context for "${event?.title || 'your event'}" (${event?.eventType || 'event'}, ${event?.guestCount || 0} guests, $${(event?.totalBudget || 0).toLocaleString()} budget). How can I assist with your vendors, timeline pacing, budget optimization, or creative ideas?`,
      timestamp: 'Just now',
      suggestions: [
        'How can we reduce catering costs by 10%?',
        'What is the ideal hourly run-of-show sequence?',
        'Draft a vendor negotiation email',
        'Suggest 3 rain contingency ideas',
      ],
    },
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sync welcome message whenever active event changes
  useEffect(() => {
    if (event?.id) {
      setMessages([
        {
          id: `m-init-${event.id}`,
          sender: 'assistant',
          content: `Hello! I am your real-time Gemini AI Copilot. I have live context for "${event.title}" (${event.eventType}, ${event.guestCount} guests, $${(event.totalBudget || 0).toLocaleString()} budget). Ask me anything about budget allocation, vendor negotiations, timeline pacing, or contingency plans!`,
          timestamp: 'Just now',
          suggestions: [
            'How can we reduce catering costs by 10%?',
            'What is the ideal hourly run-of-show sequence?',
            'Draft an inquiry email for our venue',
            'Suggest 3 unique guest experience touches',
          ],
        },
      ]);
    }
  }, [event?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isOpen) return null;

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || isLoading) return;

    const userMsg: AIMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      content: text.trim(),
      timestamp: 'Just now',
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await askCopilotAI({
        eventContext: event,
        conversationHistory: messages,
        userMessage: text.trim(),
      });

      const assistantMsg: AIMessage = {
        id: `a-${Date.now()}`,
        sender: 'assistant',
        content: response.reply,
        timestamp: 'Just now',
        suggestions: response.suggestions,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      const errorMsg: AIMessage = {
        id: `a-${Date.now()}`,
        sender: 'assistant',
        content: 'I encountered an error querying the model. Please check the prompt or try again.',
        timestamp: 'Just now',
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden pointer-events-none">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/30 backdrop-blur-xs transition-opacity pointer-events-auto"
      />

      {/* Slide-over panel */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10 pointer-events-auto">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-slate-200">
          
          {/* Header */}
          <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-indigo-500 flex items-center justify-center text-white">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold font-display">AuraEvent AI Copilot</h3>
                <p className="text-[11px] text-slate-300 truncate max-w-[240px]">
                  Context: {event.title}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs bg-slate-50/50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 shadow-2xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-slate-900 text-white rounded-br-xs'
                      : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.content}</div>

                  {msg.sender === 'assistant' && (
                    <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                      <span>AuraEvent Intelligence</span>
                      <button
                        onClick={() => handleCopy(msg.id, msg.content)}
                        className="hover:text-indigo-600 flex items-center gap-1"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-600">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {/* Suggestions chips */}
                {msg.suggestions && msg.suggestions.length > 0 && (
                  <div className="mt-2.5 flex flex-wrap gap-1.5 max-w-[95%]">
                    {msg.suggestions.map((s, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSend(s)}
                        className="text-[11px] text-left px-2.5 py-1.5 rounded-lg bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 text-slate-700 transition-colors flex items-center gap-1"
                      >
                        <span>{s}</span>
                        <ChevronRight className="w-3 h-3 text-indigo-500 shrink-0" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-2 text-xs text-slate-500 p-2">
                <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                <span>Copilot is formulating expert response...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <div className="p-3 bg-white border-t border-slate-200">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                placeholder="Ask about budgets, timeline, rain contingencies..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
                className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg transition-colors flex items-center justify-center shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
};
