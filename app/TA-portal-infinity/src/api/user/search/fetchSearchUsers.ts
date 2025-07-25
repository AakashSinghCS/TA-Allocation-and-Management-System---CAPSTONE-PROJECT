
import type User from '../../../interfaces/user/User';
import type PageableResponse from '../../../interfaces/admin/audit/PageableResponse';
import type { SearchCriteria } from '../../../components/ui/user/searchuserbar/SearchUserBar';

export async function fetchSearchUsers(
  criteria: SearchCriteria,
  page = 0,
  size = 5
): Promise<PageableResponse<User>> {
  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
    ...(criteria.role ? { role: criteria.role } : {}),
    ...(criteria.firstname ? { firstname: criteria.firstname } : {}),
    ...(criteria.lastname ? { lastname: criteria.lastname } : {}),
    ...(criteria.universityNumber ? { universityNumber: criteria.universityNumber } : {}),
    ...(criteria.userId ? { userId: criteria.userId } : {}),
  }).toString();

  const token = localStorage.getItem('token') ?? '';
  const res = await fetch(`http://localhost:8080/users/search/page?${params}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
  if (!res.ok) throw new Error(res.statusText);
  return res.json() as Promise<PageableResponse<User>>;
}
