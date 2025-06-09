import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import HomePage from "../pages/homepage/HomePage";
import AboutPage from "../pages/aboutpage/AboutPage";
import TaProfilePage from "../pages/taprofilepage/TaProfilePage";
import TaProfilePageContainer from "../pages/taprofilepage/TaProfilePageContainer";
import ErrorPage from "../pages/errorpage/ErrorPage";
import { mockTaProfilePageData } from "../mocked-objects/mockTaProfilePageData";
import CoursesPage from "../pages/coursespage/CoursesPage";

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
      { path: "courses", element: <CoursesPage /> },

      { path: "error", element: <ErrorPage /> },
      { path: "*", element: <ErrorPage /> },                
    ],
  },
]);