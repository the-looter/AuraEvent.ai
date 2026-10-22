import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

app.use(express.json({ limit: '10mb' }));

// Helper to safely check if valid API key is present
const hasValidApiKey = (): boolean => {
  const key = process.env.GEMINI_API_KEY;
  return Boolean(key && !key.startsWith('MY_') && key.length > 5);
};

// Shared Gemini Client with telemetry User-Agent
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Primary fast & free model for real-time responsiveness
const FAST_FREE_MODEL = 'gemini-3.1-flash-lite';

// Timeout wrapper
function withTimeout<T>(promise: Promise<T>, ms = 20000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`AI request timed out after ${ms}ms`)), ms)
    ),
  ]);
}

// Resilient JSON parser that handles codeblocks, prefixes, and markdown fences
function parseJsonSafely(raw: string): any {
  if (!raw) return null;
  let cleaned = raw.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/, '').replace(/```\s*$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/```\s*$/, '');
  }
  try {
    return JSON.parse(cleaned);
  } catch {
    const objMatch = cleaned.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
    if (objMatch) {
      try {
        return JSON.parse(objMatch[0]);
      } catch {}
    }
    return null;
  }
}

// -------------------------------------------------------------
// Endpoint 1: AI Plan Generator based strictly on user inputs
// -------------------------------------------------------------
app.post('/api/ai/plan-event', async (req, res) => {
  const { eventType = 'wedding', title, guestCount, budget, vibe, location, date, specialNotes } = req.body;
  const total = Number(budget) || 20000;
  const count = Number(guestCount) || 80;
  const cleanTitle = title?.trim() || `${eventType.toUpperCase()} Celebration`;
  const cleanLocation = location?.trim() || 'Selected Event Venue';
  const cleanVibe = vibe?.trim() || 'Curated, warm and elegant';

  const buildLocalFallbackPlan = () => ({
    theme: `${cleanTitle} — ${cleanVibe.split(',')[0]}`,
    vibeKeywords: ['Tailored Hospitality', 'Seamless Flow', 'Memorable Moments', 'Thoughtful Details'],
    notes: `Curated specifically for ${count} guests at ${cleanLocation} with a target budget of $${total.toLocaleString()}. ${specialNotes || 'Tailored to seamless guest flow and personalized experiences.'}`,
    budgetItems: [
      {
        category: 'Venue',
        title: `${cleanLocation} Space Agreement & Facility Rights`,
        estimatedCost: Math.round(total * 0.28),
        notes: 'Includes staging areas, prep suites, and load-in access.',
        priority: 'essential',
      },
      {
        category: 'Catering & Bar',
        title: `Dinner Service & Bar Experience (${count} Guests)`,
        estimatedCost: Math.round(total * 0.35),
        notes: `Estimated at ~$${Math.round((total * 0.35) / count)}/head including bar service and staffing.`,
        priority: 'essential',
      },
      {
        category: 'Decor & Florals',
        title: 'Atmospheric Styling, Table Centerpieces & Ambient Lighting',
        estimatedCost: Math.round(total * 0.15),
        notes: 'Focal entrance arrangement, table decor, and ambient lighting.',
        priority: 'essential',
      },
      {
        category: 'Photography & Video',
        title: 'Documentary Photo & Highlight Video Coverage',
        estimatedCost: Math.round(total * 0.11),
        notes: 'High-res digital gallery and edited recap reel.',
        priority: 'essential',
      },
      {
        category: 'Music & Entertainment',
        title: 'Professional Sound Production & Live DJ / Entertainment',
        estimatedCost: Math.round(total * 0.06),
        notes: 'Wireless mics, curated music progression, and dance lighting.',
        priority: 'recommended',
      },
      {
        category: 'Contingency',
        title: 'Contingency & Weather Buffer (5%)',
        estimatedCost: Math.round(total * 0.05),
        notes: 'Reserve buffer for last-minute headcount or weather adjustments.',
        priority: 'essential',
      },
    ],
    timelinePhases: [
      {
        name: 'Phase 1: Foundation & Core Contracts',
        timeframe: 'Initial Planning Sprint',
        items: [
          {
            title: `Lock in contract with ${cleanLocation}`,
            description: 'Sign agreement and remit initial deposit to secure date hold.',
            category: 'Venue',
          },
          {
            title: 'Confirm catering tasting and beverage package',
            description: `Review menu choices and finalize headcount quote for ${count} guests.`,
            category: 'Catering',
          },
        ],
      },
      {
        name: 'Phase 2: Atmosphere, Production & Invitations',
        timeframe: 'Design & Logistics Sprint',
        items: [
          {
            title: 'Approve decor swatches and lighting design',
            description: `Align aesthetic palette with "${cleanVibe}".`,
            category: 'Decor',
          },
          {
            title: 'Send formal invitations and monitor digital RSVPs',
            description: 'Track meal preferences and special dietary accommodations.',
            category: 'Logistics',
          },
        ],
      },
      {
        name: 'Phase 3: Final Production & Call Sheets',
        timeframe: 'Final 2 Weeks',
        items: [
          {
            title: 'Distribute Master Run-of-Show to All Vendors',
            description: 'Confirm load-in windows, electrical specs, and sound check.',
            category: 'Logistics',
          },
        ],
      },
    ],
    dayOfSchedule: [
      {
        time: '09:00 AM',
        title: 'Vendor Load-In & Audio/Lighting Staging',
        location: cleanLocation,
        leadPerson: 'Lead Coordinator',
        notes: 'Supervise load-in dock and electrical staging.',
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
        title: eventType === 'wedding' ? 'Ceremony Begins' : 'Welcome Toast & Grand Entrance',
        location: 'Center Stage',
        leadPerson: 'Lead Coordinator',
        notes: 'Sound levels checked; wireless mic live.',
      },
      {
        time: '06:30 PM',
        title: 'Dinner Service & Speeches',
        location: 'Dining Pavilion',
        leadPerson: 'Catering Lead',
        notes: 'Keep speeches capped at 3-4 minutes each to preserve flow.',
      },
      {
        time: '08:30 PM',
        title: 'Dance Floor Opens & Evening Celebration',
        location: 'Main Floor',
        leadPerson: 'DJ / Entertainment Lead',
        notes: 'Late-night bite trays served at 10:00 PM.',
      },
    ],
    vendors: [
      {
        category: 'Venue',
        name: cleanLocation,
        notes: 'Check load-in timing and cleanup protocols.',
        quotedPrice: Math.round(total * 0.28),
        tags: ['Primary Space', 'Verified'],
      },
      {
        category: 'Catering & Bar',
        name: 'Artisan Culinary & Bar Group',
        notes: `Full bar package and dinner service for ${count} guests.`,
        quotedPrice: Math.round(total * 0.35),
        tags: ['Staff Included', 'Local Sourcing'],
      },
      {
        category: 'Florals & Styling',
        name: 'Botanica Studio & Decor',
        notes: 'Repurpose ceremony florals to dining tables for evening.',
        quotedPrice: Math.round(total * 0.15),
        tags: ['Installations', 'Lighting'],
      },
    ],
    creativeIdeas: [
      {
        category: 'Signature Menu',
        title: 'Curated Welcome Cocktails & Seasonal Mocktails',
        description: `Custom-curated welcome drinks inspired by ${cleanVibe.split(',')[0]}.`,
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
        description: 'Hanging warm lighting over main tables creating an intimate, starlit garden feel.',
        estimatedCostTier: '$$',
        tags: ['Atmosphere', 'Lighting'],
      },
    ],
  });

  if (!hasValidApiKey()) {
    return res.json({ success: true, plan: buildLocalFallbackPlan() });
  }

  const prompt = `You are a world-class professional event planning director.
Create a comprehensive, turnkey master plan strictly customized for this user's event:
- Event Category: ${eventType}
- Event Title: ${cleanTitle}
- Guest Count: ${count}
- Total Target Budget: $${total}
- Location: ${cleanLocation}
- Date: ${date || 'Upcoming'}
- Aesthetic / Vibe: ${cleanVibe}
- Special Notes / Priorities: ${specialNotes || 'None'}

Return ONLY valid JSON matching this schema:
{
  "theme": "Creative event theme title",
  "vibeKeywords": ["keyword1", "keyword2", "keyword3", "keyword4"],
  "notes": "2-3 sentence strategic summary and planner philosophy tailored to this event",
  "budgetItems": [
    {
      "category": "Venue | Catering & Bar | Decor & Florals | Photography & Video | Music & Entertainment | Rentals & Attire | Permits & Security | Contingency | Other",
      "title": "Specific budget line item title",
      "estimatedCost": 5000,
      "notes": "Cost rationale and notes",
      "priority": "essential | recommended | luxury"
    }
  ],
  "timelinePhases": [
    {
      "name": "Phase name",
      "timeframe": "e.g. Initial Sprint or Final 2 Weeks",
      "items": [
        {
          "title": "Milestone title",
          "description": "Details",
          "category": "Venue | Catering | Decor | Logistics"
        }
      ]
    }
  ],
  "dayOfSchedule": [
    {
      "time": "09:00 AM",
      "title": "Schedule activity",
      "location": "Location name",
      "leadPerson": "Lead person",
      "notes": "Execution note"
    }
  ],
  "vendors": [
    {
      "category": "Venue | Catering & Bar | Florals & Styling | Photo & Video | Music & AV | Rentals",
      "name": "Vendor business name",
      "notes": "Scope notes",
      "quotedPrice": 3000,
      "tags": ["Tag1", "Tag2"]
    }
  ],
  "creativeIdeas": [
    {
      "category": "Theme & Decor | Signature Menu | Entertainment & Music | Guest Experience | Gifts & Favors",
      "title": "Creative idea title",
      "description": "2 sentences describing concept",
      "estimatedCostTier": "$ | $$ | $$$",
      "tags": ["Memorable"]
    }
  ]
}`;

  try {
    const apiCall = ai.models.generateContent({
      model: FAST_FREE_MODEL,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const response = await withTimeout(apiCall, 18000);
    const parsed = JSON.parse(response.text || '{}');
    if (parsed.budgetItems && parsed.budgetItems.length > 0) {
      return res.json({ success: true, plan: parsed });
    }
    return res.json({ success: true, plan: buildLocalFallbackPlan() });
  } catch (err: any) {
    console.warn('AI Plan generator fallback triggered:', err?.message);
    return res.json({ success: true, plan: buildLocalFallbackPlan() });
  }
});

// -------------------------------------------------------------
// Endpoint 2: Multi-Turn AI Chatbot with Free Gemini Model
// -------------------------------------------------------------
app.post('/api/ai/chat', async (req, res) => {
  const { messages, userMessage, role = 'lead_planner', eventContext } = req.body;

  let roleInstruction = '';
  if (role === 'budget_strategist') {
    roleInstruction = `You are the Event Financial Strategist & Contract Analyst.
Your core expertise:
- Scrutinizing budget line items, detecting cost overruns, and identifying high-leverage savings.
- Providing mathematical breakdowns per guest, deposit milestones, and contingency reserve logic.
- Drafting tactical vendor negotiation scripts to save 5-15% on catering, venue, or rental fees.
- Always be quantitatively precise and practical.`;
  } else if (role === 'fast_assistant') {
    roleInstruction = `You are the Rapid Event Dispatcher & Quick Assistant.
Your core expertise:
- Providing rapid, punchy, concise answers, load-in checklists, and immediate operational steps.
- Drafting quick vendor inquiry emails and immediate task reminders.
- Keep answers ultra-scannable, efficient, and direct.`;
  } else if (role === 'creative_director') {
    roleInstruction = `You are the Creative & Sensory Atmosphere Director.
Your core expertise:
- Designing cohesive color palettes, lighting architectures, floral installations, and sensory accents.
- Conceptualizing bespoke signature food and beverage twists, interactive guest keepsakes, and icebreakers.
- Ensuring visual elegance without generic cliches.`;
  } else {
    roleInstruction = `You are the Lead Master Event Producer & Logistical Director.
Your expertise:
- Holistic event coordination, timeline pacing, and seamless transitions from arrival to departure.
- Synchronizing vendors (catering, music, lighting, photography) and resolving schedule bottlenecks.
- Establishing contingency plans for weather, power, and guest flow.`;
  }

  let contextSnippet = 'No active event details available yet. Provide general professional event advice.';
  if (eventContext && eventContext.title) {
    contextSnippet = `ACTIVE EVENT CONTEXT (User's Actual Plan):
- Title: "${eventContext.title}" (${eventContext.eventType})
- Date: ${eventContext.date || 'TBD'} | Location: ${eventContext.location || 'TBD'}
- Guests: ${eventContext.guestCount || 0} | Total Budget: $${(eventContext.totalBudget || 0).toLocaleString()}
- Theme/Vibe: ${eventContext.theme || 'Custom'}
- Budget Items Count: ${(eventContext.budgetItems || []).length}
- Timeline Schedule Count: ${(eventContext.dayOfSchedule || []).length}
- Vendors Count: ${(eventContext.vendors || []).length}
${eventContext.notes ? `- Special Notes: ${eventContext.notes}` : ''}`;
  }

  const systemInstruction = `${roleInstruction}

${contextSnippet}

GUIDELINES:
1. Provide real-time, helpful, practical answers specifically referencing the user's event data and questions.
2. Structure with bullet points and bold highlights for rapid reading.
3. Keep tone professional, upbeat, and action-oriented.`;

  const fallbackAnswer = () => {
    const title = eventContext?.title || 'your celebration';
    const total = eventContext?.totalBudget ? `$${eventContext.totalBudget.toLocaleString()}` : '$20,000';
    return `Regarding **"${userMessage}"** for **${title}** (Budget: ${total}):\n\n` +
      `1. **Key Focus**: Confirm all load-in windows with the venue at least 14 days prior.\n` +
      `2. **Financial Tip**: Aim to preserve 5% contingency reserve for overtime or last-minute dietary counts.\n` +
      `3. **Guest Experience**: Ensure ambient lighting transitions smoothly as evening begins.\n\n` +
      `Feel free to ask me to draft a vendor email, calculate budget adjustments, or build schedule cues!`;
  };

  if (!hasValidApiKey()) {
    return res.json({
      success: true,
      reply: fallbackAnswer(),
      modelUsed: FAST_FREE_MODEL,
      roleUsed: role,
      suggestions: [
        'How should we adjust our schedule for sunset photos?',
        'Draft a 10% negotiation email for catering',
        'Suggest 3 outdoor rain contingency ideas',
      ],
    });
  }

  try {
    const contents: any[] = [];
    if (Array.isArray(messages)) {
      for (const msg of messages) {
        if (msg.content && msg.content.trim()) {
          contents.push({
            role: msg.sender === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }],
          });
        }
      }
    }
    contents.push({
      role: 'user',
      parts: [{ text: userMessage }],
    });

    const apiCall = ai.models.generateContent({
      model: FAST_FREE_MODEL,
      contents,
      config: {
        systemInstruction,
      },
    });

    const response = await withTimeout(apiCall, 12000);
    const reply = response.text?.trim() || fallbackAnswer();

    return res.json({
      success: true,
      reply,
      modelUsed: FAST_FREE_MODEL,
      roleUsed: role,
      suggestions: [
        'How should we adjust our schedule for sunset photos?',
        'Draft a 10% negotiation email for catering',
        'Suggest 3 outdoor rain contingency ideas',
      ],
    });
  } catch (err: any) {
    console.warn('Chatbot fallback triggered:', err?.message);
    return res.json({
      success: true,
      reply: fallbackAnswer(),
      modelUsed: FAST_FREE_MODEL,
      roleUsed: role,
      suggestions: [
        'How should we adjust our schedule for sunset photos?',
        'Draft a 10% negotiation email for catering',
        'Suggest 3 outdoor rain contingency ideas',
      ],
    });
  }
});

// Alias for copilot
app.post('/api/ai/copilot', async (req, res) => {
  // Forward to /api/ai/chat
  const { eventContext, conversationHistory, userMessage } = req.body;
  req.body.messages = conversationHistory || [];
  req.body.userMessage = userMessage;
  req.body.eventContext = eventContext;
  req.body.role = 'lead_planner';

  // Delegate directly
  const chatHandler = app._router.stack.find((layer: any) => layer.route && layer.route.path === '/api/ai/chat');
  if (chatHandler) {
    return chatHandler.route.stack[0].handle(req, res);
  }
  return res.json({ success: true, reply: 'Copilot ready' });
});

// -------------------------------------------------------------
// Endpoint 3: AI Budget Optimizer
// -------------------------------------------------------------
app.post('/api/ai/optimize-budget', async (req, res) => {
  const { eventTitle, totalBudget, budgetItems = [], guestCount } = req.body;
  const total = Number(totalBudget) || 20000;
  const allocated = budgetItems.reduce((acc: number, item: any) => acc + (Number(item.actualCost || item.estimatedCost) || 0), 0);

  const fallbackAnalysis = {
    summaryScore: allocated > total ? 'Over Budget' : 'Well Balanced Allocation',
    totalAllocated: allocated,
    savingsPotential: Math.round(total * 0.08),
    strategicTips: [
      {
        category: 'Catering & Bar',
        insight: 'Beverage and meal service represent ~35-40% of total expenditure.',
        recommendation: 'Curate 2 signature cocktails with wine & beer rather than an unlimited open top-shelf spirit bar to save 12-15%.',
        estimatedSavings: Math.round(total * 0.04),
      },
      {
        category: 'Decor & Florals',
        insight: 'Ceremony floral arches are often left behind during dinner.',
        recommendation: 'Repurpose the ceremony arch or floral pillars behind the sweetheart/head table to save on secondary installations.',
        estimatedSavings: Math.round(total * 0.03),
      },
    ],
    vendorNegotiationTips: [
      'Ask vendors for a 3-5% courtesy discount for paying invoices via direct ACH transfer rather than credit card.',
      'Package setup, teardown, and delivery fees into the primary service contract.',
    ],
    contingencyAssessment: 'Maintain at least 5% contingency reserve ($' + Math.round(total * 0.05).toLocaleString() + ') for overtime or last-minute dietary counts.',
  };

  if (!hasValidApiKey()) {
    return res.json({ success: true, analysis: fallbackAnalysis });
  }

  const prompt = `Analyze this event budget and provide strategic cost-saving recommendations:
Event: ${eventTitle}
Total Target Budget: $${total}
Guest Count: ${guestCount}
Current Line Items: ${JSON.stringify(budgetItems)}

Return JSON with:
{
  "summaryScore": "Well Balanced Allocation | Needs Adjustment | Over Budget",
  "totalAllocated": ${allocated},
  "savingsPotential": 1500,
  "strategicTips": [
    {
      "category": "Category Name",
      "insight": "Observation on current allocation",
      "recommendation": "Concrete tactical advice",
      "estimatedSavings": 500
    }
  ],
  "vendorNegotiationTips": ["Tip 1", "Tip 2"],
  "contingencyAssessment": "1 sentence on contingency reserve health"
}`;

  try {
    const apiCall = ai.models.generateContent({
      model: FAST_FREE_MODEL,
      contents: prompt,
      config: { responseMimeType: 'application/json' },
    });
    const response = await withTimeout(apiCall, 12000);
    const parsed = JSON.parse(response.text || '{}');
    return res.json({ success: true, analysis: parsed });
  } catch (err: any) {
    console.warn('Budget optimizer fallback triggered:', err?.message);
    return res.json({ success: true, analysis: fallbackAnalysis });
  }
});

