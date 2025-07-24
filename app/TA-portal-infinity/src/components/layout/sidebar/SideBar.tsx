import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import {
  Home,
  BookOpen,
  GraduationCap,
  Presentation,
  ClipboardList,
  User,
  LogOut,
  Users,
  CalendarCog,
  FileUser,
  FileQuestionMark,
  ShieldCheck,
  type LucideProps,
  CalendarDays,
} from 'lucide-react';
import { useState, type Dispatch, type SetStateAction } from 'react';
import { UserRole } from '../../../interfaces/enum/UserRole';
import ubcLogo from '../../../assets/ubc-logo.png';

interface navItem {
    label: string;
    to: string;
    icon: JSX.Element;
    roles: UserRole[];
}

interface SideNavProps {
  expanded: boolean;
  setExpanded: Dispatch<SetStateAction<boolean>>;
}

export default function SideNav({expanded, setExpanded}:SideNavProps) {
  const { pathname } = useLocation();
  const { logout, userRoles, userId } = useAuth();

  const navItems:navItem[] = [

    // Coordinator
    { label: 'Dashboard', to: '/user/coordinator/home', icon: <Home size={22} />, roles: [UserRole.COORDINATOR] },
    { label: 'TA Applications', to: '/user/coordinator/applications', icon: <GraduationCap size={22} />, roles: [UserRole.COORDINATOR] },
    { label: 'TA Allocations', to: '/user/coordinator/allocation', icon: <Presentation size={22} />, roles: [UserRole.COORDINATOR] },
    { label: 'Exams', to: '/user/coordinator/create-exam', icon: <BookOpen size={22} />, roles: [UserRole.COORDINATOR] },
    // { label: 'Profile', to: '/user/coordinator/profile', icon: <UserRoundPen size={22} />, roles: [UserRole.COORDINATOR] },
    { label: 'Profile Questions', to: '/user/coordinator/questions', icon: <FileQuestionMark size={22} />, roles: [UserRole.COORDINATOR] },
    { label: 'Courses', to: '/user/coordinator/sections', icon: <BookOpen size={22} />, roles: [UserRole.COORDINATOR] },
    { label: 'Users', to: '/user/coordinator/browseuser', icon: <Users size={22} />, roles: [UserRole.COORDINATOR] },
    // Instructor
    { label: 'Dashboard', to: '/user/instructor/home', icon: <Home size={22} />, roles: [UserRole.INSTRUCTOR] },
    // { label: 'My Courses', to: '/user/instructor/courses', icon: <BookOpen size={22} />, roles: [UserRole.INSTRUCTOR] },
    { label: 'Sections & Req(s)', to: `instructorprofile/${userId}/need`, icon: <ClipboardList size={22} />, roles: [UserRole.INSTRUCTOR] },
    { label: 'Students Allocated', to: `/user/instructorprofile/${userId}/students`, icon: <Presentation size={22} />, roles: [UserRole.INSTRUCTOR] },
    // { label: 'TA Allocations', to: `instructorprofile/${userId}/need`, icon: <Presentation size={22} />, roles: [UserRole.INSTRUCTOR] },
    // { label: 'Instructor Profile', to: `/user/instructorprofile/${userId}`, icon: <User size={22} />, roles: [UserRole.INSTRUCTOR] },
    // { label: 'Users', to: '/user/instructor/browseuser', icon: <Users size={22} />, roles: [UserRole.INSTRUCTOR] },
    { label: 'Instructor Lab Skills', to: `/user/instructorprofile/${userId}/qualifications`, icon: <User size={22} />, roles: [UserRole.INSTRUCTOR] },

    // Student
    { label: 'Dashboard', to: '/user/student/home', icon: <Home size={22} />, roles: [UserRole.STUDENT] },
    // { label: 'My Courses', to: '/user/student/courses', icon: <BookOpen size={22} />, roles: [UserRole.STUDENT] },
    { label: 'Start Application', to: '/user/student/application', icon: <FileUser size={22} />, roles: [UserRole.STUDENT] },
    { label: 'View Applications', to: '/user/student/view-applications', icon: <GraduationCap size={22} />, roles: [UserRole.STUDENT] },
    { label: "Exam Availability", to: "/user/student/availability", icon: <BookOpen size={22} />, roles: [UserRole.STUDENT] },
    // { label: 'Student Profile', to: `/user/taprofile/${userId}`, icon: <User size={22} />, roles: [UserRole.STUDENT] },
    { label: 'Student Lab Skills', to: `/user/taprofile/${userId}/qualifications`, icon: <ShieldCheck size={22} />, roles: [UserRole.STUDENT] },
    { label: 'Profile Questions', to: `/user/student/questions/${userId}`, icon: <FileQuestionMark size={22} />, roles: [UserRole.STUDENT] },
    { label: 'Allocation History', to: `/user/taprofile/${userId}/allocationHistory`, icon: <FileQuestionMark size={22} />, roles: [UserRole.STUDENT] },
    { label: 'Schedule', to: `/user/student/schedule`, icon: <CalendarDays size={22} />, roles: [UserRole.STUDENT] },
    //Profile
    { label: 'Profile', to: `/user/profile/${userId}`, icon: <User size={22} />, roles: [UserRole.STUDENT,UserRole.INSTRUCTOR,UserRole.COORDINATOR] },

    //Admin
    { label: 'Term & Deadline(s)', to: '/user/coordinator/globalconfig', icon: <CalendarCog size={22} />, roles: [UserRole.ADMIN] },
    { label: 'Audit', to: `/user/coordinator/audit`, icon: <BookOpen size={22} />, roles: [UserRole.ADMIN] },
];
  const filteredNavItems = navItems.filter(item =>
    item.roles.some(role => userRoles.includes(role))
  );

  return (
    <aside
      className={`fixed top-0 left-0 z-20 h-screen bg-[#040941] text-white flex flex-col transition-all duration-300 shadow-lg ${
        expanded ? 'w-56' : 'w-20'
      }`}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
    >
    <Link to="/" className="flex items-center">
        <img
        src={ubcLogo}
        alt="UBC logo"
        className="h-20 sm:h-20 w-auto transition hover:drop-shadow-[0_0_1em_#FFFFFF] mb-3"
        />
    </Link>
      <div className="flex-1 flex flex-col px-2 space-y-2">
        {filteredNavItems.map(({ label, to, icon }) => {
          const isActive = pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-4 px-3 py-2 rounded-md transition-all duration-200 ${
                isActive
                  ? 'bg-white/20 shadow text-white'
                  : 'hover:bg-white/10 hover:text-gray-200'
              }`}
            >
              {icon}
              {expanded && (
                <span className="text-sm font-medium whitespace-nowrap">
                  {label}
                </span>
              )}
            </Link>
          );
        })}
      </div>
      <div className="border-t border-white/20 w-full px-8 py-6">
        <button
          onClick={logout}
          className="flex items-center gap-5 text-sm text-white hover:text-[#a0ffe6] hover:scale-105 hover:drop-shadow-[0_0_10px_#a0ffe6] transition-all duration-300"
        >
          <LogOut size={22} />
          {expanded && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
