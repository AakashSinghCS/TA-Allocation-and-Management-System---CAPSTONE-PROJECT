import type  Section from '../../../interfaces/section/Section';

export async function fetchSection(sectionId: number, token: string): Promise<Section> {
  const headers = { Authorization: `Bearer ${token}` };
  const res = await fetch(`http://localhost:8080/sections/get/${sectionId}`, { headers });
  if (!res.ok) {
    throw new Error(`Failed to fetch section: ${res.status} ${res.statusText}`);
  }
  const section: Section = await res.json();
  return section;
}
