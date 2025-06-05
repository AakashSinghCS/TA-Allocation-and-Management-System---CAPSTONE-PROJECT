import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import HomePage from "../pages/homepage/HomePage";
import AboutPage from "../pages/aboutpage/AboutPage";

export const router = createBrowserRouter([
  {
    element: <App />,           
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/about", element: <AboutPage /> },
    ],
  },
]);
