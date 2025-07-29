import { useEffect, useState } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import { ChevronDown, ChevronUp } from 'lucide-react';
import Pagination from '../../../../utility/pagination/pagination/Pagination';
import { fetchAllocationsByStudent } from '../../../../api/allocation/fetchAllocationByStudent';
import type { ApplicationDto } from '../../../../interfaces/application/Application';
import type { Allocation } from '../../../../interfaces/allocation/Allocation';
import { fetchAllApplicationYears } from '../../../../api/application/fetchAllApplicationYears';
import { fetchAllApplicationSemesters } from '../../../../api/application/fetchAllApplicationSemesters';
import { useApplicationSearchPage } from '../../../../api/application/useApplicationSearchPage';
import SelectedApplicationDetails from './selectedapplicationdetails/SelectedApplicationDetails';
import { StatusIndicator } from '../../../ui/statusindicator/StatusIndicator';

interface Props {
  selApp: ApplicationDto | null;
  loadApp: (app: ApplicationDto) => void;
  colSpanClass?: string;
}

interface ApplicationFilters {
  pref1 : string;
  pref2 : string;
  pref3 : string;
  year: string;
  semester: string;
  wantRemote : string;
  wantHours : string;
  studentName? : string;
  studentNum? : string;
}

export default function ApplicationFilterPanel({
  selApp,
  loadApp,
  colSpanClass = 'lg:col-span-5',
}: Props) {
  const { token } = useAuth();

  // 1️⃣ Local filter state:
  const [filters, setFilters] = useState<ApplicationFilters>({
    pref1: '',
    pref2: '',
    pref3: '',
    year: '',
    semester: '',
    wantRemote: '',
    wantHours: '',
    studentName: '',
    studentNum: '',
  });

  const [advancedOpen, setAdvancedOpen] = useState(false);

  const [page, setPage] = useState(0);
  const pageSize = 5;

  const [years, setYears] = useState<number[]>([]);
  const [semesters, setSemesters] = useState<string[]>([]);
  
  useEffect(() => {
    // Fetch all application years
    fetchAllApplicationYears()
      .then(arr => {
        const yearsArr = arr ?? [];
        setYears(yearsArr);

        // Do NOT preset year filter, leave blank
      })
      .catch(() => setYears([]));

    // Fetch all application semesters
    fetchAllApplicationSemesters()
      .then(arr => {
        const semestersArr = arr ?? [];
        setSemesters(semestersArr);
      })
      .catch(() => setSemesters([]));
  }, []);

  const apiFilters = {
    wantRemote:
      filters.wantRemote === ''
        ? undefined
        : filters.wantRemote === 'true',
    hours:
      filters.wantHours === ''
        ? undefined
        : Number(filters.wantHours),
    preference1: filters.pref1 || undefined,
    preference2: filters.pref2 || undefined,
    preference3: filters.pref3 || undefined,
    // Only include year and semester if they have values
    ...(filters.year !== '' && { year: Number(filters.year) }),
    ...(filters.semester !== '' && { semester: filters.semester }),
  };

  const {
    data: pageData,
    isFetching,
  } = useApplicationSearchPage(apiFilters, page, pageSize, token!);

  const apps = pageData?.content ?? [];
  const displayApps = filterByStudentNameAndNum(apps,filters);
  const totalPages = pageData?.totalPages ?? 0;

  const [history, setHistory] = useState<Allocation[]>([]);
  useEffect(() => {
    if (!selApp || !token) return setHistory([]);
    fetchAllocationsByStudent(selApp.student.id, token)
      .then(setHistory)
      .catch(() => setHistory([]));
  }, [selApp, token]);

  return (
    <div className={`${colSpanClass} bg-white p-4 rounded shadow space-y-1 text-sm`}>
      {/* Header + collapse toggle */}
      <div className="flex justify-between items-center">
        <h1 className="font-semibold text-xl">Application Filter</h1>
      </div>

      {/* ───── Basic filters (always visible) ───── */}
      <div className="grid grid-rows-4 gap-2">
        <select
         aria-label="Year"
          className="border rounded px-2 py-1"
          value={filters.year}
          onChange={e => setFilters(f => ({ ...f, year: e.target.value }))}
        >
          <option value="">Year</option>
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <select
         aria-label="Semester"
          className="border rounded px-2 py-1"
          value={filters.semester}
          onChange={e => setFilters(f => ({ ...f, semester: e.target.value }))}
        >
          <option value="">Semester</option>
          {semesters.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select
         aria-label="1st Pref"
          className="border rounded px-2 py-1"
          value={filters.pref1}
          onChange={e => setFilters(f => ({ ...f, pref1: e.target.value }))}
          title="Existing 1st Preferences in the Database by Year"
        >
          <option value="">Student's 1st Preference</option>
          {Array.from(new Set(apps.flatMap(a => a.preferences)))
            .sort()
            .map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <select
         aria-label="Hours"
          className="border rounded px-2 py-1"
          value={filters.wantHours}
          onChange={e => setFilters(f => ({ ...f, wantHours: e.target.value }))}
          title="Existing Requested Hours in the Database by Year"
        >
          <option value="">Student's Requested Hours</option>
          {Array.from(new Set(apps.map(a => a.wantWorkingHours.toString())))
            .sort((a, b) => +a - +b)
            .map(h => <option key={h} value={h}>{h}</option>)}
        </select>
      </div>

      {advancedOpen && (
        <>
        <div className="grid grid-cols-3 gap-2">
          <select
            className="border rounded px-2 py-1"
            value={filters.pref2}
            onChange={e => setFilters(f => ({ ...f, pref2: e.target.value }))}
          >
            <option value="">2nd Preference</option>
            {Array.from(new Set(apps.flatMap(a => a.preferences)))
              .sort()
              .map(p => <option key={p} value={p}>{p}</option>)
            }
          </select>

          <select
            className="border rounded px-2 py-1"
            value={filters.pref3}
            onChange={e => setFilters(f => ({ ...f, pref3: e.target.value }))}
          >
            <option value="">3rd Preference</option>
            {Array.from(new Set(apps.flatMap(a => a.preferences)))
              .sort()
              .map(p => <option key={p} value={p}>{p}</option>)
            }
          </select>

          <select
            className="border rounded px-2 py-1"
            value={filters.wantRemote}
            onChange={e => setFilters(f => ({ ...f, wantRemote: e.target.value }))}
          >
            <option value="">Remote?</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>         
        </div>
        <input
            type="text"
            placeholder="Student Number"
            className="border rounded px-2 py-1 w-full"
            value={filters.studentNum}
            onChange={e => setFilters(f => ({ ...f, studentNum: e.target.value }))}
          />
          <input
            type="text"
            placeholder="Student Name"
            className="border rounded px-2 py-1 w-full"
            value={filters.studentName}
            onChange={e => setFilters(f => ({ ...f, studentName: e.target.value }))}
          />
        </>
      )}

      <button onClick={() => setAdvancedOpen(open => !open)}
        className="w-full border border-gray-300 rounded flex justify-center items-center text-gray-600 hover:bg-gray-100 transition">
        {advancedOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>
      <h1 className="font-semibold text-xl mt-2">Please select an Application</h1>
      <div className="max-h-48 overflow-auto space-y-1 mt-2">
        {isFetching && <StatusIndicator loading={isFetching}/>}
        {!isFetching && apps.length === 0 && (
          <p className="text-gray-500">No applications found</p>
        )}
        {!isFetching && displayApps.map(app => (
          <button
            key={`${app.student.id}-${app.timeSubmitted}`}
            onClick={() => loadApp(app)}
            className={`block w-full text-left px-3 py-2 rounded ${selApp === app
              ? 'bg-gray-900 text-white'
              : 'bg-gray-200 hover:bg-gray-300'
              }`}
          >
            {app.student.firstName} {app.student.lastName} — {app.year} {app.semester} — {new Date(app.timeSubmitted).toLocaleString()}
          </button>
        ))}
      </div>

      <Pagination
        page={page}
        pageCount={totalPages}
        onPrev={() => setPage(p => Math.max(0, p - 1))}
        onNext={() => setPage(p => Math.min(totalPages - 1, p + 1))}
      />
      
      {selApp && (
        <SelectedApplicationDetails 
          selApp={selApp} 
          history={history} 
        />
      )}
    </div>
  );
}

function filterByStudentNameAndNum (apps:ApplicationDto[], filters:ApplicationFilters){
    // ── Client‑side name/number filtering ──
  let displayApps = apps.filter(app => {
    // 1) Name match?
    const fullName = `${app.student.firstName} ${app.student.lastName}`.toLowerCase();
    const nameMatch = filters.studentName
      ? fullName.includes(filters.studentName.toLowerCase())
      : true;

    const studentNumStr = String(app.student.studentNum ?? '');
    const filterNumStr  = String(filters.studentNum ?? '');
    const numMatch = filterNumStr
      ? studentNumStr.includes(filterNumStr)
      : true;

    return nameMatch && numMatch;
  });
  return displayApps;
}