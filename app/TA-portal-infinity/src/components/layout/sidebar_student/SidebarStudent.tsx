import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { Home, BookOpen, GraduationCap, User, LogOut, FileUser, FileQuestionMark, ShieldCheck } from "lucide-react";
import { useState } from "react";


export default function SideNavStudent() {
  const { pathname } = useLocation();
  const { logout } = useAuth();
  const [hovered, setHovered] = useState(false);
  const navItems = [
    { label: "Home", to: "/user/student/home", icon: <Home size={22} /> },
    { label: "My Courses", to: "/user/student/courses", icon: <BookOpen size={22} /> },
    { label: "Start Application", to: "/user/student/application", icon: <FileUser size={22} /> },
    { label: "View Applications", to: "/user/student/view-applications", icon: <GraduationCap size={22} /> },
    { label: "Exam Availability", to: "/user/student/availability", icon: <BookOpen size={22} /> },
    { label: "Profile", to: `/user/taprofile/${useAuth().userId}`, icon: <User size={22} /> },
    { label: "Qualifications", to: `taprofile/${useAuth().userId}/qualifications`, icon: <ShieldCheck size={22} /> },
    { label: "Questions", to: `/user/student/questions/${useAuth().userId}`, icon: <FileQuestionMark size={22} /> },
  ];

  const expanded = hovered;

  return (
    <aside
      className={`h-full bg-[#040941] text-white flex flex-col transition-all duration-300 shadow-lg ${expanded ? "w-56" : "w-20"
        }`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Nav Links */}
      <div className="flex-1 flex flex-col px-2 space-y-2">
        {navItems.map(({ label, to, icon }) => {
          const isActive = pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-4 px-3 py-2 rounded-md transition-all duration-200 ${isActive
                  ? "bg-white/20 shadow text-white"
                  : "hover:bg-white/10 hover:text-gray-200"
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

      {/* Logout */}
      <div className="border-t border-white/20 w-full px-8 py-4">
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
