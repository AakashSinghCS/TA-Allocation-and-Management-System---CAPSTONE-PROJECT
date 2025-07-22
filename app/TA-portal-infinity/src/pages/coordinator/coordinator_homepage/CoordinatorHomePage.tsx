import { Link } from 'react-router-dom';
import SummaryMetrics from '../../../components/features/co-ordinator_home/SummaryMetrics';
import RecentApplications from '../../../components/features/co-ordinator_home/RecentApplications';
import OfferTasks from '../../../components/features/co-ordinator_home/OfferTasks';
import TasksOverview from '../../../components/features/co-ordinator_home/TasksOverview';
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
  // Loading states for async data
  const [userProfileLoaded, setUserProfileLoaded] = useState(false);
  const [appsLoaded, setAppsLoaded] = useState(false);
  const [allocationsLoaded, setAllocationsLoaded] = useState(false);
  const [sectionsLoaded, setSectionsLoaded] = useState(false);
  const [questionsLoaded, setQuestionsLoaded] = useState(false);
  const [deadlinesLoaded, setDeadlinesLoaded] = useState(false);

  // User profile loading effect and fullName logic
  useEffect(() => {
    setUserProfileLoaded(false);
    if (!token) return;
    fetchUserDetails<{ firstName: string; lastName: string }>(userId)
      .then(u => setUserProfile({ firstName: u.firstName ?? 'User', lastName: u.lastName ?? '' }))
      .catch(() => {})
      .finally(() => setUserProfileLoaded(true));
  }, [token, userId]);
  const fullName = userProfile.lastName ? `${userProfile.firstName} ${userProfile.lastName}` : userProfile.firstName;
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
    setAppsLoaded(false);
    setAllocationsLoaded(false);
    setSectionsLoaded(false);
    setQuestionsLoaded(false);
    if (!token) return;
    // Applications and allocations
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
            setAppsLoaded(true);
          })
          .catch(() => {
            setAppsLoaded(true);
          });
      })
      .catch(() => {
        setTotalApps(0);
        setRecentApps([]);
        setAppsLoaded(true);
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
      setAllocationsLoaded(true);
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
        setSectionsLoaded(true);
      })
      .catch(() => {
        setSectionsCount(0);
        setSectionsNeedingTAsCount(0);
        setSectionsLoaded(true);
      });
    // fetch profile questions count
    fetchAllProfileQuestions()
      .then(qs => {
        setQuestionsCount(qs?.length ?? 0);
        setQuestionsLoaded(true);
      })
      .catch(() => {
        setQuestionsCount(0);
        setQuestionsLoaded(true);
      });
  }, [token]);
  // fetch deadline
  useEffect(() => {
    setDeadlinesLoaded(false);
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
        setDeadlinesLoaded(true);
      })
      .catch(() => {
        setDeadlines([]);
        setDeadlinesLoaded(true);
      });
  }, [token]);
  // task summaries
  const pendingApplications = Math.max(0, totalApps - offerCount);
  const sectionsInSystem = sectionsCount;
  const sectionsNeedingTAs = sectionsNeedingTAsCount;

  // Only render dashboard after all data is loaded
  const allLoaded = userProfileLoaded && appsLoaded && allocationsLoaded && sectionsLoaded && questionsLoaded && deadlinesLoaded;

  return (
    <section className="px-2 sm:px-4 py-4 sm:py-6 bg-white min-h-full">
      <div className="max-w-7xl mx-auto">
        {!allLoaded ? (
          <div className="flex flex-1 items-center justify-center min-h-[300px]">
            <span className="text-gray-500 text-lg">Loading...</span>
          </div>
        ) : (
          <>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#040941] mb-2">My Dashboard</h1>
            <p className="text-base sm:text-lg text-gray-700 mb-4">Welcome, {fullName}</p>
            {/* Main Content & Sidebar */}
            <div className="flex flex-col lg:flex-row gap-y-6 lg:gap-y-0 lg:gap-x-8">
              <main className="w-full lg:w-3/4 space-y-6">
                <SummaryMetrics
                  totalApps={totalApps}
                  pendingApplications={pendingApplications}
                  offerCount={offerCount}
                  confirmedCount={confirmedCount}
                  rejectedCount={rejectedCount}
                  sectionsInSystem={sectionsInSystem}
                />
                <RecentApplications
                  recentApps={recentApps}
                  recentAppAllocations={recentAppAllocations}
                  topAllocations={topAllocations}
                />
                <OfferTasks
                  topAllocations={topAllocations}
                />
              </main>
              <aside className="flex justify-center w-full lg:w-1/4 mt-6 lg:mt-0">
                <TasksOverview
                  totalDeadlines={totalDeadlines}
                  activeDeadlines={activeDeadlines.length}
                  deadlines={deadlines}
                  daysUntilList={daysUntilList}
                  formatDeadlineName={formatDeadlineName}
                  progressColor={progressColor}
                  tasksDash1={tasksDash1}
                  tasksDash2={tasksDash2}
                  sectionsNeedingTAs={sectionsNeedingTAs}
                  profileDash1={profileDash1}
                  profileDash2={profileDash2}
                  profileColor={profileColor}
                  questionsCount={questionsCount}
                />
              </aside>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
