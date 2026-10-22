import { describe, it, expect } from 'vitest';
import { synthesizeLocalPlan } from '../src/services/geminiService';

describe('Gemini AI Service & Synthesis Layer', () => {
  it('synthesizes a complete event plan for standard inputs', () => {
    const plan = synthesizeLocalPlan({
      eventType: 'wedding',
      title: 'Oceanfront Elegance',
      guestCount: 120,
      budget: 45000,
      vibe: 'Modern Coastal, Candlelight',
      location: 'Monterey Cliffside Sanctuary',
      date: '2026-09-15',
      specialNotes: 'Focus on local organic farm-to-table dining',
    });

    expect(plan).toBeDefined();
    expect(plan.theme).toContain('Oceanfront Elegance');
    expect(plan.budgetItems.length).toBeGreaterThanOrEqual(5);
    expect(plan.timelinePhases.length).toBeGreaterThanOrEqual(3);
    expect(plan.dayOfSchedule.length).toBeGreaterThanOrEqual(5);
    expect(plan.vendors.length).toBeGreaterThanOrEqual(3);
    expect(plan.creativeIdeas.length).toBeGreaterThanOrEqual(3);
  });

  it('allocates budget proportionately across essential categories', () => {
    const total = 50000;
    const plan = synthesizeLocalPlan({
      eventType: 'corporate',
      title: 'Annual Innovation Summit',
      guestCount: 200,
      budget: total,
      vibe: 'Sleek, High-Tech, Professional',
      location: 'Metropolitan Convention Hall',
      date: '2026-11-10',
    });

    const venue = plan.budgetItems.find(b => b.category === 'Venue');
    const catering = plan.budgetItems.find(b => b.category === 'Catering & Bar');
    const contingency = plan.budgetItems.find(b => b.category === 'Contingency');

    expect(venue).toBeDefined();
    expect(catering).toBeDefined();
    expect(contingency).toBeDefined();

    // Verify reasonable percentage allocations
    expect(venue!.estimatedCost).toBeGreaterThanOrEqual(total * 0.20);
    expect(catering!.estimatedCost).toBeGreaterThanOrEqual(total * 0.25);
    expect(contingency!.estimatedCost).toBeGreaterThanOrEqual(total * 0.04);
  });

  it('handles extreme edge cases like $0 budget and 0 guests gracefully', () => {
    const plan = synthesizeLocalPlan({
      eventType: 'custom',
      title: 'Micro Gathering',
      guestCount: 0,
      budget: 0,
      vibe: 'Cozy',
      location: 'Local Park',
      date: '2026-10-30',
    });

    expect(plan).toBeDefined();
    expect(plan.budgetItems.length).toBeGreaterThan(0);
    expect(plan.timelinePhases.length).toBeGreaterThan(0);
    expect(plan.dayOfSchedule.length).toBeGreaterThan(0);
  });

  it('generates creative ideas with valid category and cost tier metadata', () => {
    const plan = synthesizeLocalPlan({
      eventType: 'birthday',
      title: 'Retro Arcade Night',
      guestCount: 50,
      budget: 8000,
      vibe: 'Neon, Synthwave, Nostalgic',
      location: 'Downtown Loft',
      date: '2026-12-05',
    });

    for (const idea of plan.creativeIdeas) {
      expect(idea.title).toBeTruthy();
      expect(idea.description).toBeTruthy();
      expect(['$', '$$', '$$$']).toContain(idea.estimatedCostTier);
      expect(Array.isArray(idea.tags)).toBe(true);
      expect(idea.tags.length).toBeGreaterThan(0);
    }
  });
});
