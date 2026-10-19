import { describe, it, expect } from 'vitest';

describe('BuildVerse Studio Environment', () => {
  it('runs unit tests with correct mathematical precision', () => {
    const wallLength = 6.0;
    const wallHeight = 3.0;
    const grossArea = wallLength * wallHeight;
    expect(grossArea).toBe(18.0);
  });
});
