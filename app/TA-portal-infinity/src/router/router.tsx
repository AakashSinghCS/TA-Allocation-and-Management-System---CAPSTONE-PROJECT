import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import HomePage from "../pages/homepage/HomePage";
import AboutPage from "../pages/aboutpage/AboutPage";
import TaProfilePage from "../pages/taprofilepage/TaProfilePage";
import TaProfilePageContainer from "../pages/taprofilepage/TaProfilePageContainer";
import ErrorPage from "../pages/errorpage/ErrorPage"
import { mockTaProfilePageData } from "../mocked-objects/mockTaProfilePageData";

export const router = createBrowserRouter([
  {
    element: <App />,
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/about", element: <AboutPage /> },
      { path: "/taprofile", element: <TaProfilePage data={mockTaProfilePageData} /> }, // /taprofile can be deleted later when development of taprofile is done
      { path: "/taprofile/:studentId", element: <TaProfilePageContainer /> },
      
      
      { path: "/error", element: <ErrorPage /> },
      //catches-all for anything that doesn't match:
      { path: '*',element: <ErrorPage />,  }
    ],
  },
]);
