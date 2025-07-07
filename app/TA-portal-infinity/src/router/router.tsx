import { createBrowserRouter, Outlet } from "react-router-dom";
import { lazy, Suspense } from "react";
import App from "../App";
import RoleGuard from "../components/features/roleguard/RoleGuard";
import { UserRole } from "../interfaces/enum/UserRole";
import PublicLayout from "../components/layout/publicLayout/PublicLayout";

import { CoordinatorQuestionnairePage } from "../pages/coordinatorquestionnairepage/CoordinatorQuestionnairePage";

const TaProfilePage = lazy(() => import("../pages/taprofilepage/TaProfilePage"));
const CoursesTakenPage = lazy(() => import("../pages/taprofilepage/coursestakenpage/CoursesTakenPage"));
const StudentComparerPage = lazy(() => import("../pages/taprofilepage/comparerpage/StudentComparerPage"));
const StudentQualificationPage = lazy(() => import("../pages/taprofilepage/qualificationpage/StudentQualificationPage"));
const AddAllocationHistory = lazy(() => import("../pages/taprofilepage/addallocationhistory/AddAllocationHistory"));
const AddEnrolledCourse = lazy(() => import("../pages/taprofilepage/coursestakenpage/addenrolledcourse/AddEnrolledCourse"));

const InstructorProfilePage = lazy(() => import("../pages/instructorprofilepage/InstructorProfilePage"));
const InstructorNeedPage = lazy(() => import("../pages/instructorprofilepage/needpage/InstructorNeedPage"));
const InstructorComparerPage = lazy(() => import("../pages/instructorprofilepage/comparerpage/InstructorComparerPage"));
const InstructorQualificationPage = lazy(() => import("../pages/instructorprofilepage/qualificationpage/InstructorQualificationPage"));
const InstructorAddSectionPage = lazy(() => import("../pages/instructorprofilepage/needpage/addsectionpage/InstructorAddSectionPage"));
const InstructorAddNeedPage = lazy(() => import("../pages/instructorprofilepage/needpage/addneedpage/InstructorAddNeedPage"));

const ApplicationPage = lazy(() => import("../pages/applicationpage/ApplicationPage"));
const ApplicationViewPage = lazy(() => import("../pages/coordinatorpages/applicationviewpage/ApplicationViewPage"));

const StudentHomePage = lazy(() => import("../pages/student_homepage/StudentHomePage"));
const InstructorHomePage = lazy(() => import("../pages/instructor_homepage/InstructorHomePage"));
const CoordinatorHomePage = lazy(() => import("../pages/coordinator_homepage/CoordinatorHomePage"));

const AllocationPage = lazy(() => import("../pages/allocationpage/AllocationPage"));
const UserBrowsingPage = lazy(() => import("../pages/userbrowsingpage/UserBrowsingPage"));
const ManualCreateUserPage = lazy(() => import("../pages/userbrowsingpage/manualcreateuserpage/ManualCreateUserPage"));

const SectionListPage = lazy(() => import("../pages/coursepage/SectionListPage"));
const AddSectionPage = lazy(() => import("../pages/coursepage/AddSectionPage"));
const CourseProfilePage = lazy(() => import("../pages/courseprofilepage/CourseProfilePage"));


