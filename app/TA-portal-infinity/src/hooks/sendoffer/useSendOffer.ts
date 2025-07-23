import { useState } from 'react';
import { toast } from 'react-toastify';
import type { CreateOfferRequest } from '../../api/allocation/sendOffer';
import { sendOffer as apiSendOffer } from '../../api/allocation/sendOffer';
import type { ApplicationDto } from '../../interfaces/application/Application';
import type { Need } from '../../interfaces/need/Need';

/** Computing remaining hours for a section */
function getRemainingGradingHours(need: Need): number {
  const required = need.requiredGradingHours ?? 0;
  const allocated = need.numHoursCurrentlyAllocated ?? 0; //numGRADINGhours currently allocated
  return Math.max(required - allocated, 0);
}

/** Validating all preconditions; return an error string or null. */
function validate(app: ApplicationDto, need: Need, hasAvailabilityMatch: boolean, gradingHours:number, labPrepHours:number, sectionHours:number): string | null {
  const remaining = getRemainingGradingHours(need);
  const studentTotalHours = gradingHours + labPrepHours + sectionHours;
  //commented this out because it's possible the instructor set 0 as grading hours, but still wants TAs for labs.
  // if (remaining <= 0) {
  //   return 'No grading hours left on this section.';
  // }
  //I commented this out because why send an error when the student is getting assigned less hours than he wanted?
  // if (app.wantWorkingHours > remaining) {
  //   return `${app.student.firstName} requested ${app.wantWorkingHours}h, but only ${remaining}h available.`;
  // }
  if(app.wantWorkingHours < studentTotalHours){
    return `${app.student.firstName} requested ${app.wantWorkingHours}h, but you tried to assign him or her ${studentTotalHours}h, 
      which exceeds what the student asked for.`;
  }
  if(gradingHours > remaining){
    return `The section has ${remaining} grading hours remaining, 
      but you tried to assign more grading hours than what the instructor requested`;
  }
  if (hasAvailabilityMatch) {
    return "Unavailability match: student's unavailability intercepts with course slots.";
  }
  return null;
}

export function useSendOffer() {
  const [loading, setLoading] = useState(false);

  async function send(
    app: ApplicationDto,
    sectionId: number,
    need: Need,
    numberOfSectionHours: number,
    numberOfLabPrepHours: number,
    numberOfGradingHours: number,
    hasAvailabilityMatch: boolean,
    onSuccess: () => void
  ) {
    const error = validate(app, need, hasAvailabilityMatch, numberOfGradingHours,numberOfLabPrepHours,numberOfSectionHours);
    if (error) {
      toast.error(error, { position: 'top-right', autoClose: 8000 });
      return;
    }

    const applicationId = app.applicationId ?? app.id;
    if (applicationId == null) {
      console.error("Neither app.applicationId nor app.id is set!", app);
      return;
    }

    const payload: CreateOfferRequest = {
      studentId: app.student.id,
      applicationId,
      status: 'SENT',
      // numberOfHours: app.wantWorkingHours,
      numberOfSectionHours: numberOfSectionHours,
      numberOfLabPrepHours: numberOfLabPrepHours,
      numberOfGradingHours: numberOfGradingHours,
      sectionId,
    };
    setLoading(true);

    const promise = apiSendOffer(payload);
    toast.promise(
      promise,
      {
        pending: `Sending offer to ${app.student.firstName}…`,
        success: `Offer sent!`,
        error: `Failed to send offer.`,
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