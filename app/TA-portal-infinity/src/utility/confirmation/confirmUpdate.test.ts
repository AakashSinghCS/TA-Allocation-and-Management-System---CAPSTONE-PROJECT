import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { confirmUpdate } from './confirmUpdate';

describe('confirmUpdate', () => {
  beforeEach(() => {
    // Mock browser APIs
    global.confirm = vi.fn();
    global.prompt = vi.fn();
    global.alert = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns false when first confirmation is cancelled', () => {
    (global.confirm as any).mockReturnValue(false);

    const result = confirmUpdate('user profile', 'Important data');

    expect(global.confirm).toHaveBeenCalledWith('Really update the user profile?');
    expect(global.prompt).not.toHaveBeenCalled();
    expect(global.alert).not.toHaveBeenCalled();
    expect(result).toBe(false);
  });

  it('returns false when prompt is cancelled (null)', () => {
    (global.confirm as any).mockReturnValue(true);
    (global.prompt as any).mockReturnValue(null);

    const result = confirmUpdate('settings', 'System settings');

    expect(global.confirm).toHaveBeenCalledWith('Really update the settings?');
    expect(global.prompt).toHaveBeenCalledWith('System settings. Type "UPDATE" to confirm settings update.');
    expect(global.alert).toHaveBeenCalledWith('Update cancelled.');
    expect(result).toBe(false);
  });

  it('returns false when incorrect phrase is entered', () => {
    (global.confirm as any).mockReturnValue(true);
    (global.prompt as any).mockReturnValue('WRONG');

    const result = confirmUpdate('configuration', 'Application config');

    expect(global.confirm).toHaveBeenCalledWith('Really update the configuration?');
    expect(global.prompt).toHaveBeenCalledWith('Application config. Type "UPDATE" to confirm configuration update.');
    expect(global.alert).toHaveBeenCalledWith('Update cancelled.');
    expect(result).toBe(false);
  });

  it('returns true when correct phrase is entered', () => {
    (global.confirm as any).mockReturnValue(true);
    (global.prompt as any).mockReturnValue('UPDATE');

    const result = confirmUpdate('database', 'Important database changes');

    expect(global.confirm).toHaveBeenCalledWith('Really update the database?');
    expect(global.prompt).toHaveBeenCalledWith('Important database changes. Type "UPDATE" to confirm database update.');
    expect(global.alert).not.toHaveBeenCalled();
    expect(result).toBe(true);
  });

  it('handles empty extra info correctly', () => {
    (global.confirm as any).mockReturnValue(true);
    (global.prompt as any).mockReturnValue('UPDATE');

    const result = confirmUpdate('record', '');

    expect(global.confirm).toHaveBeenCalledWith('Really update the record?');
    expect(global.prompt).toHaveBeenCalledWith(' Type "UPDATE" to confirm record update.');
    expect(result).toBe(true);
  });

  it('adds period to extra info when provided', () => {
    (global.confirm as any).mockReturnValue(true);
    (global.prompt as any).mockReturnValue('UPDATE');

    const result = confirmUpdate('user data', 'Personal information');

    expect(global.prompt).toHaveBeenCalledWith('Personal information. Type "UPDATE" to confirm user data update.');
    expect(result).toBe(true);
  });

  it('handles case sensitivity correctly', () => {
    (global.confirm as any).mockReturnValue(true);
    (global.prompt as any).mockReturnValue('update'); // lowercase

    const result = confirmUpdate('entry', 'Data entry');

    expect(global.alert).toHaveBeenCalledWith('Update cancelled.');
    expect(result).toBe(false);
  });
});
