import React, { useState } from 'react';
import { EventPlan, EventType } from '../types/event';
import { Sparkles, Calendar, Users, DollarSign, MapPin, X, ArrowRight, Wand2, FilePlus2 } from 'lucide-react';
import { generateEventPlanAI } from '../services/geminiService';
import { DEFAULT_COLLABORATORS } from '../data/mockEvents';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEventCreated: (newEvent: EventPlan) => void;
}

export const CreateEventModal: React.FC<CreateEventModalProps> = ({
  isOpen,
  onClose,
  onEventCreated,
}) => {
  const [eventType, setEventType] = useState<EventType>('wedding');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('2026-11-20');
  const [location, setLocation] = useState('');
  const [guestCount, setGuestCount] = useState(80);
  const [budget, setBudget] = useState(25000);
  const [vibe, setVibe] = useState('');
  const [specialNotes, setSpecialNotes] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const getCoverImage = (type: EventType) => {
    if (type === 'wedding') return '/src/assets/images/wedding_coastal_botanical_1792573701601.jpg';
    if (type === 'birthday') return '/src/assets/images/birthday_neon_galactic_1792573702507.jpg';
    if (type === 'community') return '/src/assets/images/community_harvest_fair_1792573703104.jpg';
    return '/src/assets/images/planner_studio_flatlay_1792573703222.jpg';
  };

  const handleCreateBlankPlan = () => {
    const finalTitle = title.trim() || `My ${eventType === 'wedding' ? 'Wedding' : eventType === 'birthday' ? 'Birthday Party' : eventType === 'community' ? 'Community Event' : 'Celebration'}`;
    const cleanLocation = location.trim() || 'Venue TBD';
    const cleanVibe = vibe.trim() || 'Curated & Memorable';

    const newPlan: EventPlan = {
      id: `event-${Date.now()}`,
      title: finalTitle,
      eventType,
      date,
      location: cleanLocation,
      guestCount,
      totalBudget: budget,
      theme: cleanVibe,
      vibeKeywords: ['Custom Plan', 'User-Created', 'Collaborative'],
      coverImage: getCoverImage(eventType),
      notes: specialNotes.trim() || 'Blank starter plan ready for your custom line items and schedule.',
      collaborators: DEFAULT_COLLABORATORS,
      budgetItems: [],
      timelinePhases: [
        {
          id: `tp-${Date.now()}-1`,
          name: 'Phase 1: Initial Planning Sprint',
          timeframe: 'Immediate',
          items: [],
        },
      ],
      dayOfSchedule: [],
      vendors: [],
      creativeIdeas: [],
      comments: [
        {
          id: `c-init-${Date.now()}`,
          collaboratorId: 'user-primary',
          targetType: 'general',
          content: `Created new blank event plan "${finalTitle}". Add your budget items and timeline milestones!`,
          timestamp: 'Just now',
        },
      ],
      activityLog: [
        {
          id: `al-init-${Date.now()}`,
          collaboratorId: 'user-primary',
          action: 'Created Blank Plan',
          detail: `Created "${finalTitle}" with $${budget.toLocaleString()} budget`,
          timestamp: 'Just now',
        },
      ],
    };

    onEventCreated(newPlan);
    onClose();
  };

  const handleGenerateAIPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);

    const finalTitle = title.trim() || `My ${eventType === 'wedding' ? 'Wedding' : eventType === 'birthday' ? 'Birthday Party' : eventType === 'community' ? 'Community Event' : 'Celebration'}`;
    const cleanLocation = location.trim() || (eventType === 'wedding' ? 'Scenic Pavilion' : eventType === 'birthday' ? 'Downtown Lounge' : 'Public Meadow');
    const cleanVibe = vibe.trim() || (eventType === 'wedding' ? 'Warm candlelit botanical elegance' : eventType === 'birthday' ? 'Vibrant celebratory evening with craft cocktails' : 'Welcoming outdoor community gathering');

    try {
      const planData = await generateEventPlanAI({
        eventType,
        title: finalTitle,
        guestCount,
        budget,
        vibe: cleanVibe,
        location: cleanLocation,
        date,
        specialNotes,
      });

      const newPlan: EventPlan = {
        id: `event-${Date.now()}`,
        title: finalTitle,
        eventType,
        date,
        location: cleanLocation,
        guestCount,
        totalBudget: budget,
        theme: planData?.theme || cleanVibe,
        vibeKeywords: planData?.vibeKeywords || ['Tailored', 'Hospitality', 'Seamless'],
        coverImage: getCoverImage(eventType),
        notes: planData?.notes || specialNotes || 'Tailored masterplan generated with Gemini AI based on your inputs.',
        collaborators: DEFAULT_COLLABORATORS,
        budgetItems: (planData?.budgetItems || []).map((b: any, idx: number) => ({
          id: `b-${Date.now()}-${idx}`,
          category: b.category || 'Other',
          title: b.title || 'Budget Item',
          estimatedCost: Number(b.estimatedCost) || Math.round(budget / 6),
          actualCost: Number(b.estimatedCost) || Math.round(budget / 6),
          paidAmount: 0,
          status: 'planned',
          notes: b.notes || '',
          assignedTo: DEFAULT_COLLABORATORS[idx % DEFAULT_COLLABORATORS.length].id,
          priority: b.priority || 'essential',
        })),
        timelinePhases: (planData?.timelinePhases || []).map((p: any, pIdx: number) => ({
          id: `tp-${Date.now()}-${pIdx}`,
          name: p.name || `Phase ${pIdx + 1}`,
          timeframe: p.timeframe || 'Planning Sprint',
          items: (p.items || []).map((item: any, iIdx: number) => ({
            id: `t-${pIdx}-${iIdx}`,
            title: item.title || 'Milestone Task',
            description: item.description || '',
            dueDate: date,
            completed: false,
            assignedTo: DEFAULT_COLLABORATORS[iIdx % DEFAULT_COLLABORATORS.length].id,
            category: item.category || 'Planning',
          })),
        })),
        dayOfSchedule: (planData?.dayOfSchedule || []).map((s: any, idx: number) => ({
          id: `ds-${Date.now()}-${idx}`,
          time: s.time || '12:00 PM',
          title: s.title || 'Schedule Cue',
          location: s.location || cleanLocation,
          leadPerson: s.leadPerson || 'Lead Coordinator',
          notes: s.notes || '',
          completed: false,
        })),
        vendors: (planData?.vendors || []).map((v: any, idx: number) => ({
          id: `v-${Date.now()}-${idx}`,
          category: v.category || 'Service',
          name: v.name || 'Vendor Partner',
          contactPerson: 'Lead Coordinator',
          email: 'inquiry@vendor.com',
          phone: '(555) 019-2834',
          quotedPrice: Number(v.quotedPrice) || 2000,
          finalPrice: Number(v.quotedPrice) || 2000,
          status: 'researching',
          rating: 5,
          notes: v.notes || '',
          tags: v.tags || ['Verified'],
        })),
        creativeIdeas: (planData?.creativeIdeas || []).map((i: any, idx: number) => ({
          id: `ci-${Date.now()}-${idx}`,
          category: i.category || 'Theme & Decor',
          title: i.title || 'Creative Idea',
          description: i.description || '',
          estimatedCostTier: i.estimatedCostTier || '$$',
          tags: i.tags || ['Creative'],
          saved: true,
        })),
        comments: [
          {
            id: `c-init-${Date.now()}`,
            collaboratorId: 'user-primary',
            targetType: 'general',
            content: `Created AI masterplan for ${finalTitle}. Budget and timeline ready for review!`,
            timestamp: 'Just now',
          },
        ],
        activityLog: [
          {
            id: `al-init-${Date.now()}`,
            collaboratorId: 'user-primary',
            action: 'Generated Masterplan',
            detail: `Synthesized with Gemini AI for ${guestCount} guests`,
            timestamp: 'Just now',
          },
        ],
      };

      onEventCreated(newPlan);
      onClose();
    } catch (err) {
      console.error('Failed to create plan:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-event-modal-title"
    >
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs" aria-hidden="true">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 id="create-event-modal-title" className="text-base font-bold text-slate-900 font-display">
                Create Event Plan
              </h3>
              <p className="text-xs text-slate-500">
                Enter your event details to generate an AI masterplan or start fresh
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close create event modal"
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Wizard Form */}
        <form onSubmit={handleGenerateAIPlan} className="space-y-4 pt-4 text-xs">
          
          {/* Event Type Selector */}
          <div>
            <span id="event-category-label" className="block font-semibold text-slate-700 mb-1.5">
              Event Category
            </span>
            <div role="radiogroup" aria-labelledby="event-category-label" className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'wedding', label: 'Wedding', icon: '💍' },
                { id: 'birthday', label: 'Birthday', icon: '🎂' },
                { id: 'community', label: 'Community Event', icon: '🎪' },
                { id: 'custom', label: 'Custom Gala', icon: '✨' },
              ].map((t) => (
                <button
                  type="button"
                  key={t.id}
                  role="radio"
                  aria-checked={eventType === t.id}
                  onClick={() => setEventType(t.id as EventType)}
                  className={`p-2.5 rounded-lg border text-left transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    eventType === t.id
                      ? 'border-indigo-600 bg-indigo-50/60 ring-1 ring-indigo-600 font-semibold text-indigo-900'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="text-base mb-1" aria-hidden="true">{t.icon}</div>
                  <div className="text-xs font-semibold">{t.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Event Title */}
          <div>
            <label htmlFor="create-event-title-input" className="block font-medium text-slate-700 mb-1">
              Event Name / Working Title <span className="text-indigo-600">*</span>
            </label>
            <input
              id="create-event-title-input"
              type="text"
              required
              placeholder={eventType === 'wedding' ? 'e.g. Maya & Alex\'s Wedding' : eventType === 'birthday' ? 'e.g. Lucas\'s 30th Birthday Bash' : eventType === 'community' ? 'e.g. Spring Artisans & Food Fair' : 'e.g. Annual Gala Celebration'}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 text-xs"
            />
          </div>

          {/* Date & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="create-event-date-input" className="block font-medium text-slate-700 mb-1">Event Date</label>
              <input
                id="create-event-date-input"
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 text-xs"
              />
            </div>
            <div>
              <label htmlFor="create-event-location-input" className="block font-medium text-slate-700 mb-1">Location / Venue</label>
              <input
                id="create-event-location-input"
                type="text"
                placeholder="e.g. Hilltop Vineyard, Brooklyn Loft, Town Square"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 text-xs"
              />
            </div>
          </div>

          {/* Guests & Total Budget */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="create-event-guests-input" className="block font-medium text-slate-700 mb-1">Estimated Guest Count</label>
              <input
                id="create-event-guests-input"
                type="number"
                min="5"
                max="5000"
                value={guestCount}
                onChange={(e) => setGuestCount(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 text-xs font-mono"
              />
            </div>
            <div>
              <label htmlFor="create-event-budget-input" className="block font-medium text-slate-700 mb-1">Total Target Budget ($)</label>
              <input
                id="create-event-budget-input"
                type="number"
                min="500"
                step="500"
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 text-xs font-mono"
              />
            </div>
          </div>

          {/* Theme & Vibe */}
          <div>
            <label htmlFor="create-event-vibe-input" className="block font-medium text-slate-700 mb-1">
              Aesthetic Vibe & Atmosphere
            </label>
            <input
              id="create-event-vibe-input"
              type="text"
              placeholder="e.g. Warm candlelight, organic florals, acoustic live music, artisan cocktails"
              value={vibe}
              onChange={(e) => setVibe(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 text-xs"
            />
          </div>

          {/* Special Requirements */}
          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Special Priorities or Constraints (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Rain contingency needed, vegetarian menu preferences, early load-in..."
              value={specialNotes}
              onChange={(e) => setSpecialNotes(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 text-xs"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-[11px] text-slate-400">
              Powered by real-time Gemini AI
            </span>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleCreateBlankPlan}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                title="Start with an empty event plan without AI prefill"
              >
                <FilePlus2 className="w-3.5 h-3.5 text-slate-500" />
                <span>Create Blank Plan</span>
              </button>
              
              <button
                type="submit"
                disabled={isGenerating}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg shadow-sm transition-colors whitespace-nowrap"
              >
                {isGenerating ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Synthesizing Masterplan...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-3.5 h-3.5" />
                    <span>Generate with Gemini AI</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
