import React from 'react';
import { EventPlan, Collaborator } from '../types/event';
import { Sparkles, Calendar, Users, Share2, Plus, MessageSquareText, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  currentEvent: EventPlan | null;
  events: EventPlan[];
  onSelectEvent: (event: EventPlan) => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onOpenCreateModal: () => void;
  onOpenShareModal: () => void;
  onOpenCopilot: () => void;
  currentCollaborator: Collaborator;
  onSwitchCollaborator: (collaborator: Collaborator) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentEvent,
  events,
  onSelectEvent,
  activeTab,
  onTabChange,
  onOpenCreateModal,
  onOpenShareModal,
  onOpenCopilot,
  currentCollaborator,
  onSwitchCollaborator,
}) => {
  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'budget', label: 'Budget' },
    { id: 'timeline', label: 'Timeline & Schedule' },
    { id: 'vendors', label: 'Vendors' },
    { id: 'ideas', label: 'Creative Ideas' },
    { id: 'chatbot', label: 'AI Chatbot' },
    { id: 'team', label: 'Collaborators' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      {/* Top Bar: 3-Zone Contract */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          
          {/* Zone 1: Brand Wordmark & Event Selector */}
          <div className="flex items-center gap-4 shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold tracking-tight text-slate-900 font-display whitespace-nowrap">
                AuraEvent<span className="text-indigo-600">.ai</span>
              </span>
            </div>

            <span className="text-slate-300 hidden sm:inline" aria-hidden="true">|</span>

            {/* Event Dropdown Selector */}
            {events.length > 0 ? (
              <div className="relative group">
                <select
                  value={currentEvent?.id || ''}
                  onChange={(e) => {
                    const ev = events.find((item) => item.id === e.target.value);
                    if (ev) onSelectEvent(ev);
                  }}
                  className="text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200/80 rounded-md py-1.5 pl-3 pr-8 border-none focus:ring-2 focus:ring-indigo-500 cursor-pointer transition-colors max-w-[200px] sm:max-w-[280px] truncate"
                >
                  {events.map((ev) => (
                    <option key={ev.id} value={ev.id}>
                      {ev.eventType === 'wedding' ? '💍 ' : ev.eventType === 'birthday' ? '🎂 ' : '🎪 '}
                      {ev.title}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <span className="text-xs text-slate-500 italic">No event yet</span>
            )}
          </div>

          {/* Zone 2: Navigation Links (Clean single-line text tabs) */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`py-1 transition-colors whitespace-nowrap relative ${
                  activeTab === tab.id
                    ? 'text-indigo-600 font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <span className="absolute bottom-[-16px] left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />
                )}
              </button>
            ))}
          </nav>

          {/* Zone 3: Collaborator Persona Switcher & Primary Action */}
          <div className="flex items-center gap-3 shrink-0">
            
            {/* Active Planner Profile Selector (Demonstrating Collaborative Shared Editing) */}
            <div className="relative group">
              <button
                type="button"
                className="flex items-center gap-2 p-1 rounded-full hover:bg-slate-100 transition-colors border border-slate-200"
                title="Switch Active Planner Role"
              >
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-xs"
                  style={{ backgroundColor: currentCollaborator.color }}
                >
                  {currentCollaborator.name.charAt(0)}
                </div>
                <div className="hidden md:block text-left text-xs pr-2">
                  <div className="font-semibold text-slate-900 leading-tight truncate max-w-[100px]">
                    {currentCollaborator.name}
                  </div>
                  <div className="text-[10px] text-slate-500 leading-tight">
                    {currentCollaborator.role.replace('_', ' ')}
                  </div>
                </div>
              </button>

              {/* Persona switch dropdown */}
              <div className="absolute right-0 mt-1 w-64 bg-white rounded-xl shadow-lg border border-slate-200 py-2 hidden group-hover:block z-50">
                <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Simulate Editing As:
                </div>
                {(currentEvent?.collaborators || [currentCollaborator]).map((c) => (
                  <button
                    key={c.id}
                    onClick={() => onSwitchCollaborator(c)}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-xs text-left hover:bg-slate-50 transition-colors ${
                      c.id === currentCollaborator.id ? 'bg-indigo-50/70 text-indigo-900 font-semibold' : 'text-slate-700'
                    }`}
                  >
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                      style={{ backgroundColor: c.color }}
                    >
                      {c.name.charAt(0)}
                    </div>
                    <div className="truncate flex-1">
                      <div>{c.name}</div>
                      <div className="text-[10px] text-slate-500">{c.title}</div>
                    </div>
                    {c.id === currentCollaborator.id && (
                      <span className="text-indigo-600 text-xs">Active</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* AI Copilot Quick Button */}
            <button
              onClick={onOpenCopilot}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors whitespace-nowrap border border-indigo-200"
            >
              <MessageSquareText className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden sm:inline">AI Copilot</span>
            </button>

            {/* Share / Export */}
            <button
              onClick={onOpenShareModal}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              title="Share and Export Plan"
            >
              <Share2 className="w-4 h-4" />
            </button>

            {/* New Event AI Generator Button */}
            <button
              onClick={onOpenCreateModal}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-colors whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Plan</span>
            </button>
          </div>

        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="flex lg:hidden overflow-x-auto gap-4 py-2 border-t border-slate-100 text-xs font-medium no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`pb-1 whitespace-nowrap shrink-0 transition-colors ${
                activeTab === tab.id
                  ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600'
                  : 'text-slate-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

      </div>
    </header>
  );
};
