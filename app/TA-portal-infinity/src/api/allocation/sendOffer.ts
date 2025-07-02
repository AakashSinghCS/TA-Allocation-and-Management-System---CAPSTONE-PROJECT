import type { OfferDto } from '../../interfaces/application/Application';
import { fetchWithAuth } from '../Auth/fetchWithAuth';

export interface CreateOfferRequest {
  studentId:     number;
  isConfirmed:   boolean;
  numberOfHours: number;
  sectionId:     number;
}

export async function sendOffer(
  payload: CreateOfferRequest
){
  const res = await fetchWithAuth(
    'http://localhost:8080/allocations/allocate',
    {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    }
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  return (await res.json()) as OfferDto;
}