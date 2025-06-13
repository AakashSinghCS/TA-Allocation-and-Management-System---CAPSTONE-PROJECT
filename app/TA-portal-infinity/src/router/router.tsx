import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import HomePage from "../pages/homepage/HomePage";
import AboutPage from "../pages/aboutpage/AboutPage";
import TaProfilePage from "../pages/taprofilepage/TaProfilePage";
import LoginPage from "../pages/loginPage/LoginPage";
import SignUpPage from "../pages/signupPage/SignUpPage";
import ErrorPage from "../pages/errorpage/ErrorPage";
import PublicLayout from "../components/layout/publicLayout/PublicLayout";

// import TaProfilePageContainer from "../pages/taprofilepage/TaProfilePageContainer";

import { mockTaProfilePageData } from "../mocked-objects/mockTaProfilePageData";
import CourseListPage from "../pages/coursespage/CourseListPage";
import AddCoursePage from "../pages/coursespage/AddCoursePage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "about", element: <AboutPage /> },
      
      // { path: "taprofile/:studentId", element: <TaProfilePageContainer /> },

      { path: "taprofile", element: <TaProfilePage /> },

      { path: "courses", element: <CourseListPage /> },
      { path: "courses/add", element: <AddCoursePage /> },

      { path: "error", element: <ErrorPage /> },
      { path: "*", element: <ErrorPage /> },
    ],
  },
   {
    path: "/",
    element: <PublicLayout />,
    children: [
      { path: "login", element: <LoginPage /> },
      { path: "signup", element: <SignUpPage /> },
  ],
},
]);
