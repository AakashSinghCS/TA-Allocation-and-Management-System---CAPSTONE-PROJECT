import type { DecodedToken } from "../interfaces/auth/DecodedToken";

/**
 * Decodes a JWT token and returns the payload as a DecodedToken object.
 * @param token - The JWT token to decode.
 * @returns The decoded token payload or null if decoding fails.
 */
export function decodeToken(token: string): DecodedToken | null {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload) as DecodedToken;
  } catch (error) {
    console.error("Failed to decode token:", error);
    return null;
  }
}
