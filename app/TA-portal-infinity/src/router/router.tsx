import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import HomePage from "../pages/homepage/HomePage";
import AboutPage from "../pages/aboutpage/AboutPage";
import TaProfilePage from "../pages/taprofilepage/TaProfilePage";
import TaProfilePageContainer from "../pages/taprofilepage/TaProfilePageContainer";
import { mockStudentJohnDoe } from "../mocked-objects/mockStudentJohnDoe";
import { mockSectionCOSC111 } from "../mocked-objects/mockSectionCOSC111";
import type TaProfilePageData from "../pages/taprofilepage/TaProfilePageData";
import ErrorPage from "../pages/errorpage/ErrorPage"

const mockTaProfileData = {
  student: mockStudentJohnDoe,
  section: mockSectionCOSC111
}

export const router = createBrowserRouter([
  {
    element: <App />,           
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/about", element: <AboutPage /> },
      { path: "/taprofile", element: <TaProfilePage data ={mockTaProfileData}/> },
      { path: "/taprofile/:studentId", element: <TaProfilePageContainer /> },
      { path: "/error", element: <ErrorPage /> },
    ],
  },
]);
