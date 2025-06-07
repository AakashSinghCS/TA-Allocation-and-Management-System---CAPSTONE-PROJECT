import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import HomePage from "../pages/homepage/HomePage";
import AboutPage from "../pages/aboutpage/AboutPage";
import TaProfilePage from "../pages/taprofilepage/TaProfilePage";
import TaProfilePageContainer from "../pages/taprofilepage/TaProfilePageContainer";
import { mockStudentJohnDoe } from "../mocked-objects/mockStudentJohnDoe";
import { mockSectionCOSC111 } from "../mocked-objects/mockSectionCOSC111";
import { mockSectionScheduleCOSC111ForTue } from "../mocked-objects/mockSectionCOSC111";
import { mockSectionScheduleCOSC111ForFri } from "../mocked-objects/mockSectionCOSC111";
import ErrorPage from "../pages/errorpage/ErrorPage"
import type TaProfilePageData from "../pages/taprofilepage/TaProfilePageData";

const mockTaProfileData : TaProfilePageData= {
  student: mockStudentJohnDoe,
  section: {sectionDetails: mockSectionCOSC111,sectionSchedule: [mockSectionScheduleCOSC111ForTue,mockSectionScheduleCOSC111ForFri]}
}

export const router = createBrowserRouter([
  {
    element: <App />,           
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/about", element: <AboutPage /> },
      { path: "/taprofile", element: <TaProfilePage data ={mockTaProfileData}/> }, // /taprofile can be deleted later when development of taprofile is done
      { path: "/taprofile/:studentId", element: <TaProfilePageContainer /> },
      { path: "/error", element: <ErrorPage /> },
    ],
  },
]);
