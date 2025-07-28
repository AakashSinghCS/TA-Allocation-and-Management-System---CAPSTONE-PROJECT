import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchStudentDetails } from "../../../api/student/fetchStudentDetails";
import { fetchApplicationsByStudent } from "../../../api/application/FetchApplicationsByStudent";
import { fetchAllStudentQualifications } from "../../../api/student/qualification/fetchAllStudentQualifications";
import { fetchAllStudentEnrollmentOverview } from "../../../api/student/enrollment/fetchAllStudentCompletedCourses";
import { fetchAllStudentQuestions } from "../../../api/question/fetchAllStudentQuestion";
import { fetchAllocationByApplicationId } from "../../../api/allocation/fetchAllocationByApplicationId";
import { useAuth } from "../../../context/AuthContext";
import type { ApplicationDto } from "../../../interfaces/application/Application";
import type { Student } from "../../../interfaces/user/Student";
import type { ProfileQuestion } from "../../../interfaces/question/ProfileQuestion";
import type { CourseEnrollmentOverview } from "../../../interfaces/course/CourseEnrollment";
import { Bell, User, GraduationCap, FileText, BookOpen, FileQuestion, CheckCircle, XCircle } from "lucide-react";

export default function StudentHomePage() {
  const { userId } = useAuth();
  const [student, setStudent] = useState<Student | null>(null);
  type ApplicationWithAllocation = ApplicationDto & { allocation?: { status?: string; section?: any } };
  const [applications, setApplications] = useState<ApplicationWithAllocation[]>([]);
  const [courses, setCourses] = useState<CourseEnrollmentOverview | null>(null);
  const [profileQuestions, setProfileQuestions] = useState<ProfileQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  // Track dismissed notification IDs in localStorage (until we have a backend solution)
  const [dismissedNotifIds, setDismissedNotifIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('dismissedStudentNotifIds');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [showNotifications, setShowNotifications] = useState(true);
  // const navigate = useNavigate();

  const [refreshKey, setRefreshKey] = useState(0);
  async function fetchAll() {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token") || "";
      // Fetch student, applications, courses, questions
      const [stu, apps, , crs, qs] = await Promise.all([
        fetchStudentDetails<Student>(userId),
        fetchApplicationsByStudent(userId, token),
        fetchAllStudentQualifications(userId),
        fetchAllStudentEnrollmentOverview(userId),
        fetchAllStudentQuestions(userId),
      ]);
      setStudent(stu);
      setCourses(crs);
      setProfileQuestions(qs || []);

      // Fetch allocations for all applications
      let appsWithDetails: any[] = [];
      if (apps.length > 0) {
        appsWithDetails = await Promise.all(
          apps.map(async (app) => {
            let allocation = null;
            try {
              const allocations = await fetchAllocationByApplicationId(app.id ?? app.applicationId ?? 0, token);
              allocation = allocations && allocations.length > 0 ? allocations[0] : null;
            } catch (err) {
              console.error('fetchAllocationByApplicationId error:', err);
            }
            return { ...app, allocation };
          })
        );
      }
      setApplications(appsWithDetails);
      // Build notifications
      const notificationsList: any[] = [];
     
      if (appsWithDetails.length > 0) {
        notificationsList.push({
          id: 'submitted',
          title: 'Application Submitted',
          body: 'Your TA application has been submitted.',
          time: appsWithDetails[0].timeSubmitted || new Date().toISOString(),
        });
      }
      appsWithDetails.forEach((app: any) => {
        if (app.allocation && app.allocation.status) {
          const section = app.allocation.section;
          let sectionStr = '';
          if (section && section.course) {
            sectionStr = `${section.course.deptCode} ${section.course.courseNum} - ${section.course.name}`;
          }
          const statusTime = app.allocation.timeStatusChanged || app.allocation.updatedAt || app.timeSubmitted || new Date().toISOString();
          if (app.allocation.status === 'SENT') {
            notificationsList.push({
              id: `offer-${app.id}`,
              title: 'Offer Received',
              body: `You have received an offer${sectionStr ? ' for ' + sectionStr : ''}.`,
              time: statusTime,
            });
          } else if (app.allocation.status === 'CONFIRMED') {
            notificationsList.push({
              id: `confirmed-${app.id}`,
              title: 'Offer Accepted',
              body: `You accepted the offer${sectionStr ? ' for ' + sectionStr : ''}.`,
              time: statusTime,
            });
            notificationsList.push({
              id: `allocation-${app.id}`,
              title: 'Allocation Confirmed',
              body: `Your allocation is confirmed${sectionStr ? ' for ' + sectionStr : ''}.`,
              time: statusTime,
            });
          } else if (app.allocation.status === 'REJECTED') {
            notificationsList.push({
              id: `rejected-${app.id}`,
              title: 'Offer Rejected',
              body: `You rejected the offer${sectionStr ? ' for ' + sectionStr : ''}.`,
              time: statusTime,
            });
          }
        }
      });
      // Filter out dismissed notifications
      const filtered = notificationsList.filter((notif, idx) => {
        const id = notif.id ?? idx;
        return !dismissedNotifIds.includes(String(id));
      });
      setNotifications(filtered);
      console.log('[StudentHomePage] Final notifications:', notificationsList);
      console.log('[StudentHomePage] courses fetched:', crs);
    } catch (e: any) {
      setError(e.message || "Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  }

  const pollingInterval = 30000; 
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    fetchAll();

    function startPolling() {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        if (document.visibilityState === 'visible') {
          fetchAll();
        }
      }, pollingInterval);
    }

    function handleVisibilityChange() {
      if (document.visibilityState === 'visible') {
        fetchAll();
        startPolling();
      } else if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);
    startPolling();

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [userId, refreshKey]);

  if (loading) return <div className="p-8">Loading dashboard...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;

  return (
    <section className="px-4 py-6 md:px-8 md:py-8 min-h-screen">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-8 -mt-8">
        <h1 className="text-2xl md:text-3xl font-bold text-[#040941] mb-8 tracking-tight">My Dashboard</h1>
        {/* Dashboard Summary Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-md p-4 flex items-center justify-between hover:shadow-lg transition-shadow">
            <div>
              <p className="text-sm font-medium text-gray-500">Applications</p>
              <p className="text-2xl font-bold text-gray-900">{applications.length}</p>
            </div>
            <FileText className="w-8 h-8 text-blue-500" />
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 flex items-center justify-between hover:shadow-lg transition-shadow">
            <div>
              <p className="text-sm font-medium text-gray-500">Accepted</p>
              <p className="text-2xl font-bold text-green-500">{applications.filter(a => a.allocation?.status==='CONFIRMED').length}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 flex items-center justify-between hover:shadow-lg transition-shadow">
            <div>
              <p className="text-sm font-medium text-gray-500">Rejected</p>
              <p className="text-2xl font-bold text-red-500">{applications.filter(a => a.allocation?.status==='REJECTED').length}</p>
            </div>
            <XCircle className="w-8 h-8 text-red-400" />
          </div>
        </div>
        <div className="flex flex-col md:flex-row gap-8">
        {/* Main Content */}
        <main className="flex-1 flex flex-col gap-10">
          {/* Profile Strip */}
          <div className="flex flex-col gap-8 items-stretch">
            <div className="flex-1 flex flex-col md:flex-row items-center gap-4 md:gap-6 bg-gradient-to-r from-blue-950 to-blue-800 text-white rounded-xl px-4 md:px-8 py-4 md:py-6 shadow-lg">
              <div className="h-24 w-24 rounded-full bg-gradient-to-br from-blue-200 to-blue-100 flex items-center justify-center text-4xl font-extrabold text-blue-900 border-4 border-white">
                <User className="w-12 h-12 text-blue-700" />
              </div>
              <div className="flex-1 flex flex-col gap-1">
                <div className="font-bold text-2xl flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-200" />
                  {student?.firstName} {student?.lastName}
                </div>
                <div className="text-xs flex items-center gap-1">
                  <FileText className="w-4 h-4 mr-1 text-blue-200" />
                  Student #: {student?.studentNum}
                </div>
                <div className="flex flex-wrap gap-2 text-sm mt-1">
                  <span className="bg-white/20 rounded px-3 py-1 w-fit flex items-center gap-1">
                    <FileText className="w-4 h-4 text-blue-200" />
                    {student?.email}
                  </span>
                  <span className="bg-white/20 rounded px-3 py-1 w-fit flex items-center gap-1">
                    <GraduationCap className="w-4 h-4 text-blue-200" />
                    Year: {student?.schoolYear ?? 'N/A'}
                  </span>
                  <span className="bg-white/20 rounded px-3 py-1 w-fit flex items-center gap-1">
                    <BookOpen className="w-4 h-4 text-blue-200" />
                    Enrolled: {student?.enrollmentYear ?? 'N/A'}
                  </span>
                </div>
                <Link
                  to={`/user/profile/${userId}`}
                  className="mt-2 inline-flex items-center gap-1 text-xs font-semibold bg-blue-700 hover:bg-blue-800 text-white rounded px-4 py-2 shadow transition-colors duration-150"
                  style={{ width: "fit-content" }}
                >
                  <User className="w-4 h-4" />
                  Edit Profile
                </Link>
              </div>
            </div>
          </div>

          {/* Applications Section */}
          <section>
            <h2 className="text-xl font-bold text-blue-900 mb-3 flex items-center gap-2"><FileText className="w-6 h-6 text-blue-400" />Recent Applications</h2>
            <div className="border-l-4 border-blue-200 pl-6 relative">
              {applications.length === 0 ? (
                <div className="text-slate-400 italic">No applications found.</div>
              ) : (
                <ul className="space-y-6">
                  {applications.map((app, idx) => {
                    // Stepper logic
                    let steps = [
                      { label: 'Submitted', key: 'SUBMITTED' },
                      { label: 'Offer Received', key: 'SENT' },
                      { label: '', key: '' }, 
                      { label: 'Confirmed', key: 'CONFIRMED_FINAL' }
                    ];
                    let currentStep = 0;
                    if (app.allocation?.status === 'SENT') currentStep = 1;
                    else if (app.allocation?.status === 'CONFIRMED') currentStep = 2;
                    else if (app.allocation?.status === 'REJECTED') currentStep = 2;
                    //  Accepted or Rejected
                    if (app.allocation?.status === 'CONFIRMED') {
                      steps[2] = { label: 'Accepted', key: 'CONFIRMED' };
                      currentStep = 2;
                    } else if (app.allocation?.status === 'REJECTED') {
                      steps[2] = { label: 'Rejected', key: 'REJECTED' };
                      currentStep = 2;
                    } else {
                      steps[2] = { label: 'Accepted/Rejected', key: 'PENDING' };
                    }
                    // Confirmed only if status is CONFIRMED
                    let visibleSteps = steps;
                    if (app.allocation?.status !== 'CONFIRMED') {
                      visibleSteps = steps.slice(0, 3);
                    } else {
                      currentStep = 3;
                    }
                    return (
                      <li key={app.id ?? idx} className="relative">
                        {/* horizontal stepper */}
                        <div className="flex items-center mb-2">
                          {visibleSteps.map((step, i) => (
                            <div key={step.key} className="flex items-center">
                              <div
                                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300
                                  ${i === visibleSteps.length - 1 && app.allocation?.status === 'CONFIRMED' ? 'bg-blue-700 border-blue-900 text-white' : i === currentStep ? 'bg-blue-500 border-blue-700 text-white' : i < currentStep ? 'bg-blue-200 border-blue-400 text-blue-700' : 'bg-gray-200 border-gray-300 text-gray-400'}`}
                                title={step.label}
                              >
                                {i + 1}
                              </div>
                              {i < visibleSteps.length - 1 && (
                                <div className={`h-1 w-8 ${i < currentStep ? 'bg-blue-400' : 'bg-gray-200'} mx-1 rounded transition-all duration-300`}></div>
                              )}
                            </div>
                          ))}
                        </div>
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 bg-blue-50/60 rounded-lg px-4 py-3">
                          <div className="flex flex-col">
                            <span className="font-medium text-blue-900">
                              {app.year} {app.semester} - {app.preferences?.join(", ") || "No preferences"}
                            </span>
                            <span className="text-xs text-gray-500">{new Date(app.timeSubmitted).toLocaleString()}</span>
                          </div>
                          <div className="flex flex-wrap items-center gap-3">
                            <span className="text-xs">Remote: {app.wantRemote ? "Yes" : "No"}</span>
                            <span className="text-xs">Hours: {app.wantWorkingHours}</span>
                            <span className="text-xs font-semibold">
                              Status: {
                                !app.allocation?.status ? "Submitted"
                                : app.allocation.status === "SENT" ? "Offer Received"
                                : app.allocation.status === "CONFIRMED" ? "Offer Accepted & Confirmed"
                                : app.allocation.status === "REJECTED" ? "Offer Rejected"
                                : app.allocation.status
                              }
                            </span>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
              <Link to="/user/student/view-applications" className="mt-6 inline-block text-blue-700 hover:underline text-sm">View All Applications</Link>
            </div>
          </section>

          {/* Profile Questions Section */}
          <section>
            <h2 className="text-xl font-bold text-yellow-700 mb-3 flex items-center gap-2"><FileQuestion className="w-6 h-6 text-yellow-500" />Profile Questions</h2>
            <div className="bg-yellow-50/60 rounded-lg px-6 py-4 shadow">
              {profileQuestions.length === 0 ? (
                <div className="text-slate-400 italic">No profile questions answered.</div>
              ) : (
                <ul className="space-y-1">
                  {profileQuestions.slice(0, 3).map((q) => (
                    <li key={q.id} className="text-sm">
                      <span className="font-medium">{q.description}</span>
                      {q.answers && q.answers.length > 0 && (
                        <span className="ml-2 text-gray-600">- {q.answers.map(a => a.description || a.answerText).filter(Boolean).join(', ')}</span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
              <Link to={`/user/student/questions/${userId}`} className="mt-4 inline-block text-yellow-700 hover:underline text-sm">Edit Profile Questions</Link>
            </div>
          </section>

          {/* Courses Taken Section */}
          <section>
            <h2 className="text-xl font-bold text-blue-900 mb-3 flex items-center gap-2"><BookOpen className="w-6 h-6 text-blue-400" />Courses Taken</h2>
            <div className="bg-blue-50/60 rounded-lg px-6 py-4 shadow">
              {courses && Array.isArray(courses.completedCourses) && courses.completedCourses.length > 0 ? (
                <ul className="flex flex-wrap gap-2">
                  {courses.completedCourses.map((c) => (
                    <li key={c.course.id} className="bg-blue-100 rounded px-3 py-1 text-xs font-medium text-blue-900">
                      {c.course.deptCode} {c.course.courseNum} - {c.course.name}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-slate-400 italic">No completed courses found.</div>
              )}
              <Link to="/user/student/courses" className="mt-4 inline-block text-blue-700 hover:underline text-sm">View All Courses</Link>
            </div>
          </section>
          </main>

        {/* Notification Panel on the right */}
        <aside className="w-full md:w-1/4 flex flex-col gap-4 bg-white/80 rounded-2xl shadow-lg p-4 min-h-[500px] border border-blue-100">
          <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center sm:justify-between mb-2 gap-2">
            <div className="flex items-center gap-2 flex-wrap">
               <Bell size={22} className="text-blue-400" />
               <h2 className="text-lg font-bold text-blue-900">Notifications</h2>
              <button
                onClick={() => setRefreshKey((k) => k + 1)}
                className="mt-1 sm:mt-0 ml-0 sm:ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 border border-blue-200"
                title="Refresh notifications"
              >
                Refresh
              </button>
            </div>
            <button onClick={() => setShowNotifications((v) => !v)} className="text-xs text-blue-700 hover:underline font-semibold">{showNotifications ? "Hide" : "Show"}</button>
          </div>
          {showNotifications && (
            <div className="flex-1 overflow-y-auto max-h-[400px] mt-2">
              {notifications.length === 0 ? (
                <div className="text-slate-400 italic">No notifications.</div>
              ) : (
                <ul className="space-y-3">
                  {notifications.map((notif, idx) => (
                    <li key={notif.id ?? idx} className="bg-blue-50/80 rounded-lg px-3 py-2 text-xs text-blue-900 border border-blue-100 flex flex-col gap-1 relative group">
                      <button
                        aria-label="Remove notification"
                        className="absolute top-1 right-1 text-blue-400 hover:text-red-500 text-lg font-bold opacity-60 hover:opacity-100 transition-opacity"
                        onClick={() => {
                      const removeId = String(notif.id ?? idx);
                      setNotifications((prev) => prev.filter((n, i) => String(n.id ?? i) !== removeId));
                      setDismissedNotifIds((prev) => {
                        const updated = [...prev, removeId];
                        localStorage.setItem('dismissedStudentNotifIds', JSON.stringify(updated));
                        return updated;
                      });
                        }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                      >
                        ×
                      </button>
                      <span className="font-semibold">{notif.title || "Notification"}</span>
                      <span>{notif.body || notif.message}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </aside>
      </div> 
      </div> 
    </section>
  );
}
