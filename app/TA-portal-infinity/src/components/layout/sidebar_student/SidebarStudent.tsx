import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { Home, BookOpen, GraduationCap, User, LogOut,} from "lucide-react";
import { useState } from "react";

const navItems = [
  { label: "Home", to: "/user/student/home", icon: <Home size={22} /> },
  { label: "My Courses", to: "/user/student/courses", icon: <BookOpen size={22} /> },
  { label: "My Applications", to: "/user/student/application", icon: <GraduationCap size={22} /> },
  { label: "Profile", to: "/user/student/profile", icon: <User size={22} /> },
];

export default function SideNavStudent() {
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
      {/* Nav Links */}
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

      {/* Logout */}
      <div className="border-t border-white/20 w-full px-3 py-4">
        <button
          onClick={logout}
          className="flex items-center gap-3 text-sm hover:text-red-300 transition"
        >
          <LogOut size={22} />
          {expanded && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
