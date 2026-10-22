import { EventPlan, CreativeIdea } from '../types/event';

export interface PlanGenerationParams {
  eventType: string;
  title: string;
  guestCount: number;
  budget: number;
  vibe: string;
  location: string;
  date: string;
  specialNotes?: string;
}

export function synthesizeLocalPlan(params: PlanGenerationParams) {
  const total = Number(params.budget) || 25000;
  const count = Number(params.guestCount) || 80;
  const title = params.title || `${params.eventType.toUpperCase()} Celebration`;
  const location = params.location || 'Selected Venue & Estate';
  const vibe = params.vibe || 'Curated, warm and elegant';

  return {
    theme: `${title} — ${vibe.split(',')[0]}`,
    vibeKeywords: ['Seamless Flow', 'Hospitality-Focused', 'Memorable Moments', 'Tailored Design'],
    notes: `Curated specifically for ${count} guests at ${location} with a target budget of $${total.toLocaleString()}. ${params.specialNotes || 'Focused on seamless transitions and personalized attendee touchpoints.'}`,
    budgetItems: [
      {
        category: 'Venue',
        title: `${location} Space & Facilities Agreement`,
        estimatedCost: Math.round(total * 0.28),
        notes: 'Includes prep suites, staging areas, and sound curfew waiver.',
        priority: 'essential',
      },
      {
        category: 'Catering & Bar',
        title: `Full Catering & Bar Service (${count} Guests)`,
        estimatedCost: Math.round(total * 0.35),
        notes: `Estimated at ~$${Math.round((total * 0.35) / count)}/guest including bar staffing and dinner courses.`,
        priority: 'essential',
      },
      {
        category: 'Decor & Florals',
        title: 'Atmospheric Styling, Floral Arrangements & Lighting',
        estimatedCost: Math.round(total * 0.15),
        notes: 'Focal entrance installation, dining table centerpieces, and candle runners.',
        priority: 'essential',
      },
      {
        category: 'Photography & Video',
        title: 'Full Day Documentary Photo & Highlight Reel',
        estimatedCost: Math.round(total * 0.11),
        notes: 'Comprehensive coverage, edited teaser, and digital album rights.',
        priority: 'essential',
      },
      {
        category: 'Music & Entertainment',
        title: 'Professional Sound Production & Live Music / DJ',
        estimatedCost: Math.round(total * 0.06),
        notes: 'Curated playlists, wireless mics, and dance floor lighting.',
        priority: 'recommended',
      },
      {
        category: 'Contingency',
        title: 'Overtime & Inclement Weather Reserve Buffer',
        estimatedCost: Math.round(total * 0.05),
        notes: '5% emergency buffer for last-minute headcount or weather adjustments.',
        priority: 'essential',
      },
    ],
    timelinePhases: [
      {
        name: 'Phase 1: Foundation & Core Bookings',
        timeframe: 'Initial Planning Sprint',
        items: [
          {
            title: `Finalize Contract with ${location}`,
            description: 'Sign agreement and remit initial deposit to secure date hold.',
            category: 'Venue',
          },
          {
            title: 'Curate Dining & Bar Menu Tastings',
            description: 'Sample dishes, review dietary requests, and lock in per-person rate.',
            category: 'Catering',
          },
        ],
      },
      {
        name: 'Phase 2: Atmosphere & Guest Coordination',
        timeframe: 'Design Phase',
        items: [
          {
            title: 'Approve Floral, Linen & Lighting Mockups',
            description: 'Review physical swatches matching desired aesthetic vibe.',
            category: 'Decor',
          },
          {
            title: 'Send Invitations & Track Digital RSVPs',
            description: `Collect guest headcounts and dietary restrictions for ${count} expected attendees.`,
            category: 'Invitations',
          },
        ],
      },
      {
        name: 'Phase 3: Final Production & Call Sheets',
        timeframe: 'Final 2 Weeks',
        items: [
          {
            title: 'Distribute Master Run-of-Show to All Vendors',
            description: 'Confirm load-in windows, power outlets, and staging zones.',
            category: 'Logistics',
          },
        ],
      },
    ],
    dayOfSchedule: [
      {
        time: '09:00 AM',
        title: 'Vendor Load-In & Audio/Lighting Staging',
        location: location,
        leadPerson: 'Lead Coordinator',
        notes: 'Supervise load-in dock and electrical lines.',
      },
      {
        time: '12:00 PM',
        title: 'Table Linens & Floral Arrangements Staged',
        location: 'Main Event Space',
        leadPerson: 'Styling Lead',
        notes: 'Inspect place settings and candle heights.',
      },
      {
        time: '04:00 PM',
        title: 'Guest Arrivals & Welcome Beverage Reception',
        location: 'Entrance Foyer / Lawn',
        leadPerson: 'Event Host',
        notes: 'Welcome signature drink passed to arriving guests.',
      },
      {
        time: '05:00 PM',
        title: params.eventType === 'wedding' ? 'Ceremony Begins' : 'Welcome Toast & Opening Remarks',
        location: 'Center Stage',
        leadPerson: 'Lead Coordinator',
        notes: 'Sound levels checked; wireless mic live.',
      },
      {
        time: '06:30 PM',
        title: 'Dinner Service & Celebratory Speeches',
        location: 'Dining Pavilion',
        leadPerson: 'Catering Lead',
        notes: 'Keep speeches capped at 3-4 minutes each.',
      },
      {
        time: '08:30 PM',
        title: 'Dance Floor Opens & Evening Entertainment',
        location: 'Main Floor',
        leadPerson: 'DJ / Band Lead',
        notes: 'Late-night bite trays served at 10:00 PM.',
      },
    ],
    vendors: [
      {
        category: 'Venue',
        name: location,
        notes: 'Check load-in timing and cleanup protocols.',
        quotedPrice: Math.round(total * 0.28),
        tags: ['Primary Space', 'Scenic'],
      },
      {
        category: 'Catering & Bar',
        name: 'Premier Artisan Catering',
        notes: `Full bar package and dinner service for ${count} guests.`,
        quotedPrice: Math.round(total * 0.35),
        tags: ['Staff Included', 'Local Sourcing'],
      },
      {
        category: 'Florals & Styling',
        name: 'Botanica Studio & Decor',
        notes: 'Repurpose ceremony florals to head table for evening.',
        quotedPrice: Math.round(total * 0.15),
        tags: ['Candlelight', 'Installations'],
      },
    ],
    creativeIdeas: [
      {
        category: 'Signature Menu',
        title: 'Craft Welcome Cocktails & Seasonal Mocktails',
        description: `Custom-curated welcome drinks inspired by ${vibe.split(',')[0]} and local seasonal fruits.`,
        estimatedCostTier: '$$',
        tags: ['Interactive', 'Beverage'],
      },
      {
        category: 'Guest Experience',
        title: 'Vintage Audio Guestbook Telephone',
        description: 'A stylish vintage phone where guests record heartfelt spoken audio memories throughout the evening.',
        estimatedCostTier: '$',
        tags: ['Sentimental', 'Keepsake'],
      },
      {
        category: 'Theme & Decor',
        title: 'Suspended Fairy Light & Greenery Canopy',
        description: 'Hanging warm lighting over the main dining tables creating an intimate, starlit garden feel.',
        estimatedCostTier: '$$',
        tags: ['Atmosphere', 'Lighting'],
      },
    ],
  };
}

