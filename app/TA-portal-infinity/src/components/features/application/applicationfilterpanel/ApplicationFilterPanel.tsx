import React, { useMemo } from 'react';
import type { ApplicationDto } from '../../../../interfaces/application/Application';
import type { Allocation } from '../../../../interfaces/allocation/Allocation';
import { useState, useEffect } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import { fetchAllocationsByStudent } from '../../../../api/allocation/fetchAllocationByStudent';

interface ApplicationFilterPanelProps {
  appQ: {
    pref1: string;
    pref2: string;
    wantRemote: string;
    wantHours: string;
    studentName: string;
    studentNum: string;
  };
  setAppQ: React.Dispatch<React.SetStateAction<ApplicationFilterPanelProps['appQ']>>;
  allApps: ApplicationDto[];
  selApp: ApplicationDto | null;
  loadApp: (app: ApplicationDto) => void;
  colSpanClass?: string;
}

const ApplicationFilterPanel: React.FC<ApplicationFilterPanelProps> = ({
  appQ,
  setAppQ,
  allApps,
  selApp,
  loadApp,
  colSpanClass = 'lg:col-span-5',
}) => {
  const { token } = useAuth();
  const [history, setHistory] = useState<Allocation[]>([]);
  const [filteredApps, setFilteredApps] = useState<ApplicationDto[]>([]);
  const [filtering, setFiltering] = useState(false);
  // Internal filtering logic
  const filterApplications = () => {
    const filtered = allApps.filter(a => {
      if (appQ.pref1 && !a.preferences.includes(appQ.pref1)) return false;
      if (appQ.pref2 && !a.preferences.includes(appQ.pref2)) return false;
      if (appQ.wantRemote && String(a.wantRemote) !== appQ.wantRemote) return false;
      if (appQ.wantHours && String(a.wantWorkingHours) !== appQ.wantHours) return false;
      if (appQ.studentName) {
        const fullName = `${a.student.firstName} ${a.student.lastName}`.toLowerCase();
        if (!fullName.includes(appQ.studentName.toLowerCase())) return false;
      }
      if (appQ.studentNum && a.student.studentNum !== appQ.studentNum) return false;
      return true;
    });
    setFilteredApps(filtered);
    setFiltering(true);
  };
   
  // Whenever the selected application changes, fetch its allocation history
      useEffect(() => {
        if (!selApp || !token) {
          setHistory([]);
          return;
        }
        fetchAllocationsByStudent(selApp.student.id, token)
          .then(setHistory)
          .catch(err => {
            console.error('Failed to load allocation history', err);
            setHistory([]);
          });
      }, [selApp, token]);

  return (
    <div className={`${colSpanClass} bg-white p-6 rounded shadow space-y-4 text-sm`}>
      <h1 className="font-semibold text-xl">Application Filter</h1>

      {/* Filter controls */}
      <div className="grid grid-cols-2 gap-2">
        <select
          className="border rounded px-2 py-2"
          value={appQ.pref1}
          onChange={e => setAppQ(q => ({ ...q, pref1: e.target.value }))}
        >
          <option value="">1st Pref</option>
          {Array.from(new Set(allApps.flatMap(a => a.preferences)))
            .sort()
            .map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
        </select>
        <select
          className="border rounded px-2 py-2"
          value={appQ.pref2}
          onChange={e => setAppQ(q => ({ ...q, pref2: e.target.value }))}
        >
          <option value="">2nd Pref</option>
          {Array.from(new Set(allApps.flatMap(a => a.preferences)))
            .sort()
            .map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
        </select>
        <select
          className="border rounded px-2 py-2"
          value={appQ.wantRemote}
          onChange={e => setAppQ(q => ({ ...q, wantRemote: e.target.value }))}
        >
          <option value="">Remote?</option>
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>
        <select
          className="border rounded px-2 py-2"
          value={appQ.wantHours}
          onChange={e => setAppQ(q => ({ ...q, wantHours: e.target.value }))}
        >
          <option value="">Hours</option>
          {Array.from(new Set(allApps.map(a => a.wantWorkingHours.toString())))
            .sort((a, b) => +a - +b)
            .map(h => <option key={h} value={h}>{h}</option>)}
        </select>
      </div>
      <input
        type="text"
        placeholder="Student Name"
        className="border rounded px-2 py-2 w-full"
        value={appQ.studentName}
        onChange={e => setAppQ(q => ({ ...q, studentName: e.target.value }))}
      />
      <input
        type="text"
        placeholder="Student Number"
        className="border rounded px-2 py-2 w-full"
        value={appQ.studentNum}
        onChange={e => setAppQ(q => ({ ...q, studentNum: e.target.value }))}
      />
      {/* Filter Button */}
      <div className="flex justify-end">
        <button
          onClick={filterApplications}  
          className="px-6 py-2 bg-[#040941] text-white rounded w-full"
        >
          Filter
        </button>
      </div>

      {/* Application list */}
      <div className="max-h-48 overflow-auto space-y-1 mt-2">
        <h2 className="font-semibold text-xl">Please select an Application*</h2>
        {filteredApps.map(app => (
          <button
            key={`${app.student.id}-${app.timeSubmitted}`}
            onClick={() => loadApp(app)}
            className={`block w-full text-left px-3 py-2 rounded ${
              selApp === app ? 'bg-gray-900 text-white' : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            {app.student.firstName} {app.student.lastName} —{' '}
            {new Date(app.timeSubmitted).toLocaleString()}
          </button>
        ))}
        {filteredApps.length === 0 && <p className="text-gray-500">No applications</p>}
      </div>

      {/* Details sections inside panel */}
      {selApp && (
        <div className="mt-6 border-t pt-4 space-y-6">
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
              {selApp.availabilities.map((a, i) => (
                <li key={i}>{a.day}: {a.startTime} – {a.endTime}</li>
              ))}
            </ul>
          </section>

          {/* Allocation History */}
            <section>
          <h2 className="font-bold text-lg">Allocation History</h2>
          {history.length > 0 ? (
            <ul className="list-disc pl-4 space-y-1 text-sm">
              {history.map(h => (
                <li key={h.id}>
                  <strong>
                  {h.application?.timeSubmitted
                    ? new Date(h.application.timeSubmitted).toLocaleString()
                    : 'N/A'}
                  </strong>{' '}
                  — {h.section?.course?.deptCode || 'N/A'}{' '}
                  {h.section?.course?.courseNum || ''} Section{' '}
                  {h.section?.section || ''} — {h.numberOfHours ?? 'N/A'}h{' '}
                  {h.status === 'CONFIRMED' ? '(Confirmed)' : h.status ? `(${h.status.charAt(0) + h.status.slice(1).toLowerCase()})` : '(Pending)'}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-sm">No previous allocations</p>
          )}
        </section>

        </div>
      )}
    </div>
  );
};

export default ApplicationFilterPanel;
