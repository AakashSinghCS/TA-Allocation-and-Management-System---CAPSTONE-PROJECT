
export async function updateApplication(
  userId: string | number,
  payload: any,
  token: string,
  userRoles: string[]
) {
  // The backend endpoint requires: update/{studentId}/{year}/{semester}
  const url = `http://localhost:8080/applications/update/${userId}/${payload.year}/${payload.semester}`;
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    'X-User-Id': userId.toString(),
    'X-User-Roles': userRoles.join(',')
  };
  const resp = await fetch(url, {
    method: 'PUT',
    headers,
    body: JSON.stringify(payload),
  });
  if (!resp.ok) {
    const errTxt = await resp.text();
    throw new Error(`Update failed: ${resp.status} ${resp.statusText}: ${errTxt}`);
  }
  return resp.json();
}
