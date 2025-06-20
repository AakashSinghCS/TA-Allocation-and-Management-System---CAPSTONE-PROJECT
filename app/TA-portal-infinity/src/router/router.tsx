
import { createBrowserRouter, Outlet } from "react-router-dom";
import App from "../App";
import PublicLayout from "../components/layout/publicLayout/PublicLayout";

import LoginPage from "../pages/loginPage/LoginPage";
import SignUpPage from "../pages/signupPage/SignUpPage";
import ErrorPage from "../pages/errorpage/ErrorPage";

import StudentHomePage from "../pages/student_homepage/StudentHomePage";
import ApplicationPage from "../pages/applicationpage/ApplicationPage";

import InstructorHomePage from "../pages/instructor_homepage/InstructorHomePage";
import CoordinatorHomePage from "../pages/coordinator_homepage/CoordinatorHomePage";
import TaProfilePage from "../pages/taprofilepage/TaProfilePage";

import RoleGuard from "../components/features/roleguard/RoleGuard";
import { UserRole } from "../interfaces/enum/UserRole";

export const router = createBrowserRouter([
  {
    path: "/user",
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
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
          { path: "taprofile/:studentId", element: <TaProfilePage /> },
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
      { path: "login", element: <LoginPage /> },
      { path: "signup", element: <SignUpPage /> },
      { path: "*", element: <ErrorPage /> },
    ],
  },
]);
