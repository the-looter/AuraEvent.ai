import { describe, it, expect } from 'vitest';
import { createDefaultEvent, DEFAULT_COLLABORATORS } from '../src/data/mockEvents';

describe('Event Domain Models', () => {
  it('initializes a comprehensive wedding event with valid initial values', () => {
    const event = createDefaultEvent('wedding');
    expect(event).toBeDefined();
    expect(event.eventType).toBe('wedding');
    expect(event.title).toContain('Wedding');
    expect(event.totalBudget).toBeGreaterThan(0);
    expect(event.guestCount).toBeGreaterThan(0);
    expect(event.budgetItems.length).toBeGreaterThanOrEqual(5);
    expect(event.timelinePhases.length).toBeGreaterThanOrEqual(2);
    expect(event.dayOfSchedule.length).toBeGreaterThanOrEqual(5);
    expect(event.vendors.length).toBeGreaterThanOrEqual(3);
    expect(event.creativeIdeas.length).toBeGreaterThanOrEqual(3);
  });

  it('supports birthday, community and custom event configurations', () => {
    const birthday = createDefaultEvent('birthday');
    const community = createDefaultEvent('community');
    const custom = createDefaultEvent('custom');

    expect(birthday.eventType).toBe('birthday');
    expect(birthday.title).toContain('Birthday');

    expect(community.eventType).toBe('community');
    expect(community.title).toContain('Community');

    expect(custom.eventType).toBe('custom');
  });

  it('provides a default team of collaborators with distinct roles', () => {
    expect(DEFAULT_COLLABORATORS.length).toBeGreaterThanOrEqual(3);
    const roles = DEFAULT_COLLABORATORS.map(c => c.role);
    expect(roles).toContain('lead_planner');
    expect(roles).toContain('budget_manager');
    expect(roles).toContain('logistics_decor');

    const lead = DEFAULT_COLLABORATORS.find(c => c.isCurrentUser);
    expect(lead).toBeDefined();
    expect(lead?.role).toBe('lead_planner');
  });

  it('ensures budget items have required status and priority fields', () => {
    const event = createDefaultEvent('wedding');
    for (const item of event.budgetItems) {
      expect(item.id).toBeTruthy();
      expect(item.category).toBeTruthy();
      expect(item.estimatedCost).toBeGreaterThanOrEqual(0);
      expect(['planned', 'deposit_paid', 'paid_in_full', 'negotiating']).toContain(item.status);
      expect(['essential', 'recommended', 'luxury']).toContain(item.priority);
    }
  });

  it('calculates total budget allocation correctly', () => {
    const event = createDefaultEvent('wedding');
    const totalAllocated = event.budgetItems.reduce(
      (sum, item) => sum + (item.actualCost || item.estimatedCost),
      0
    );
    expect(totalAllocated).toBeGreaterThan(0);
    expect(typeof totalAllocated).toBe('number');
  });
});
