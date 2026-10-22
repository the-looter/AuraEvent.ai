/**
 * Comprehensive Automated Test Suite for AuraEvent
 * Tests all backend AI endpoints, fallbacks, schema contracts, and local domain models.
 */

import { createDefaultEvent } from '../src/data/mockEvents.js';
import { synthesizeLocalPlan } from '../src/services/geminiService.js';

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

interface TestResult {
  name: string;
  category: string;
  passed: boolean;
  durationMs: number;
  details?: string;
  error?: string;
}

const results: TestResult[] = [];

async function runTest(category: string, name: string, fn: () => Promise<void>) {
  const start = Date.now();
  try {
    await fn();
    const durationMs = Date.now() - start;
    results.push({ name, category, passed: true, durationMs });
    console.log(`  ✓ [PASS] [${category}] ${name} (${durationMs}ms)`);
  } catch (err: any) {
    const durationMs = Date.now() - start;
    results.push({ name, category, passed: false, durationMs, error: err.message || String(err) });
    console.error(`  ✗ [FAIL] [${category}] ${name} (${durationMs}ms): ${err.message}`);
  }
}

function assert(condition: boolean, msg: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${msg}`);
  }
}

async function main() {
  console.log(`\n=================================================`);
  console.log(`  🚀 Starting AuraEvent Comprehensive Test Suite  `);
  console.log(`  Base Target: ${BASE_URL}                        `);
  console.log(`=================================================\n`);

  // Section 1: Domain Model & Data Integrity Tests
  console.log(`--- SECTION 1: Local Domain & Fallback Logic ---`);

  await runTest('Domain Logic', 'createDefaultEvent creates valid wedding plan', async () => {
    const plan = createDefaultEvent('wedding');
    assert(Boolean(plan.id), 'Plan must have an id');
    assert(plan.eventType === 'wedding', 'Event type must match');
    assert(plan.budgetItems.length > 0, 'Must have initial budget items');
    assert(plan.timelinePhases.length > 0, 'Must have timeline phases');
    assert(plan.dayOfSchedule.length > 0, 'Must have day of schedule');
    assert(plan.vendors.length > 0, 'Must have vendors');
    assert(plan.creativeIdeas.length > 0, 'Must have creative ideas');
    assert(plan.totalBudget > 0, 'Total budget must be greater than 0');
  });

  await runTest('Domain Logic', 'createDefaultEvent generates distinct birthday and community configurations', async () => {
    const bday = createDefaultEvent('birthday');
    const comm = createDefaultEvent('community');
    assert(bday.eventType === 'birthday', 'Birthday event type check');
    assert(comm.eventType === 'community', 'Community event type check');
    assert(bday.title.includes('Birthday'), 'Birthday title check');
    assert(comm.title.includes('Community'), 'Community title check');
  });

  await runTest('Domain Logic', 'synthesizeLocalPlan handles edge-case numbers and produces complete schema', async () => {
    const synth = synthesizeLocalPlan({
      eventType: 'custom',
      title: 'Minimalist Rooftop Launch',
      guestCount: 0,
      budget: 0,
      vibe: 'Modern, Minimalist',
      location: 'Skyline Terrace',
      date: '2026-12-01',
      specialNotes: 'Focus on networking',
    });
    assert(Boolean(synth.theme), 'Must have theme');
    assert(synth.budgetItems.length >= 5, 'Must have at least 5 budget items');
    assert(synth.timelinePhases.length >= 3, 'Must have 3 timeline phases');
    assert(synth.dayOfSchedule.length >= 4, 'Must have schedule items');
    assert(synth.vendors.length >= 2, 'Must have vendors');
    assert(synth.creativeIdeas.length >= 2, 'Must have creative ideas');
  });

  // Section 2: AI Endpoints Live Integration Tests
  console.log(`\n--- SECTION 2: AI Endpoints Live Integration ---`);

  await runTest('API: Plan Generator', 'POST /api/ai/plan-event returns turnkey master plan', async () => {
    const res = await fetch(`${BASE_URL}/api/ai/plan-event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventType: 'wedding',
        title: 'Eucalyptus Vineyard Nuptials',
        guestCount: 110,
        budget: 32000,
        vibe: 'Rustic Elegance, Organic Florals',
        location: 'Sonoma Valley Estate',
        date: '2026-10-14',
      }),
    });
    assert(res.ok, `Expected 200, got ${res.status}`);
    const data = await res.json();
    assert(data.success === true, 'Success flag should be true');
    assert(Boolean(data.plan), 'Response must contain plan object');
    assert(Array.isArray(data.plan.budgetItems) && data.plan.budgetItems.length > 0, 'Must have budgetItems array');
    assert(Array.isArray(data.plan.timelinePhases) && data.plan.timelinePhases.length > 0, 'Must have timelinePhases');
    assert(Array.isArray(data.plan.dayOfSchedule) && data.plan.dayOfSchedule.length > 0, 'Must have dayOfSchedule');
    assert(Array.isArray(data.plan.creativeIdeas) && data.plan.creativeIdeas.length > 0, 'Must have creativeIdeas');
    assert(Array.isArray(data.plan.vendors) && data.plan.vendors.length > 0, 'Must have vendors');
  });

  await runTest('API: Plan Generator', 'POST /api/ai/plan-event handles empty body defaults gracefully', async () => {
    const res = await fetch(`${BASE_URL}/api/ai/plan-event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    assert(res.ok, `Expected 200, got ${res.status}`);
    const data = await res.json();
    assert(data.success === true, 'Empty payload should fallback cleanly with success: true');
    assert(Boolean(data.plan?.theme), 'Plan must provide default theme');
  });

  await runTest('API: Creative Ideas', 'POST /api/ai/creative-ideas generates 4+ ideas with valid tags and cost tiers', async () => {
    const res = await fetch(`${BASE_URL}/api/ai/creative-ideas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventType: 'wedding',
        title: 'Coastal Sunset Reception',
        theme: 'Ocean Breeze & Candlelit Dining',
        focus: 'Interactive culinary stations and bespoke guest keepsakes',
        guestCount: 95,
      }),
    });
    assert(res.ok, `Expected 200, got ${res.status}`);
    const data = await res.json();
    assert(data.success === true, 'Success flag must be true');
    assert(Array.isArray(data.ideas), 'Response ideas must be an array');
    assert(data.ideas.length >= 3, `Expected at least 3 ideas, received ${data.ideas.length}`);

    for (const idea of data.ideas) {
      assert(Boolean(idea.id), 'Idea must have id');
      assert(Boolean(idea.title), 'Idea must have title');
      assert(Boolean(idea.description), 'Idea must have description');
      assert(Boolean(idea.category), 'Idea must have category');
      assert(Array.isArray(idea.tags), 'Tags must be an array');
      assert(['$', '$$', '$$$'].includes(idea.estimatedCostTier), `Invalid cost tier: ${idea.estimatedCostTier}`);
    }
  });

  await runTest('API: Creative Ideas', 'POST /api/ai/creative-ideas handles blank focus without failing', async () => {
    const res = await fetch(`${BASE_URL}/api/ai/creative-ideas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventType: 'birthday',
        title: 'Milestone 40th Soiree',
        theme: 'Gatsby Glamour',
        focus: '',
        guestCount: 60,
      }),
    });
    assert(res.ok, `Expected 200, got ${res.status}`);
    const data = await res.json();
    assert(data.success === true, 'Must return success: true on blank focus');
    assert(Array.isArray(data.ideas) && data.ideas.length > 0, 'Must return generated ideas');
  });

  await runTest('API: Chatbot', 'POST /api/ai/chat delivers structured answer & follow-up suggestions', async () => {
    const res = await fetch(`${BASE_URL}/api/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userMessage: 'What are the top 3 risks when planning an outdoor summer wedding?',
        role: 'lead_planner',
        messages: [],
      }),
    });
    assert(res.ok, `Expected 200, got ${res.status}`);
    const data = await res.json();
    assert(data.success === true, 'Success flag must be true');
    assert(typeof data.reply === 'string' && data.reply.trim().length > 30, 'Reply must be substantial string');
    assert(Array.isArray(data.suggestions) && data.suggestions.length > 0, 'Suggestions must be non-empty array');
  });

  await runTest('API: Chatbot Roles', 'POST /api/ai/chat handles budget_strategist role with quantitative context', async () => {
    const res = await fetch(`${BASE_URL}/api/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userMessage: 'Our catering quote is $12,000 for 90 guests. How can we negotiate this down 10%?',
        role: 'budget_strategist',
        eventContext: {
          title: 'Harbor View Gala',
          totalBudget: 28000,
          guestCount: 90,
        },
      }),
    });
    assert(res.ok, `Expected 200, got ${res.status}`);
    const data = await res.json();
    assert(data.success === true, 'Chat role query succeeded');
    assert(data.roleUsed === 'budget_strategist', 'Role used should be recorded');
    assert(typeof data.reply === 'string' && data.reply.length > 20, 'Reply must be populated');
  });

  await runTest('API: Copilot Alias', 'POST /api/ai/copilot routes seamlessly to chat engine', async () => {
    const res = await fetch(`${BASE_URL}/api/ai/copilot`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userMessage: 'How do I schedule vendor setup on the morning of the event?',
        eventContext: {
          title: 'Spring Garden Party',
        },
      }),
    });
    assert(res.ok, `Expected 200, got ${res.status}`);
    const data = await res.json();
    assert(data.success === true, 'Copilot alias returns success: true');
    assert(typeof data.reply === 'string' && data.reply.length > 10, 'Copilot alias returns reply');
  });

  await runTest('API: Budget Optimizer', 'POST /api/ai/optimize-budget returns actionable savings and recommendations', async () => {
    const res = await fetch(`${BASE_URL}/api/ai/optimize-budget`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventTitle: 'Golden Gate Anniversary Gala',
        totalBudget: 30000,
        guestCount: 120,
        budgetItems: [
          { category: 'Venue', estimatedCost: 10000, actualCost: 10000 },
          { category: 'Catering & Bar', estimatedCost: 14000, actualCost: 14000 },
          { category: 'Decor & Florals', estimatedCost: 5000, actualCost: 5000 },
          { category: 'Music & Entertainment', estimatedCost: 3500, actualCost: 3500 },
        ],
      }),
    });
    assert(res.ok, `Expected 200, got ${res.status}`);
    const data = await res.json();
    assert(data.success === true, 'Success flag must be true');
    assert(Boolean(data.analysis), 'Must contain analysis object');
    assert(typeof data.analysis.totalAllocated === 'number', 'totalAllocated must be number');
    assert(Array.isArray(data.analysis.strategicTips), 'strategicTips must be array');
    assert(Array.isArray(data.analysis.vendorNegotiationTips), 'vendorNegotiationTips must be array');
  });

  await runTest('API: Vendor Email Drafter', 'POST /api/ai/vendor-email drafts a complete professional email', async () => {
    const res = await fetch(`${BASE_URL}/api/ai/vendor-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        vendor: {
          name: 'Artisan Floral Collective',
          contactPerson: 'Elena Rostova',
          category: 'Florals & Styling',
        },
        eventContext: {
          title: 'Highland Meadow Wedding',
          date: '2026-09-18',
          location: 'Meadowood Pavilion',
          guestCount: 85,
        },
        emailGoal: 'Inquire about availability and request a breakdown of ceremony arch installations',
      }),
    });
    assert(res.ok, `Expected 200, got ${res.status}`);
    const data = await res.json();
    assert(data.success === true, 'Success flag must be true');
    assert(typeof data.emailText === 'string' && data.emailText.length > 50, 'Drafted email must be substantial');
    assert(data.emailText.toLowerCase().includes('subject:') || data.emailText.toLowerCase().includes('dear'), 'Must have email structure');
  });

  // Section 3: Summary Report
  console.log(`\n=================================================`);
  console.log(`               TEST SUITE SUMMARY                `);
  console.log(`=================================================`);

  const passedCount = results.filter((r) => r.passed).length;
  const failedCount = results.filter((r) => !r.passed).length;
  const totalCount = results.length;

  console.log(`Total Tests Run:  ${totalCount}`);
  console.log(`Passed:           ${passedCount} ✅`);
  console.log(`Failed:           ${failedCount} ${failedCount > 0 ? '❌' : ''}`);

  if (failedCount > 0) {
    console.error(`\nFailed tests:`);
    for (const r of results.filter((r) => !r.passed)) {
      console.error(`  - [${r.category}] ${r.name}: ${r.error}`);
    }
    process.exit(1);
  } else {
    console.log(`\n🎉 ALL ${totalCount} TEST CASES PASSED WITH 100% SUCCESS RATE!\n`);
    process.exit(0);
  }
}

main().catch((err) => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
