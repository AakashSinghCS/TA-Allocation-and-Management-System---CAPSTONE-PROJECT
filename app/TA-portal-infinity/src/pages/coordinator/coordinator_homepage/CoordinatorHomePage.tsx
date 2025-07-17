import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { fetchUserDetails } from '../../../api/user/fetchUserDetails';
import { fetchApplications } from '../../../api/application/FetchApplications';
import type { ApplicationDto } from '../../../interfaces/application/Application';
import { fetchAllocationByStatus } from '../../../api/allocation/fetchAllocationByStatus';
import { fetchFilteredSections } from '../../../api/course/sectionfilter/fetchFilteredSections';
import { fetchAllProfileQuestions } from '../../../api/question/fetchAllProfileQuestions';
import { fetchAllocationBySectionId } from '../../../api/allocation/fetchAllocationBySectionId';
import { fetchAllocationByApplicationId } from '../../../api/allocation/fetchAllocationByApplicationId';
import type { Allocation } from '../../../interfaces/allocation/Allocation';
import { fetchDeadlines } from '../../../api/config/fetchDeadlines';

export default function CoordinatorHomePage() {
  const { token, userId } = useAuth();
  // Fetch user profile for welcome message
  const [userProfile, setUserProfile] = useState<{ firstName: string; lastName: string }>({ firstName: 'User', lastName: '' });
  useEffect(() => {
    if (!token) return;
    fetchUserDetails<{ firstName: string; lastName: string }>(userId)
      .then(u => setUserProfile({ firstName: u.firstName ?? 'User', lastName: u.lastName ?? '' }))
      .catch(() => {});
  }, [token, userId]);
  const fullName = userProfile.lastName ? `${userProfile.firstName} ${userProfile.lastName}` : userProfile.firstName;
  const [totalApps, setTotalApps] = useState(0);
  const [recentApps, setRecentApps] = useState<ApplicationDto[]>([]);
  const [offerCount, setOfferCount] = useState(0);
  const [confirmedCount, setConfirmedCount] = useState(0);
  const [rejectedCount, setRejectedCount] = useState(0);
  const [sectionsCount, setSectionsCount] = useState(0);
  const [questionsCount, setQuestionsCount] = useState(0);
  const [sectionsNeedingTAsCount, setSectionsNeedingTAsCount] = useState(0);
  const [appStatusMap, setAppStatusMap] = useState<Record<number, string>>({});
  const [topAllocations, setTopAllocations] = useState<Allocation[]>([]);
  // Map raw allocation statuses to user-friendly text
  const getAppStatusText = (id: number): string => {
    const s = appStatusMap[id];
    if (!s || s === 'None') return 'Not Allocated';
    if (s === 'SENT') return 'Offer Sent';
    if (s === 'CONFIRMED') return 'Allocated';
    if (s === 'REJECTED') return 'Offer Rejected';
    return s;
  };
  // Tasks progress: deadlines set out of total
  const totalDeadlines = 3;
  const [deadlines, setDeadlines] = useState<Allocation[]>([]);
  const tasksProgress = Math.floor((deadlines.length / totalDeadlines) * 100);
  // Ensure ring is visible at 0%: full dash when no progress
  const tasksDash1 = tasksProgress > 0 ? tasksProgress : 100;
  const tasksDash2 = tasksProgress > 0 ? 100 - tasksProgress : 0;
  // Color: 0-65% red, 66-99% yellow, 100% green
  const progressColor =
    tasksProgress >= 100 ? 'text-green-500' :
    tasksProgress >= 66 ? 'text-yellow-500' :
    'text-red-500';
  // Profile questions setup progress: target 5
  const profileThreshold = 5;
  const profileProgress = Math.min(Math.floor((questionsCount / profileThreshold) * 100), 100);
  const profileDash1 = profileProgress > 0 ? profileProgress : 100;
  const profileDash2 = profileProgress > 0 ? 100 - profileProgress : 0;
  // Color: 0-2 red, 3-4 yellow, >=5 green
  const profileColor =
    questionsCount >= profileThreshold ? 'text-green-500' :
    questionsCount >= 3 ? 'text-yellow-500' :
    'text-red-500';

  useEffect(() => {
    if (!token) return;
    fetchApplications(1, token)
      .then(apps => {
        setTotalApps(apps.length);
        const sorted = [...apps].sort((a, b) =>
          new Date(b.timeSubmitted).getTime() - new Date(a.timeSubmitted).getTime()
        );
        const topApps = sorted.slice(0, 5);
        setRecentApps(topApps);
        // fetch and map allocation statuses for recent apps
        Promise.all(topApps.map(app => fetchAllocationByApplicationId(app.id ?? 0, token)))
          .then(results => {
            const statusMap: Record<number, string> = {};
            results.forEach((allocs, idx) => {
              const appId = topApps[idx].id ?? 0;
              statusMap[appId] = allocs.length
                ? allocs[0].status || 'Unknown'
                : 'None';
            });
            setAppStatusMap(statusMap);
          })
          .catch(() => {});
      })
      .catch(() => {
        setTotalApps(0);
        setRecentApps([]);
      });
    // fetch offer counts and build unified top allocations list
    const statuses = ['SENT', 'CONFIRMED', 'REJECTED'] as const;
    Promise.all(statuses.map(status =>
      fetchAllocationByStatus(status, token)
        .then(res => {
          // update individual counts
          if (status === 'SENT') setOfferCount(res.length);
          if (status === 'CONFIRMED') setConfirmedCount(res.length);
          if (status === 'REJECTED') setRejectedCount(res.length);
          return res;
        })
        .catch(() => {
          // default count to 0 on error
          if (status === 'SENT') setOfferCount(0);
          if (status === 'CONFIRMED') setConfirmedCount(0);
          if (status === 'REJECTED') setRejectedCount(0);
          return [] as Allocation[];
        })
    ))
    .then(results => {
      const all = results.flat();
      const sorted = all.sort((a, b) => new Date(b.application?.timeSubmitted ?? '').getTime() - new Date(a.application?.timeSubmitted ?? '').getTime());
      setTopAllocations(sorted.slice(0, 5));
    });

    // fetch all sections and count how many have no allocations
    fetchFilteredSections({ isCourse: false })
      .then(async list => {
        const sections = list ?? [];
        setSectionsCount(sections.length);
        // for each section, fetch allocations and count those with none
        const allocLists = await Promise.all(
          sections.map(sec => fetchAllocationBySectionId(sec.sectionId ?? 0, token))
        );
        const needyCount = allocLists.filter(arr => arr.length === 0).length;
        setSectionsNeedingTAsCount(needyCount);
      })
      .catch(() => {
        setSectionsCount(0);
        setSectionsNeedingTAsCount(0);
      });
    // fetch profile questions count
    fetchAllProfileQuestions()
      .then(qs => setQuestionsCount(qs?.length ?? 0))
      .catch(() => setQuestionsCount(0));
  }, [token]);
  // fetch deadlines
  useEffect(() => {
    if (!token) return;
    fetchDeadlines(token)
      .then(res => setDeadlines(res ?? []))
      .catch(() => setDeadlines([]));
  }, [token]);
  // Compute task summaries
  const pendingApplications = Math.max(0, totalApps - offerCount);
  const sectionsInSystem = sectionsCount;
  const sectionsNeedingTAs = sectionsNeedingTAsCount;

  return (
    <section className="px-4 py-6 bg-white min-h-full">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-[#040941] mb-2">My Dashboard</h1>
        <p className="text-lg text-gray-700 mb-4">Welcome, {fullName}</p>
        {/* Summary Metrics (8 cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {/* Total Applications */}
          <div className="bg-blue-50 rounded-lg p-4 flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">Total Applications</p>
              <p className="text-xl font-semibold text-gray-900">{totalApps}</p>
            </div>
          </div>
          {/* Pending Reviews */}
          <div className="bg-yellow-50 rounded-lg p-4 flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">Pending Reviews</p>
              <p className="text-xl font-semibold text-gray-900">{pendingApplications}</p>
            </div>
          </div>
          {/* Offers Sent */}
          <div className="bg-green-50 rounded-lg p-4 flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">Offers Sent</p>
              <p className="text-xl font-semibold text-gray-900">{offerCount}</p>
            </div>
          </div>
          {/* Offers Confirmed */}
          <div className="bg-red-50 rounded-lg p-4 flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">Offers Confirmed</p>
              <p className="text-xl font-semibold text-gray-900">{confirmedCount}</p>
            </div>
          </div>
          {/* Offers Rejected */}
          <div className="bg-blue-50 rounded-lg p-4 flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">Offers Rejected</p>
              <p className="text-xl font-semibold text-gray-900">{rejectedCount}</p>
            </div>
          </div>
          {/* Sections in System */}
          <div className="bg-yellow-50 rounded-lg p-4 flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">Sections in System</p>
              <p className="text-xl font-semibold text-gray-900">{sectionsInSystem}</p>
            </div>
          </div>
          {/* Courses Requiring TAs */}
          <div className="bg-green-50 rounded-lg p-4 flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">Courses Requiring TAs</p>
              <p className="text-xl font-semibold text-gray-900">{sectionsNeedingTAs}</p>
            </div>
          </div>
          {/* Profile Questions */}
          <div className="bg-red-50 rounded-lg p-4 flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">Profile Questions</p>
              <p className="text-xl font-semibold text-gray-900">{questionsCount}</p>
            </div>
          </div>
        </div>
        {/* Main Content & Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-y-8 lg:gap-x-16">
          <main className="lg:col-span-3 space-y-6">
            {/* Recent Applications */}
            <div className="bg-white rounded-lg shadow w-full">
              <div className="px-4 py-2 border-b"><h2 className="font-semibold text-gray-700">Recent Applications</h2></div>
              <div className="p-4">
                {recentApps.length === 0 ? (
                  <p className="text-gray-500">No new applications.</p>
                ) : (
                  <ul className="space-y-4">
                    {recentApps.map(app => (
                      <li key={app.id}>
                        <div className="grid grid-cols-3 gap-x-6">
                          <div>
                            <p className="font-medium text-gray-800">
                              {app.student.firstName} {app.student.lastName}
                            </p>
                            <p className="text-xs text-gray-500">
                              Submitted: {new Date(app.timeSubmitted).toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">
                              Preferences: {app.preferences?.join(', ') || 'None'}
                            </p>
                            <p className="text-sm text-gray-600">
                              Type: {app.applicationType}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">
                              Hours Requested: {app.wantWorkingHours}
                            </p>
                            <p className="text-sm font-semibold text-gray-700">
                              Status: {getAppStatusText(app.id ?? 0)}
                            </p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="px-4 py-2 bg-gray-50 text-right">
                <Link to="/user/coordinator/applications" className="text-blue-900 hover:underline">View all applications</Link>
              </div>
            </div>
            {/* Offer Tasks */}
            <div className="bg-white rounded-lg shadow w-full">
              <div className="px-4 py-2 border-b"><h2 className="font-semibold text-gray-700">Offer Tasks</h2></div>
              <div className="p-4">
                {topAllocations.length > 0 ? (
                  <ul className="space-y-4">
                    {topAllocations.map(a => (
                        <li key={a.id}>
                        <div className="grid grid-cols-3 gap-x-6 p-2 rounded">
                          <div>
                            <p className="font-medium text-gray-800">
                              {a.student?.firstName} {a.student?.lastName}
                            </p>
                            <p className="text-xs text-gray-500">{a.student?.email}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Hours Allocated: {a.numberOfHours}</p>
                            <p className="text-sm text-gray-600">
                              Status: {a.status === 'SENT' ? 'Offer Sent' : a.status === 'CONFIRMED' ? 'Offer Confirmed' : a.status === 'REJECTED' ? 'Offer Rejected' : a.status}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">
                              Section: {a.section?.year} {a.section?.semester}, {a.section?.type} — {a.section?.course?.deptCode} {a.section?.course?.courseNum} ({a.section?.course?.name})
                            </p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">No recent allocations.</p>
                )}
              </div>
              <div className="px-4 py-2 bg-gray-50 text-right">
                <Link to="/user/coordinator/allocation" className="text-blue-900 hover:underline">Manage allocations</Link>
              </div>
            </div>
          </main>
          <aside className="flex justify-center">
            {/* Combined Tasks & Profile Setup Card */}
            <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center w-full max-w-sm">
              <h2 className="font-semibold text-gray-700 mb-4">Tasks Overview</h2>
              <div className="flex flex-col items-center space-y-6">
                {/* Deadline(s) Tasks */}
                <div className="flex flex-col items-center">
                  <div className="relative w-32 h-32">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <circle className="text-gray-200" strokeWidth="6" stroke="currentColor" fill="none" cx="18" cy="18" r="15" />
                      <circle
                        className={progressColor}
                        strokeWidth="6"
                        strokeDasharray={`${tasksDash1},${tasksDash2}`}
                        stroke="currentColor"
                        fill="none"
                        cx="18"
                        cy="18"
                        r="15"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center text-lg font-semibold">
                      {deadlines.length}/{totalDeadlines}
                    </div>
                  </div>
                  {deadlines.length < totalDeadlines ? (
                    <Link to="/user/coordinator/deadlines" className="mt-2 text-sm text-blue-600 hover:underline">
                      {totalDeadlines - deadlines.length} deadline(s) missing
                    </Link>
                  ) : (
                    <p className="mt-2 text-sm text-gray-600">All deadlines set</p>
                  )}
                </div>
                {/* Profile Questions Setup */}
                <div className="flex flex-col items-center">
                  <div className="relative w-32 h-32">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <circle className="text-gray-200" strokeWidth="6" stroke="currentColor" fill="none" cx="18" cy="18" r="15" />
                      <circle
                        className={profileColor}
                        strokeWidth="6"
                        strokeDasharray={`${profileDash1},${profileDash2}`}
                        stroke="currentColor"
                        fill="none"
                        cx="18"
                        cy="18"
                        r="15"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center text-lg font-semibold">
                      {questionsCount}
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-gray-600">Profile Questions Setup</p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
