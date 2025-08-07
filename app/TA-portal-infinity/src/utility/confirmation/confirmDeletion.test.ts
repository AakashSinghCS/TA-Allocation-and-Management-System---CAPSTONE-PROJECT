import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { confirmDeletion } from './confirmDeletion';

describe('confirmDeletion', () => {
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

    const result = confirmDeletion('user', 'Additional info');

    expect(global.confirm).toHaveBeenCalledWith('Really delete the user?');
    expect(global.prompt).not.toHaveBeenCalled();
    expect(global.alert).not.toHaveBeenCalled();
    expect(result).toBe(false);
  });

  it('returns false when prompt is cancelled (null)', () => {
    (global.confirm as any).mockReturnValue(true);
    (global.prompt as any).mockReturnValue(null);

    const result = confirmDeletion('item', 'Extra details');

    expect(global.confirm).toHaveBeenCalledWith('Really delete the item?');
    expect(global.prompt).toHaveBeenCalledWith('Extra details. Type "DELETE" to confirm item deletion. ');
    expect(global.alert).toHaveBeenCalledWith('Deletion cancelled.');
    expect(result).toBe(false);
  });

  it('returns false when incorrect phrase is entered', () => {
    (global.confirm as any).mockReturnValue(true);
    (global.prompt as any).mockReturnValue('WRONG');

    const result = confirmDeletion('file', 'Important file');

    expect(global.confirm).toHaveBeenCalledWith('Really delete the file?');
    expect(global.prompt).toHaveBeenCalledWith('Important file. Type "DELETE" to confirm file deletion. ');
    expect(global.alert).toHaveBeenCalledWith('Deletion cancelled.');
    expect(result).toBe(false);
  });

  it('returns true when correct phrase is entered', () => {
    (global.confirm as any).mockReturnValue(true);
    (global.prompt as any).mockReturnValue('DELETE');

    const result = confirmDeletion('document', 'Critical document');

    expect(global.confirm).toHaveBeenCalledWith('Really delete the document?');
    expect(global.prompt).toHaveBeenCalledWith('Critical document. Type "DELETE" to confirm document deletion. ');
    expect(global.alert).not.toHaveBeenCalled();
    expect(result).toBe(true);
  });

  it('handles empty extra info correctly', () => {
    (global.confirm as any).mockReturnValue(true);
    (global.prompt as any).mockReturnValue('DELETE');

    const result = confirmDeletion('record', '');

    expect(global.confirm).toHaveBeenCalledWith('Really delete the record?');
    expect(global.prompt).toHaveBeenCalledWith(' Type "DELETE" to confirm record deletion. ');
    expect(result).toBe(true);
  });

  it('adds period to extra info when provided', () => {
    (global.confirm as any).mockReturnValue(true);
    (global.prompt as any).mockReturnValue('DELETE');

    const result = confirmDeletion('profile', 'User profile data');

    expect(global.prompt).toHaveBeenCalledWith('User profile data. Type "DELETE" to confirm profile deletion. ');
    expect(result).toBe(true);
  });

  it('handles case sensitivity correctly', () => {
    (global.confirm as any).mockReturnValue(true);
    (global.prompt as any).mockReturnValue('delete'); // lowercase

    const result = confirmDeletion('entry', 'Data entry');

    expect(global.alert).toHaveBeenCalledWith('Deletion cancelled.');
    expect(result).toBe(false);
  });
});
