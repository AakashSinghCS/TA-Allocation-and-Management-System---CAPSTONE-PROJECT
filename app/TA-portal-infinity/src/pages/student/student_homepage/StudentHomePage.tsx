import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchStudentDetails } from "../../../api/student/fetchStudentDetails";
import { fetchApplicationsByStudent } from "../../../api/application/FetchApplicationsByStudent";
import { fetchAllStudentQualifications } from "../../../api/student/qualification/fetchAllStudentQualifications";
import { fetchAllStudentEnrollmentOverview } from "../../../api/student/enrollment/fetchAllStudentCompletedCourses";
import { fetchAllStudentQuestions } from "../../../api/question/fetchAllStudentQuestion";
import { fetchAllocationByApplicationId } from "../../../api/allocation/fetchAllocationByApplicationId";
// import { fetchAllNotificationsForStudent } from "../../../api/notification/fetchAllNotificationsForStudent";
import { useAuth } from "../../../context/AuthContext";
import type { ApplicationDto } from "../../../interfaces/application/Application";
import type { Student } from "../../../interfaces/user/Student";
import type { ProfileQuestion } from "../../../interfaces/question/ProfileQuestion";
import type { CourseEnrollmentOverview } from "../../../interfaces/course/CourseEnrollment";
import { Bell, User, GraduationCap, FileText, BookOpen, FileQuestion, Award } from "lucide-react";