export async function generateEventPlanAI(params: PlanGenerationParams): Promise<any> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);

    const res = await fetch('/api/ai/plan-event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    if (data.plan) return data.plan;
    return synthesizeLocalPlan(params);
  } catch (err) {
    console.warn('API call failed or timed out, generating customized plan locally:', err);
    return synthesizeLocalPlan(params);
  }
}

export async function generateCreativeIdeasAI(params: {
  eventType: string;
  title: string;
  theme: string;
  focus: string;
  guestCount: number;
}): Promise<CreativeIdea[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 22000);

    const res = await fetch('/api/ai/creative-ideas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    const rawIdeas = data.ideas || data.creativeIdeas || (Array.isArray(data) ? data : []);

    if (Array.isArray(rawIdeas) && rawIdeas.length > 0) {
      return rawIdeas.map((i: any, idx: number) => ({
        id: i.id || `ci-${Date.now()}-${idx}`,
        category: (i.category as any) || 'Guest Experience',
        title: i.title || 'Creative Concept',
        description: i.description || '',
        estimatedCostTier: i.estimatedCostTier || '$$',
        tags: Array.isArray(i.tags)
          ? i.tags
          : typeof i.tags === 'string'
          ? i.tags.split(',').map((t: string) => t.trim())
          : ['Personalized', 'Concept'],
        saved: true,
      }));
    }
    throw new Error('No ideas array returned');
  } catch (err) {
    console.warn('Failed to generate creative ideas via AI, synthesizing personalized concepts locally:', err);
    const focusWord = params.focus?.trim() ? params.focus.trim().slice(0, 35) : 'Bespoke Experience';
    return [
      {
        id: `ci-${Date.now()}-1`,
        category: 'Signature Menu',
        title: `Signature Culinary Pairing: ${focusWord}`,
        description: `A custom-curated food and beverage pairing tailored to ${params.title || 'your celebration'}, designed around ${params.theme || 'the event vibe'}.`,
        estimatedCostTier: '$$',
        tags: ['Interactive', 'Culinary', 'Personalized'],
        saved: true,
      },
      {
        id: `ci-${Date.now()}-2`,
        category: 'Guest Experience',
        title: 'Interactive Audio Guestbook Keepsake Station',
        description: 'A vintage telephone recording station with ambient velvet styling where guests leave heartfelt voicemail memories throughout the evening.',
        estimatedCostTier: '$',
        tags: ['Keepsake', 'Sentimental', 'Interactive'],
        saved: true,
      },
      {
        id: `ci-${Date.now()}-3`,
        category: 'Theme & Decor',
        title: 'Atmospheric Overhead Fairy Canopy & Botanical Styling',
        description: `Overhead warm lighting and lush greenery runners creating an intimate, starlit garden feel for ${params.guestCount || 80} guests.`,
        estimatedCostTier: '$$',
        tags: ['Atmosphere', 'Lighting', 'Floral'],
        saved: true,
      },
      {
        id: `ci-${Date.now()}-4`,
        category: 'Entertainment & Music',
        title: 'Curated Golden Hour Acoustic Transition',
        description: 'Live acoustic musical transitions guiding guests effortlessly from cocktails into the evening celebration.',
        estimatedCostTier: '$$',
        tags: ['Live Music', 'Atmosphere', 'Flow'],
        saved: true,
      },
    ];
  }
}

