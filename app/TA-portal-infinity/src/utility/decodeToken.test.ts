import { describe, it, expect, vi } from 'vitest';
import { decodeToken } from './decodeToken';
import { UserRole } from '../interfaces/enum/UserRole';

describe('decodeToken', () => {
  // Helper to create a valid JWT token for testing
  const createMockToken = (payload: object): string => {
    const header = { alg: 'HS256', typ: 'JWT' };
    const headerEncoded = btoa(JSON.stringify(header)).replace(/=/g, '');
    const payloadEncoded = btoa(JSON.stringify(payload)).replace(/=/g, '');
    const signature = 'mock-signature';
    return `${headerEncoded}.${payloadEncoded}.${signature}`;
  };

  it('successfully decodes a valid JWT token', () => {
    const payload = {
      sub: 'test@example.com',
      userId: 123,
      roles: [UserRole.STUDENT],
      issuedAt: 1609459200,
      expiration: 1609545600
    };
    
    const token = createMockToken(payload);
    const result = decodeToken(token);
    
    expect(result).toEqual(payload);
  });

  it('returns null for invalid token format', () => {
    const invalidToken = 'invalid.token';
    const result = decodeToken(invalidToken);
    
    expect(result).toBeNull();
  });

  it('returns null for malformed base64 in payload', () => {
    const invalidToken = 'header.invalid-base64.signature';
    const result = decodeToken(invalidToken);
    
    expect(result).toBeNull();
  });

  it('returns null for token with invalid JSON payload', () => {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).replace(/=/g, '');
    const invalidPayload = btoa('invalid-json{').replace(/=/g, '');
    const signature = 'signature';
    const invalidToken = `${header}.${invalidPayload}.${signature}`;
    
    const result = decodeToken(invalidToken);
    
    expect(result).toBeNull();
  });

  it('handles tokens with URL-safe base64 encoding', () => {
    const payload = {
      sub: 'test@example.com',
      userId: 456,
      roles: [UserRole.INSTRUCTOR],
      issuedAt: 1609459200,
      expiration: 1609545600
    };
    
    // Create token with URL-safe base64 characters
    const payloadStr = JSON.stringify(payload);
    const payloadBase64 = btoa(payloadStr).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    const token = `header.${payloadBase64}.signature`;
    
    const result = decodeToken(token);
    
    expect(result).toEqual(payload);
  });

  it('logs error and returns null when decoding fails', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    const result = decodeToken('completely.invalid.token');
    
    expect(result).toBeNull();
    expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to decode token:', expect.any(Error));
    
    consoleErrorSpy.mockRestore();
  });
});