export default function StudentHomePage() {
  const { userId } = useAuth();
  const [student, setStudent] = useState<Student | null>(null);
  type ApplicationWithAllocation = ApplicationDto & { allocation?: { status?: string } };
  const [applications, setApplications] = useState<ApplicationWithAllocation[]>([]);
  const [qualifications, setQualifications] = useState<number[] | null>(null);
  const [courses, setCourses] = useState<CourseEnrollmentOverview | null>(null);
  const [profileQuestions, setProfileQuestions] = useState<ProfileQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<any[]>([
    {
      id: 1,
      title: "Welcome!",
      body: "Your student dashboard is now live.",
      time: new Date().toISOString(),
    },
    {
      id: 2,
      title: "Application Update",
      body: "Your recent TA application has been submitted.",
      time: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    },
    {
      id: 3,
      title: "Profile Reminder",
      body: "Don't forget to update your profile for the new semester!",
      time: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    },
  ]);
  const [showNotifications, setShowNotifications] = useState(true);
  // const navigate = useNavigate();

  useEffect(() => {
    async function fetchAll() {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token") || "";
        const [stu, apps, quals, crs, qs] = await Promise.all([
          fetchStudentDetails<Student>(userId),
          fetchApplicationsByStudent(userId, token),
          fetchAllStudentQualifications(userId),
          fetchAllStudentEnrollmentOverview(userId),
          fetchAllStudentQuestions(userId),
        ]);
        setStudent(stu);
        setQualifications(quals);
        setCourses(crs);
        setProfileQuestions(qs || []);
        // Fetch allocations for the first 3 applications
        const appsWithAlloc = await Promise.all(
          apps.slice(0, 3).map(async (app) => {
            let allocation: { status?: string } | undefined = undefined;
            try {
              const allocs = await fetchAllocationByApplicationId(app.id ?? app.applicationId ?? 0, token);
              if (allocs && allocs.length > 0) {
                allocation = { status: allocs[0].status };
              }
            } catch {}
            return { ...app, allocation };
          })
        );
        setApplications(appsWithAlloc);
        console.log("[StudentHomePage] courses fetched:", crs);
      } catch (e: any) {
        setError(e.message || "Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, [userId]);

  if (loading) return <div className="p-8">Loading dashboard...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;

  // dashboard with notification panel on the right
  return (
    <section className="p-0 md:p-8 min-h-screen -mt-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8 py-8">
        {/* Main Content */}
        <main className="flex-1 flex flex-col gap-10">
          {/* Profile & Qualifications Strip */}
          <div className="flex flex-col md:flex-row gap-8 items-stretch">
            <div className="flex-1 flex items-center gap-6 bg-gradient-to-r from-blue-950 to-blue-800 text-white rounded-xl px-8 py-6 shadow-lg">
              <div className="h-24 w-24 rounded-full bg-gradient-to-br from-blue-200 to-blue-100 flex items-center justify-center text-4xl font-extrabold text-blue-900 border-4 border-white">
                <User className="w-12 h-12 text-blue-700" />
              </div>
              <div className="flex-1 flex flex-col gap-1">
                <div className="font-bold text-2xl flex items-center gap-2"><User className="w-5 h-5 text-blue-200" />{student?.firstName} {student?.lastName}</div>
                <div className="text-xs flex items-center gap-1"><FileText className="w-4 h-4 mr-1 text-blue-200" />Student #: {student?.studentNum}</div>
                <div className="flex flex-wrap gap-2 text-sm mt-1">
                  <span className="bg-white/20 rounded px-3 py-1 w-fit flex items-center gap-1"><FileText className="w-4 h-4 text-blue-200" />{student?.email}</span>
                  <span className="bg-white/20 rounded px-3 py-1 w-fit flex items-center gap-1"><GraduationCap className="w-4 h-4 text-blue-200" />Year: {student?.schoolYear ?? 'N/A'}</span>
                  <span className="bg-white/20 rounded px-3 py-1 w-fit flex items-center gap-1"><BookOpen className="w-4 h-4 text-blue-200" />Enrolled: {student?.enrollmentYear ?? 'N/A'}</span>
                </div>
                <Link to={`/user/taprofile/${userId}`} className="mt-2 inline-block text-blue-100 hover:underline text-xs font-semibold bg-blue-700/40 rounded px-3 py-1 shadow flex items-center gap-1">Edit Profile</Link>
              </div>
              <div className="flex flex-col items-end justify-between min-w-[180px]">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="w-5 h-5 text-green-100" />
                  <h2 className="text-lg font-bold text-green-100 tracking-wide">Qualifications</h2>
                </div>
                {qualifications && qualifications.length > 0 ? (
                  <ul className="flex flex-wrap gap-2 mt-1">
                    {qualifications.slice(0, 6).map((q) => (
                      <li key={q} className="flex items-center gap-1 bg-green-100/80 rounded-full px-3 py-1 text-green-900 font-semibold text-xs">
                        <Award className="w-4 h-4 text-green-500" />
                        <span className="inline-block bg-green-400 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold">{q}</span>
                        Qual
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-green-100/80 italic mt-2">No qualifications</div>
                )}
                <Link to={`/user/taprofile/${userId}/qualifications`} className="mt-2 text-green-100 hover:underline text-xs font-semibold flex items-center gap-1"><Award className="w-4 h-4 text-green-100" />View All</Link>
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
                  {applications.map((app, idx) => (
                    <li key={app.id ?? idx} className="relative">
                      <span className="absolute -left-7 top-2 w-4 h-4 rounded-full bg-blue-400 border-2 border-white"></span>
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 bg-blue-50/60 rounded-lg px-4 py-3">
                        <div className="flex flex-col">
                          <span className="font-medium text-blue-900">{app.preferences?.join(", ") || "No preferences"}</span>
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
                  ))}
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
              <Link to={`/user/taprofile/${userId}`} className="mt-4 inline-block text-yellow-700 hover:underline text-sm">Edit Profile Questions</Link>
            </div>
          </section>

          {/* Courses Taken Section */}
          <section>
            <h2 className="text-xl font-bold text-blue-900 mb-3 flex items-center gap-2"><BookOpen className="w-6 h-6 text-blue-400" />Courses Taken</h2>
            <div className="bg-blue-50/60 rounded-lg px-6 py-4 shadow">
              {courses && Array.isArray(courses.completedCourses) && courses.completedCourses.length > 0 ? (
                <ul className="flex flex-wrap gap-2">
                  {courses.completedCourses.slice(0, 8).map((c) => (
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
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Bell size={22} className="text-blue-400" />
              <h2 className="text-lg font-bold text-blue-900">Notifications</h2>
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
                    <li key={notif.id ?? idx} className="bg-blue-50/80 rounded-lg px-3 py-2 text-xs text-blue-900 border border-blue-100 flex flex-col gap-1">
                      <span className="font-semibold">{notif.title || "Notification"}</span>
                      <span>{notif.body || notif.message}</span>
                      <span className="text-[10px] text-gray-500 self-end">{notif.time ? new Date(notif.time).toLocaleString() : ""}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}
