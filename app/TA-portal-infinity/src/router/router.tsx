import { createBrowserRouter, Outlet } from "react-router-dom";
import { lazy, Suspense } from "react";
import App from "../App";
import RoleGuard from "../components/features/roleguard/RoleGuard";
import { UserRole } from "../interfaces/enum/UserRole";
import PublicLayout from "../components/layout/publicLayout/PublicLayout";


const CoordinatorQuestionnairePage = lazy(()=> import("../pages/coordinator/coordinatorquestionnairepage/CoordinatorQuestionnairePage"));
const TaQuestionnairePage = lazy(()=>import("../pages/student/taquestionnairepage/TaQuestionnairePage"));
const ProfilePage = lazy(()=> import("../pages/auth/profilepage/ProfilePage"));
const AllocationHistoryPage = lazy(()=>import("../pages/student/allocationhistorypage/AllocationHistoryPage"));
const ViewProfileQuestionsPage = lazy(()=> import("../pages/student/viewprofilequestionspage/ViewProfileQuestionsPage"));
const AuditLogsPage = lazy(()=> import("../pages/admin/audit/auditlogspage/AuditLogsPage"));
const CoursesTakenPage = lazy(() => import("../pages/student/taprofilepage/coursestakenpage/CoursesTakenPage"));
const StudentComparerPage = lazy(() => import("../pages/student/taprofilepage/comparerpage/StudentComparerPage"));
const StudentQualificationPage = lazy(() => import("../pages/student/taprofilepage/qualificationpage/StudentQualificationPage"));
const AddAllocationHistory = lazy(() => import("../pages/student/taprofilepage/addallocationhistory/AddAllocationHistory"));
const AddEnrolledCourse = lazy(() => import("../pages/student/taprofilepage/coursestakenpage/addenrolledcourse/AddEnrolledCourse"));
const StudentHomePage = lazy(() => import("../pages/student/student_homepage/StudentHomePage"));
const ApplicationPage = lazy(() => import("../pages/student/applicationpage/ApplicationPage"));
const ViewApplicationPage = lazy(() => import("../pages/student/viewapplicationpage/ViewApplicationPage"));
const ScheduleViewer = lazy(() => import("../pages/student/scheduleviewer/ScheduleViewer"));
const TranscriptUploadPage = lazy(() => import("../pages/student/transcriptuploadpage/TranscriptUploadPage"));
const LabSkillsPage = lazy(() => import("../pages/student/taprofilepage/qualificationpage/StudentQualificationPage"));

const InstructorNeedPage = lazy(() => import("../pages/instructor/instructorprofilepage/needpage/InstructorNeedPage"));
const InstructorQualificationPage = lazy(() => import("../pages/instructor/instructorprofilepage/qualificationpage/InstructorQualificationPage"));
const InstructorAddSectionPage = lazy(() => import("../pages/instructor/instructorprofilepage/needpage/addsectionpage/InstructorAddSectionPage"));
const InstructorAddNeedPage = lazy(() => import("../pages/instructor/instructorprofilepage/needpage/addneedpage/InstructorAddNeedPage"));
const InstructorHomePage = lazy(() => import("../pages/instructor/instructorhomepage/InstructorHomePage"));
const StudentsAllocatedPage = lazy(() => import("../pages/instructor/instructorprofilepage/studentsallocatedpage/StudentsAllocatedPage"));

const CoordinatorHomePage = lazy(() => import("../pages/coordinator/coordinator_homepage/CoordinatorHomePage"));
const AllocationPage = lazy(() => import("../pages/coordinator/allocationpage/AllocationPage"));
const ApplicationViewPage = lazy(() => import("../pages/coordinator/applicationviewpage/ApplicationViewPage"));
const UserBrowsingPage = lazy(() => import("../pages/coordinator/userbrowsingpage/UserBrowsingPage"));
const ManualCreateUserPage = lazy(() => import("../pages/coordinator/userbrowsingpage/manualcreateuserpage/ManualCreateUserPage"));
const GlobalConfigPage = lazy(() => import("../pages/admin/globalconfig/GlobalConfigPage"));
const TranscriptManagementPage = lazy(() => import("../pages/coordinator/transcriptmanagementpage/TranscriptManagementPage"));