// -------------------------------------------------------------
// Endpoint 4: AI Creative Ideas Generator
// -------------------------------------------------------------
app.post('/api/ai/creative-ideas', async (req, res) => {
  const { eventType = 'event', title = 'Celebration', theme = 'Celebratory', focus, guestCount = 80 } = req.body;
  const cleanFocus = focus?.trim() || 'Distinctive sensory, culinary and experiential guest moments';

  const buildDynamicFallbackIdeas = () => [
    {
      id: `ci-${Date.now()}-1`,
      category: 'Signature Menu',
      title: `Artisan Welcome Spritz & Tasting Flight: "${cleanFocus.slice(0, 32)}"`,
      description: `A custom welcome beverage pairing and appetizer flight curated around ${theme}, featuring local botanicals, fresh infusions, and personalized glassware.`,
      estimatedCostTier: '$$',
      tags: ['Interactive', 'Culinary', 'Bespoke'],
      saved: true,
    },
    {
      id: `ci-${Date.now()}-2`,
      category: 'Guest Experience',
      title: 'Interactive Audio Guestbook & Keepsake Voicemail Station',
      description: `A vintage phone station styled with velvet linen and retro signage where guests record heartfelt spoken audio memories for ${title}.`,
      estimatedCostTier: '$',
      tags: ['Keepsake', 'Sentimental', 'Interactive'],
      saved: true,
    },
    {
      id: `ci-${Date.now()}-3`,
      category: 'Theme & Decor',
      title: 'Atmospheric Overhead Light Canopy & Living Greenery',
      description: `Cascading warm fairy lighting and lush foliage installations designed to amplify the ${theme} ambiance throughout the evening.`,
      estimatedCostTier: '$$',
      tags: ['Atmosphere', 'Lighting', 'Visual'],
      saved: true,
    },
    {
      id: `ci-${Date.now()}-4`,
      category: 'Entertainment & Music',
      title: 'Curated Golden Hour Acoustic Transition Set',
      description: `Live acoustic musicians seamlessly guiding guests from the afternoon cocktail hour into an energized evening celebration.`,
      estimatedCostTier: '$$',
      tags: ['Live Music', 'Atmosphere', 'Flow'],
      saved: true,
    },
  ];

  if (!hasValidApiKey()) {
    return res.json({ success: true, ideas: buildDynamicFallbackIdeas() });
  }

  const prompt = `You are an elite creative event experience designer.
Generate 4-5 fresh, innovative, high-impact ideas strictly tailored for:
Event: ${title} (${eventType})
Theme: ${theme}
Custom Inspiration Focus: ${cleanFocus}
Guest Count: ${guestCount}

Return JSON with format:
{
  "ideas": [
    {
      "id": "ci-1",
      "category": "Theme & Decor | Signature Menu | Entertainment & Music | Guest Experience | Gifts & Favors",
      "title": "Creative concept title",
      "description": "2-3 engaging sentences describing the sensory details, guest journey, and execution",
      "estimatedCostTier": "$ | $$ | $$$",
      "tags": ["Tag1", "Tag2"]
    }
  ]
}`;

  try {
    const apiCall = ai.models.generateContent({
      model: FAST_FREE_MODEL,
      contents: prompt,
      config: { responseMimeType: 'application/json' },
    });
    const response = await withTimeout(apiCall, 18000);
    const parsed = parseJsonSafely(response.text || '');
    const rawIdeas = parsed?.ideas || parsed?.creativeIdeas || (Array.isArray(parsed) ? parsed : null);

    if (Array.isArray(rawIdeas) && rawIdeas.length > 0) {
      const normalizedIdeas = rawIdeas.map((item: any, idx: number) => ({
        id: `ci-${Date.now()}-${idx}`,
        category: item.category || 'Guest Experience',
        title: item.title || 'Creative Concept',
        description: item.description || '',
        estimatedCostTier: item.estimatedCostTier || '$$',
        tags: Array.isArray(item.tags)
          ? item.tags
          : typeof item.tags === 'string'
          ? item.tags.split(',').map((t: string) => t.trim())
          : ['Personalized', 'Concept'],
        saved: true,
      }));
      return res.json({ success: true, ideas: normalizedIdeas });
    }
    return res.json({ success: true, ideas: buildDynamicFallbackIdeas() });
  } catch (err: any) {
    console.warn('Creative ideas fallback triggered:', err?.message);
    return res.json({ success: true, ideas: buildDynamicFallbackIdeas() });
  }
});

