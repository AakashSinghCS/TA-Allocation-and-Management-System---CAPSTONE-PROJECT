import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import HomePage from "../pages/homepage/HomePage";
import AboutPage from "../pages/aboutpage/AboutPage";
import TaProfilePage from "../pages/taprofilepage/TaProfilePage";
import LoginPage from "../pages/loginPage/LoginPage";
import { mockStudent } from "../mocked-objects/mockUsers";
import { mockSection } from "../mocked-objects/mockSection";
import PublicLayout from "../components/layout/publicLayout/PublicLayout";
import SignUpPage from "../pages/signupPage/SignUpPage";



export const router = createBrowserRouter([
  {
    element: <App />,           
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/about", element: <AboutPage /> },
      { path: "/taprofile", element: <TaProfilePage student = {mockStudent} section={[mockSection]}/> },
     
    ],
  },
     {
    path: "/login",
    element: <PublicLayout />,
    children: [
      {
        index: true,
        element: <LoginPage />,
      },
    ],
  },
  {
    path: "/signup",
    element: <PublicLayout />,
    children: [
      {
        index: true,
        element: <SignUpPage />,
      },
    ],
  },
]);
