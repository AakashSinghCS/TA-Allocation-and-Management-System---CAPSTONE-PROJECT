
import { createBrowserRouter, Outlet } from "react-router-dom";
import App from "../App";

import PublicLayout from "../components/layout/publicLayout/PublicLayout";
import CoursesTakenPage from "../pages/taprofilepage/coursestakenpage/CoursesTakenPage";
import StudentComparerPage from "../pages/taprofilepage/comparerpage/StudentComparerPage";
import InstructorProfilePage from "../pages/instructorprofilepage/InstructorProfilePage";
import InstructorNeedPage from "../pages/instructorprofilepage/needpage/InstructorNeedPage";
import InstructorComparerPage from "../pages/instructorprofilepage/comparerpage/InstructorComparerPage";
import LoginPage from "../pages/loginPage/LoginPage";
import ErrorPage from "../pages/errorpage/ErrorPage";
import StudentHomePage from "../pages/student/student_homepage/StudentHomePage";
import ApplicationPage from "../pages/applicationpage/ApplicationPage";
import InstructorHomePage from "../pages/instructor_homepage/InstructorHomePage";
import CoordinatorHomePage from "../pages/coordinator_homepage/CoordinatorHomePage";
import TaProfilePage from "../pages/taprofilepage/TaProfilePage";
import { TaQuestionnairePage } from "../pages/taquestionnairepage/TaQuestionnairePage";
import { CoordinatorQuestionnairePage } from "../pages/coordinatorquestionnairepage/CoordinatorQuestionnairePage";
import RoleGuard from "../components/features/roleguard/RoleGuard";
import { UserRole } from "../interfaces/enum/UserRole";
import AllocationPage from "../pages/allocationpage/AllocationPage";
import InstructorQualificationPage from "../pages/instructorprofilepage/qualificationpage/InstructorQualificationPage";
import StudentQualificationPage from "../pages/taprofilepage/qualificationpage/StudentQualificationPage";
import ForgotPasswordPage from "../pages/forgotpasswordpage/ForgotPasswordPage";
import ResetPasswordPage from "../pages/resetpasswordpage/ResetPasswordPage";
import UserBrowsingPage from "../pages/userbrowsingpage/UserBrowsingPage";
import ManualCreateUserPage from "../pages/userbrowsingpage/manualcreateuserpage/ManualCreateUserPage";
import SignUpPage from "../pages/signupPage/SignUpPage";
import CourseProfilePage from "../pages/courseprofilepage/CourseProfilePage";
import SectionListPage from "../pages/coursepage/SectionListPage";
import AddSectionPage from "../pages/coursepage/AddSectionPage";
import InstructorAddSectionPage from "../pages/instructorprofilepage/needpage/addsectionpage/InstructorAddSectionPage";
import InstructorAddNeedPage from "../pages/instructorprofilepage/needpage/addneedpage/InstructorAddNeedPage";
import AddAllocationHistory from "../pages/taprofilepage/addallocationhistory/AddAllocationHistory";
import AddEnrolledCourse from "../pages/taprofilepage/coursestakenpage/addenrolledcourse/AddEnrolledCourse";
import ViewApplicationPage from "../pages/student/viewapplicationpage/ViewApplicationPage";
import ApplicationViewPage from "../pages/coordinatorpages/applicationviewpage/ApplicationViewPage";

export const router = createBrowserRouter([
  {
    path: "/user",
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      { path: "taprofile/:studentId", element: <TaProfilePage /> },
      { path: "taprofile/:studentId/coursesTaken", element: <CoursesTakenPage /> },
      { path: "taprofile/:studentId/compare", element: <StudentComparerPage /> },
      { path: "taprofile/:studentId/qualifications", element: <StudentQualificationPage /> },
      { path: "instructorprofile/:instructorId", element: <InstructorProfilePage /> },
      { path: "instructorprofile/:instructorId/need", element: <InstructorNeedPage /> },
      { path: "instructorprofile/:instructorId/compare", element: <InstructorComparerPage /> },
      { path: "instructorprofile/:instructorId/qualifications", element: <InstructorQualificationPage /> },

      { path: "sectionprofile/:sectionId", element: <CourseProfilePage /> },
      { path: "courseprofile/:courseId", element: <CourseProfilePage /> },
      // STUDENT routes
      {
        path: "student",
        element: (
          <RoleGuard role={UserRole.STUDENT}>
            <Outlet />
          </RoleGuard>
        ),
        children: [
          { path: "home", element: <StudentHomePage /> },
          { path: "application", element: <ApplicationPage /> },
          { path: "view-applications", element: <ViewApplicationPage /> },
          { path: "questions/:studentId", element: <TaQuestionnairePage /> },
          { path: "addallocation", element: <AddAllocationHistory/>},
          { path: "addenrollment", element: <AddEnrolledCourse/>},
          { path: "error", element: <ErrorPage /> },
        ],
      },

      // INSTRUCTOR routes
      {
        path: "instructor",
        element: (
          <RoleGuard role={UserRole.INSTRUCTOR}>
            <Outlet />
          </RoleGuard>
        ),
        children: [
          { path: "home", element: <InstructorHomePage /> },
          { path: "browseuser", element: <UserBrowsingPage /> },
          { path: "addsection", element: <InstructorAddSectionPage /> },
          { path: "updateprereqcourses/:courseId/:year/:semester", element: <InstructorAddSectionPage mode="update"/> },
          { path: "addneed/:sectionId", element: <InstructorAddNeedPage /> },
          { path: "error", element: <ErrorPage /> },
        ],
      },

      // COORDINATOR routes
      {
        path: "coordinator",
        element: (
          <RoleGuard role={UserRole.COORDINATOR || UserRole.ADMIN}>
            <Outlet />
          </RoleGuard>
        ),
        children: [
          { path: "home", element: <CoordinatorHomePage /> },
          { path: "questions", element: < CoordinatorQuestionnairePage/> },
          { path: "browseuser", element: <UserBrowsingPage /> },
          { path: "browseuser/newuser", element: < ManualCreateUserPage/> },
          { path: "sections", element: < SectionListPage/> },
          { path: "sections/add", element: < AddSectionPage/> },
          { path: "applications", element: <ApplicationViewPage /> },
          {path: "allocation", element: <AllocationPage />},
          { path: "student/questions/:studentId", element: < TaQuestionnairePage/> }, //TEMPORARY for development
          { path: "error", element: <ErrorPage /> },
        ],
      },
      { path: "*", element: <ErrorPage /> },
    ],
  },

  // Public (no auth required)
  {
    path: "/",
    element: <PublicLayout />,
    children: [
      { path: "", element: <LoginPage /> },
      { path: "login", element: <LoginPage /> },
      // { path: "signup", element: <SignUpPage /> },
      { path: "signup", element: <SignUpPage /> },
      { path: "forgot-password", element: <ForgotPasswordPage /> },
      { path: "reset-password", element: <ResetPasswordPage /> },
      { path: "*", element: <ErrorPage /> },
    ],
  },
]);