// -------------------------------------------------------------
// Endpoint 5: AI Vendor Email Drafter
// -------------------------------------------------------------
app.post('/api/ai/vendor-email', async (req, res) => {
  const { vendor, eventContext, emailGoal } = req.body;
  const eventName = eventContext?.title || 'our event';
  const eventDate = eventContext?.date || 'our upcoming date';
  const vendorName = vendor?.name || 'Partner';
  const recipientName = vendor?.contactPerson || vendorName;

  const fallbackEmail = `Subject: Inquiry regarding ${eventName} on ${eventDate}\n\n` +
    `Dear ${recipientName},\n\n` +
    `We hope this note finds you well. We are organizing "${eventName}" scheduled for ${eventDate} at ${eventContext?.location || 'our venue'} with approximately ${eventContext?.guestCount || 80} attendees.\n\n` +
    `We would love to discuss your availability and collaborate on securing your services. Specifically, our primary objective is: ${emailGoal || 'to discuss availability and pricing packages'}.\n\n` +
    `Could you please let us know if you have availability on this date and share your current package options?\n\n` +
    `Thank you, and we look forward to hearing from you!\n\n` +
    `Warm regards,\n` +
    `Event Coordination Team`;

  if (!hasValidApiKey()) {
    return res.json({ success: true, emailText: fallbackEmail });
  }

  const prompt = `Draft a polite, professional, high-leverage email to a vendor:
Vendor: ${vendorName} (${vendor?.category || 'Service'})
Recipient: ${recipientName}
Event: ${eventName} (${eventContext?.eventType || 'Celebration'})
Date: ${eventDate}
Guest Count: ${eventContext?.guestCount || 80}
Location: ${eventContext?.location || 'Venue'}
Goal: ${emailGoal}

Return ONLY the plain text email draft (including Subject line).`;

  try {
    const apiCall = ai.models.generateContent({
      model: FAST_FREE_MODEL,
      contents: prompt,
    });
    const response = await withTimeout(apiCall, 10000);
    const emailText = response.text?.trim() || fallbackEmail;
    return res.json({ success: true, emailText });
  } catch (err: any) {
    console.warn('Vendor email fallback triggered:', err?.message);
    return res.json({ success: true, emailText: fallbackEmail });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);

    // Serve transformed index.html for SPA routes
    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        let template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AuraEvent Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
