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
import type { Deadline } from '../../../interfaces/config/Deadline';


export default function CoordinatorHomePage() {
  const { token, userId } = useAuth();
  // welcome message
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
  const [recentAppAllocations, setRecentAppAllocations] = useState<Record<number, Allocation[]>>({});
  const [topAllocations, setTopAllocations] = useState<Allocation[]>([]);
  // deadlines set out of total
  const totalDeadlines = 3;
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  // Only count deadlines whose endTime is in the future
  const now = new Date();
  const activeDeadlines = deadlines.filter(d => new Date(d.endTime) > now);
  const tasksProgress = Math.floor((activeDeadlines.length / totalDeadlines) * 100);
  const tasksDash1 = tasksProgress > 0 ? tasksProgress : 100;
  const tasksDash2 = tasksProgress > 0 ? 100 - tasksProgress : 0;
  // days until each deadline
  const daysUntilList = deadlines.map(d => {
    const date = new Date(d.endTime);
    return Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  });
  const formatDeadlineName = (name: string) =>
    name.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const progressColor =
    tasksProgress >= 100 ? 'text-green-700' :
    tasksProgress >= 66 ? 'text-yellow-700' :
    'text-red-600';
  const profileThreshold = 5;
  const profileProgress = Math.min(Math.floor((questionsCount / profileThreshold) * 100), 100);
  const profileDash1 = profileProgress > 0 ? profileProgress : 100;
  const profileDash2 = profileProgress > 0 ? 100 - profileProgress : 0;
  const profileColor =
    questionsCount >= profileThreshold ? 'text-green-700' :
    questionsCount >= 3 ? 'text-yellow-700' :
    'text-red-700';

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
        // fetch allocations for each recent app
        Promise.all(topApps.map(app => fetchAllocationByApplicationId(app.id ?? 0, token)))
          .then(results => {
            const allocMap: Record<number, Allocation[]> = {};
            results.forEach((allocs, idx) => {
              const appId = topApps[idx].id ?? 0;
              allocMap[appId] = allocs;
            });
            setRecentAppAllocations(allocMap);
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
      .then(res => {
        const raw = res ?? [];
        const list = raw.map(d => ({
          name: (d as any).name,
          startTime: (d as any).startTime,
          endTime: (d as any).endTime,
        }));
        setDeadlines(list);
      })
      .catch(() => setDeadlines([]));
  }, [token]);
  // task summaries
  const pendingApplications = Math.max(0, totalApps - offerCount);
  const sectionsInSystem = sectionsCount;
  const sectionsNeedingTAs = sectionsNeedingTAsCount;

  return (
    <section className="px-2 sm:px-4 py-4 sm:py-6 bg-white min-h-full">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#040941] mb-2">My Dashboard</h1>
        <p className="text-base sm:text-lg text-gray-700 mb-4">Welcome, {fullName}</p>
        {/* Main Content & Sidebar */}
        <div className="flex flex-col lg:flex-row gap-y-6 lg:gap-y-0 lg:gap-x-8">
          <main className="w-full lg:w-3/4 space-y-6">
            {/* Summary Metrics */}
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
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
          </div>
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
                              <a
                                href={`http://localhost:5173/user/profile/${app.student.id}`}
                                className="text-blue-900 hover:underline"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {app.student.firstName} {app.student.lastName}
                              </a>
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
                              Status: {
                                (() => {
                                  // all allocations for this application 
                                  const allocs = recentAppAllocations[app.id ?? 0];
                                  if (allocs && allocs.length > 0) {
                                    // Priority: CONFIRMED > SENT > REJECTED > fallback
                                    if (allocs.some(a => a.status === 'CONFIRMED')) return 'Allocated';
                                    if (allocs.some(a => a.status === 'SENT')) return 'Offer Sent';
                                    if (allocs.some(a => a.status === 'REJECTED')) return 'Offer Rejected';
                                    return allocs[0].status || 'Unknown';
                                  }
                                  // If not found, check all topAllocations for this application
                                  const allocs2 = topAllocations.filter(a => a.application?.id === app.id);
                                  if (allocs2.length > 0) {
                                    if (allocs2.some(a => a.status === 'CONFIRMED')) return 'Allocated';
                                    if (allocs2.some(a => a.status === 'SENT')) return 'Offer Sent';
                                    if (allocs2.some(a => a.status === 'REJECTED')) return 'Offer Rejected';
                                    return allocs2[0].status || 'Unknown';
                                  }
                                  return 'Not Allocated';
                                })()
                              }
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
                              <a
                                href={`http://localhost:5173/user/profile/${a.student?.id}`}
                                className="text-blue-900 hover:underline"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {a.student?.firstName} {a.student?.lastName}
                              </a>
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
          <aside className="flex justify-center w-full lg:w-1/4 mt-6 lg:mt-0">
            {/* Combined Tasks & Profile Setup Card */}
            <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center w-full max-w-xs sm:max-w-sm">
              <h2 className="font-semibold text-gray-700 mt-1">Tasks Overview</h2>
              <div className="flex flex-col items-center space-y-6">
                 <hr className="my-6 w-full border-gray-300" />
                {/* Deadline(s) Tasks */}
                <div className="flex flex-col items-center">
                  <p className="text-sm font-medium text-gray-700 mb-2">Deadline(s)</p>
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
                      {activeDeadlines.length}/{totalDeadlines}
                    </div>
                  </div>
                  <ul className="mt-2 space-y-4 w-full">
                    {deadlines.map((d, idx) => {
                      const days = daysUntilList[idx];
                      const due = new Date(d.endTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                      const textColor = days <= 7 ? 'text-red-700' : days <= 14 ? 'text-yellow-700' : 'text-green-700';
                      const formatted = formatDeadlineName(d.name);
                      const displayName = d.name === 'instructor_need_update_deadline'
                        ? 'Instructor Need Deadline'
                        : formatted;
                      return (
                        <li key={d.name}>
                          <Link
                            to="/user/coordinator/deadlines"
                            className={`text-sm font-medium ${textColor} hover:underline`}
                          >
                            {displayName} - {due}
                          </Link>
                          <p className="text-xs text-gray-500">{days} days left</p>
                        </li>
                      );
                    })}
                  </ul>
                  {deadlines.length < totalDeadlines && (
                    <Link to="/user/coordinator/deadlines" className="mt-2 text-sm text-blue-600 hover:underline">
                      {totalDeadlines - deadlines.length} deadline(s) missing
                    </Link>
                  )}
                </div>
                <hr className="my-6 -mt-2 w-full border-gray-300" />
                {/* Courses Requiring TAs Circle */}
                <div className="flex flex-col items-center">
                  <p className="text-sm font-medium text-gray-700 mb-2">Courses Requiring TAs</p>
                  <div className="relative w-32 h-32">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <circle className="text-gray-200" strokeWidth="6" stroke="currentColor" fill="none" cx="18" cy="18" r="15" />
                      {(() => {
                        let color = 'text-green-700';
                        let dash1 = 0;
                        let dash2 = 100;
                        if (sectionsNeedingTAs === 0) {
                          color = 'text-green-700';
                          dash1 = 100;
                          dash2 = 0;
                        } else if (sectionsNeedingTAs > 0 && sectionsNeedingTAs < 10) {
                          color = 'text-yellow-500';
                          dash1 = Math.min(100, Math.round((sectionsNeedingTAs / 10) * 100));
                          dash2 = 100 - dash1;
                        } else if (sectionsNeedingTAs >= 10) {
                          color = 'text-red-700';
                          dash1 = 100;
                          dash2 = 0;
                        }
                        return (
                          <circle
                            className={color}
                            strokeWidth="6"
                            strokeDasharray={`${dash1},${dash2}`}
                            stroke="currentColor"
                            fill="none"
                            cx="18"
                            cy="18"
                            r="15"
                          />
                        );
                      })()}
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center text-lg font-semibold">
                      {sectionsNeedingTAs}
                    </div>
                  </div>
                  <Link to="/user/coordinator/allocation" className="mt-4 text-sm text-blue-800 font-medium hover:underline">
                    View Sections Needing TAs
                  </Link>
                </div>
                <hr className="my-6 -mt-2 w-full border-gray-300" />
                {/* Profile Questions Setup */}
                <div className="flex flex-col items-center">
                  <p className="text-sm font-medium text-gray-700 mb-2">Profile Question(s)</p>
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
                  <Link to="/user/coordinator/questions" className="mt-2 mb-2 text-sm text-blue-800 font-medium hover:underline">
                    Manage Profile Questions
                  </Link>
                </div>
              </div>
            </div>
          </aside>
        </div>
         </div>
    </section>
  );
}
