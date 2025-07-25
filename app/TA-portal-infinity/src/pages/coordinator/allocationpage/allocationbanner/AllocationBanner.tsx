import type { ApplicationDto } from "../../../../interfaces/application/Application";
import type Section from "../../../../interfaces/section/Section";
import { deallocateAllocation } from '../../../../api/allocation/deallocateAllocation';
import { useState } from "react";
import { toast } from 'react-toastify';
import type { Allocation } from "../../../../interfaces/allocation/Allocation";

interface AllocationBanner {
    selApp : ApplicationDto;
    setSelApp :  React.Dispatch<React.SetStateAction<ApplicationDto | null>>;
    selCourse: Section;
    refreshHistory: (studentId: number, token : string) => void;
    token : string | null;
    history: Allocation[];
    showBanner: boolean;
    setShowBanner: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function AllocationBanner({ selApp, setSelApp, selCourse, refreshHistory, token, history, showBanner, setShowBanner}:AllocationBanner) {


    return (
        <div
            className="
            mt-4
            bg-[#e8f1ff]
            border-l-4 border-[#040941]
            rounded-md
            p-4
            flex flex-col md:flex-row md:items-center md:justify-between
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
                        ? `You’ve just sent an offer to `
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
                    .{' '}
                    {showBanner
                        ? `They’ve been offered ${selApp.wantWorkingHours} hours.`
                        : `They were offered ${selApp.wantWorkingHours} hours earlier.`}
                </p>
            </div>

            {/* actions */}
            <div className="mt-2 md:mt-0 flex items-center space-x-3">
                <button
                    onClick={async () => {
                        if (!selApp || !selCourse) return;
                        // Find the allocation for this app+section
                        const allocation = history.find(h =>
                            h.application?.applicationId === selApp.applicationId &&
                            h.section?.id === selCourse.id
                        );
                        if (!allocation || allocation.id == null) return;
                        try {
                            const ok = await deallocateAllocation(allocation.id, token || undefined);
                            if (!ok) throw new Error('Failed to deallocate');
                            setShowBanner(false);
                            setSelApp(null);
                            toast.success('Offer revoked successfully.');
                            if (selApp.student.id && token) {
                                await refreshHistory(selApp.student.id, token);
                            }
                        } catch (e) {
                            toast.error('Failed to revoke Offer.');
                        }
                    }}
                    className="text-sm bg-[#040941] text-white px-3 py-1 rounded hover:bg-[#03072a] transition"
                >
                    Revoke
                </button>
            </div>
        </div>
    );
}