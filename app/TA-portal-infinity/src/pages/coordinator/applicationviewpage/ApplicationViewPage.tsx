import React, { useEffect, useMemo, useState } from 'react';
import { fetchAllocationByStatus } from '../../../api/allocation/fetchAllocationByStatus';
import { fetchAllocationsByStudent } from '../../../api/allocation/fetchAllocationByStudent';
import { fetchApplications } from '../../../api/application/FetchApplications';
import ApplicationCard from '../../../components/features/application/viewtaapplication/ApplicationCard';
import ApplicationDetailsPanel from '../../../components/features/application/viewtaapplication/ApplicationDetailsPanel';
import ApplicationStats from '../../../components/features/application/viewtaapplication/ApplicationStats';
import { useAuth } from '../../../context/AuthContext';
import type { Allocation } from '../../../interfaces/allocation/Allocation';
import type { ApplicationDto } from '../../../interfaces/application/Application';

const ApplicationPage: React.FC = () => {
  const { token } = useAuth();
  const [allApps, setAllApps] = useState<ApplicationDto[]>([]);
  const [allocationHistory, setAllocationHistory] = useState<Allocation[]>([]);
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
  const [studentName, setStudentName] = useState('');
  const [prefContains, setPrefContains] = useState('');
  const [remotePref, setRemotePref] = useState('');
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
    async function fetchFilteredAllocations() {
      let allocations: Allocation[] = [];
      try {
        if (allocationStatus) {
          // Use new status-based API utility
          const all = await Promise.all(
            allApps.map(() => fetchAllocationByStatus(allocationStatus, token || ''))
          );
          allocations = all.flat();
        } else {
          // fallback: fetch all allocations for all students in allApps
          const all = await Promise.all(
            allApps.map(app => fetchAllocationsByStudent(app.student.id, token || ''))
          );
          allocations = all.flat();
        }
        setAllocationHistory(allocations);
      } catch (err) {
        setAllocationHistory([]);
      } finally {
        setAllocationsLoading(false);
      }
    }
    // Fetch allocations on initial load (when allApps changes) and on filter click
    if (allApps.length > 0) {
      fetchFilteredAllocations();
    }
  }, [filterTrigger, allApps, allocationStatus, token]);

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
    return allApps.filter((app) => {
      let match = true;
      // Application filters
      if (yearSubmitted && !app.timeSubmitted.startsWith(yearSubmitted)) match = false;
      if (studentName && !(`${app.student.firstName} ${app.student.lastName}`.toLowerCase().includes(studentName.toLowerCase()))) match = false;
      if (prefContains && !app.preferences.some(p => p.toLowerCase().includes(prefContains.toLowerCase()))) match = false;
      if (remotePref && ((remotePref === 'true' && !app.wantRemote) || (remotePref === 'false' && app.wantRemote))) match = false;
      // Offer sent: true if any allocation exists for this application
      if (offerSentFilter === 'true') {
        const hasOffer = allocationHistory.some(
          (alloc) => alloc.application?.applicationId === app.applicationId
        );
        if (!hasOffer) match = false;
      }
      if (offerSentFilter === 'false') {
        const hasOffer = allocationHistory.some(
          (alloc) => alloc.application?.applicationId === app.applicationId
        );
        if (hasOffer) match = false;
      }
      // Allocation status filter
      if (allocationStatus) {
        const hasStatus = allocationHistory.some(
          (alloc) => alloc.application?.applicationId === app.applicationId && alloc.status === allocationStatus
        );
        if (!hasStatus) match = false;
      }
      if (allocatedHoursFilter !== '') {
        const totalAllocatedHours = allocationHistory
          .filter((alloc) => alloc.application?.applicationId === app.applicationId)
          .reduce((total, alloc) => total + (alloc.numberOfHours ?? 0), 0);
        if (totalAllocatedHours !== parseInt(allocatedHoursFilter)) match = false;
      }
      // Allocation advanced filters
      if (allocationDept) {
        const hasDept = allocationHistory.some(
          (alloc) => alloc.application?.applicationId === app.applicationId && alloc.section?.course?.deptCode?.toLowerCase() === allocationDept.toLowerCase()
        );
        if (!hasDept) match = false;
      }
      if (allocationCourseNum) {
        const hasCourse = allocationHistory.some(
          (alloc) => alloc.application?.applicationId === app.applicationId && String(alloc.section?.course?.courseNum) === allocationCourseNum
        );
        if (!hasCourse) match = false;
      }
      if (allocationSectionYear) {
        const hasYear = allocationHistory.some(
          (alloc) => alloc.application?.applicationId === app.applicationId && String(alloc.section?.year) === allocationSectionYear
        );
        if (!hasYear) match = false;
      }
      if (allocationSemester) {
        const hasSemester = allocationHistory.some(
          (alloc) => alloc.application?.applicationId === app.applicationId && alloc.section?.semester?.toLowerCase() === allocationSemester.toLowerCase()
        );
        if (!hasSemester) match = false;
      }
      if (allocationType) {
        const hasType = allocationHistory.some(
          (alloc) => alloc.application?.applicationId === app.applicationId && alloc.section?.type?.toLowerCase() === allocationType.toLowerCase()
        );
        if (!hasType) match = false;
      }
      return match;
    });
  }, [allApps, allocationHistory, offerSentFilter, allocatedHoursFilter, yearSubmitted, studentName, allocationStatus, allocationDept, allocationCourseNum, allocationSectionYear, allocationSemester, allocationType, filterTrigger]);

  const [selectedApp, setSelectedApp] = useState<ApplicationDto | null>(null);
  const allocations = useMemo(() => {
    if (!selectedApp) return [];
    return allocationHistory.filter(
      (alloc) => alloc.application?.applicationId === selectedApp.applicationId
    );
  }, [selectedApp, allocationHistory]);

  const [expandedAppId, setExpandedAppId] = useState<number | null>(null);
  const [expandAll, setExpandAll] = useState(false);
  const [allocationsLoading, setAllocationsLoading] = useState(false);

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
  }, [allocationHistory]);

  // Reset expanded card when filters change
  useEffect(() => {
    setExpandedAppId(null);
  }, [filterTrigger]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl md:text-4xl font-bold text-[#040941] mb-8 tracking-tight">Applications Overview</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8">
          {/* Application Filters */}
          <div className="lg:col-span-2">
            <div className="sticky top-8 bg-white rounded-2xl shadow-lg p-4 border border-blue-100 flex flex-col gap-4">
              <h3 className="font-semibold text-[#040941] text-lg mb-2">Application Filters</h3>
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Student Name</label>
                  <input type="text" value={studentName} onChange={e => setStudentName(e.target.value)} className="w-full border border-gray-300 rounded-lg px-2 py-0 text-xs focus:ring-2 focus:ring-[#040941] focus:outline-none" placeholder="e.g. John" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Year Submitted</label>
                  <input type="text" value={yearSubmitted} onChange={e => setYearSubmitted(e.target.value)} className="w-full border border-gray-300 rounded-lg px-2 py-0 text-xs focus:ring-2 focus:ring-[#040941] focus:outline-none" placeholder="e.g. 2025" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Preference Contains</label>
                  <input type="text" value={prefContains} onChange={e => setPrefContains(e.target.value)} className="w-full border border-gray-300 rounded-lg px-2 py-0 text-xs focus:ring-2 focus:ring-[#040941] focus:outline-none" placeholder="e.g. COSC" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Remote Preference</label>
                  <select value={remotePref} onChange={e => setRemotePref(e.target.value)} className="w-full border border-gray-300 rounded-lg px-2 py-0 text-xs focus:ring-2 focus:ring-[#040941] focus:outline-none">
                    <option value="">Any</option>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>
              </div>
              <button onClick={handleFilterClick} className="mt-2 px-6 py-2 bg-[#040941] text-white rounded-lg shadow hover:opacity-80 transition font-semibold">Filter</button>
            </div>
          </div>
          {/* Stats and Results */}
          <div className="lg:col-span-8 flex flex-col gap-8">
            {/* TA Application Stats */}
            <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-6">
              <h3 className="font-semibold text-[#040941] mb-4 text-lg flex items-center gap-2">
                <svg className="w-6 h-6 text-blue-500 p-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3" stroke="currentColor" strokeWidth="2"/><circle cx="12" cy="12" r="10" fill="none"/></svg>
                TA Application Stats
              </h3>
              <ApplicationStats
                totalApplications={allApps.length}
                appsWithOffer={allApps.filter(app => allocationHistory.some(alloc => alloc.application?.applicationId === app.applicationId)).length}
                appsWithConfirmed={allApps.filter(app => allocationHistory.some(alloc => alloc.application?.applicationId === app.applicationId && alloc.status === 'CONFIRMED')).length}
                appsWithOfferWaiting={allApps.filter(app => {
                  const appAllocs = allocationHistory.filter(alloc => alloc.application?.applicationId === app.applicationId);
                  return appAllocs.length > 0 && !appAllocs.some(alloc => alloc.status === 'CONFIRMED');
                }).length}
                filteredCount={filteredApps.length}
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
            </div>
            {/* Results Cards and Details Panel */}
            <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-4 relative">
              {/* Application Cards */}
              <div className="col-span-2 grid md:grid-cols-2 xl:grid-cols-2 gap-8 justify-items-stretch items-stretch">
                {filteredApps.length > 0 ? (
                  filteredApps.map((app) => {
                    const allocations = allocationHistory.filter((alloc) => alloc.application?.applicationId === app.applicationId);
                    const isAllocated = allocations.length > 0;
                    const isExpanded = expandAll || expandedAppId === app.applicationId;
                    return (
                      <ApplicationCard
                        key={app.applicationId}
                        app={app}
                        allocations={allocations}
                        isAllocated={isAllocated}
                        isExpanded={isExpanded}
                        onExpand={() => { if (app.applicationId !== undefined) setExpandedAppId(app.applicationId); }}
                        onCollapse={() => setExpandedAppId(null)}
                      />
                    );
                  })
                ) : (
                  <div className="col-span-full text-center text-gray-500 py-12 text-lg">No applications found based on filters</div>
                )}
              </div>
              {/* Details Panel */}
              {selectedApp && (
                <ApplicationDetailsPanel
                  selectedApp={selectedApp}
                  allocations={allocations}
                  allocationHistory={allocationHistory}
                  onClose={() => setSelectedApp(null)}
                />
              )}
            </div>
          </div>
          {/* Allocation Filters */}
          <div className="lg:col-span-2">
            <div className="sticky top-8 bg-white rounded-2xl shadow-lg p-4 border border-blue-100 flex flex-col gap-4">
              <h3 className="font-semibold text-[#040941] text-lg mb-2">Allocation & Offer Related Filters</h3>
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Offer Sent</label>
                  <select value={offerSentFilter} onChange={e => setOfferSentFilter(e.target.value)} className="w-full border border-gray-300 rounded-lg px-2 py-0 text-xs focus:ring-2 focus:ring-[#040941] focus:outline-none">
                    <option value="">Any</option>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Allocation Confirmed</label>
                  <select value={allocationStatus} onChange={e => setAllocationStatus(e.target.value)} className="w-full border border-gray-300 rounded-lg px-2 py-0 text-xs focus:ring-2 focus:ring-[#040941] focus:outline-none">
                    <option value="">Any</option>
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="REJECTED">Rejected</option>
                    <option value="SENT">Sent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Allocated Hours</label>
                  <input type="number" value={allocatedHoursFilter} onChange={e => setAllocatedHoursFilter(e.target.value)} className="w-full border border-gray-300 rounded-lg px-2 py-0 text-xs focus:ring-2 focus:ring-[#040941] focus:outline-none" placeholder="Enter allocated hours" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Dept Code</label>
                  <input type="text" value={allocationDept} onChange={e => setAllocationDept(e.target.value)} className="w-full border border-gray-300 rounded-lg px-2 py-0 text-xs focus:ring-2 focus:ring-[#040941] focus:outline-none" placeholder="e.g. COSC" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Course Number</label>
                  <input type="text" value={allocationCourseNum} onChange={e => setAllocationCourseNum(e.target.value)} className="w-full border border-gray-300 rounded-lg px-2 py-0 text-xs focus:ring-2 focus:ring-[#040941] focus:outline-none" placeholder="e.g. 123" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Section Year</label>
                  <input type="text" value={allocationSectionYear} onChange={e => setAllocationSectionYear(e.target.value)} className="w-full border border-gray-300 rounded-lg px-2 py-0 text-xs focus:ring-2 focus:ring-[#040941] focus:outline-none" placeholder="e.g. 2025" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Semester</label>
                  <input type="text" value={allocationSemester} onChange={e => setAllocationSemester(e.target.value)} className="w-full border border-gray-300 rounded-lg px-2 py-0 text-xs focus:ring-2 focus:ring-[#040941] focus:outline-none" placeholder="e.g. W" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Section Type</label>
                  <select value={allocationType} onChange={e => setAllocationType(e.target.value)} className="w-full border border-gray-300 rounded-lg px-2 py-0 text-xs focus:ring-2 focus:ring-[#040941] focus:outline-none">
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
                <button onClick={handleFilterClick} className="mt-2 px-6 py-2 bg-[#040941] text-white rounded-lg shadow transition font-semibold hover:opacity-80">Filter</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationPage;