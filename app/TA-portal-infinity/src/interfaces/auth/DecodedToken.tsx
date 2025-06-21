
import type { UserRole } from '../enum/UserRole';
export interface DecodedToken {
  sub: string;               
  userId: number;
  roles: UserRole[];
  issuedAt: number;
  expiration: number;

}
export function getEmail(token: DecodedToken): string {
  return token.sub;
}

export function getExpiresAt(token: DecodedToken): Date {
  return new Date(token.expiration * 1000);
}