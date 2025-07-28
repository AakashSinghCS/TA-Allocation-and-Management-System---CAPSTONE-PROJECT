import { useEffect, useState } from "react";
import { fetchAllocationByApplicationId } from "../../../api/allocation/fetchAllocationByApplicationId";
import { fetchApplicationsByStudent } from "../../../api/application/FetchApplicationsByStudent";
import { acceptOffer } from "../../../api/offer/acceptOffer";
import { denyOffer } from "../../../api/offer/denyOffer";
import { fetchUserDetails } from "../../../api/user/fetchUserDetails";
import type { Allocation } from "../../../interfaces/allocation/Allocation";
import type { ApplicationDto } from "../../../interfaces/application/Application";
import type { Student } from "../../../interfaces/user/Student";
import { decodeToken } from "../../../utility/decodeToken";
import { fetchSectionInfo } from "../../../api/section/fetchSectionInfo";

import type { DeadlineDto } from '../../../interfaces/admin/Deadline';
import { fetchDeadlines } from '../../../api/admin/FetchDeadline';
import { toast, ToastContainer } from "react-toastify";


type ApplicationWithAllocation = ApplicationDto & { allocation?: Allocation };

const ViewApplicationPage = () => {
  const [applications, setApplications] = useState<ApplicationWithAllocation[]>([]);
  const [year, setYear] = useState("");
  const [semester, setSemester] = useState("");
  const [prefContains, setPrefContains] = useState("");
  const [remotePref, setRemotePref] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [filtersApplied, setFiltersApplied] = useState(false);
  const [expandedCard, setExpandedCard] = useState<number | null>(null);
  const [offerDeadline, setOfferDeadline] = useState<DeadlineDto | null>(null);
  const [deadlineError, setDeadlineError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Authentication token is missing");
      return;
    }

  
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
      console.warn('Could not decode JWT:', e);
    }


    const decoded = decodeToken(token);
    const userIdFromToken = decoded?.userId;
    if (!userIdFromToken) {
      setError("Failed to extract userId from token");
      return;
    }

    setLoading(true);
    fetchApplicationsByStudent(userIdFromToken, token)
      .then(async (data: ApplicationDto[]) => {
        // For each application, fetch allocation, section info, and student info if needed
        const appsWithDetails = await Promise.all(
          data.map(async (app) => {
            let allocation: Allocation | null = null;
            let sectionInfo: any = null;
            try {
              const allocations = await fetchAllocationByApplicationId(app.id ?? app.applicationId ?? 0, token);
              allocation = allocations && allocations.length > 0 ? allocations[0] : null;
              if (allocation && 'isConfirmed' in allocation) {
                delete allocation.isConfirmed;
              }
              // Always fetch section info (with instructor) if allocation.section exists and has id
              let sectionId: number | undefined = undefined;
              if (allocation && allocation.section && allocation.section.id) {
                sectionId = allocation.section.id;
              }
              if (sectionId) {
                try {
                  // Use fetchSectionIncludeInstructorId to get section details with instructor
                  const { fetchSectionIncludeInstructorId } = await import("../../../api/section/fetchSectionIncludeInstructorId");
                  const sectionDetails = await fetchSectionIncludeInstructorId(sectionId);
                  if (allocation && sectionDetails) {
                    allocation.section = sectionDetails;
                    
                  }
                } catch (e) {
                  console.error('DEBUG: fetchSectionIncludeInstructorId failed for sectionId', sectionId, e);
                }
              }
            } catch (err) {
              console.error('Allocation fetch error:', err);
              allocation = null;
            }
            // If student info is missing or incomplete, trying to fetch it using student.id
            if (!app.student || !app.student.firstName) {
              const studentId = app.student?.id ?? (app as any).studentId;
              if (studentId) {
                try {
                  const student = await fetchUserDetails<Student>(studentId);
                  return { ...app, student, allocation };
                } catch {
                  return { ...app, allocation };
                }
              }
              return { ...app, allocation };
            }
            return { ...app, allocation };
          })
        );
        setApplications(appsWithDetails as ApplicationWithAllocation[]);
      })
      .catch((e: Error) => setError(e.message))
      .finally((): void => setLoading(false));
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
      async function loadDeadline() {
        setDeadlineError("");
        try {
          const allDeadlines = await fetchDeadlines(token || "");
          const offerDeadline = allDeadlines.find(
            (d) => d.name === "student_offer_accept_deadline"
          );
          setOfferDeadline(offerDeadline || null);
        } catch (err) {
          console.error("Failed to load deadline:", err);
          setDeadlineError("Could not load application deadline.");
        }
      }
    
      if (token) loadDeadline();
    }, []);

  const deadlinePassed =
    !!offerDeadline &&
    new Date(offerDeadline.endTime) < new Date();

  // Accept/Deny handlers: just check response, no fetching allocation history
  const handleAccept = async (allocationId: number, appId: number) => {
    setActionLoading(allocationId);
    setSuccess(null);
    try {
      const resp = await acceptOffer(allocationId);
      if (resp && (resp.ok === true || resp.status === 200)) {
        // Update allocation status in local state
        setApplications(apps =>
          apps.map(app => {
            if ((app.id ?? app.applicationId) === appId && app.allocation) {
              return {
                ...app,
                allocation: {
                  ...app.allocation,
                  status: 'CONFIRMED',
                },
              };
            }
            return app;
          })
        );
      } else {
        // Try to parse error response for backend message
        let errorMsg = "Failed to accept the offer. Please try again.";
        try {
          const text = await resp.text();
          if (text && text.includes("Course has no need for that year and semester")) {
            errorMsg = "This course does not have a TA need for the selected year and semester. Please contact your coordinator.";
          } else if (text) {
            errorMsg = text;
          }
        } catch {}
        setError(errorMsg);
      }
    } catch (e: any) {
      console.error('[handleAccept] error:', e);
      let errorMsg = e?.message || "Failed to accept the offer. Please try again.";
      if (errorMsg.includes("Course has no need for that year and semester")) {
        errorMsg = "This course does not have a TA need for the selected year and semester. Please contact your coordinator.";
      }
      setError(errorMsg);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeny = async (allocationId: number, appId: number) => {
    setActionLoading(allocationId);
    setSuccess(null);
    try {
      const resp = await denyOffer(allocationId);
      if (resp && (resp.ok === true || resp.status === 200)) {
        // Update allocation status in local state
        setApplications(apps =>
          apps.map(app => {
            if ((app.id ?? app.applicationId) === appId && app.allocation) {
              return {
                ...app,
                allocation: {
                  ...app.allocation,
                  status: 'REJECTED',
                },
              };
            }
            return app;
          })
        );
      } else {
        setError("Failed to decline the offer. Please try again.");
      }
    } catch (e: any) {
      console.error('[handleDeny] error:', e);
      setError(e.message);
    } finally {
      setActionLoading(null);
    }
  };

  const applyFilters = () => {
    setFiltersApplied(true);
  };

  const resetFilters = () => {
    setYear("");
    setSemester("");
    setPrefContains("");
    setRemotePref("");
    setFiltersApplied(false);
  };

  const filteredApps = filtersApplied
    ? applications.filter((app) => {
        let match = true;
        if (year && String(app.year) !== year) match = false;
        if (semester && app.semester.toLowerCase() !== semester.toLowerCase()) match = false;
        if (prefContains && !app.preferences.some(p => p && p.toLowerCase().includes(prefContains.toLowerCase()))) match = false;
        if (remotePref && ((remotePref === 'true' && !app.wantRemote) || (remotePref === 'false' && app.wantRemote))) match = false;
        return match;
      })
    : applications;

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-[#040941] mb-8 tracking-tight">My Applications</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8">
          {/* Filters */}
          <div className="lg:col-span-3">
            <div className="sticky top-8 bg-white rounded-2xl shadow-lg p-4 border border-blue-100 flex flex-col gap-4">
              <h3 className="font-semibold text-[#040941] text-lg mb-2">Filters</h3>
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Year</label>
                  <input type="text" value={year} onChange={e => setYear(e.target.value)} className="w-full border border-gray-300 rounded-lg px-2 py-0 text-xs focus:ring-2 focus:ring-[#040941] focus:outline-none" placeholder="e.g. 2025" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Semester</label>
                  <input type="text" value={semester} onChange={e => setSemester(e.target.value)} className="w-full border border-gray-300 rounded-lg px-2 py-0 text-xs focus:ring-2 focus:ring-[#040941] focus:outline-none" placeholder="e.g. Winter" />
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
              <div className="flex gap-2 mt-4">
                <button onClick={applyFilters} className="px-4 py-2 bg-[#040941] text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition">Filter</button>
                <button onClick={resetFilters} className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-400 transition">Reset</button>
              </div>
              <div className="mt-2 text-sm text-[#040941] font-semibold">
                Total Results: {filteredApps.length}
              </div>
            </div>
          </div>
          {/* Application Cards */}
          <div className="lg:col-span-9 flex flex-col gap-8">
            {loading && <div>Loading...</div>}
            {error && <div className="text-red-500">{error}</div>}
            {success && <div className="text-green-600 font-semibold">{success}</div>}
            <div className="grid grid-cols-1 gap-6">
              {filteredApps.length > 0 ? (
                filteredApps.map((app, idx) => {
                  const cardId = app.id ?? idx;
                  const expanded = expandedCard === cardId;
                  const sectionDetails = app.allocation?.section;
                  return (
                    <div key={cardId} className="bg-white rounded-2xl shadow-lg border border-blue-100 p-10 flex flex-col gap-6 min-h-[520px] relative overflow-hidden w-full transition-all duration-300 hover:shadow-2xl hover:border-blue-300" style={{ maxWidth: '900px', margin: '0 auto' }}>
                      {app.student ? (
                        <div className="flex items-center gap-2 mb-1 z-10">
                          <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-lg font-bold text-[#040941]">
                            {app.student.firstName?.[0] || "?"}{app.student.lastName?.[0] || "?"}
                          </div>
                          <div>
                            <h2 className="font-semibold text-base text-[#040941] leading-tight">
                              {app.student.firstName || "Unknown"} {app.student.lastName || "Student"}
                            </h2>
                            <p className="text-xs text-gray-500 leading-tight">ID: {app.student.studentNum || "N/A"}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="text-red-500 text-sm">Student information is missing.</div>
                      )}
                      <div className="flex flex-col gap-0.5 text-xs z-10">
                        <span><strong>Preferences:</strong> {app.preferences.join(', ')}</span>
                        <span><strong>Remote:</strong> {app.wantRemote ? 'Yes' : 'No'}</span>
                        <span><strong>Hours Requested:</strong> {app.wantWorkingHours}</span>
                        <span><strong>Submitted:</strong> {new Date(app.timeSubmitted).toLocaleString()}</span>
                      </div>
                      
                      {offerDeadline && (
                         <div className="w-fit">
                         <p className="inline-block px-2 py-1 bg-red-500 text-white rounded text-xs font-medium hover:bg-red-600 transition">
                          Deadline:{" "}
                          <span className="bg-red-500 text-white rounded-lg text-xs font-semibold hover:bg-red-600 transition">
                            {new Date(offerDeadline.endTime).toLocaleString()}
                          </span>
                        </p>
                         </div>
                        )}
                       
                        {!offerDeadline && !deadlineError && (
                          <p className="text-md text-gray-500 mb-6">
                            No application deadline found.
                          </p>
                        )}
                        {deadlineError && (
                          <p className="text-md text-red-500 mb-6">
                            {deadlineError}
                          </p>
                        )}
                      
                    {/* Offer/Allocation Info */}
                    {app.allocation ? (
                      <div className="mt-2 z-10">
                        <strong>Offer Status:</strong>
                    {app.allocation.status === 'CONFIRMED' && (
                      <div className="mt-1 flex flex-col gap-2 p-4 bg-gray-50 border-[#040941] rounded-lg">
                        <span className="text-green-800 font-semibold text-lg">Success! Your allocation is now confirmed!</span>
                        <span>
                          <strong>Section:</strong> {app.allocation.section?.course?.deptCode || 'N/A'}
                          {app.allocation.section?.course?.courseNum ? ` ${app.allocation.section.course.courseNum}` : ''}
                          {app.allocation.section?.section ? ` - ${app.allocation.section.section}` : ''}
                          {app.allocation.section?.type ? ` (${app.allocation.section.type})` : ''}
                          {app.allocation.section?.semester || app.allocation.section?.year ? ` [${app.allocation.section.semester || ''} ${app.allocation.section.year || ''}]` : ''}
                        </span>
                        <span><strong>Hours:</strong> {app.allocation.numberOfHours ?? 'N/A'}</span>
                        <span><strong>Instructor:</strong> {app.allocation.section?.instructor && typeof app.allocation.section.instructor === 'object' && 'firstName' in app.allocation.section.instructor ? `${app.allocation.section.instructor.firstName} ${app.allocation.section.instructor.lastName}` : 'N/A'}</span>
                      </div>
                    )}
                    {app.allocation.status === 'REJECTED' && (
                      <div className="mt-1 flex flex-col gap-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                        <span className="text-red-700 font-semibold">Allocation Declined</span>
                      </div>
                    )}
                    {app.allocation.status === 'SENT' && (
                      <div className="mt-1 flex items-center gap-2">
                        <span>Offer pending confirmation</span>
                        <button
                          onClick={(e) => {
                            if (deadlinePassed) {
                              e.preventDefault();
                              toast.error("The application deadline has passed. You can no longer submit.");
                              return;
                            }
                            if (
                              app.allocation &&
                              typeof app.allocation.id === 'number' &&
                              typeof (app.id ?? app.applicationId) === 'number'
                            ) {
                              // Debug log for allocationId and appId
                              console.log('Accept Offer clicked:', {
                                allocationId: app.allocation.id,
                                appId: app.id ?? app.applicationId,
                                app,
                              });
                              handleAccept(app.allocation.id as number, (app.id ?? app.applicationId) as number);
                            }
                          }}
                          disabled={
                            !app.allocation ||
                            typeof app.allocation.id !== 'number' ||
                            typeof (app.id ?? app.applicationId) !== 'number' ||
                            actionLoading === app.allocation.id
                          }
                          className={`px-3 py-1 rounded ${
                            deadlinePassed
                              ? "bg-gray-400 cursor-not-allowed"
                              : "px-3 py-2 bg-green-600 text-white rounded-lg text-xs font-semibold hover:bg-green-700 transition mr-2"
                          }`}
                        >
                          {actionLoading === app.allocation?.id ? 'Accepting...' : 'Accept Offer'}
                        </button>
                        <button
                          onClick={() =>
                            app.allocation &&
                            typeof app.allocation.id === 'number' &&
                            typeof (app.id ?? app.applicationId) === 'number' &&
                            typeof app.allocation.id === 'number' && typeof (app.id ?? app.applicationId) === 'number' && handleDeny(app.allocation.id as number, (app.id ?? app.applicationId) as number)
                          }
                          disabled={
                            !app.allocation ||
                            typeof app.allocation.id !== 'number' ||
                            typeof (app.id ?? app.applicationId) !== 'number' ||
                            actionLoading === app.allocation.id
                          }
                          className="px-3 py-2 bg-red-800 text-white rounded-lg text-xs font-semibold hover:bg-red-600 transition"
                        >
                          {actionLoading === app.allocation.id ? 'Declining...' : 'Decline Offer'}
                        </button>
                        
                  </div>
                )}

              </div>

                    ) : (
                      <>
                        {app.offers && app.offers.length > 0 ? (
                          <div className="mt-2 z-10">
                            <strong>Offer Status:</strong>
                            {app.offers.map((offer, idx) => (
                              <div key={offer.id || idx} className="mt-1 flex items-center gap-2">
                                <span>{offer.description}</span>
                                {offer.isAccepted === true && <span className="text-green-600 font-semibold">Accepted</span>}
                                {offer.isAccepted === false && <span className="text-red-500 font-semibold">Declined</span>}
                                {offer.isAccepted === null && (
                                  <>
                                    <button
                                      onClick={() => typeof offer.id === 'number' && typeof (app.id ?? app.applicationId) === 'number' && handleAccept(offer.id as number, (app.id ?? app.applicationId) as number)}
                                      disabled={typeof offer.id !== 'number' || typeof (app.id ?? app.applicationId) !== 'number' || actionLoading === offer.id}
                                      className="px-3 py-1 bg-green-8
                                      00 text-white rounded-lg text-xs font-semibold hover:bg-green-700 transition mr-2"
                                    >
                                      {actionLoading === offer.id ? 'Accepting...' : 'Accept Offer'}
                                    </button>
                                    <button
                                      onClick={() => typeof offer.id === 'number' && typeof (app.id ?? app.applicationId) === 'number' && handleDeny(offer.id as number, (app.id ?? app.applicationId) as number)}
                                      disabled={typeof offer.id !== 'number' || typeof (app.id ?? app.applicationId) !== 'number' || actionLoading === offer.id}
                                      className="px-3 py-1 bg-red-800 text-white rounded-lg text-xs font-semibold hover:bg-red-600 transition"
                                    >
                                      {actionLoading === offer.id ? 'Declining...' : 'Decline Offer'}
                                    </button>
                                  </>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="mt-2 text-xs text-gray-500 z-10">No offer for this application.</div>
                        )}
                      </>
                    )}


                    {/* details Button */}
                      <button
                        className="self-end px-3 py-2 text-xs rounded-lg font-semibold border border-blue-50 bg-[#040941] hover:bg-blue-800 text-white transition"
                        onClick={() => setExpandedCard(expanded ? null : cardId)}
                        aria-expanded={expanded}
                      >
                        {expanded ? 'Hide Details' : 'View Details'}
                      </button>
                      {/* details Section */}
                      {expanded && (
                        <div className="mt-2 p-4 bg-gray-50 border border-gray-200 rounded-lg text-sm animate-fade-in">
                          <div className="mb-2 font-semibold text-blue-900">Section Details</div>
                          {sectionDetails ? (
                            <>
                              <div><strong>Course:</strong> {sectionDetails.course?.deptCode || 'N/A'} {sectionDetails.course?.courseNum || ''}</div>
                              <div><strong>Section:</strong> {sectionDetails.section || 'N/A'}</div>
                              <div><strong>Type:</strong> {sectionDetails.type || 'N/A'}</div>
                               <div><strong>Semester:</strong> {app.allocation?.section?.semester ?? sectionDetails.semester ?? 'N/A'}</div>
                               <div><strong>Year:</strong> {app.allocation?.section?.year ?? sectionDetails.year ?? 'N/A'}</div>
                              {/* Show schedule from sectionSchedule array if present, else fallback to schedule string, else show message */}
                              {app.allocation?.section?.sectionSchedule && app.allocation.section.sectionSchedule.length > 0 ? (
                                <div>
                                  <strong>Schedule:</strong>
                                  <ul className="ml-4 list-disc">
                                    {app.allocation.section.sectionSchedule.map((sch, i) => (
                                      <li key={i}>
                                        {sch.day || 'N/A'} {sch.startTime && sch.endTime ? `${sch.startTime} - ${sch.endTime}` : ''}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              ) : (sectionDetails as any).schedule && String((sectionDetails as any).schedule).trim() !== '' ? (
                                <div><strong>Schedule:</strong> {(sectionDetails as any).schedule}</div>
                              ) : (
                                <div className="text-gray-500">No schedule info available.</div>
                              )}
                            </>
                          ) : (
                            <div className="text-gray-500">No section details available.</div>
                          )}
                        </div>
                      )}

                    {/* Progress bar */}
                 
                    <div className="mt-4 z-10">
                      {(() => {
                        let step = 0;
                        let label = 'Application submitted. Waiting for offer...';
                        let tip = '';
                        // Allocation status logic
                        if (app.allocation) {
                          if (app.allocation.status === 'CONFIRMED') {
                            step = 3;
                            label = 'Allocation confirmed!';
                            tip = 'You are officially allocated to this section.';
                          } else if (app.allocation.status === 'SENT') {
                            // If the backend does not use 'ACCEPTED', treat 'SENT' as offer received, but check if the offer is accepted via offers array
                            const accepted = app.offers && app.offers.some(o => o.isAccepted === true);
                            if (accepted) {
                              step = 2;
                              label = 'Offer accepted. Awaiting confirmation...';
                              tip = 'Coordinator will confirm your allocation soon.';
                            } else {
                              step = 1;
                              label = 'Offer received! Please accept or decline.';
                              tip = 'Accepting an offer will notify the coordinator instantly!';
                            }
                          } else if (app.allocation.status === 'REJECTED') {
                            step = 1;
                            label = 'Offer declined.';
                            tip = '';
                          }
                        } else if (app.offers && app.offers.length > 0) {
                          // If there are offers but no allocation, treat as offer sent
                          const accepted = app.offers.some(o => o.isAccepted === true);
                          if (accepted) {
                            step = 2;
                            label = 'Offer accepted. Awaiting confirmation...';
                            tip = 'Coordinator will confirm your allocation soon.';
                          } else {
                            step = 1;
                            label = 'Offer received! Please accept or decline.';
                            tip = 'Accepting an offer will notify the coordinator instantly!';
                          }
                        }
                        const progressPercents = [20, 50, 80, 100];
                        const percent = progressPercents[step];
                        // Progress bar steps
                        const steps = [
                          { label: 'Submitted' },
                          { label: 'Offer Received' },
                          { label: 'Offer Accepted' },
                          { label: 'Confirmed' },
                        ];
                        return (
                          <>
                            <div className="w-full bg-blue-50 rounded-full h-2.5 mb-2 relative">
                              <div className="bg-blue-400 h-2.5 rounded-full transition-all duration-500" style={{ width: `${percent}%` }}></div>
                              {/* Step markers */}
                              <div className="absolute top-0 left-0 w-full h-2.5 flex justify-between items-center pointer-events-none">
                                {steps.map((s, i) => (
                                  <div key={i} className={`w-2 h-2 rounded-full border-2 ${i <= step ? 'bg-blue-500 border-blue-500' : 'bg-white border-blue-200'} transition-all duration-500`} style={{ zIndex: 2 }}></div>
                                ))}
                              </div>
                            </div>
                            <div className="flex justify-between text-[11px] text-blue-900 font-semibold mb-1 px-1">
                              {steps.map((s, i) => (
                                <span key={i} className={i === step ? 'text-blue-700 font-bold' : 'text-blue-400'}>{s.label}</span>
                              ))}
                            </div>
                            <div className="text-xs text-blue-700 font-semibold">{label}</div>
                            {tip && <div className="mt-1 text-xs text-green-700 font-semibold">{tip}</div>}
                          </>
                        );
                      })()}
                    </div>
                  </div>
                  );
                })
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center py-12">
                  <svg width="64" height="64" fill="none" viewBox="0 0 64 64" aria-hidden="true" className="mb-4">
                    <rect width="64" height="64" rx="16" fill="#F3F4F6"/>
                    <path d="M20 28h24M20 36h24M28 20h8" stroke="#A0AEC0" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  <div className="text-gray-500 text-lg font-semibold mb-2">No applications found</div>
                  <div className="text-gray-400 text-sm mb-4">&nbsp;&nbsp;&nbsp;No TA applications match your current filters.<br/>Adjust your filters or start a new application to see it here.</div>
                  <a href="application" className="inline-block px-5 py-2 bg-[#040941] text-white rounded-lg font-semibold hover:bg-blue-700 transition">Start New Application</a>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default ViewApplicationPage;