import { useState } from 'react';
import { toast } from 'react-toastify';
import { sendOffer as apiSendOffer } from '../../api/allocation/sendOffer';
import type { CreateOfferRequest } from '../../api/allocation/sendOffer';
import type { ApplicationDto } from '../../interfaces/application/Application';
import type { Need } from '../../interfaces/need/Need';

/** Compute remaining hours for a section */
function getRemainingHours(need: Need): number {
  const required = need.requiredGradingHours ?? 0;
  const allocated = need.numOfHoursCurrentlyAllocated ?? 0;
  return Math.max(required - allocated, 0);
}

/** Validate all preconditions; return an error string or null. */
function validate(app: ApplicationDto, need: Need, hasConflict: boolean): string | null {
  const remaining = getRemainingHours(need);
  if (remaining <= 0) {
    return 'No grading hours left on this section.';
  }
  if (app.wantWorkingHours > remaining) {
    return `${app.student.firstName} requested ${app.wantWorkingHours}h, but only ${remaining}h available.`;
  }
  if (hasConflict) {
    return 'Schedule conflict: availability overlaps course slots.';
  }
  return null;
}

/** Hook that sends offers with built-in validation & toast feedback */
export function useSendOffer() {
  const [loading, setLoading] = useState(false);

  async function send(
    app: ApplicationDto,
    sectionId: number,
    need: Need,
    hasConflict: boolean,
    onSuccess: () => void
  ) {
    const error = validate(app, need, hasConflict);
    if (error) {
      toast.error(error, { position: 'top-right', autoClose: 8000 });
      return;
    }
  console.log('Selected application object:', app);
    const payload: CreateOfferRequest = {
      studentId:     app.student.id,
      applicationId: app.id,
      isConfirmed:   false,
      numberOfHours: app.wantWorkingHours,
      sectionId,
    };
    console.log(' sendOffer payload:', payload);
    setLoading(true);
    const promise = apiSendOffer(payload);

    toast.promise(
      promise,
      {
        pending: `Sending offer to ${app.student.firstName}…`,
        success: `Offer sent!`,
        error:   `Failed to send offer.`,
      },
      { position: 'top-right', autoClose: 5000 }
    );

    try {
      await promise;
      onSuccess();
    } finally {
      setLoading(false);
    }
  }

  return { sendOffer: send, loading };
}
