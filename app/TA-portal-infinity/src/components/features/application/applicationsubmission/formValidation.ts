import type { ApplicationRequest, Day } from '../../../../interfaces/application/Application';

export interface FormData {
  firstPreference: string;
  secondPreference: string;
  thirdPreference: string;
  wantWorkingHours: string;
  wantRemote: string;
  transcriptFile: File | null;
  confirmProfileUpdated: boolean;
  applicationType: '' | 'UNDERGRADUATE' | 'GRADUATE';
}

export interface Unavailability {
  id: string;
  day: Day;
  startTime: string;
  endTime: string;
}

export function validateForm(formData: FormData, availability: Unavailability[]) {
  const newErrors: { [k: string]: string } = {};
  if (!formData.firstPreference)   newErrors.firstPreference   = '1st preference is required.';
  if (!availability.length)        newErrors.availability      = 'Pick at least one availability slot.';
  if (!formData.wantWorkingHours)  newErrors.wantWorkingHours  = 'Hours requested is required.';
  if (!formData.wantRemote)        newErrors.wantRemote        = 'Select a remote work preference.';
  if (!formData.transcriptFile)    newErrors.transcriptFile    = 'Upload your transcript.';
  if (!formData.confirmProfileUpdated)
                                   newErrors.confirmProfileUpdated = 'Please confirm profile update.';
  if (!formData.applicationType)   newErrors.applicationType   = 'Select application type.';
  return newErrors;
}

export function buildPayload(formData: FormData, unavailability: Unavailability[]): ApplicationRequest {
  return {
    preferences: [
      formData.firstPreference,
      formData.secondPreference,
      formData.thirdPreference
    ].filter(p => p),
    wantRemote: formData.wantRemote === 'yes',
    wantWorkingHours: Number(formData.wantWorkingHours),
    unavailabilities: unavailability.map(av => ({
      day: av.day,
      startTime: av.startTime,
      endTime: av.endTime
    })),
    applicationType: formData.applicationType as 'UNDERGRADUATE' | 'GRADUATE',
  };
}
