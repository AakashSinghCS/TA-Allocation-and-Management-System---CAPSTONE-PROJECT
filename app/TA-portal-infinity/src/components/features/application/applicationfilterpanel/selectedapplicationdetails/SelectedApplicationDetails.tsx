import type { Allocation } from "../../../../../interfaces/allocation/Allocation";
import type { ApplicationDto } from "../../../../../interfaces/application/Application";


interface SelectedApplicationDetailsProps {
  selApp: ApplicationDto;
  history: Allocation | null;
}

export default function SelectedApplicationDetails({ selApp, history }: SelectedApplicationDetailsProps) {
  return (
    <div className="mt-6 border-t pt-4 space-y-6 text-sm">
      {/* Applicant Details */}
      <section>
        <h2 className="font-bold text-lg">Applicant Details</h2>
        <div className="space-y-1 pl-2">
          <p><strong>Name:</strong> {selApp.student.firstName} {selApp.student.lastName}</p>
          <p><strong>User ID:</strong> {selApp.student.id}</p>
          <p><strong>Student Number:</strong> {selApp.student.studentNum || 'N/A'}</p>
        </div>
      </section>

      {/* Application Details */}
      <section>
        <h2 className="font-bold text-lg">Application Details</h2>
        <div className="space-y-1 pl-2">
          <p><strong>Preferences:</strong> {selApp.preferences.join(', ')}</p>
          <p><strong>Remote?</strong> {selApp.wantRemote ? 'Yes' : 'No'}</p>
          <p><strong>Desired Hours:</strong> {selApp.wantWorkingHours}</p>
          <p><strong>Submitted:</strong> {new Date(selApp.timeSubmitted).toLocaleString()}</p>
        </div>
      </section>

      {/* Availabilities */}
      <section>
        <h2 className="font-bold text-lg">Availabilities</h2>
        <ul className="list-disc pl-4 space-y-1">
          {selApp.unavailabilities.map((a, i) => (
            <li key={i}>{a.day}: {a.startTime} – {a.endTime}</li>
          ))}
        </ul>
      </section>

      {/* Allocation History */}
      <section>
        <h2 className="font-bold text-lg">Allocation History</h2>
        {history  ? (
          <ul className="list-disc pl-4 space-y-1 text-sm">
            {/* {history.map(h => (
              <li key={h.id}>
                <strong>
                  {h.application?.timeSubmitted
                    ? new Date(h.application.timeSubmitted).toLocaleString()
                    : 'N/A'}
                </strong>{' '}
                — {h.section?.course?.deptCode || 'N/A'}{' '}
                {h.section?.course?.courseNum || ''} Section{' '}
                {h.section?.section || ''} — {h.numberOfHours ?? 'N/A'}h{' '}
                {h.status === 'CONFIRMED'
                  ? '(Confirmed)'
                  : h.status
                  ? `(${h.status.charAt(0) + h.status.slice(1).toLowerCase()})`
                  : '(Pending)'}
              </li>
            ))} */}
          </ul>
        ) : (
          <p className="text-gray-500 text-sm">No previous allocations</p>
        )}
      </section>
    </div>
  );
}