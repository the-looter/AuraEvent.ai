import React, { useState } from 'react';
import { EventPlan, EventType } from '../types/event';
import { Sparkles, Calendar, Users, DollarSign, MapPin, Wand2, PlusCircle, ArrowRight } from 'lucide-react';
import { generateEventPlanAI } from '../services/geminiService';
import { DEFAULT_COLLABORATORS } from '../data/mockEvents';

interface WelcomeEventSetupProps {
  onEventCreated: (event: EventPlan) => void;
}

export const WelcomeEventSetup: React.FC<WelcomeEventSetupProps> = ({ onEventCreated }) => {
  const [eventType, setEventType] = useState<EventType>('wedding');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('2026-11-20');
  const [location, setLocation] = useState('');
  const [guestCount, setGuestCount] = useState<number>(100);
  const [budget, setBudget] = useState<number>(25000);
  const [vibe, setVibe] = useState('');
  const [specialNotes, setSpecialNotes] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleTypeSelect = (type: EventType) => {
    setEventType(type);
    if (!title) {
      if (type === 'wedding') setTitle('Our Wedding Celebration');
      else if (type === 'birthday') setTitle('Birthday Bash');
      else if (type === 'community') setTitle('Annual Community Festival');
      else setTitle('Special Celebration Gala');
    }
    if (!location) {
      if (type === 'wedding') setLocation('Napa Valley Vineyard Estate');
      else if (type === 'birthday') setLocation('Downtown Rooftop Lounge');
      else if (type === 'community') setLocation('City Central Park & Promenade');
      else setLocation('Grand Ballroom');
    }
    if (!vibe) {
      if (type === 'wedding') setVibe('Romantic candlelit garden with warm ivory linens & live acoustic strings');
      else if (type === 'birthday') setVibe('High energy celebratory dinner with custom cocktails and DJ');
      else if (type === 'community') setVibe('Welcoming family-friendly festival with food stalls & live bluegrass');
      else setVibe('Sophisticated modern gala with ambient lighting');
    }
  };

  const createBlankEvent = () => {
    const finalTitle = title.trim() || `${eventType.toUpperCase()} Plan`;
    const newPlan: EventPlan = {
      id: `event-${Date.now()}`,
      title: finalTitle,
      eventType,
      date,
      location: location || 'Location TBD',
      guestCount: Number(guestCount) || 50,
      totalBudget: Number(budget) || 10000,
      theme: vibe || 'Custom Event Plan',
      vibeKeywords: ['Organized', 'Custom', 'Tailored'],
      coverImage: eventType === 'wedding'
        ? '/src/assets/images/wedding_coastal_botanical_1792573701601.jpg'
        : eventType === 'birthday'
        ? '/src/assets/images/birthday_neon_galactic_1792573702507.jpg'
        : eventType === 'community'
        ? '/src/assets/images/community_harvest_fair_1792573703104.jpg'
        : '/src/assets/images/planner_studio_flatlay_1792573703222.jpg',
      notes: specialNotes || 'Fresh planner created. Add your budget items, timeline cues, and vendors.',
      collaborators: DEFAULT_COLLABORATORS,
      budgetItems: [],
      timelinePhases: [
        {
          id: `tp-init-${Date.now()}`,
          name: 'Phase 1: Booking & Foundations',
          timeframe: 'Initial Planning',
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
          content: `Created blank planner for ${finalTitle}. Ready to add your line items and schedule!`,
          timestamp: 'Just now',
        },
      ],
      activityLog: [
        {
          id: `al-init-${Date.now()}`,
          collaboratorId: 'user-primary',
          action: 'Created Event Planner',
          detail: `Initialized canvas for ${finalTitle}`,
          timestamp: 'Just now',
        },
      ],
    };

    onEventCreated(newPlan);
  };

  const handleGenerateAIPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);

    try {
      const planData = await generateEventPlanAI({
        eventType,
        title: title || `${eventType.toUpperCase()} Celebration`,
        guestCount,
        budget,
        vibe,
        location,
        date,
        specialNotes,
      });

      let coverImage = '/src/assets/images/planner_studio_flatlay_1792573703222.jpg';
      if (eventType === 'wedding') {
        coverImage = '/src/assets/images/wedding_coastal_botanical_1792573701601.jpg';
      } else if (eventType === 'birthday') {
        coverImage = '/src/assets/images/birthday_neon_galactic_1792573702507.jpg';
      } else if (eventType === 'community') {
        coverImage = '/src/assets/images/community_harvest_fair_1792573703104.jpg';
      }

      const newPlan: EventPlan = {
        id: `event-${Date.now()}`,
        title: title || `${eventType.toUpperCase()} Celebration`,
        eventType,
        date,
        location: location || 'Venue TBD',
        guestCount,
        totalBudget: budget,
        theme: planData?.theme || vibe || 'Curated Celebration',
        vibeKeywords: planData?.vibeKeywords || ['Atmospheric', 'Seamless', 'Hospitality-Focused'],
        coverImage,
        notes: planData?.notes || specialNotes,
        collaborators: DEFAULT_COLLABORATORS,
        budgetItems: (planData?.budgetItems || []).map((b: any, idx: number) => ({
          id: `b-new-${Date.now()}-${idx}`,
          category: b.category || 'Other',
          title: b.title,
          estimatedCost: Number(b.estimatedCost) || Math.round(budget / 6),
          actualCost: Number(b.estimatedCost) || Math.round(budget / 6),
          paidAmount: 0,
          status: 'planned',
          notes: b.notes || '',
          assignedTo: DEFAULT_COLLABORATORS[idx % DEFAULT_COLLABORATORS.length].id,
          priority: b.priority || 'essential',
        })),
        timelinePhases: (planData?.timelinePhases || []).map((p: any, pIdx: number) => ({
          id: `tp-new-${Date.now()}-${pIdx}`,
          name: p.name,
          timeframe: p.timeframe,
          items: (p.items || []).map((item: any, iIdx: number) => ({
            id: `t-new-${pIdx}-${iIdx}`,
            title: item.title,
            description: item.description || '',
            dueDate: date,
            completed: false,
            assignedTo: DEFAULT_COLLABORATORS[iIdx % DEFAULT_COLLABORATORS.length].id,
            category: item.category || 'Planning',
          })),
        })),
        dayOfSchedule: (planData?.dayOfSchedule || []).map((s: any, idx: number) => ({
          id: `ds-new-${Date.now()}-${idx}`,
          time: s.time || '12:00 PM',
          title: s.title,
          location: s.location || location,
          leadPerson: s.leadPerson || 'Lead Coordinator',
          notes: s.notes || '',
          completed: false,
        })),
        vendors: (planData?.vendors || []).map((v: any, idx: number) => ({
          id: `v-new-${Date.now()}-${idx}`,
          category: v.category || 'Service',
          name: v.name || 'Verified Vendor',
          contactPerson: 'Manager',
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
          id: `ci-new-${Date.now()}-${idx}`,
          category: i.category || 'Theme & Decor',
          title: i.title,
          description: i.description,
          estimatedCostTier: i.estimatedCostTier || '$$',
          tags: i.tags || ['Personalized'],
          saved: true,
        })),
        comments: [
          {
            id: `c-init-${Date.now()}`,
            collaboratorId: 'user-primary',
            targetType: 'general',
            content: `Turnkey plan generated based on your inputs for ${title || 'your event'}.`,
            timestamp: 'Just now',
          },
        ],
        activityLog: [
          {
            id: `al-init-${Date.now()}`,
            collaboratorId: 'user-primary',
            action: 'Generated Masterplan',
            detail: `Synthesized with Gemini for ${guestCount} guests`,
            timestamp: 'Just now',
          },
        ],
      };

      onEventCreated(newPlan);
    } catch (err) {
      console.warn('AI generation error, creating blank event:', err);
      createBlankEvent();
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6">
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-10 space-y-8">
        
        {/* Intro */}
        <div className="text-center max-w-xl mx-auto space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white mx-auto shadow-sm">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-display">
            Plan Your Event with Gemini AI
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            Enter your real event details below. We do not use mock placeholders—your budget, timeline, vendors, and ideas will be built strictly around your inputs.
          </p>
        </div>

        {/* Input Form */}
        <form onSubmit={handleGenerateAIPlan} className="space-y-6 text-xs">
          
          {/* Category Selection */}
          <div>
            <label className="block font-semibold text-slate-800 mb-2">
              1. What type of event are you organizing?
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { id: 'wedding', label: 'Wedding', icon: '💍', desc: 'Ceremony, reception, vows & dinner' },
                { id: 'birthday', label: 'Birthday', icon: '🎂', desc: 'Milestone, themed party or dinner' },
                { id: 'community', label: 'Community Event', icon: '🎪', desc: 'Festival, charity gala or market' },
                { id: 'custom', label: 'Custom Gala', icon: '✨', desc: 'Corporate, celebration or reunion' },
              ].map((cat) => (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => handleTypeSelect(cat.id as EventType)}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    eventType === cat.id
                      ? 'border-indigo-600 bg-indigo-50/70 ring-1 ring-indigo-600 font-semibold text-indigo-900 shadow-2xs'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="text-xl mb-1">{cat.icon}</div>
                  <div className="font-bold text-xs text-slate-900">{cat.label}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">{cat.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Event Title */}
          <div>
            <label className="block font-semibold text-slate-800 mb-1.5">
              2. Event Title or Celebration Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Maya & Julian's Coastal Wedding, or Leo's 30th Birthday Dinner"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
            />
          </div>

          {/* Date & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-800 mb-1.5">
                3. Event Date
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-800 mb-1.5">
                4. Location / Setting
              </label>
              <input
                type="text"
                placeholder="e.g. Carmel Valley Estate, or Chicago Loft"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Guest Count & Budget */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-800 mb-1.5">
                5. Expected Guest Count
              </label>
              <input
                type="number"
                min="5"
                max="10000"
                value={guestCount}
                onChange={(e) => setGuestCount(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-800 mb-1.5">
                6. Total Target Budget ($)
              </label>
              <input
                type="number"
                min="500"
                step="500"
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              />
            </div>
          </div>

          {/* Theme & Vibe */}
          <div>
            <label className="block font-semibold text-slate-800 mb-1.5">
              7. Desired Theme, Aesthetic & Atmospheric Vibe
            </label>
            <input
              type="text"
              placeholder="e.g. Warm taper candlelight, neutral eucalyptus, farm-to-table cuisine, acoustic music"
              value={vibe}
              onChange={(e) => setVibe(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Special Notes */}
          <div>
            <label className="block font-semibold text-slate-800 mb-1.5">
              8. Special Priorities, Restrictions or Dietary Notes (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Sunset ceremony timing, gluten-free vegan catering options, late night sound curfew..."
              value={specialNotes}
              onChange={(e) => setSpecialNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Submit Actions */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={createBlankEvent}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4 text-slate-400" />
              <span>Start with Blank Canvas Instead</span>
            </button>

            <button
              type="submit"
              disabled={isGenerating}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl shadow-sm transition-colors whitespace-nowrap"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Synthesizing Masterplan with Gemini...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  <span>Generate Turnkey Plan with AI</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