const CourseProfilePage = lazy(() => import("../pages/course/courseprofilepage/CourseProfilePage"));
const SectionListPage = lazy(() => import("../pages/course/sectionlistpage/SectionListPage"));
const AddSectionPage = lazy(() => import("../pages/course/addsectionpage/AddSectionPage"));

const LoginPage = lazy(() => import("../pages/auth/loginPage/LoginPage"));
const SignUpPage = lazy(() => import("../pages/auth/signupPage/SignUpPage"));
const ForgotPasswordPage = lazy(() => import("../pages/auth/forgotpasswordpage/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("../pages/auth/resetpasswordpage/ResetPasswordPage"));
const ErrorPage = lazy(() => import("../pages/auth/errorpage/ErrorPage"));

const ExportToCSVPage = lazy(() => import("../pages/csv/exportpage/ExportToCSVPage"));

const GraduateAvailabilityPage = lazy(() => import("../pages/student/graduateavailabilitypage/GraduateAvailabilityPage"));

const CreateExamPage = lazy(() => import("../pages/coordinator/exampage/CreateExamPage"));

export const router = createBrowserRouter([
  {
    path: "/user",
    element: <App />,
    errorElement: <Suspense fallback={<div>Loading...</div>}><ErrorPage /></Suspense>,
    children: [
      { path : "profile/:userId", element: <Suspense fallback={<div>Loading...</div>}><ProfilePage /></Suspense> },
      // { path: "taprofile/:studentId", element: <Suspense fallback={<div>Loading...</div>}><TaProfilePage /></Suspense> },
      // { path: "taprofile/:userId/coursesTaken", element: <Suspense fallback={<div>Loading...</div>}><CoursesTakenPage /></Suspense> },
      { path: "taprofile/:userId/allocationHistory", element: <Suspense fallback={<div>Loading...</div>}><AllocationHistoryPage /></Suspense> },
      { path: "taprofile/:userId/labSkills", element: <Suspense fallback={<div>Loading...</div>}><LabSkillsPage /></Suspense> },
      { path: "taprofile/:userId/transcript-upload", element: <Suspense fallback={<div>Loading...</div>}><TranscriptUploadPage /></Suspense> },
      { path: "taprofile/:userId/profileQuestions", element: <Suspense fallback={<div>Loading...</div>}><ViewProfileQuestionsPage /></Suspense> },
      // { path: "taprofile/:userId/compare", element: <Suspense fallback={<div>Loading...</div>}><StudentComparerPage /></Suspense> },
      { path: "taprofile/:userId/qualifications", element: <Suspense fallback={<div>Loading...</div>}><StudentQualificationPage /></Suspense> },
      // { path: "instructorprofile/:instructorId", element: <Suspense fallback={<div>Loading...</div>}><InstructorProfilePage /></Suspense> },
      { path: "instructorprofile/:userId/need", element: <Suspense fallback={<div>Loading...</div>}><InstructorNeedPage /></Suspense> },
      { path: "instructorprofile/:userId/students", element: <Suspense fallback={<div>Loading...</div>}><StudentsAllocatedPage /></Suspense> },
      // { path: "instructorprofile/:instructorId/compare", element: <Suspense fallback={<div>Loading...</div>}><InstructorComparerPage /></Suspense> },
      { path: "instructorprofile/:userId/qualifications", element: <Suspense fallback={<div>Loading...</div>}><InstructorQualificationPage /></Suspense> },
      { path: "sectionprofile/:sectionId", element: <Suspense fallback={<div>Loading...</div>}><CourseProfilePage /></Suspense> },
      { path: "courseprofile/:courseId", element: <Suspense fallback={<div>Loading...</div>}><CourseProfilePage /></Suspense> },

      {
        path: "student",
        element: (
          <RoleGuard role={UserRole.STUDENT}>
            <Outlet />
          </RoleGuard>
        ),
        children: [
          { path: "home", element: <Suspense fallback={<div>Loading...</div>}><StudentHomePage /></Suspense> },
          { path: "application", element: <Suspense fallback={<div>Loading...</div>}><ApplicationPage /></Suspense> },
          { path: "view-applications", element: <Suspense fallback={<div>Loading...</div>}><ViewApplicationPage /></Suspense> },
        //  { path: "taprofile/:userId/transcript-upload", element: <Suspense fallback={<div>Loading...</div>}><TranscriptUploadPage /></Suspense> },

          { path: "schedule", element: <Suspense fallback={<div>Loading...</div>}><ScheduleViewer  /></Suspense> },
          { path: "questions/:studentId", element: <TaQuestionnairePage /> },
          { path: "questions/:studentId", element: <Suspense fallback={<div>Loading...</div>}><TaQuestionnairePage /></Suspense> },

          { path: "addallocation", element: <Suspense fallback={<div>Loading...</div>}><AddAllocationHistory /></Suspense> },
          { path: "addenrollment", element: <Suspense fallback={<div>Loading...</div>}><AddEnrolledCourse /></Suspense> },
          { path: "error", element: <Suspense fallback={<div>Loading...</div>}><ErrorPage /></Suspense> },
          { path: "availability", element: <Suspense fallback={<div>Loading...</div>}><GraduateAvailabilityPage /></Suspense>},
        ],
      },

      {
        path: "instructor",
        element: (
          <RoleGuard role={UserRole.INSTRUCTOR}>
            <Outlet />
          </RoleGuard>
        ),
        children: [
          { path: "home", element: <Suspense fallback={<div>Loading...</div>}><InstructorHomePage /></Suspense> },
          { path: "browseuser", element: <Suspense fallback={<div>Loading...</div>}><UserBrowsingPage /></Suspense> },
          { path: "addsection", element: <Suspense fallback={<div>Loading...</div>}><InstructorAddSectionPage /></Suspense> },
          { path: "updateprereqcourses/:courseId/:year/:semester", element: <Suspense fallback={<div>Loading...</div>}><InstructorAddSectionPage mode="update" /></Suspense> },
          { path: "addneed/:sectionId", element: <Suspense fallback={<div>Loading...</div>}><InstructorAddNeedPage /></Suspense> },
          { path: "error", element: <Suspense fallback={<div>Loading...</div>}><ErrorPage /></Suspense> },
        ],
      },

      {
        path: "coordinator",
        element: (
          <RoleGuard role={UserRole.COORDINATOR || UserRole.ADMIN}>
            <Outlet />
          </RoleGuard>
        ),
        children: [
          { path: "home", element: <Suspense fallback={<div>Loading...</div>}><CoordinatorHomePage /></Suspense> },
          { path: "questions", element: <CoordinatorQuestionnairePage />},
          { path: "browseuser", element: <Suspense fallback={<div>Loading...</div>}><UserBrowsingPage /></Suspense> },
          { path: "browseuser/newuser", element: <Suspense fallback={<div>Loading...</div>}><ManualCreateUserPage /></Suspense> },
          { path: "sections", element: <Suspense fallback={<div>Loading...</div>}><SectionListPage /></Suspense> },
          { path: "sections/add", element: <Suspense fallback={<div>Loading...</div>}><AddSectionPage /></Suspense> },
          { path: "sections/export", element: <Suspense fallback={<div>Loading...</div>}><ExportToCSVPage /></Suspense> },
          { path: "applications", element: <Suspense fallback={<div>Loading...</div>}><ApplicationViewPage /></Suspense> },
          { path: "allocation", element: <Suspense fallback={<div>Loading...</div>}><AllocationPage /></Suspense> },
          { path: "transcripts", element: <Suspense fallback={<div>Loading...</div>}><TranscriptManagementPage /></Suspense> },
          { path: "globalconfig", element: <Suspense fallback={<div>Loading...</div>}><GlobalConfigPage /></Suspense> },
          { path: "audit", element: <Suspense fallback={<div>Loading...</div>}><AuditLogsPage /></Suspense> },
          { path: "error", element: <Suspense fallback={<div>Loading...</div>}><ErrorPage /></Suspense> },
          { path: "create-exam", element: <Suspense fallback={<div>Loading...</div>}><CreateExamPage /></Suspense> },
        ],
      },

      { path: "*", element: <Suspense fallback={<div>Loading...</div>}><ErrorPage /></Suspense> },
    ],
  },

  {
    path: "/",
    element: <PublicLayout />,
    children: [
      { path: "", element: <LoginPage /> },
      { path: "login", element: <LoginPage /> },
      { path: "signup", element: <SignUpPage /> },
      { path: "forgot-password", element: <ForgotPasswordPage /> },
      { path: "reset-password", element: <ResetPasswordPage /> },
      { path: "*", element: <ErrorPage /> },
    ],
  },
]);
