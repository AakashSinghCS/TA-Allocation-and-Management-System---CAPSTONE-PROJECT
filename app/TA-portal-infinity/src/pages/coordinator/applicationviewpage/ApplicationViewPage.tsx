import React, { useEffect, useMemo, useState } from 'react';
import { fetchAllocationsByStudent } from '../../../api/allocation/fetchAllocationByStudent';
import { fetchAllApplicationSemesters } from '../../../api/application/fetchAllApplicationSemesters';
import { fetchAllApplicationYears } from '../../../api/application/fetchAllApplicationYears';
import { fetchApplications } from '../../../api/application/FetchApplications';
import { fetchSectionIncludeInstructorId } from '../../../api/section/fetchSectionIncludeInstructorId';
import ApplicationCard from '../../../components/features/application/viewtaapplication/ApplicationCard';
import ApplicationStats from '../../../components/features/application/viewtaapplication/ApplicationStats';
import { useAuth } from '../../../context/AuthContext';
import type { AllocatedSection } from '../../../interfaces/allocation/Allocation';
import type { ApplicationDto } from '../../../interfaces/application/Application';
import type Section from '../../../interfaces/section/Section';
  export type EnrichedAllocatedSection = AllocatedSection & {
  status?: string;
  applicationId?: number;
  section?: Section;
};

