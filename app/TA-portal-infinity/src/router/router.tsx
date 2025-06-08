import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import HomePage from "../pages/homepage/HomePage";
import AboutPage from "../pages/aboutpage/AboutPage";
import TaProfilePage from "../pages/taprofilepage/TaProfilePage";
import ErrorPage from "../pages/errorpage/ErrorPage";


export const router = createBrowserRouter([
  {
    path: "/",              
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <HomePage /> },               
      { path: "about", element: <AboutPage /> },            
      { path: "taprofile/:studentId", element: <TaProfilePage />},
      { path: "error", element: <ErrorPage /> },
      { path: "*", element: <ErrorPage /> },                
    ],
  },
]);