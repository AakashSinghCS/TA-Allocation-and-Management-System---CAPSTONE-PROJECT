export function getApplicationUrls(userId: string | number) {
  return {
    addUrl:    'http://localhost:8080/applications/add',
    updateUrl: `http://localhost:8080/applications/update/${userId}`,
  };
}

export function getRolesHeader(userRoles: string[]) {
  return userRoles
    .map(r => r.startsWith('ROLE_') ? r : `ROLE_${r}`)
    .join(',');
}

export function getCommonHeaders(token: string, userId: string | number, userRoles: string[]) {
  return {
    'Content-Type':  'application/json',
    'Authorization': `Bearer ${token}`,
    'X-User-Id':     userId.toString(),
    'X-User-Roles':  getRolesHeader(userRoles)
  };
}
