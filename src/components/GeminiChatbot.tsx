import React, { useState, useRef, useEffect } from 'react';
import { EventPlan, AIMessage, Collaborator } from '../types/event';
import { Sparkles, Send, Bot, User, Trash2, Copy, Check, Zap, DollarSign, Calendar, Layers, ShieldCheck, ArrowRight, CornerDownLeft } from 'lucide-react';
import { sendChatbotMessage } from '../services/geminiService';

interface GeminiChatbotProps {
  event: EventPlan | null;
  currentCollaborator: Collaborator;
  onUpdateEvent?: (updated: EventPlan) => void;
  onAddActivity?: (action: string, detail: string) => void;
}

export const GeminiChatbot: React.FC<GeminiChatbotProps> = ({
  event,
  currentCollaborator,
  onUpdateEvent,
  onAddActivity,
}) => {
  const [selectedRole, setSelectedRole] = useState<'lead_planner' | 'budget_strategist' | 'fast_assistant' | 'creative_director'>('lead_planner');
  const [modelPreference, setModelPreference] = useState<'gemini-3.8-flash' | 'gemini-3.1-flash-lite'>('gemini-3.1-flash-lite');
  
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: 'init-1',
      sender: 'assistant',
      content: event
        ? `Hello! I am your real-time Gemini Event Planning Assistant. I am loaded with the details of "${event.title}" (${event.eventType}, ${event.guestCount} guests, $${(event.totalBudget || 0).toLocaleString()} budget). How can I help you organize or optimize your event today?`
        : `Welcome to AuraEvent AI. I am your multi-turn Gemini planning assistant. Create or select an event, or tell me what type of wedding, birthday, or community celebration you are planning and I will help you organize it from scratch!`,
      timestamp: 'Just now',
      suggestions: event ? [
        'How should we adjust our schedule for sunset photos?',
        'Draft a 10% negotiation email for our catering quote',
        'Suggest 3 outdoor rain contingency ideas',
        'How can we save $1,500 on decor without looking cheap?',
      ] : [
        'Help me outline a realistic budget for a 120-person wedding',
        'Suggest a schedule for a milestone 30th birthday dinner',
        'What permits are required for a community park festival?',
      ],
    },
  ]);

  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sync event context when active event changes
  useEffect(() => {
    if (event?.id) {
      setMessages((prev) => [
        ...prev,
        {
          id: `switched-${event.id}`,
          sender: 'assistant',
          content: `Loaded live event context for "${event.title}" (${event.eventType}, ${event.guestCount} guests, $${(event.totalBudget || 0).toLocaleString()} budget). Ready to assist with budgeting, scheduling, and vendor outreach.`,
          timestamp: 'Just now',
          suggestions: [
            'Analyze our current budget allocation',
            'Draft a vendor negotiation email',
            'Suggest an hourly run-of-show schedule',
          ],
        },
      ]);
    }
  }, [event?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const roles = [
    {
      id: 'lead_planner',
      name: 'Lead Master Planner',
      model: 'gemini-3.8-flash',
      desc: 'Holistic event orchestration, schedule pacing, guest flow & vendor coordination',
      badge: 'Master Director',
    },
    {
      id: 'budget_strategist',
      name: 'Budget & Financial Strategist',
      model: 'gemini-3.8-flash',
      desc: 'Mathematical budget allocations, deposit schedules & contract negotiation',
      badge: 'Financial Strategist',
    },
    {
      id: 'fast_assistant',
      name: 'Rapid Dispatcher & Email Drafter',
      model: 'gemini-3.1-flash-lite',
      desc: 'Instant replies, quick checklists, and fast vendor inquiry drafts',
      badge: 'Fast Assistant',
    },
    {
      id: 'creative_director',
      name: 'Creative & Sensory Director',
      model: 'gemini-3.8-flash',
      desc: 'Bespoke themes, lighting architectures, signature food & interactive moments',
      badge: 'Design & Vibe',
    },
  ];

  const handleRoleSelect = (roleId: any) => {
    setSelectedRole(roleId);
    const target = roles.find((r) => r.id === roleId);
    if (target) {
      setModelPreference(target.model as any);
      setMessages((prev) => [
        ...prev,
        {
          id: `role-${Date.now()}`,
          sender: 'assistant',
          content: `I have switched to the **${target.name}** role (powered by \`${target.model}\`). ${target.desc}. What shall we focus on?`,
          timestamp: 'Just now',
          suggestions: roleId === 'budget_strategist' ? [
            'Analyze our current budget allocation for cost risks',
            'Draft a vendor negotiation script for catering',
            'Suggest a contingency reserve percentage',
          ] : roleId === 'creative_director' ? [
            'Suggest 3 sensory signature cocktail concepts',
            'How to design an unforgettable guest entrance',
            'Ideas for interactive guest favors with zero waste',
          ] : roleId === 'fast_assistant' ? [
            'Draft quick vendor load-in confirmation email',
            'Give me a 5-point day-of coordinator emergency kit checklist',
          ] : [
            'Create a timeline rundown from arrival to departure',
            'How to handle unexpected bad weather for outdoor events',
          ],
        },
      ]);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || isLoading) return;

    const userMessage: AIMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      content: text.trim(),
      timestamp: 'Just now',
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await sendChatbotMessage({
        messages: messages,
        userMessage: text.trim(),
        role: selectedRole,
        modelPreference: modelPreference,
        eventContext: event,
      });

      const assistantMessage: AIMessage = {
        id: `a-${Date.now()}`,
        sender: 'assistant',
        content: response.reply,
        timestamp: 'Just now',
        suggestions: response.suggestions,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      if (onAddActivity) {
        onAddActivity('Consulted Gemini Chatbot', `Asked about "${text.slice(0, 30)}..."`);
      }
    } catch {
      const errorMsg: AIMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        content: 'I had trouble communicating with the server. Please try again.',
        timestamp: 'Just now',
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: `reset-${Date.now()}`,
        sender: 'assistant',
        content: 'Conversation history reset. How can I help you plan?',
        timestamp: 'Just now',
        suggestions: [
          'Help me optimize the event budget',
          'Draft a vendor negotiation email',
          'Create an hourly run-of-show schedule',
        ],
      },
    ]);
  };

  return (
    <div className="space-y-6 pb-16">
      
      {/* Top Banner & Role Selection Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs">
                <Sparkles className="w-4 h-4" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 font-display">
                Gemini Multi-Turn Planning Chatbot
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {event
                ? `Currently grounded in your active event: "${event.title}" · ${event.guestCount} guests · $${event.totalBudget.toLocaleString()}`
                : 'Interactive conversational planning assistant grounded in your customized inputs'}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={handleClearHistory}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-slate-200"
              title="Clear Conversation History"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Thread</span>
            </button>
          </div>
        </div>

        {/* Specialized Roles Bar with System Instructions */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Select Chatbot Specialist Role:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {roles.map((r) => (
              <button
                key={r.id}
                onClick={() => handleRoleSelect(r.id)}
                className={`p-3 rounded-lg border text-left transition-all ${
                  selectedRole === r.id
                    ? 'border-indigo-600 bg-indigo-50/70 ring-1 ring-indigo-600 shadow-2xs'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-900">{r.badge}</span>
                  <span className="text-[10px] font-mono text-indigo-700 bg-white/80 px-1.5 py-0.5 rounded border border-indigo-100">
                    {r.model}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                  {r.desc}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Chat Conversation Container */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col h-[600px] overflow-hidden">
        
        {/* Scrollable Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/40 text-xs">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-3xl ${
                msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
              }`}
            >
              {/* Avatar Icon */}
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold ${
                  msg.sender === 'user'
                    ? 'bg-slate-900 text-white'
                    : 'bg-indigo-600 text-white'
                }`}
              >
                {msg.sender === 'user' ? currentCollaborator.name.charAt(0) : <Sparkles className="w-3.5 h-3.5" />}
              </div>

              {/* Message Bubble */}
              <div className="space-y-2 flex-1">
                <div
                  className={`p-4 rounded-2xl leading-relaxed whitespace-pre-wrap shadow-2xs ${
                    msg.sender === 'user'
                      ? 'bg-slate-900 text-white rounded-tr-xs'
                      : 'bg-white text-slate-800 border border-slate-200/90 rounded-tl-xs'
                  }`}
                >
                  {msg.content}
                </div>

                {/* Message footer & copy button for AI */}
                {msg.sender === 'assistant' && (
                  <div className="flex items-center justify-between px-1 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <span className="font-semibold text-indigo-600 capitalize">
                        {selectedRole.replace(/_/g, ' ')}
                      </span>
                      <span>·</span>
                      <span className="font-mono text-slate-400">{modelPreference}</span>
                    </span>

                    <button
                      onClick={() => handleCopyMessage(msg.id, msg.content)}
                      className="hover:text-indigo-600 flex items-center gap-1 transition-colors"
                      title="Copy response"
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

                {/* Quick Interactive Follow-Up Chips */}
                {msg.suggestions && msg.suggestions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {msg.suggestions.map((suggestion, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(suggestion)}
                        className="text-[11px] px-2.5 py-1.5 rounded-lg bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 text-slate-700 transition-colors flex items-center gap-1.5 shadow-2xs text-left"
                      >
                        <span>{suggestion}</span>
                        <ArrowRight className="w-3 h-3 text-indigo-500 shrink-0" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200 max-w-sm shadow-2xs">
              <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-slate-600">
                {selectedRole === 'budget_strategist'
                  ? 'Calculating financial allocations...'
                  : selectedRole === 'fast_assistant'
                  ? 'Drafting quick response...'
                  : 'Synthesizing planning recommendations...'}
              </span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input Bar */}
        <div className="p-3 sm:p-4 bg-white border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex gap-2 items-center"
          >
            <input
              type="text"
              placeholder={`Ask the ${roles.find((r) => r.id === selectedRole)?.name} anything about your event...`}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-colors shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>
          <div className="mt-2 text-[10px] text-slate-400 flex items-center justify-between px-1">
            <span>Powered by Gemini API multi-turn dialogue with continuous context memory</span>
            <span>Press Enter to send</span>
          </div>
        </div>

      </div>

    </div>
  );
};
