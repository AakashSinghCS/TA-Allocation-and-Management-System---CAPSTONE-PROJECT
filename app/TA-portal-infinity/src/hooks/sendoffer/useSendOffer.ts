import { useState } from 'react';
import { toast, type ToastContentProps, type ToastPromiseParams } from 'react-toastify';
import type { CreateOfferRequest } from '../../api/allocation/sendOffer';
import { sendOffer} from '../../api/allocation/sendOffer';
import type { ApplicationDto } from '../../interfaces/application/Application';
import type { Need } from '../../interfaces/need/Need';
import type { AllocationType } from '../../interfaces/allocation/Allocation';
import { getTaskLabel } from '../../utility/calendar/gettasklabels/getTaskLabel';

/** Computing remaining hours for a section */
function getRemainingGradingHours(need: Need): number {
  const required = need.requiredGradingHours ?? 0;
  const allocated = need.numHoursCurrentlyAllocated ?? 0; //numGRADINGhours currently allocated
  return Math.max(required - allocated, 0);
}

/** Validating all preconditions; return an error string or null. */
function validate(app: ApplicationDto, need: Need, hasUnavailabilityMatch: boolean, gradingHours:number, labPrepHours:number, sectionHours:number): string | null {
  const remaining = getRemainingGradingHours(need);
  const studentTotalHours = gradingHours + labPrepHours + sectionHours;
  //commented this out because it's possible the instructor set 0 as grading hours, but still wants TAs for labs.
  // if (remaining <= 0) {
  //   return 'No grading hours left on this section.';
  // }
  //I commented this out because it's outdated. hours is more about just the grading now.
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
  if (hasUnavailabilityMatch) {
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
    sectionHours: number,
    labPrepHours: number,
    gradingHours: number,
    hasAvailabilityMatch: boolean,
    onSuccess: () => void
  ) {
    const error = validate(app, need, hasAvailabilityMatch, sectionHours,labPrepHours,gradingHours);
    if (error) {
      toast.error(error, { position: 'top-right', autoClose: 8000 });
      return;
    }

    const applicationId = app.applicationId ?? app.id;
    if (applicationId == null) {
      console.error("Neither app.applicationId nor app.id is set!", app);
      return;
    }

    type HoursPayload = { gradingHours?: number; labPrepHours?: number; sectionHours?: number };
    const tasks: Array<{ task: AllocationType; hours: HoursPayload }> = [];
    if (gradingHours > 0)  tasks.push({ task: 'GRADING',   hours: { gradingHours } });
    if (labPrepHours > 0)  tasks.push({ task: 'LAB_PREP',  hours: { labPrepHours } });
    if (sectionHours > 0)  tasks.push({ task: 'LAB',       hours: { sectionHours } });

    if (tasks.length === 0) {
      toast.error("No hours to send.", { position: 'top-right' });
      return;
    }
    setLoading(true);
    try {
      for (const { task, hours } of tasks) {
        const payload: CreateOfferRequest = {
          studentId:    app.student.id,
          applicationId,
          status:       'SENT',
          task,
          sectionId,
          ...hours
        };

        const label = getTaskLabel(task);
        const promise = sendOffer(payload);
        toast.promise(
          promise,
          {
            pending: `Sending ${label} offer to ${app.student.firstName}…`,
            success: `${label.charAt(0).toUpperCase() + label.slice(1)} offer sent!`,
            error:     {
            render({ data }: ToastContentProps<Error>) {
              return data?.message ?? `Failed to send ${label} offer.`;
            }
      }
          },
          { position: 'top-right', autoClose: 5000 }
        );
        await promise;
        onSuccess();
      }
    } finally {
      setLoading(false);
    }
  }

  return { sendOffer: send, loading };
}