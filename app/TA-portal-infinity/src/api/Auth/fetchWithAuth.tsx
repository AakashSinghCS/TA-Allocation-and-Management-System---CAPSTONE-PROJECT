export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem("token");

  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      "Authorization": `Bearer ${token}`,
      "X-User-Id": extractUserId(token),      
      "X-User-Roles": extractRoles(token)     
    },
  });
};

const decodePayload = (token: string) => {
  const payload = token.split('.')[1];
  return JSON.parse(atob(payload));
};

const extractUserId = (token: string | null): string => {
  if (!token) return "";
  return decodePayload(token).userId?.toString() || "";
};

const extractRoles = (token: string | null): string => {
  if (!token) return "";
  return decodePayload(token).roles?.join(",") || "";
};
