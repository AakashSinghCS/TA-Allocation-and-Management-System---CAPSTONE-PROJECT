
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
import StudentHomePage from "../pages/student_homepage/StudentHomePage";
import ApplicationPage from "../pages/applicationpage/ApplicationPage";
import InstructorHomePage from "../pages/instructor_homepage/InstructorHomePage";
import CoordinatorHomePage from "../pages/coordinator_homepage/CoordinatorHomePage";
import TaProfilePage from "../pages/taprofilepage/TaProfilePage";
import { TaQuestionnairePage } from "../pages/taquestionnairepage/TaQuestionnairePage";
import { CoordinatorQuestionnairePage } from "../pages/coordinatorquestionnairepage/CoordinatorQuestionnairePage";
import RoleGuard from "../components/features/roleguard/RoleGuard";
import { UserRole } from "../interfaces/enum/UserRole";
import InstructorQualificationPage from "../pages/instructorprofilepage/qualificationpage/InstructorQualificationPage";
import StudentQualificationPage from "../pages/taprofilepage/qualificationpage/StudentQualificationPage";
import UserBrowsingPage from "../pages/userbrowsingpage/UserBrowsingPage";
import ManualCreateUserPage from "../pages/userbrowsingpage/manualcreateuserpage/ManualCreateUserPage";
import SignUpPage from "../pages/signupPage/SignUpPage";

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
          { path: "questions/:studentId", element: < TaQuestionnairePage/> },
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
          { path: "error", element: <ErrorPage /> },
        ],
      },

      // COORDINATOR routes
      {
        path: "coordinator",
        element: (
          <RoleGuard role={UserRole.COORDINATOR}>
            <Outlet />
          </RoleGuard>
        ),
        children: [
          { path: "home", element: <CoordinatorHomePage /> },
          { path: "questions", element: < CoordinatorQuestionnairePage/> },
          { path: "browseuser", element: <UserBrowsingPage /> },
          { path: "browseuser/newuser", element: < ManualCreateUserPage/> },
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
      { path: "*", element: <ErrorPage /> },
    ],
  },
]);
