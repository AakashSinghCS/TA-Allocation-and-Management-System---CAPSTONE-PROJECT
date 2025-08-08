import type { ApplicationRequest, Day } from '../../../../interfaces/application/Application';

export interface FormData {
  selectedTerms: string[]; // Array of "year-semester" strings like ["2025-W1", "2025-W2"]
  firstPreference: string;
  secondPreference: string;
  thirdPreference: string;
  wantWorkingHours: string;
  wantRemote: string;
  confirmProfileUpdated: boolean;
  applicationType: '' | 'UNDERGRADUATE' | 'GRADUATE';
}

export interface TermFormData {
  firstPreference: string;
  secondPreference: string;
  thirdPreference: string;
  wantWorkingHours: string;
  wantRemote: string;
  confirmProfileUpdated: boolean;
  applicationType: '' | 'UNDERGRADUATE' | 'GRADUATE';
}

export interface Unavailability {
  id: string;
  day: Day;
  startTime: string;
  endTime: string;
}

export function validateForm(formData: FormData, unavailability: Unavailability[]) {
  const newErrors: { [k: string]: string } = {};
  if (!formData.selectedTerms.length)     newErrors.selectedTerms      = 'At least one term is required.';
  if (!formData.firstPreference)          newErrors.firstPreference    = '1st preference is required.';
  if (!unavailability.length)               newErrors.unavailability       = 'Pick at least one unavailability slot.';
  if (!formData.wantWorkingHours)         newErrors.wantWorkingHours   = 'Hours requested is required.';
  if (!formData.wantRemote)               newErrors.wantRemote         = 'Select a remote work preference.';
  if (!formData.confirmProfileUpdated)
                                          newErrors.confirmProfileUpdated = 'Please confirm profile update.';
  if (!formData.applicationType)          newErrors.applicationType    = 'Select application type.';
  return newErrors;
}

export function validateTermForm(termData: TermFormData, unavailability: Unavailability[]) {
  const newErrors: { [k: string]: string } = {};
  if (!termData.firstPreference)          newErrors.firstPreference    = '1st preference is required.';
  if (!unavailability.length)               newErrors.unavailability       = 'Pick at least one unavailability slot.';
  if (!termData.wantWorkingHours)         newErrors.wantWorkingHours   = 'Hours requested is required.';
  if (!termData.wantRemote)               newErrors.wantRemote         = 'Select a remote work preference.';
  if (!termData.confirmProfileUpdated)
                                          newErrors.confirmProfileUpdated = 'Please confirm profile update.';
  if (!termData.applicationType)          newErrors.applicationType    = 'Select application type.';
  return newErrors;
}

export function buildPayload(formData: FormData, unavailability: Unavailability[]): ApplicationRequest[] {
  return formData.selectedTerms.map(term => {
    const [year, semester] = term.split('-');
    return {
      year: parseInt(year),
      semester: semester,
      preferences: [
        formData.firstPreference,
        formData.secondPreference,
        formData.thirdPreference
      ].filter(p => p),
      wantRemote: formData.wantRemote === 'yes',
      wantWorkingHours: Number(formData.wantWorkingHours),
      applicationType: formData.applicationType as 'UNDERGRADUATE' | 'GRADUATE',
      unavailabilities: unavailability.map(uv => ({
        day: uv.day,
        startTime: uv.startTime,
        endTime: uv.endTime
      }))
    };
  });
}

export function buildTermPayload(termData: TermFormData, year: number, semester: string, unavailability: Unavailability[]): ApplicationRequest {
  return {
    year: year,
    semester: semester,
    preferences: [
      termData.firstPreference,
      termData.secondPreference,
      termData.thirdPreference
    ].filter(p => p),
    wantRemote: termData.wantRemote === 'yes',
    wantWorkingHours: Number(termData.wantWorkingHours),
    applicationType: termData.applicationType as 'UNDERGRADUATE' | 'GRADUATE',
    unavailabilities: unavailability.map(uv => ({
      day: uv.day,
      startTime: uv.startTime,
      endTime: uv.endTime
    }))
  };
}
