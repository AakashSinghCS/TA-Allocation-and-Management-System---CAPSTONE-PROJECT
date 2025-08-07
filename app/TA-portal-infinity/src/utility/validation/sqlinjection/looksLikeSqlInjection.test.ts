import { describe, it, expect } from 'vitest';
import { looksLikeSqlInjection } from './looksLikeSqlInjection';

describe('looksLikeSqlInjection', () => {
  it('returns false for safe strings', () => {
    expect(looksLikeSqlInjection('')).toBe(false);
    expect(looksLikeSqlInjection('normal text')).toBe(false);
    expect(looksLikeSqlInjection('user@example.com')).toBe(false);
    expect(looksLikeSqlInjection('John Smith')).toBe(false);
    expect(looksLikeSqlInjection('123456')).toBe(false);
  });

  it('detects single-line SQL comments', () => {
    expect(looksLikeSqlInjection('input -- DROP TABLE')).toBe(true);
    expect(looksLikeSqlInjection('--')).toBe(true);
    expect(looksLikeSqlInjection('value-- comment')).toBe(true);
  });

  it('detects multi-line SQL comments', () => {
    expect(looksLikeSqlInjection('/* comment */')).toBe(true);
    expect(looksLikeSqlInjection('input /* malicious */ value')).toBe(true);
  });

  it('detects statement separators', () => {
    expect(looksLikeSqlInjection('input; DROP TABLE users;')).toBe(true);
    expect(looksLikeSqlInjection(';')).toBe(true);
  });

  it('detects SQL Server extended stored procedures', () => {
    expect(looksLikeSqlInjection('xp_cmdshell')).toBe(true);
    expect(looksLikeSqlInjection('XP_CMDSHELL')).toBe(true);
    expect(looksLikeSqlInjection('input xp_delete')).toBe(true);
  });

  it('detects SQL keywords (case insensitive)', () => {
    expect(looksLikeSqlInjection('SELECT * FROM users')).toBe(true);
    expect(looksLikeSqlInjection('select')).toBe(true);
    expect(looksLikeSqlInjection('UNION ALL')).toBe(true);
    expect(looksLikeSqlInjection('INSERT INTO')).toBe(true);
    expect(looksLikeSqlInjection('update table')).toBe(true);
    expect(looksLikeSqlInjection('DELETE FROM')).toBe(true);
    expect(looksLikeSqlInjection('DROP TABLE')).toBe(true);
    expect(looksLikeSqlInjection('CREATE DATABASE')).toBe(true);
    expect(looksLikeSqlInjection('ALTER TABLE')).toBe(true);
    expect(looksLikeSqlInjection('EXEC procedure')).toBe(true);
  });

  it('detects SQL keywords in mixed case', () => {
    expect(looksLikeSqlInjection('Select')).toBe(true);
    expect(looksLikeSqlInjection('UnIoN')).toBe(true);
    expect(looksLikeSqlInjection('dRoP')).toBe(true);
  });

  it('detects SQL injection attempts in realistic scenarios', () => {
    expect(looksLikeSqlInjection("admin' OR '1'='1")).toBe(false); // This doesn't contain SQL keywords
    expect(looksLikeSqlInjection("'; DROP TABLE users; --")).toBe(true);
    expect(looksLikeSqlInjection("1' UNION SELECT username, password FROM users--")).toBe(true);
  });

  it('handles edge cases', () => {
    expect(looksLikeSqlInjection('selection')).toBe(false); // Contains 'SELECT' but as part of word
    expect(looksLikeSqlInjection('SELECTOR')).toBe(false); // Contains 'SELECT' but as part of word
  });
});
