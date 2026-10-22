import React, { useState } from 'react';
import { EventPlan, Collaborator, EventType } from '../types/event';
import { Calendar, MapPin, Users, DollarSign, CheckCircle2, Clock, Sparkles, ArrowRight, Lightbulb, TrendingUp, Wand2, RefreshCw, PlusCircle, Check } from 'lucide-react';
import { generateEventPlanAI } from '../services/geminiService';

interface EventOverviewProps {
  event: EventPlan;
  onNavigateTab: (tab: string) => void;
  onOpenCopilot: () => void;
  onOpenOptimizeModal: () => void;
  currentCollaborator: Collaborator;
  onAddComment: (text: string) => void;
  onUpdateEvent: (updated: EventPlan) => void;
}

export const EventOverview: React.FC<EventOverviewProps> = ({
  event,
  onNavigateTab,
  onOpenCopilot,
  onOpenOptimizeModal,
  currentCollaborator,
  onAddComment,
  onUpdateEvent,
}) => {
  // Budget stats
  const budgetItems = event.budgetItems || [];
  const totalAllocated = budgetItems.reduce(
    (sum, item) => sum + (Number(item.actualCost || item.estimatedCost) || 0),
    0
  );
  const totalPaid = budgetItems.reduce(
    (sum, item) => sum + (Number(item.paidAmount) || 0),
    0
  );
  const remainingBudget = event.totalBudget - totalAllocated;

  // Timeline stats
  const timelinePhases = event.timelinePhases || [];
  const allTimelineTasks = timelinePhases.flatMap((p) => p.items || []);
  const completedTimelineTasks = allTimelineTasks.filter((t) => t.completed).length;
  const taskProgress = allTimelineTasks.length
    ? Math.round((completedTimelineTasks / allTimelineTasks.length) * 100)
    : 0;

  // Vendors stats
  const vendors = event.vendors || [];
  const confirmedVendors = vendors.filter(
    (v) => v.status === 'contract_signed' || v.status === 'paid'
  ).length;

  // Days until event
  const calculateDaysLeft = (targetDate: string) => {
    try {
      const diff = new Date(targetDate).getTime() - new Date('2026-10-21').getTime();
      const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
      return days > 0 ? days : 0;
    } catch {
      return 60;
    }
  };

  const daysLeft = calculateDaysLeft(event.date);

  // In-line Customizer & AI Generator State
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [editTitle, setEditTitle] = useState(event.title);
  const [editType, setEditType] = useState<EventType>(event.eventType);
  const [editDate, setEditDate] = useState(event.date);
  const [editLocation, setEditLocation] = useState(event.location);
  const [editGuests, setEditGuests] = useState(event.guestCount);
  const [editBudget, setEditBudget] = useState(event.totalBudget);
  const [editVibe, setEditVibe] = useState(event.theme);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [generationSuccess, setGenerationSuccess] = useState(false);

  const [commentInput, setCommentInput] = useState('');

  const handlePostNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    onAddComment(commentInput.trim());
    setCommentInput('');
  };

  // Run AI Masterplan Synthesis based on user's current inputs
  const handleSynthesizeMasterplan = async () => {
    setIsGeneratingPlan(true);
    setGenerationSuccess(false);

    try {
      const planData = await generateEventPlanAI({
        eventType: editType,
        title: editTitle.trim() || `${editType.toUpperCase()} Celebration`,
        guestCount: Number(editGuests) || 80,
        budget: Number(editBudget) || 20000,
        vibe: editVibe.trim() || 'Warm, elegant and memorable',
        location: editLocation.trim() || 'Venue Estate',
        date: editDate,
      });

      let coverImage = event.coverImage;
      if (editType === 'wedding') {
        coverImage = '/src/assets/images/wedding_coastal_botanical_1792573701601.jpg';
      } else if (editType === 'birthday') {
        coverImage = '/src/assets/images/birthday_neon_galactic_1792573702507.jpg';
      } else if (editType === 'community') {
        coverImage = '/src/assets/images/community_harvest_fair_1792573703104.jpg';
      }

      const collabs = (event.collaborators && event.collaborators.length > 0) ? event.collaborators : [{ id: 'user-primary' }];

      const updatedPlan: EventPlan = {
        ...event,
        title: editTitle.trim() || `${editType.toUpperCase()} Celebration`,
        eventType: editType,
        date: editDate,
        location: editLocation.trim() || 'Selected Venue',
        guestCount: Number(editGuests) || 80,
        totalBudget: Number(editBudget) || 20000,
        theme: planData?.theme || editVibe,
        vibeKeywords: planData?.vibeKeywords || ['Curated', 'Memorable', 'Seamless'],
        coverImage,
        notes: planData?.notes || event.notes,
        budgetItems: (planData?.budgetItems || []).map((b: any, idx: number) => ({
          id: `b-${Date.now()}-${idx}`,
          category: b.category || 'Other',
          title: b.title,
          estimatedCost: Number(b.estimatedCost) || Math.round(Number(editBudget) / 6),
          actualCost: Number(b.estimatedCost) || Math.round(Number(editBudget) / 6),
          paidAmount: 0,
          status: 'planned',
          notes: b.notes || '',
          assignedTo: collabs[idx % collabs.length]?.id || 'user-primary',
          priority: b.priority || 'essential',
        })),
        timelinePhases: (planData?.timelinePhases || []).map((p: any, pIdx: number) => ({
          id: `tp-${Date.now()}-${pIdx}`,
          name: p.name,
          timeframe: p.timeframe,
          items: (p.items || []).map((item: any, iIdx: number) => ({
            id: `t-${pIdx}-${iIdx}`,
            title: item.title,
            description: item.description || '',
            dueDate: editDate,
            completed: false,
            assignedTo: collabs[iIdx % collabs.length]?.id || 'user-primary',
            category: item.category || 'Planning',
          })),
        })),
        dayOfSchedule: (planData?.dayOfSchedule || []).map((s: any, idx: number) => ({
          id: `ds-${Date.now()}-${idx}`,
          time: s.time || '12:00 PM',
          title: s.title,
          location: s.location || editLocation,
          leadPerson: s.leadPerson || 'Lead Coordinator',
          notes: s.notes || '',
          completed: false,
        })),
        vendors: (planData?.vendors || []).map((v: any, idx: number) => ({
          id: `v-${Date.now()}-${idx}`,
          category: v.category || 'Service',
          name: v.name || 'Verified Vendor',
          contactPerson: 'Lead Coordinator',
          email: 'contact@vendor.com',
          phone: '(555) 012-3456',
          quotedPrice: Number(v.quotedPrice) || 2000,
          finalPrice: Number(v.quotedPrice) || 2000,
          status: 'researching',
          rating: 5,
          notes: v.notes || '',
          tags: v.tags || ['Recommended'],
        })),
        creativeIdeas: (planData?.creativeIdeas || []).map((i: any, idx: number) => ({
          id: `ci-${Date.now()}-${idx}`,
          category: i.category || 'Theme & Decor',
          title: i.title,
          description: i.description,
          estimatedCostTier: i.estimatedCostTier || '$$',
          tags: i.tags || ['Personalized'],
          saved: true,
        })),
      };

      onUpdateEvent(updatedPlan);
      setGenerationSuccess(true);
      setTimeout(() => setGenerationSuccess(false), 4000);
      setIsCustomizing(false);
    } catch (err) {
      console.error('Plan generation error:', err);
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const handleClearToBlank = () => {
    const blankPlan: EventPlan = {
      ...event,
      title: editTitle.trim() || event.title,
      eventType: editType,
      date: editDate,
      location: editLocation.trim() || event.location,
      guestCount: Number(editGuests) || event.guestCount,
      totalBudget: Number(editBudget) || event.totalBudget,
      theme: editVibe.trim() || event.theme,
      budgetItems: [],
      timelinePhases: [
        {
          id: `tp-${Date.now()}`,
          name: 'Milestone Phase 1',
          timeframe: 'Planning',
          items: [],
        },
      ],
      dayOfSchedule: [],
      vendors: [],
      creativeIdeas: [],
    };
    onUpdateEvent(blankPlan);
    setIsCustomizing(false);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Event Setup & Masterplan Control Bar */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-sm sm:text-base font-display">
                Event Setup & Masterplan Generator
              </span>
              {generationSuccess && (
                <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  <Check className="w-3 h-3 text-emerald-600" />
                  Plan Generated Successfully!
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Configure your event parameters and click &quot;Generate AI Turnkey Plan&quot; to synthesize your budget, timeline, vendors, and ideas.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => setIsCustomizing(!isCustomizing)}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              {isCustomizing ? 'Hide Controls' : 'Edit Event Parameters'}
            </button>
            <button
              onClick={handleSynthesizeMasterplan}
              disabled={isGeneratingPlan}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg shadow-sm transition-colors whitespace-nowrap"
            >
              {isGeneratingPlan ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Generating Plan...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>Generate AI Masterplan</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Collapsible Parameter Editor */}
        {isCustomizing && (
          <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Event Title</label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md focus:ring-1 focus:ring-indigo-500 text-xs"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Event Type</label>
              <select
                value={editType}
                onChange={(e) => setEditType(e.target.value as EventType)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md focus:ring-1 focus:ring-indigo-500 text-xs"
              >
                <option value="wedding">💍 Wedding</option>
                <option value="birthday">🎂 Birthday</option>
                <option value="community">🎪 Community Festival</option>
                <option value="custom">✨ Custom Celebration</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Guest Count</label>
              <input
                type="number"
                min="5"
                max="5000"
                value={editGuests}
                onChange={(e) => setEditGuests(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md focus:ring-1 focus:ring-indigo-500 text-xs font-mono"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Total Target Budget ($)</label>
              <input
                type="number"
                min="500"
                step="500"
                value={editBudget}
                onChange={(e) => setEditBudget(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md focus:ring-1 focus:ring-indigo-500 text-xs font-mono"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Event Date</label>
              <input
                type="date"
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md focus:ring-1 focus:ring-indigo-500 text-xs"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Venue / Location</label>
              <input
                type="text"
                value={editLocation}
                onChange={(e) => setEditLocation(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md focus:ring-1 focus:ring-indigo-500 text-xs"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-medium text-slate-700 mb-1">Aesthetic / Theme Vibe</label>
              <input
                type="text"
                placeholder="e.g. Warm candlelit dinner, eucalyptus garland, organic farm-to-table"
                value={editVibe}
                onChange={(e) => setEditVibe(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md focus:ring-1 focus:ring-indigo-500 text-xs"
              />
            </div>

            <div className="col-span-full pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={handleClearToBlank}
                className="text-xs text-rose-600 hover:text-rose-800 font-medium"
              >
                Clear to Blank Lists
              </button>

              <button
                type="button"
                onClick={handleSynthesizeMasterplan}
                disabled={isGeneratingPlan}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-xs"
              >
                {isGeneratingPlan ? 'Synthesizing...' : 'Apply & Generate Plan'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Hero Visual Card with High-Res Image & Measured Scrim */}
      <div className="relative rounded-2xl overflow-hidden shadow-sm border border-slate-200/80 bg-slate-900 min-h-[300px] flex flex-col justify-end">
        <img
          src={event.coverImage}
          alt={event.title}
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover object-center transform transition-transform duration-700 hover:scale-105"
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/60 to-slate-950/20" />

        <div className="relative z-10 p-6 sm:p-8 max-w-4xl">
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-300 mb-3">
            <span className="uppercase tracking-wider font-semibold text-indigo-300">
              {event.eventType} Masterplan
            </span>
            <span aria-hidden="true" className="text-slate-400">·</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              {new Date(event.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
            <span aria-hidden="true" className="text-slate-400">·</span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              {event.location}
            </span>
            <span aria-hidden="true" className="text-slate-400">·</span>
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <span className="tabular-nums">{event.guestCount}</span> Guests
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-white font-display mb-3 text-balance">
            {event.title}
          </h1>

          <p className="text-sm sm:text-base text-slate-200 line-clamp-2 max-w-3xl leading-relaxed">
            <span className="font-semibold text-white">Theme:</span> {event.theme} — {event.notes}
          </p>

          <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {(event.collaborators || []).map((c) => (
                  <div
                    key={c.id}
                    className="relative group"
                    title={`${c.name} (${c.title}) - currently in ${c.currentSection || 'Overview'}`}
                  >
                    <div
                      className="w-8 h-8 rounded-full border-2 border-slate-900 flex items-center justify-center text-xs font-bold text-white shadow-xs"
                      style={{ backgroundColor: c.color }}
                    >
                      {c.name.charAt(0)}
                    </div>
                    {c.status === 'online' && (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-slate-900 rounded-full" />
                    )}
                  </div>
                ))}
              </div>
              <span className="text-xs text-slate-300">
                <strong className="text-white font-medium">{(event.collaborators || []).length} planners</strong> collaborating on this event
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onOpenOptimizeModal}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-900 bg-white hover:bg-slate-100 rounded-lg shadow-sm transition-colors whitespace-nowrap"
              >
                <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
                <span>AI Budget Optimization</span>
              </button>
              <button
                onClick={onOpenCopilot}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors whitespace-nowrap"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Ask AI Copilot</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Metric Strips */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Budget KPI */}
        <div
          onClick={() => onNavigateTab('budget')}
          className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs hover:border-indigo-300 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-medium">Total Budget</span>
            <DollarSign className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
            ${event.totalBudget.toLocaleString()}
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
            <span>Allocated: <strong className="text-slate-800 tabular-nums">${totalAllocated.toLocaleString()}</strong></span>
            <span className={remainingBudget >= 0 ? 'text-emerald-700 font-medium' : 'text-rose-700 font-medium'}>
              {remainingBudget >= 0 ? `+$${remainingBudget.toLocaleString()} buffer` : `-$${Math.abs(remainingBudget).toLocaleString()} over`}
            </span>
          </div>
          <div className="mt-3 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full ${totalAllocated > event.totalBudget ? 'bg-rose-500' : 'bg-indigo-600'}`}
              style={{ width: `${Math.min(100, Math.round((totalAllocated / (event.totalBudget || 1)) * 100))}%` }}
            />
          </div>
        </div>

        {/* Milestone Completion KPI */}
        <div
          onClick={() => onNavigateTab('timeline')}
          className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs hover:border-indigo-300 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-medium">Milestone Progress</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
            {taskProgress}%
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
            <span>Tasks Done: <strong className="text-slate-800 tabular-nums">{completedTimelineTasks} of {allTimelineTasks.length}</strong></span>
            <span className="text-slate-600 font-medium group-hover:text-indigo-600 flex items-center gap-0.5">
              View <ArrowRight className="w-3 h-3" />
            </span>
          </div>
          <div className="mt-3 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="h-full bg-emerald-600 rounded-full transition-all duration-500"
              style={{ width: `${taskProgress}%` }}
            />
          </div>
        </div>

        {/* Vendors Status KPI */}
        <div
          onClick={() => onNavigateTab('vendors')}
          className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs hover:border-indigo-300 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-medium">Vendor Partners</span>
            <Users className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
            {confirmedVendors} <span className="text-sm font-normal text-slate-500">/ {vendors.length} Confirmed</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
            <span>Paid Deposits: <strong className="text-slate-800 tabular-nums">${totalPaid.toLocaleString()}</strong></span>
            <span className="text-sky-700 font-medium">Pipeline active</span>
          </div>
          <div className="mt-3 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="h-full bg-sky-600 rounded-full"
              style={{ width: `${vendors.length ? (confirmedVendors / vendors.length) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Days to Event Countdown */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-medium">Target Date</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
            {daysLeft} <span className="text-sm font-normal text-slate-500">Days Out</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
            <span className="truncate">{event.location.split(',')[0]}</span>
            <span className="text-amber-700 font-medium">On Schedule</span>
          </div>
          <div className="mt-3 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div className="h-full bg-amber-500 rounded-full" style={{ width: '75%' }} />
          </div>
        </div>

      </div>

      {/* Two-Column Grid: Strategic Pillars & Live Collaboration Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2 Cols): Quick Access Pillars */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Day-of Run-of-Show Preview */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-display">
                  Day-of Run-of-Show Highlights
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Synchronized hourly breakdown for coordinators, hosts, and vendors
                </p>
              </div>
              <button
                onClick={() => onNavigateTab('timeline')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1"
              >
                Full Schedule <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {(event.dayOfSchedule || []).length === 0 ? (
                <div className="py-6 text-center text-slate-400 text-xs">
                  No schedule cues added yet. Navigate to &quot;Timeline & Schedule&quot; or click &quot;Generate AI Masterplan&quot; above.
                </div>
              ) : (
                (event.dayOfSchedule || []).slice(0, 4).map((item) => (
                  <div key={item.id} className="py-3 flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <span className="text-xs font-mono font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded tabular-nums shrink-0 mt-0.5">
                        {item.time}
                      </span>
                      <div>
                        <div className="text-sm font-semibold text-slate-800">{item.title}</div>
                        <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                          <span>{item.location}</span>
                          <span aria-hidden="true">·</span>
                          <span>Lead: {item.leadPerson}</span>
                        </div>
                      </div>
                    </div>
                    <span className="text-[11px] text-slate-400 italic shrink-0 hidden sm:inline">
                      {item.notes}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Curated Creative Ideas Spotlight */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-display">
                  Curated Personalized Ideas
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Hand-crafted sensory, culinary, and decor concepts generated for this theme
                </p>
              </div>
              <button
                onClick={() => onNavigateTab('ideas')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1"
              >
                Browse All Ideas <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(event.creativeIdeas || []).length === 0 ? (
                <div className="col-span-2 py-6 text-center text-slate-400 text-xs bg-slate-50 rounded-lg border border-slate-100">
                  No creative ideas saved yet. Click &quot;Browse All Ideas&quot; to brainstorm custom concepts with Gemini.
                </div>
              ) : (
                (event.creativeIdeas || []).slice(0, 2).map((idea) => (
                  <div key={idea.id} className="p-4 rounded-lg bg-slate-50 border border-slate-200/70 space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="font-semibold text-indigo-700">{idea.category}</span>
                      <span className="font-mono text-slate-600">{idea.estimatedCostTier}</span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 leading-snug">
                      {idea.title}
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {idea.description}
                    </p>
                    <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-400">
                      {(idea.tags || []).map((tag) => (
                        <span key={tag}>#{tag}</span>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Right Column (1 Col): Live Collaborative Activity & Notes */}
        <div className="space-y-6">
          
          {/* Real-time Collaboration Feed */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-display">
                  Team Activity & Log
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Live updates from shared planners
                </p>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Connected in real-time" />
            </div>

            {/* Activity Stream */}
            <div className="space-y-3.5 mb-6 flex-1 overflow-y-auto max-h-[300px] pr-1">
              {(event.activityLog || []).map((log) => {
                const user = (event.collaborators || []).find((c) => c.id === log.collaboratorId);
                return (
                  <div key={log.id} className="flex items-start gap-3 text-xs">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 mt-0.5"
                      style={{ backgroundColor: user?.color || '#6366f1' }}
                    >
                      {user?.name.charAt(0) || 'P'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-baseline justify-between gap-1">
                        <strong className="text-slate-900 font-semibold">{user?.name || 'Planner'}</strong>
                        <span className="text-[10px] text-slate-400 tabular-nums">{log.timestamp}</span>
                      </div>
                      <div className="text-slate-700 font-medium mt-0.5">{log.action}</div>
                      <div className="text-slate-500 text-[11px] mt-0.5">{log.detail}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Team Comments Preview */}
            <div className="pt-4 border-t border-slate-100">
              <div className="text-xs font-semibold text-slate-700 mb-2">
                Recent Planner Comments
              </div>
              <div className="space-y-2 mb-3 max-h-[140px] overflow-y-auto text-xs">
                {(event.comments || []).slice(0, 2).map((c) => {
                  const user = (event.collaborators || []).find((col) => col.id === c.collaboratorId);
                  return (
                    <div key={c.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="font-semibold text-slate-800">{user?.name || 'Planner'}</span>
                        <span className="text-slate-400">{c.timestamp}</span>
                      </div>
                      <p className="text-slate-600 text-xs leading-relaxed">{c.content}</p>
                    </div>
                  );
                })}
              </div>

              {/* Quick Post Team Note Form */}
              <form onSubmit={handlePostNote} className="flex gap-2">
                <input
                  type="text"
                  placeholder={`Post note as ${currentCollaborator.name}...`}
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  className="flex-1 text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  disabled={!commentInput.trim()}
                  className="px-3 py-2 text-xs font-semibold text-white bg-indigo-600 disabled:opacity-50 hover:bg-indigo-700 rounded-lg transition-colors whitespace-nowrap"
                >
                  Post
                </button>
              </form>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
