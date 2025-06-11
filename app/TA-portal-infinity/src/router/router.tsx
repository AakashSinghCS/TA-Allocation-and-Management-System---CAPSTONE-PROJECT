import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import HomePage from "../pages/homepage/HomePage";
import AboutPage from "../pages/aboutpage/AboutPage";
import TaProfilePage from "../pages/taprofilepage/TaProfilePage";
import TaProfilePageContainer from "../pages/taprofilepage/TaProfilePageContainer";
import ErrorPage from "../pages/errorpage/ErrorPage";
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
      { path: "taprofile", element: <TaProfilePage data={mockTaProfilePageData} /> },
      { path: "taprofile/:studentId", element: <TaProfilePageContainer /> },
      // The courses route now points to the list page.
      { path: "courses", element: <CourseListPage /> },
      // A new route for adding courses.
      { path: "courses/add", element: <AddCoursePage /> },

      { path: "error", element: <ErrorPage /> },
      { path: "a_star", element: <ErrorPage /> }, // "a_star" was likely a typo for "*", correcting it.
      { path: "*", element: <ErrorPage /> },
    ],
  },
]);