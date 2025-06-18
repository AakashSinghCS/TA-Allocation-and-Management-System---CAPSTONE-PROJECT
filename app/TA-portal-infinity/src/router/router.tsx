import { createBrowserRouter } from "react-router-dom";
import App from "../App";

import AboutPage from "../pages/aboutpage/AboutPage";
import TaProfilePage from "../pages/taprofilepage/TaProfilePage";
import LoginPage from "../pages/loginPage/LoginPage";
import ErrorPage from "../pages/errorpage/ErrorPage";
import PublicLayout from "../components/layout/publicLayout/PublicLayout";
import SignUpPage from "../pages/signupPage/SignUpPage";
import ApplicationPage from "../pages/applicationpage/ApplicationPage";
import RoleGuard from "../components/features/roleguard/RoleGuard";
import StudentHomePage from "../pages/student_homepage/StudentHomePage";  
import CoordinatorHomePage from "../pages/coordinator_homepage/CoordinatorHomePage";
import InstructorHomePage from "../pages/instructor_homepage/InstructorHomePage";

export const router = createBrowserRouter([
  {
    path: '/user',
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: 'student',
        element: (
          <RoleGuard role="ROLE_STUDENT">
            <StudentHomePage />
          </RoleGuard>
        ),children: [
          { path: 'home', element: <StudentHomePage /> },
          { path: 'application', element: <ApplicationPage /> },
          { path: 'error', element: <ErrorPage /> },
        ],
      },
      {
        path: 'instructor',
        element: (
          <RoleGuard role="ROLE_INSTRUCTOR">
            <InstructorHomePage />
          </RoleGuard>
        ),children: [
          { path: 'home', element: <InstructorHomePage /> },
          { path: 'error', element: <ErrorPage /> },

        ],
      },
      {
        path: 'coordinator',
        element: (
          <RoleGuard role="ROLE_COORDINATOR">
            <CoordinatorHomePage />
          </RoleGuard>
        ),children: [
          { path: 'home', element: <CoordinatorHomePage /> },
          { path: 'taprofile/:studentId', element: <TaProfilePage /> },
          { path: 'error', element: <ErrorPage /> },
          { path: '*', element: <ErrorPage /> },
        ],
      },
      
    ],
  },
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      { path: 'login', element: <LoginPage /> },
      { path: 'signup', element: <SignUpPage /> },
    ],
  },
]);