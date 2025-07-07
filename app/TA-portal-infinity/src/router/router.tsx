import { createBrowserRouter, Outlet } from "react-router-dom";
import { lazy, Suspense } from "react";
import App from "../App";
import RoleGuard from "../components/features/roleguard/RoleGuard";
import { UserRole } from "../interfaces/enum/UserRole";
import PublicLayout from "../components/layout/publicLayout/PublicLayout";

import CoursesTakenPage from "../pages/student/taprofilepage/coursestakenpage/CoursesTakenPage";
import StudentComparerPage from "../pages/student/taprofilepage/comparerpage/StudentComparerPage";
import InstructorProfilePage from "../pages/instructor/instructorprofilepage/InstructorProfilePage";
import InstructorNeedPage from "../pages/instructor/instructorprofilepage/needpage/InstructorNeedPage";
import InstructorComparerPage from "../pages/instructor/instructorprofilepage/comparerpage/InstructorComparerPage";
import LoginPage from "../pages/auth/loginPage/LoginPage";
import ErrorPage from "../pages/auth/errorpage/ErrorPage";
import StudentHomePage from "../pages/student/student_homepage/StudentHomePage";
import ApplicationPage from "../pages/student/applicationpage/ApplicationPage";
import InstructorHomePage from "../pages/instructor/instructorhomepage/InstructorHomePage";
import CoordinatorHomePage from "../pages/coordinator/coordinator_homepage/CoordinatorHomePage";
import TaProfilePage from "../pages/student/taprofilepage/TaProfilePage";
import { TaQuestionnairePage } from "../pages/student/taquestionnairepage/TaQuestionnairePage";
import { CoordinatorQuestionnairePage } from "../pages/coordinator/coordinatorquestionnairepage/CoordinatorQuestionnairePage";
import AllocationPage from "../pages/coordinator/allocationpage/AllocationPage";
import InstructorQualificationPage from "../pages/instructor/instructorprofilepage/qualificationpage/InstructorQualificationPage";
import StudentQualificationPage from "../pages/student/taprofilepage/qualificationpage/StudentQualificationPage";
import ForgotPasswordPage from "../pages/auth/forgotpasswordpage/ForgotPasswordPage";
import ResetPasswordPage from "../pages/auth/resetpasswordpage/ResetPasswordPage";
import UserBrowsingPage from "../pages/coordinator/userbrowsingpage/UserBrowsingPage";
import ManualCreateUserPage from "../pages/coordinator/userbrowsingpage/manualcreateuserpage/ManualCreateUserPage";
import SignUpPage from "../pages/auth/signupPage/SignUpPage";
import CourseProfilePage from "../pages/course/courseprofilepage/CourseProfilePage";
import SectionListPage from "../pages/course/sectionlistpage/SectionListPage";
import AddSectionPage from "../pages/course/addsectionpage/AddSectionPage";
import InstructorAddSectionPage from "../pages/instructor/instructorprofilepage/needpage/addsectionpage/InstructorAddSectionPage";
import InstructorAddNeedPage from "../pages/instructor/instructorprofilepage/needpage/addneedpage/InstructorAddNeedPage";
import AddAllocationHistory from "../pages/student/taprofilepage/addallocationhistory/AddAllocationHistory";
import AddEnrolledCourse from "../pages/student/taprofilepage/coursestakenpage/addenrolledcourse/AddEnrolledCourse";
import ApplicationViewPage from "../pages/coordinator/applicationviewpage/ApplicationViewPage";

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
