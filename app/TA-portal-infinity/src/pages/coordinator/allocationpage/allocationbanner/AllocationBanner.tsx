import type { ApplicationDto } from "../../../../interfaces/application/Application";
import type Section from "../../../../interfaces/section/Section";
import { deallocateAllocation } from '../../../../api/allocation/deallocateAllocation';
import { toast } from 'react-toastify';
import type { Allocation } from "../../../../interfaces/allocation/Allocation";
import { getTaskLabel } from "../../../../utility/calendar/gettasklabels/getTaskLabel";

interface AllocationBanner {
    selApp: ApplicationDto;
    setSelApp: React.Dispatch<React.SetStateAction<ApplicationDto | null>>;
    selCourse: Section;
    refreshAlloc: (studentId: number, token: string) => void;
    token: string | null;
    prevAlloc: Allocation | null;
    showBanner: boolean;
    setShowBanner: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function AllocationBanner({ selApp, setSelApp, selCourse, refreshAlloc, token, prevAlloc, showBanner, setShowBanner }: AllocationBanner) {
    if (!selApp || !selCourse) return null;
    const allocation = prevAlloc?.application?.applicationId === selApp.applicationId ? prevAlloc : null;
    console.log(allocation);
    const slicesForSelCourse = allocation?.allocatedSections?.filter(a => a.sectionId === selCourse.id) ?? [];
    console.log(slicesForSelCourse);
    const handleRevoke = async (allocatedSectionId: number) => {
        try {
            const ok = await deallocateAllocation(allocatedSectionId, token || undefined);
            if (!ok) throw new Error();

            setSelApp(null);
            setShowBanner(false);
            if (selApp.student.id && token) await refreshAlloc(selApp.student.id, token);
            toast.success('Revoke successful');
        } catch {
            toast.error('Failed to revoke');
        }
    };

    return (
        <div
            className="
            gap-y-2
            mt-4
            bg-[#e8f1ff]
            border-l-4 border-[#040941]
            rounded-md
            p-4
            flex flex-col md:items-start md:justify-between
            shadow
          "
            role="status"
            aria-live="polite"
        >
            <div>
                {/* header changes */}
                <p className="font-semibold text-[#040941]">
                    {showBanner
                        ? 'Offer Sent'
                        : 'Existing Offer'}
                </p>

                {/* message changes */}
                <p className="text-sm text-gray-700">
                    {showBanner
                        ? `You’ve sent an offer to `
                        : `An offer was already sent to `}
                    <strong>
                        {selApp.student.firstName} {selApp.student.lastName}
                    </strong>{' '}
                    for{' '}
                    <strong>
                        {selCourse.course?.deptCode}{' '}
                        {selCourse.course?.courseNum}{' '}
                        Section {selCourse?.section}
                    </strong>
                    .
                </p>
                {slicesForSelCourse.map(slice => {
                     const label = getTaskLabel(slice.task);
                     return (
                       <p key={slice.id} className="text-sm text-gray-700">
                         {showBanner
                           ? `They’ve been offered ${slice.hours} ${label} hours.`
                           : `They were offered ${slice.hours} ${label} hours earlier.`}
                       </p>
                     );
                   })}
            </div>

            {slicesForSelCourse.length > 0 &&
                <div className="mt-2 md:mt-0 flex w-full justify-center space-x-3">
                    {slicesForSelCourse.map(as => (
                        <button
                            key={as.id}
                            onClick={() => handleRevoke(as.id)}
                            className="text-sm bg-[#040941] text-white px-3 py-1 rounded hover:bg-[#03072a] transition"
                        >
                            Revoke {getTaskLabel(as.task)} ({as.hours} h)
                        </button>
                    ))}
                </div>
            }
        </div>
    );
}