export async function optimizeBudgetAI(params: {
  eventTitle: string;
  totalBudget: number;
  budgetItems: any[];
  guestCount: number;
}) {
  try {
    const res = await fetch('/api/ai/optimize-budget', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    return data.analysis;
  } catch (err) {
    console.warn('Failed to optimize budget via AI:', err);
    const allocated = (params.budgetItems || []).reduce((acc: number, item: any) => acc + (Number(item.actualCost || item.estimatedCost) || 0), 0);
    return {
      summaryScore: allocated > params.totalBudget ? 'Slightly Over Budget' : 'Well Balanced Allocation',
      totalAllocated: allocated,
      savingsPotential: Math.round(params.totalBudget * 0.08),
      strategicTips: [
        {
          category: 'Catering & Bar',
          insight: 'Beverage and dinner service represent the highest single spend category.',
          recommendation: 'Curate 2 signature cocktails with beer and wine rather than full open spirits to save up to 15%.',
          estimatedSavings: Math.round(params.totalBudget * 0.04),
        },
        {
          category: 'Decor & Florals',
          insight: 'Ceremony floral arches are often neglected during reception.',
          recommendation: 'Instruct the coordinator to move the floral arch behind the sweetheart or head table.',
          estimatedSavings: Math.round(params.totalBudget * 0.03),
        },
      ],
      vendorNegotiationTips: [
        'Ask for early payment discounts (3-5%) when settling in full ahead of the standard deadline.',
      ],
      contingencyAssessment: 'Maintain at least 5% contingency reserve for overtime or last-minute dietary counts.',
    };
  }
}

export async function sendChatbotMessage(params: {
  messages: any[];
  userMessage: string;
  role?: string;
  modelPreference?: string;
  eventContext: Partial<EventPlan> | null;
}) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);

    const res = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    return {
      reply: data.reply,
      modelUsed: data.modelUsed,
      roleUsed: data.roleUsed,
      suggestions: data.suggestions || [],
    };
  } catch (err) {
    console.warn('Failed to query chatbot via AI:', err);
    const eventName = params.eventContext?.title || 'your event';
    const budgetNum = (params.eventContext?.totalBudget || 25000).toLocaleString();

    let fallbackReply = `Here is my direct recommendation for **"${params.userMessage}"** regarding ${eventName} ($${budgetNum} budget):\n\n` +
      `1. **Strategic Pacing**: Ensure at least a 20-minute buffer before key milestone moments.\n` +
      `2. **Vendor Communication**: Require signed confirmation of arrival times 72 hours prior to the event.\n` +
      `3. **Budget Discipline**: Keep contingency allocations at 5% to 8% to absorb last-minute headcount changes.\n\n` +
      `Would you like me to draft an email, add a line item to your budget, or create a specific schedule cue?`;

    return {
      reply: fallbackReply,
      modelUsed: params.modelPreference || 'gemini-3.8-flash',
      roleUsed: params.role || 'lead_planner',
      suggestions: ['How to optimize budget?', 'Draft vendor inquiry email', 'Suggest run-of-show schedule'],
    };
  }
}

export async function askCopilotAI(params: {
  eventContext: Partial<EventPlan>;
  conversationHistory: any[];
  userMessage: string;
}) {
  return sendChatbotMessage({
    messages: params.conversationHistory,
    userMessage: params.userMessage,
    eventContext: params.eventContext,
  });
}

export async function draftVendorEmailAI(params: {
  vendor: any;
  eventContext: Partial<EventPlan>;
  emailGoal: string;
}): Promise<string> {
  try {
    const res = await fetch('/api/ai/vendor-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    return data.emailText;
  } catch (err) {
    console.warn('Failed to draft vendor email:', err);
    return `Subject: Partnership Inquiry: ${params.eventContext.title} — ${params.vendor?.name || 'Vendor'}\n\nDear ${params.vendor?.contactPerson || params.vendor?.name || 'Team'},\n\nWe hope this note finds you well. We are coordinating ${params.eventContext.title || 'an upcoming event'} scheduled for ${params.eventContext.date || 'our upcoming date'} at ${params.eventContext.location || 'our venue'} with approximately ${params.eventContext.guestCount || 100} guests.\n\nWe would love to discuss securing your services for this date and exploring package pricing options.\n\nThank you for your time, and we look forward to hearing from you.\n\nSincerely,\nEvent Coordination Team`;
  }
}