const LoginPage = lazy(() => import("../pages/loginPage/LoginPage"));
const SignUpPage = lazy(() => import("../pages/signupPage/SignUpPage"));
const ForgotPasswordPage = lazy(() => import("../pages/forgotpasswordpage/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("../pages/resetpasswordpage/ResetPasswordPage"));
const ErrorPage = lazy(() => import("../pages/errorpage/ErrorPage"));

export const router = createBrowserRouter([
  {
    path: "/user",
    element: <App />,
    errorElement: <Suspense fallback={<div>Loading...</div>}><ErrorPage /></Suspense>,
    children: [
      { path: "taprofile/:studentId", element: <Suspense fallback={<div>Loading...</div>}><TaProfilePage /></Suspense> },
      { path: "taprofile/:studentId/coursesTaken", element: <Suspense fallback={<div>Loading...</div>}><CoursesTakenPage /></Suspense> },
      { path: "taprofile/:studentId/compare", element: <Suspense fallback={<div>Loading...</div>}><StudentComparerPage /></Suspense> },
      { path: "taprofile/:studentId/qualifications", element: <Suspense fallback={<div>Loading...</div>}><StudentQualificationPage /></Suspense> },
      { path: "instructorprofile/:instructorId", element: <Suspense fallback={<div>Loading...</div>}><InstructorProfilePage /></Suspense> },
      { path: "instructorprofile/:instructorId/need", element: <Suspense fallback={<div>Loading...</div>}><InstructorNeedPage /></Suspense> },
      { path: "instructorprofile/:instructorId/compare", element: <Suspense fallback={<div>Loading...</div>}><InstructorComparerPage /></Suspense> },
      { path: "instructorprofile/:instructorId/qualifications", element: <Suspense fallback={<div>Loading...</div>}><InstructorQualificationPage /></Suspense> },
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
          { path: "view-applications", element: <Suspense fallback={<div>Loading...</div>}><ApplicationViewPage /></Suspense> },
          { path: "questions/:studentId", element: <Suspense fallback={<div>Loading...</div>}><TaQuestionnairePage /></Suspense> },
          { path: "addallocation", element: <Suspense fallback={<div>Loading...</div>}><AddAllocationHistory /></Suspense> },
          { path: "addenrollment", element: <Suspense fallback={<div>Loading...</div>}><AddEnrolledCourse /></Suspense> },
          { path: "error", element: <Suspense fallback={<div>Loading...</div>}><ErrorPage /></Suspense> },
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
          { path: "questions", element: <Suspense fallback={<div>Loading...</div>}><CoordinatorQuestionnairePage /></Suspense> },
          { path: "browseuser", element: <Suspense fallback={<div>Loading...</div>}><UserBrowsingPage /></Suspense> },
          { path: "browseuser/newuser", element: <Suspense fallback={<div>Loading...</div>}><ManualCreateUserPage /></Suspense> },
          { path: "sections", element: <Suspense fallback={<div>Loading...</div>}><SectionListPage /></Suspense> },
          { path: "sections/add", element: <Suspense fallback={<div>Loading...</div>}><AddSectionPage /></Suspense> },
          { path: "applications", element: <Suspense fallback={<div>Loading...</div>}><ApplicationViewPage /></Suspense> },
          { path: "allocation", element: <Suspense fallback={<div>Loading...</div>}><AllocationPage /></Suspense> },
          { path: "student/questions/:studentId", element: <Suspense fallback={<div>Loading...</div>}><TaQuestionnairePage /></Suspense> },
          { path: "error", element: <Suspense fallback={<div>Loading...</div>}><ErrorPage /></Suspense> },
        ],
      },

      { path: "*", element: <Suspense fallback={<div>Loading...</div>}><ErrorPage /></Suspense> },
    ],
  },

  {
    path: "/",
    element: <PublicLayout />,
    children: [
      { path: "", element: <Suspense fallback={<div>Loading...</div>}><LoginPage /></Suspense> },
      { path: "login", element: <Suspense fallback={<div>Loading...</div>}><LoginPage /></Suspense> },
      { path: "signup", element: <Suspense fallback={<div>Loading...</div>}><SignUpPage /></Suspense> },
      { path: "forgot-password", element: <Suspense fallback={<div>Loading...</div>}><ForgotPasswordPage /></Suspense> },
      { path: "reset-password", element: <Suspense fallback={<div>Loading...</div>}><ResetPasswordPage /></Suspense> },
      { path: "*", element: <Suspense fallback={<div>Loading...</div>}><ErrorPage /></Suspense> },
    ],
  },
]);