const ApplicationPage: React.FC = () => {
  const { token } = useAuth();
  const [allApps, setAllApps] = useState<ApplicationDto[]>([]);
  // const [allocationHistory, setAllocationHistory] = useState<Allocation[]>([]);

  const [allocations, setAllocations] = useState<EnrichedAllocatedSection[]>([]);
  const [selectedAppId, setSelectedAppId] = useState<number | null>(null);
  // const [appQ, setAppQ] = useState({
  //   pref1: '',
  //   pref2: '',
  //   wantRemote: '',
  //   wantHours: '',
  //   studentName: '',
  //   studentNum: '',
  // });

  const [offerSentFilter, setOfferSentFilter] = useState('');
  const [allocatedHoursFilter, setAllocatedHoursFilter] = useState('');
  // const [filteredSections, setFilteredSections] = useState<FilterSectionsProps[]>([]);
  // const [loadingSections, setLoadingSections] = useState(false);
  // Application filters
  const [yearSubmitted, setYearSubmitted] = useState('');
  const [semesterSubmitted, setSemesterSubmitted] = useState('');
  const [studentName, setStudentName] = useState('');
  const [prefContains, setPrefContains] = useState('');
  const [remotePref, setRemotePref] = useState('');
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [availableSemesters, setAvailableSemesters] = useState<string[]>([]);
  // Fetch available years and semesters for dropdowns (same as ApplicationFilterPanel)
  useEffect(() => {
    fetchAllApplicationYears()
      .then(arr => setAvailableYears(arr ?? []))
      .catch(() => setAvailableYears([]));
    fetchAllApplicationSemesters()
      .then(arr => setAvailableSemesters(arr ?? []))
      .catch(() => setAvailableSemesters([]));
  }, []);
  // Allocation filters (advanced)
  const [allocationStatus, setAllocationStatus] = useState('');
  const [allocationDept, setAllocationDept] = useState('');
  const [allocationCourseNum, setAllocationCourseNum] = useState('');
  const [allocationSectionYear, setAllocationSectionYear] = useState('');
  const [allocationSemester, setAllocationSemester] = useState('');
  const [allocationType, setAllocationType] = useState('');

  // Fetch all applications
  useEffect(() => {
    fetchApplications(1, token || '')
      .then(setAllApps)
      .catch((err) => console.error('Failed to fetch applications:', err));
  }, [token]);

  // Fetch allocation data based on filters
  // Filtering allocations only when filter button is clicked
  const [filterTrigger, setFilterTrigger] = useState(0);
  const handleFilterClick = () => setFilterTrigger(t => t + 1);
useEffect(() => {
  if (allApps.length === 0) return;

  async function loadAllocations() {
    try {
      // 1) fetch every student’s full Allocation
      const uniqueStudentIds = Array.from(new Set(allApps.map(app => app.student.id)));

      const rawAllocs = await Promise.all(
        uniqueStudentIds.map(studentId =>
          fetchAllocationsByStudent(studentId!, token || '', true)
        )
      );

      const stubs: EnrichedAllocatedSection[] = rawAllocs.flatMap(alloc =>
        (alloc.allocatedSections ?? []).map(stub => ({
          ...stub,
          status: alloc.status,
          applicationId: alloc.application?.applicationId // inject here
        }))
      );


      // 3) fetch each unique Section exactly once
      const sectionIds = Array.from(new Set(stubs.map(s => s.sectionId)));
      const sections = await Promise.all(
        sectionIds.map(id => fetchSectionIncludeInstructorId(id))
      );
      const sectionById = Object.fromEntries(
        sections
          .filter((s): s is Section => !!s)
          .map(s => [s.id, s] as [number, Section])
      );

      // 4) attach the Section object back onto each stub
      const enriched = stubs.map(s => ({
        ...s,
        section: sectionById[s.sectionId]
      }));

      setAllocations(enriched);
    } catch {
      setAllocations([]);
    }
  }

  loadAllocations();
}, [allApps, token]);

  const selectedApp = allApps.find(a => a.id === selectedAppId) || null;

  // Handle section filter changes
  // const handleSectionFilter = async (filters: any) => {
  //   setLoadingSections(true);
  //   try {
  //     const raw = await fetchFilteredSections(filters);
  //     setFilteredSections(raw ?? []);
  //   } catch (err) {
  //     console.error(err);
  //   } finally {
  //     setLoadingSections(false);
  //   }
  // };

  // Filter applications based on various filters
   const filteredApps = useMemo(() => {
    return allApps.filter(app => {
      const myStubs = allocations.filter(s => s.applicationId === app.applicationId);
      let match = true;

      // Example: Year submitted
      if (yearSubmitted && String(app.year) !== yearSubmitted) match = false;
      if (semesterSubmitted && app.semester !== semesterSubmitted) match = false;
      if (studentName && !(`${app.student.firstName} ${app.student.lastName}`.toLowerCase().includes(studentName.toLowerCase()))) match = false;
      if (prefContains && !app.preferences.some(p => p.toLowerCase().includes(prefContains.toLowerCase()))) match = false;
      if (remotePref && ((remotePref === 'true' && !app.wantRemote) || (remotePref === 'false' && app.wantRemote))) match = false;
      // ... other app-level filters

      // Offer sent filter
      if (offerSentFilter === 'true' && myStubs.length === 0) match = false;
      if (offerSentFilter === 'false' && myStubs.length > 0) match = false;

      // Allocation status filter
      if (allocationStatus && !myStubs.some(s => s.status === allocationStatus)) match = false;

      // Allocated hours filter
      if (allocatedHoursFilter) {
        const total = myStubs.reduce((sum, s) => sum + s.hours, 0);
        if (total !== Number(allocatedHoursFilter)) match = false;
      }

      // Advanced: dept, course, year, semester, type
      if (allocationDept && !myStubs.some(s => s.section?.course?.deptCode?.toLowerCase() === allocationDept.toLowerCase())) match = false;
      if (allocationCourseNum && !myStubs.some(s => String(s.section?.course?.courseNum) === allocationCourseNum)) match = false;
      if (allocationSectionYear && !myStubs.some(s => String(s.section?.year) === allocationSectionYear)) match = false;
      if (allocationSemester && !myStubs.some(s => s.section?.semester?.toLowerCase() === allocationSemester.toLowerCase())) match = false;
      if (allocationType && !myStubs.some(s => s.section?.type?.toLowerCase() === allocationType.toLowerCase())) match = false;

      return match;
    });
  }, [allApps, allocations, yearSubmitted, studentName, prefContains, remotePref, offerSentFilter, allocationStatus, allocatedHoursFilter, allocationDept, allocationCourseNum, allocationSectionYear, allocationSemester, allocationType]);
  // const [selectedApp, setSelectedApp] = useState<ApplicationDto | null>(null);
 const totalApplications = allApps.length;
  const appsWithOffer = new Set(allocations.map(s => s.applicationId)).size;
  const appsWithConfirmed = new Set(
    allocations.filter(s => s.status === 'CONFIRMED').map(s => s.applicationId)
  ).size;
  const appsWithOfferWaiting = allApps.filter(app => {
    const stubs = allocations.filter(s => s.applicationId === app.applicationId);
    return stubs.length > 0 && !stubs.some(s => s.status === 'CONFIRMED');
  }).length;


  const [expandedAppId, setExpandedAppId] = useState<number | null>(null);
  const [expandAll, setExpandAll] = useState(false);
  const [allocationsLoading, setAllocationsLoading] = useState(false);


  // Stats section show/hide state
  const [showStats, setShowStats] = useState(true);

  // helper to check if any filter is set
  const anyFilterSet = [yearSubmitted, studentName, prefContains, remotePref, offerSentFilter, allocatedHoursFilter, allocationStatus, allocationDept, allocationCourseNum, allocationSectionYear, allocationSemester, allocationType].some(f => f && f !== '');

  // Reset expanded card when filters change, but only after allocations are loaded
  useEffect(() => {
    setAllocationsLoading(true);
  }, [filterTrigger]);

  useEffect(() => {
    if (!allocationsLoading) return;
    if (!anyFilterSet) {
      setExpandAll(true);
      setExpandedAppId(null);
    } else {
      setExpandAll(false);
      setExpandedAppId(null);
    }
    setAllocationsLoading(false);
  }, [allocations]);

  // Reset expanded card when filters change
  useEffect(() => {
    setExpandedAppId(null);
  }, [filterTrigger]);

  return (
    <div className="min-h-screen p-2 sm:p-4 md:p-8 ">
      <div className="max-w-7xl mx-auto w-full">
        <h1 className="text-3xl sm:text-4xl font-bold text-[#040941] mb-6 sm:mb-8 tracking-tight text-center sm:text-left">Applications Overview</h1>
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-8 w-full">
          {/* Application Filters */}
          <div className="w-full lg:w-[18%] min-w-0">
            <div className="relative bg-white rounded-2xl shadow-lg p-3 sm:p-4 border border-blue-100 flex flex-col gap-4">
              <h3 className="font-semibold text-[#040941] text-lg mb-2">Application Filters</h3>
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Student Name</label>
                  <input type="text" value={studentName} onChange={e => setStudentName(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#040941] focus:outline-none" placeholder="e.g. John" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Year</label>
                  <select value={yearSubmitted} onChange={e => setYearSubmitted(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#040941] focus:outline-none">
                    <option value="">Any</option>
                    {availableYears.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Semester</label>
                  <select value={semesterSubmitted} onChange={e => setSemesterSubmitted(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#040941] focus:outline-none">
                    <option value="">Any</option>
                    {availableSemesters.map(sem => (
                      <option key={sem} value={sem}>{sem}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Preference Contains</label>
                  <input type="text" value={prefContains} onChange={e => setPrefContains(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#040941] focus:outline-none" placeholder="e.g. COSC" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Remote Preference</label>
                  <select value={remotePref} onChange={e => setRemotePref(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#040941] focus:outline-none">
                    <option value="">Any</option>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>
              </div>
              <button onClick={handleFilterClick} className="mt-2 mb-2 px-3 py-1.5 h-9 bg-[#040941] text-white rounded-lg font-semibold transition text-sm hover:opacity-80">Filter</button>
            </div>
          </div>
          {/* Stats and Results */}
          <div className="w-full lg:w-[64%] min-w-0 flex flex-col gap-4 sm:gap-8">
            {/* TA Application Stats (collapsible) */}
            <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-3 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-[#040941] text-lg flex items-center gap-2">
                  <svg className="w-6 h-6 text-blue-500 p-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3" stroke="currentColor" strokeWidth="2"/><circle cx="12" cy="12" r="10" fill="none"/></svg>
                  TA Application Stats
                </h3>
                <button
                  className="ml-2 px-3 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300 transition"
                  onClick={() => setShowStats(s => !s)}
                  aria-label={showStats ? 'Hide Stats' : 'Show Stats'}
                >
                  {showStats ? 'Hide' : 'Show'}
                </button>
              </div>
              {showStats ? (
                <>
                  <ApplicationStats
                    totalApplications={totalApplications}
                  appsWithOffer={appsWithOffer}
                  appsWithConfirmed={appsWithConfirmed}
                  appsWithOfferWaiting={appsWithOfferWaiting}
                  filteredCount={filteredApps.length}
                  compact
                />
                  <div className="flex items-center justify-between mt-2 mb-1">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <svg className="w-4 h-4 text-gray-400 p-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      Last Updated: <span className="ml-1 font-semibold">{new Date().toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="mt-2 bg-blue-50 border-l-4 border-[#040941] p-3 rounded-lg">
                    <p className="text-sm text-[#040941]">Tip: Use the right-side filters to search for applications that already have an offer or allocation. For applications with no progress, the left-side filters are more effective.</p>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center text-center text-gray-500 py-2 min-h-[48px]">
                  <span className="text-base">Stats hidden. Click "Show" to view details.</span>
                </div>
              )}
            </div>
            {/* Results Cards and Details Panel */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 relative">
              {/* Application Cards */}
              <div className="col-span-1 sm:col-span-2 xl:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 xl:gap-8 justify-items-stretch items-stretch">
                {filteredApps.length > 0 ? (
                  filteredApps.map((app) => {
                    const hasAnyOffer = allocations.some(
                      s => s.applicationId === app.applicationId
                    );
                    // const allocation = allocationHistory.filter((alloc) => alloc.application?.applicationId === app.applicationId);
                    // const isAllocated = allocations.length > 0;
                    // const isExpanded = expandAll || expandedAppId === app.applicationId;
                    return (
                      <ApplicationCard
                        key={app.applicationId}
                        app={app}
                        // allocation={allocation}
                        allocations={allocations.filter(
                          s => s.applicationId === app.applicationId
                        )}
                        isAllocated={hasAnyOffer}
                        isExpanded={selectedAppId === app.id}
                        onExpand={() => setSelectedAppId(app.id!)}
                        onCollapse={() => setSelectedAppId(null)}
                      />
                    );
                  })
                ) : (
                  <div className="col-span-full text-center text-gray-500 py-12 text-lg">No applications found based on filters</div>
                )}
              </div>
              {/* Details Panel */}
              {/* {selectedApp && (
                <ApplicationDetailsPanel
                  selectedApp={selectedApp}
                  allocations={allocations}
                  onClose={() => setSelectedAppId(null)}
                />
              )} */}
            </div>
          </div>
          {/* Allocation Filters */}
          <div className="w-full lg:w-[18%] min-w-0">
            <div className="lg:sticky lg:top-8 bg-white rounded-2xl shadow-lg p-3 sm:p-4 border border-blue-100 flex flex-col gap-4">
              <h3 className="font-semibold text-[#040941] text-lg mb-2">Allocation & Offer Related Filters</h3>
              {/* Show only 5 filters by default, with View More button */}
              {(() => {
                const [showAllFilters, setShowAllFilters] = React.useState(false);
                const filterFields = [
                  (
                    <div key="offerSent">
                      <label className="block text-sm font-medium mb-1">Offer Sent</label>
                      <select value={offerSentFilter} onChange={e => setOfferSentFilter(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#040941] focus:outline-none">
                        <option value="">Any</option>
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                      </select>
                    </div>
                  ),
                  (
                    <div key="allocationStatus">
                      <label htmlFor="allocationStatus" className="block text-sm font-medium mb-1">Allocation Confirmed</label>
                      <select id="allocationStatus" value={allocationStatus} onChange={e => setAllocationStatus(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#040941] focus:outline-none">
                        <option value="">Any</option>
                        <option value="CONFIRMED">Confirmed</option>
                        <option value="REJECTED">Rejected</option>
                        <option value="SENT">Sent</option>
                      </select>
                    </div>
                  ),
                  (
                    <div key="allocatedHours">
                      <label className="block text-sm font-medium mb-1">Allocated Hours</label>
                      <input type="number" value={allocatedHoursFilter} onChange={e => setAllocatedHoursFilter(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#040941] focus:outline-none" placeholder="Enter allocated hours" />
                    </div>
                  ),
                  (
                    <div key="deptCode">
                      <label className="block text-sm font-medium mb-1">Dept Code</label>
                      <input type="text" value={allocationDept} onChange={e => setAllocationDept(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#040941] focus:outline-none" placeholder="e.g. COSC" />
                    </div>
                  ),
                  (
                    <div key="courseNum">
                      <label className="block text-sm font-medium mb-1">Course Number</label>
                      <input type="text" value={allocationCourseNum} onChange={e => setAllocationCourseNum(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#040941] focus:outline-none" placeholder="e.g. 123" />
                    </div>
                  ),
                  (
                    <div key="sectionYear">
                      <label className="block text-sm font-medium mb-1">Section Year</label>
                      <input type="text" value={allocationSectionYear} onChange={e => setAllocationSectionYear(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#040941] focus:outline-none" placeholder="e.g. 2025" />
                    </div>
                  ),
                  (
                    <div key="semester">
                      <label className="block text-sm font-medium mb-1">Semester</label>
                      <input type="text" value={allocationSemester} onChange={e => setAllocationSemester(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#040941] focus:outline-none" placeholder="e.g. W" />
                    </div>
                  ),
                  (
                    <div key="sectionType">
                      <label className="block text-sm font-medium mb-1">Section Type</label>
                      <select value={allocationType} onChange={e => setAllocationType(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#040941] focus:outline-none">
                        <option value="">Any</option>
                        <option value="LECTURE">Lecture</option>
                        <option value="TUTORIAL">Tutorial</option>
                        <option value="LABORATORY">Laboratory</option>
                        <option value="DISCUSSION">Discussion</option>
                        <option value="SEMINAR">Seminar</option>
                        <option value="WORKSHOP">Workshop</option>
                        <option value="EXPERENTIAL">Experiential</option>
                        <option value="INDEPENDENT_STUDY">Independent Study</option>
                      </select>
                    </div>
                  ),
                ];
                return (
                  <div className="flex flex-col gap-4">
                    {(showAllFilters ? filterFields : filterFields.slice(0, 5))}
                    {filterFields.length > 5 && (
                      <button
                        className="px-3 py-1.5 h-9 bg-gray-100 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 transition"
                        type="button"
                        onClick={() => setShowAllFilters(v => !v)}
                      >
                        {showAllFilters ? 'View Less Filters' : `View More Filters (${filterFields.length - 5})`}
                      </button>
                    )}
                    <button onClick={handleFilterClick} className="mt-2 mb-2 px-3 py-1.5 h-9 bg-[#040941] text-white rounded-lg font-semibold transition text-sm hover:opacity-80">Filter</button>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationPage;