import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import HomePage from "../pages/homepage/HomePage";
import AboutPage from "../pages/aboutpage/AboutPage";
import TaProfilePage from "../pages/taprofilepage/TaProfilePage";

import type Student from '../interfaces/Student';
const mockStudent : Student = {
    firstName : "John",
    lastName : "Doe",
    email : "johndoe@test.com",
    studentNumber : 12345678,
    program : "Computer Science",
    enrollmentYear : 2021,
    schoolYear: 3,
    createdAt : new Date("2021-01-01T00:00:00.000Z"),
}
import type TermCourse from '../interfaces/TermCourse';
const mockTermCourse : TermCourse = {
    name: "Introduction to Computer Science",
    deptCode : "COSC",
    courseNum : "111",
    section: "001",
    term : "Winter 2023",
}

export const router = createBrowserRouter([
  {
    element: <App />,           
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/about", element: <AboutPage /> },
      { path: "/taprofile", element: <TaProfilePage student = {mockStudent} termCourse={mockTermCourse}/> },
    ],
  },
]);
