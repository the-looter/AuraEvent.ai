import React, { useState } from 'react';
import { EventPlan, CreativeIdea, IdeaCategory, Collaborator } from '../types/event';
import { Sparkles, Bookmark, BookmarkCheck, Plus, Lightbulb, X, Tag } from 'lucide-react';
import { generateCreativeIdeasAI } from '../services/geminiService';

interface CreativeIdeasBoardProps {
  event: EventPlan;
  currentCollaborator: Collaborator;
  onUpdateEvent: (updated: EventPlan) => void;
  onAddActivity: (action: string, detail: string) => void;
}

export const CreativeIdeasBoard: React.FC<CreativeIdeasBoardProps> = ({
  event,
  currentCollaborator,
  onUpdateEvent,
  onAddActivity,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isGenerating, setIsGenerating] = useState(false);
  const [customFocus, setCustomFocus] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Custom Idea State
  const [newIdea, setNewIdea] = useState<Partial<CreativeIdea>>({
    category: 'Guest Experience',
    title: '',
    description: '',
    estimatedCostTier: '$$',
    tags: ['Personalized'],
    saved: true,
  });

  const categories: ('All' | IdeaCategory)[] = [
    'All',
    'Theme & Decor',
    'Signature Menu',
    'Entertainment & Music',
    'Guest Experience',
    'Gifts & Favors',
  ];

  const ideas = event.creativeIdeas || [];
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  const filteredIdeas = selectedCategory === 'All'
    ? ideas
    : ideas.filter((i) => i.category === selectedCategory);

  const handleToggleSave = (ideaId: string) => {
    let savedState = false;
    const updated = {
      ...event,
      creativeIdeas: ideas.map((idea) => {
        if (idea.id === ideaId) {
          savedState = !idea.saved;
          return { ...idea, saved: savedState };
        }
        return idea;
      }),
    };
    onUpdateEvent(updated);
    onAddActivity(
      savedState ? 'Saved Creative Concept' : 'Unpinned Creative Concept',
      `Idea updated by ${currentCollaborator.name}`
    );
  };

  const handleDeleteIdea = (ideaId: string) => {
    const target = ideas.find((i) => i.id === ideaId);
    const updated = {
      ...event,
      creativeIdeas: ideas.filter((i) => i.id !== ideaId),
    };
    onUpdateEvent(updated);
    onAddActivity('Removed Creative Idea', `Removed "${target?.title || 'concept'}"`);
  };

  const handleGenerateAI = async (overrideFocus?: string) => {
    const focusToUse = (typeof overrideFocus === 'string' ? overrideFocus : customFocus).trim() ||
      'Distinctive sensory, culinary and experiential guest moments';

    setIsGenerating(true);
    setStatusMessage({ type: 'info', text: 'Gemini is brainstorming tailored creative concepts...' });

    try {
      const newIdeas = await generateCreativeIdeasAI({
        eventType: event.eventType || 'event',
        title: event.title || 'Celebration',
        theme: event.theme || 'Curated & Memorable',
        focus: focusToUse,
        guestCount: event.guestCount || 80,
      });

      if (newIdeas && newIdeas.length > 0) {
        const formatted = newIdeas.map((i, idx) => ({
          ...i,
          id: `ci-${Date.now()}-${idx}`,
          tags: Array.isArray(i.tags) ? i.tags : ['Personalized', 'Concept'],
          saved: true,
        }));

        const updated = {
          ...event,
          creativeIdeas: [...formatted, ...ideas],
        };

        onUpdateEvent(updated);
        setSelectedCategory('All');
        setCustomFocus('');
        setStatusMessage({
          type: 'success',
          text: `✨ Successfully added ${newIdeas.length} creative concepts for "${focusToUse.slice(0, 35)}"!`,
        });
        setTimeout(() => setStatusMessage(null), 5000);
        onAddActivity(
          'Generated AI Creative Ideas',
          `Generated ${newIdeas.length} concepts for "${focusToUse.slice(0, 35)}"`
        );
      } else {
        setStatusMessage({
          type: 'error',
          text: 'No concepts returned. Please try another focus keyword or prompt.',
        });
      }
    } catch (err: any) {
      console.error('Creative ideas generation failed:', err);
      setStatusMessage({
        type: 'error',
        text: 'Failed to generate ideas. Please check your connection and try again.',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddCustomIdea = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIdea.title?.trim()) return;

    const idea: CreativeIdea = {
      id: `ci-${Date.now()}`,
      category: (newIdea.category as IdeaCategory) || 'Guest Experience',
      title: newIdea.title.trim(),
      description: newIdea.description || '',
      estimatedCostTier: newIdea.estimatedCostTier as any || '$$',
      tags: Array.isArray(newIdea.tags) && newIdea.tags.length > 0 ? newIdea.tags : ['Custom'],
      saved: true,
    };

    const updated = {
      ...event,
      creativeIdeas: [idea, ...ideas],
    };

    onUpdateEvent(updated);
    onAddActivity('Added Creative Concept', `Added "${idea.title}"`);
    setIsAddModalOpen(false);
    setSelectedCategory('All');
    setNewIdea({
      category: 'Guest Experience',
      title: '',
      description: '',
      estimatedCostTier: '$$',
      tags: ['Personalized'],
      saved: true,
    });
  };

  const quickPills = [
    { label: '🍸 Bespoke Cocktails & Culinary', focus: 'Signature welcome cocktails, tasting flights and culinary pairings' },
    { label: '✨ Starlit Lighting & Overhead Canopy', focus: 'Intimate fairy lighting, suspended florals and atmospheric canopy' },
    { label: '📸 Audio Guestbook & Retro Keepsakes', focus: 'Vintage rotary phone audio guestbook, polaroid scrapbook and guest tokens' },
    { label: '🎶 Live Acoustic Sunset Set', focus: 'Live acoustic musical transitions and memorable ambient entertainment' },
    { label: '🌱 Sustainable & Plantable Favors', focus: 'Eco-friendly wildflower seed paper favors and zero-waste artisan keepsakes' },
  ];

  return (
    <div className="space-y-6 pb-16">
      
      {/* Header & AI Idea Prompt Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">
            Personalized Creative Ideas & Moodboard
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Bespoke sensory elements, signature culinary twists, and interactive entertainment concepts powered by Gemini
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-colors whitespace-nowrap self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Custom Idea</span>
        </button>
      </div>

      {/* AI Inspiration Generator Input Box */}
      <div className="p-4 bg-white rounded-xl border border-slate-200/90 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-700">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>Ask Gemini AI to Brainstorm Themed Creative Concepts</span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
            gemini-3.1-flash-lite · instant
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            placeholder="e.g. Eco-friendly organic decor, late night street food carts, sunset acoustic jazz, or custom tasting flights..."
            value={customFocus}
            onChange={(e) => setCustomFocus(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleGenerateAI();
            }}
            className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={() => handleGenerateAI()}
            disabled={isGenerating}
            className="flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg shadow-sm transition-colors whitespace-nowrap"
          >
            {isGenerating ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Lightbulb className="w-4 h-4" />
            )}
            <span>{isGenerating ? 'Brainstorming Concepts...' : 'Generate with AI'}</span>
          </button>
        </div>

        {/* Quick Inspiration Pills */}
        <div className="pt-1 flex flex-wrap items-center gap-1.5 text-[11px]">
          <span className="text-slate-400 font-medium mr-1">Quick prompts:</span>
          {quickPills.map((pill) => (
            <button
              key={pill.label}
              onClick={() => {
                setCustomFocus(pill.focus);
                handleGenerateAI(pill.focus);
              }}
              disabled={isGenerating}
              className="px-2.5 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 text-slate-600 rounded-full border border-slate-200 transition-colors disabled:opacity-50"
            >
              {pill.label}
            </button>
          ))}
        </div>

        {/* Live Status Message / Toast */}
        {statusMessage && (
          <div
            className={`p-3 rounded-lg text-xs flex items-center justify-between gap-2 transition-all ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : statusMessage.type === 'error'
                ? 'bg-rose-50 text-rose-800 border border-rose-200'
                : 'bg-indigo-50 text-indigo-800 border border-indigo-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {statusMessage.type === 'info' && (
                <div className="w-3.5 h-3.5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
            <button
              onClick={() => setStatusMessage(null)}
              className="text-slate-400 hover:text-slate-700 text-sm font-bold ml-2"
            >
              ×
            </button>
          </div>
        )}
      </div>

      {/* Category Tabs */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 no-scrollbar text-xs">
          {categories.map((cat) => {
            const count = cat === 'All' ? ideas.length : ideas.filter((i) => i.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  selectedCategory === cat
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                }`}
              >
                <span>{cat}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${selectedCategory === cat ? 'bg-slate-700 text-slate-200' : 'bg-slate-100 text-slate-500'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="text-xs text-slate-400 shrink-0 hidden sm:block">
          {filteredIdeas.length} {filteredIdeas.length === 1 ? 'concept' : 'concepts'}
        </div>
      </div>

      {/* Empty State */}
      {filteredIdeas.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-8 sm:p-12 text-center max-w-xl mx-auto shadow-xs space-y-4">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <Lightbulb className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 font-display">
              {selectedCategory === 'All'
                ? 'No creative concepts yet'
                : `No concepts found in "${selectedCategory}"`}
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto leading-relaxed">
              {selectedCategory === 'All'
                ? 'Generate personalized sensory ideas, signature menus, and entertainment moments using Gemini AI or add your own custom inspiration.'
                : `There are currently no ideas filed under ${selectedCategory}. Switch to "All" or ask Gemini to brainstorm concepts for this category.`}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            {selectedCategory !== 'All' && (
              <button
                onClick={() => setSelectedCategory('All')}
                className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                View All Concepts ({ideas.length})
              </button>
            )}
            <button
              onClick={() => handleGenerateAI(selectedCategory !== 'All' ? selectedCategory : undefined)}
              disabled={isGenerating}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg shadow-sm transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isGenerating ? 'Brainstorming...' : `Generate ${selectedCategory !== 'All' ? selectedCategory : ''} with AI`}</span>
            </button>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors"
            >
              Add Custom Idea
            </button>
          </div>
        </div>
      )}

      {/* Ideas Cards Grid */}
      {filteredIdeas.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredIdeas.map((idea) => {
            const tagsList = Array.isArray(idea.tags) ? idea.tags : [];
            return (
              <div
                key={idea.id}
                className={`rounded-xl border transition-all p-5 flex flex-col justify-between ${
                  idea.saved
                    ? 'bg-white border-slate-200/90 shadow-xs'
                    : 'bg-slate-50/60 border-slate-200/60 opacity-80'
                }`}
              >
                <div>
                  {/* Category & Pin */}
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <span className="text-xs font-semibold text-indigo-700">
                      {idea.category}
                    </span>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-medium text-slate-500">
                        {idea.estimatedCostTier}
                      </span>
                      <button
                        onClick={() => handleToggleSave(idea.id)}
                        className="text-slate-400 hover:text-indigo-600 transition-colors"
                        title={idea.saved ? 'Pinned to Master Plan' : 'Pin Idea'}
                      >
                        {idea.saved ? (
                          <BookmarkCheck className="w-4 h-4 text-indigo-600" />
                        ) : (
                          <Bookmark className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDeleteIdea(idea.id)}
                        className="text-slate-300 hover:text-rose-600 transition-colors text-xs"
                        title="Delete Idea"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-bold text-slate-900 mb-2 leading-snug">
                    {idea.title}
                  </h3>

                  {/* Description */}
                  <p className="text-xs text-slate-600 leading-relaxed mb-4">
                    {idea.description}
                  </p>
                </div>

                {/* Tags */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap gap-1">
                    {tagsList.map((t) => (
                      <span key={t} className="text-[10px] text-slate-500 font-medium bg-slate-100 px-1.5 py-0.5 rounded">
                        #{t}
                      </span>
                    ))}
                  </div>
                  <span className={`text-[10px] font-medium ${idea.saved ? 'text-indigo-600' : 'text-slate-400'}`}>
                    {idea.saved ? 'Active Concept' : 'Archived'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Custom Idea Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 font-display">
                Add Custom Idea
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCustomIdea} className="space-y-4 pt-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Concept Headline</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vintage Polaroid Guestbook Scrapbook Station"
                  value={newIdea.title}
                  onChange={(e) => setNewIdea({ ...newIdea, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Category</label>
                  <select
                    value={newIdea.category}
                    onChange={(e) => setNewIdea({ ...newIdea, category: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    {categories.filter((c) => c !== 'All').map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Cost Tier</label>
                  <select
                    value={newIdea.estimatedCostTier}
                    onChange={(e) => setNewIdea({ ...newIdea, estimatedCostTier: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                  >
                    <option value="$">$ (Budget-friendly / &lt;$300)</option>
                    <option value="$$">$$ (Moderate / $300 - $1,500)</option>
                    <option value="$$$">$$$ (Luxe / $1,500+)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Creative Description</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe the experience, sensory details, and setup instructions..."
                  value={newIdea.description}
                  onChange={(e) => setNewIdea({ ...newIdea, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg"
                >
                  Save Idea
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
