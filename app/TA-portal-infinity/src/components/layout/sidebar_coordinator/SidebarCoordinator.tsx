import { BookOpen, GraduationCap, Home, LogOut, Presentation, UserRoundPen, Users, } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";

const navItems = [
  { label: "Home", to: "/user/coordinator/home", icon: <Home size={22} /> },
  { label: "Courses Management", to: "/user/coordinator/courses", icon: <BookOpen size={22} /> },
  { label: "TA Applications", to: "/user/coordinator/applications", icon: <GraduationCap size={22} /> },
  { label: "TA Allocations", to: "/user/coordinator/allocation", icon: <Presentation size={22} /> },
  { label: "Profile", to: "/user/coordinator/profile", icon: <UserRoundPen size={22} /> },
  { label: "TA Questions", to: "/user/coordinator/questions", icon: <Users size={22} /> }, 
  { label: "Audit", to: "/user/coordinator/audit", icon: <Users size={22} /> }, 
  { label: "Courses", to: "/user/coordinator/sections", icon: <Users size={22} /> }, 

  { label: "Users", to: "/user/coordinator/browseuser", icon: <Users size={22} /> }, 
  { label: "deadline management", to: "/user/coordinator/deadlines", icon: <BookOpen size={22} /> },
];

export default function SideNavCoordinator() {
  const { pathname } = useLocation();
  const { logout } = useAuth();
  const [hovered, setHovered] = useState(false);

  const expanded = hovered;

  return (
    <aside
      className={`h-full bg-[#040941] text-white flex flex-col transition-all duration-300 shadow-lg ${
        expanded ? "w-56" : "w-20"
      }`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Navigation Links */}
      <div className="flex-1 flex flex-col px-2 space-y-2">
        {navItems.map(({ label, to, icon }) => {
          const isActive = pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-4 px-3 py-2 rounded-md transition-all duration-200 ${
                isActive
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

      {/* Logout Button */}
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
