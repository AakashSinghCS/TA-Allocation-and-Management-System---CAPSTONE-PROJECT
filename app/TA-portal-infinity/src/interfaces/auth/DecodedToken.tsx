export interface DecodedToken {
  sub: string;               
  userId: number;
  roles: string[];
  iat: number;
  exp: number;
  
  get email(): string;    
  get expiresAt(): Date;     
}