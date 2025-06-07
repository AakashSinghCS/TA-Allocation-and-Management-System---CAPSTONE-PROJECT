import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import HomePage from "../pages/homepage/HomePage";
import AboutPage from "../pages/aboutpage/AboutPage";
import TaProfilePage from "../pages/taprofilepage/TaProfilePage";
import { mockStudent } from "../mocked-objects/mockUsers";
import { mockSection } from "../mocked-objects/mockSection";

export const router = createBrowserRouter([
  {
    element: <App />,           
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/about", element: <AboutPage /> },
      { path: "/taprofile", element: <TaProfilePage student = {mockStudent} section={[mockSection]}/> },
    ],
  },
]);
