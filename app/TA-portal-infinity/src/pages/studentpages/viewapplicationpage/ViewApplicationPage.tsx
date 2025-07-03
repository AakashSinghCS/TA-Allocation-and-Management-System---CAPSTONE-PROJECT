import React, { useEffect, useState } from "react";
import { fetchApplicationsByStudent } from "../../../api/application/FetchApplicationsByStudent";
import { acceptOffer } from "../../../api/offer/acceptOffer";
import { denyOffer } from "../../../api/offer/denyOffer";
import { useAuth } from "../../../context/AuthContext";
import type { ApplicationDto } from "../../../interfaces/application/Application";
import { fetchUserDetails } from "../../../api/user/fetchUserDetails";
import type { Student } from "../../../interfaces/user/Student";
import { fetchAllocationByApplicationId } from "../../../api/allocation/fetchAllocationByApplicationId";
import type { Allocation } from "../../../interfaces/allocation/Allocation";
import { decodeToken } from "../../../utility/decodeToken";


type ApplicationWithAllocation = ApplicationDto & { allocation?: Allocation };

const ViewApplicationPage = () => {
  const { userId, token } = useAuth();
  const [applications, setApplications] = useState<ApplicationWithAllocation[]>([]);
  const [yearSubmitted, setYearSubmitted] = useState("");
  const [prefContains, setPrefContains] = useState("");
  const [remotePref, setRemotePref] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [filtersApplied, setFiltersApplied] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Authentication token is missing");
      return;
    }

    // Debug: Log the token and its decoded payload
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log('Decoded JWT payload:', payload);
    } catch (e) {
      console.warn('Could not decode JWT:', e);
    }
    console.log('Token used for allocation fetch:', token);

    const decoded = decodeToken(token);
    const userIdFromToken = decoded?.userId;
    if (!userIdFromToken) {
      setError("Failed to extract userId from token");
      return;
    }

    setLoading(true);
    fetchApplicationsByStudent(userIdFromToken, token)
      .then(async (data: ApplicationDto[]) => {
        console.log("Fetched applications:", data);
        // For each application, fetch allocation and student info if needed
        const appsWithDetails = await Promise.all(
          data.map(async (app) => {
            let allocation: Allocation | null = null;
            try {
              // Log the headers for this fetch
              console.log('Fetching allocation for app', app.id ?? app.applicationId, 'with token:', token);
              const allocations = await fetchAllocationByApplicationId(app.id ?? app.applicationId ?? 0, token);
              allocation = allocations && allocations.length > 0 ? allocations[0] : null;
            } catch (err) {
              console.error('Allocation fetch error:', err);
              allocation = null;
            }
            // If student info is missing or incomplete, try to fetch it using student.id
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

  const handleAccept = async (offerId: number) => {
    setActionLoading(offerId);
    try {
      await acceptOffer(offerId);
      const data = await fetchApplicationsByStudent(userId, token || "");
      setApplications(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeny = async (offerId: number) => {
    setActionLoading(offerId);
    try {
      await denyOffer(offerId);
      const data = await fetchApplicationsByStudent(userId, token || "");
      setApplications(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setActionLoading(null);
    }
  };

  const applyFilters = () => {
    setFiltersApplied(true);
  };

  const resetFilters = () => {
    setYearSubmitted("");
    setPrefContains("");
    setRemotePref("");
    setFiltersApplied(false);
  };

  const filteredApps = filtersApplied
    ? applications.filter((app) => {
        let match = true;
        if (yearSubmitted && !app.timeSubmitted.startsWith(yearSubmitted)) match = false;
        if (prefContains && !app.preferences.some(p => p && p.toLowerCase().includes(prefContains.toLowerCase()))) match = false;
        if (remotePref && ((remotePref === 'true' && !app.wantRemote) || (remotePref === 'false' && app.wantRemote))) match = false;
        return match;
      })
    : applications;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl md:text-4xl font-bold text-[#040941] mb-8 tracking-tight">My Applications</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8">
          {/* Filters */}
          <div className="lg:col-span-3">
            <div className="sticky top-8 bg-white rounded-2xl shadow-lg p-4 border border-blue-100 flex flex-col gap-4">
              <h3 className="font-semibold text-[#040941] text-lg mb-2">Filters</h3>
              <div className="flex flex-col gap-4">
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
              <div className="flex gap-2 mt-4">
                <button onClick={applyFilters} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition">Filter</button>
                <button onClick={resetFilters} className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-400 transition">Reset</button>
              </div>
            </div>
          </div>
          {/* Application Cards */}
          <div className="lg:col-span-9 flex flex-col gap-8">
            {loading && <div>Loading...</div>}
            {error && <div className="text-red-500">{error}</div>}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredApps.length > 0 ? (
                filteredApps.map((app, idx) => (
                  <div key={app.id ?? idx} className="bg-white rounded-2xl shadow-lg border border-blue-100 p-6 flex flex-col gap-4 min-h-[440px] relative overflow-hidden">
                    {/* Decorative background */}
                    <div className="absolute right-0 top-0 opacity-10 pointer-events-none select-none">
                      <svg width="120" height="120" viewBox="0 0 120 120" fill="none"><circle cx="60" cy="60" r="60" fill="#2563eb" /></svg>
                    </div>
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
                    {/* Offer/Allocation Info */}
                    {app.allocation ? (
                      <div className="mt-2 z-10">
                        <strong>Offer Status:</strong>
                        {app.allocation.isConfirmed === true && (
                          <div className="mt-1 flex flex-col gap-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                            <span className="text-green-700 font-semibold">Allocation Confirmed</span>
                            <span>Section: {app.allocation.section?.sectionDetails?.name || 'N/A'}</span>
                            <span>Hours: {app.allocation.numberOfHours ?? 'N/A'}</span>
                          </div>
                        )}
                        {app.allocation.isConfirmed === false && (
                          <div className="mt-1 flex flex-col gap-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                            <span className="text-red-700 font-semibold">Allocation Declined</span>
                          </div>
                        )}
                        {app.allocation.isConfirmed == null && (
                          <div className="mt-1 flex items-center gap-2">
                            <span>Offer pending confirmation</span>
                            <button
                              onClick={() => app.allocation && handleAccept(app.allocation.id!)}
                              disabled={app.allocation ? actionLoading === app.allocation.id : true}
                              className="px-3 py-1 bg-green-600 text-white rounded-lg text-xs font-semibold hover:bg-green-700 transition mr-2"
                            >
                              {actionLoading === app.allocation?.id ? 'Accepting...' : 'Accept Offer'}
                            </button>
                            <button
                              onClick={() => app.allocation && handleDeny(app.allocation.id!)}
                              disabled={app.allocation ? actionLoading === app.allocation.id : true}
                              className="px-3 py-1 bg-red-500 text-white rounded-lg text-xs font-semibold hover:bg-red-600 transition"
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
                                      onClick={() => handleAccept(offer.id)}
                                      disabled={actionLoading === offer.id}
                                      className="px-3 py-1 bg-green-600 text-white rounded-lg text-xs font-semibold hover:bg-green-700 transition mr-2"
                                    >
                                      {actionLoading === offer.id ? 'Accepting...' : 'Accept Offer'}
                                    </button>
                                    <button
                                      onClick={() => handleDeny(offer.id)}
                                      disabled={actionLoading === offer.id}
                                      className="px-3 py-1 bg-red-500 text-white rounded-lg text-xs font-semibold hover:bg-red-600 transition"
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
                    {/* Creative: Progress bar and fun fact */}
                    <div className="mt-4 z-10">
                      <div className="w-full bg-blue-50 rounded-full h-2.5 mb-2">
                        <div className="bg-blue-400 h-2.5 rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (app.offers && app.offers.length > 0 ? 100 : 50))}%` }}></div>
                      </div>
                      <div className="text-xs text-blue-700 font-semibold">
                        {app.offers && app.offers.length > 0 ? 'Offer received! 🎉' : 'Application submitted. Waiting for offer...'}
                      </div>
                      {app.offers && app.offers.length > 0 && (
                        <div className="mt-1 text-xs text-green-700 font-semibold">Tip: Accepting an offer will notify the coordinator instantly!</div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center text-gray-500 py-12 text-lg">No applications found based on filters</div>
              )}
            </div>
            {/* Creative: Motivational quote and illustration */}
            <div className="mt-8 flex flex-col items-center justify-center">
              <svg width="80" height="80" viewBox="0 0 80 80" fill="none"><circle cx="40" cy="40" r="40" fill="#2563eb" opacity="0.1"/><path d="M40 20v20l14 8" stroke="#2563eb" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <div className="mt-2 text-blue-900 text-center text-sm font-semibold max-w-xs">“Success is the sum of small efforts, repeated day in and day out.”</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewApplicationPage;