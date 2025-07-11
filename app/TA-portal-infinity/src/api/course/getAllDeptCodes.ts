export async function getAllDeptCodes(token?: string, userId?: number, userRoles?: string[]) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (userId !== undefined) headers['X-User-Id'] = userId.toString();
  if (userRoles && userRoles.length > 0) headers['X-User-Roles'] = userRoles.join(',');

  const resp = await fetch('http://localhost:8080/courses/allDeptCodes', {
    credentials: 'include',
    headers,
  });
  if (!resp.ok) {
    const errTxt = await resp.text();
    throw new Error(`Failed to fetch department codes: ${resp.status} ${errTxt}`);
  }
  return resp.json();
}
