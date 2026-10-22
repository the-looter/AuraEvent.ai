import { describe, it, expect } from 'vitest';

// Safe JSON parser test mirroring server-side parseJsonSafely implementation
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

describe('Security, Sanitization & Resilient Parsing', () => {
  it('parses pristine JSON without corruption', () => {
    const raw = JSON.stringify({ theme: 'Elegant Garden', count: 100 });
    const parsed = parseJsonSafely(raw);
    expect(parsed).toEqual({ theme: 'Elegant Garden', count: 100 });
  });

  it('safely strips markdown json codeblocks from LLM responses', () => {
    const raw = "```json\n{\n  \"theme\": \"Rustic Chic\",\n  \"budget\": 25000\n}\n```";
    const parsed = parseJsonSafely(raw);
    expect(parsed).toEqual({ theme: 'Rustic Chic', budget: 25000 });
  });

  it('handles conversational conversational prefixes before JSON block', () => {
    const raw = "Here is the master plan for your celebration:\n```json\n{\n  \"theme\": \"Midnight Starlight\"\n}\n```\nHope this helps!";
    const parsed = parseJsonSafely(raw);
    expect(parsed).toEqual({ theme: 'Midnight Starlight' });
  });

  it('safely handles empty, null or corrupted input without throwing unhandled exceptions', () => {
    expect(parseJsonSafely('')).toBeNull();
    expect(parseJsonSafely('Not a JSON string at all')).toBeNull();
    expect(parseJsonSafely('undefined')).toBeNull();
  });

  it('validates sanitized budget item fields', () => {
    const sanitizeBudgetItem = (item: any) => ({
      title: String(item.title || 'Untitled Line Item').slice(0, 120),
      estimatedCost: Math.max(0, Number(item.estimatedCost) || 0),
      actualCost: Math.max(0, Number(item.actualCost) || 0),
      category: item.category || 'Other',
    });

    const malformed = {
      title: '<script>alert(1)</script>Overly long line item with negative cost',
      estimatedCost: -500,
      actualCost: 'invalid',
    };

    const sanitized = sanitizeBudgetItem(malformed);
    expect(sanitized.estimatedCost).toBe(0);
    expect(sanitized.actualCost).toBe(0);
    expect(sanitized.category).toBe('Other');
  });
});
