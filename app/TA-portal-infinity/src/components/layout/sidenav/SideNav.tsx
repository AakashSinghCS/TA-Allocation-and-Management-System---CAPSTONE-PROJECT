import { Link, useLocation } from "react-router-dom";

const navItems = [
  { label: "Home", to: "/" },
  { label: "About", to: "/about" },
];

export default function SideNav() {
  const { pathname } = useLocation();

  return (
    <aside className="h-full w-40 bg-gray-800 text-gray-200 flex flex-col">
      <nav className="flex-1 py-4 space-y-1">
        {navItems.map(({ label, to }) => (
          <Link
            key={to}
            to={to}
            className={`block px-4 py-2 rounded-r-lg transition
               ${pathname === to ? "bg-sky-700 text-white" : "hover:bg-gray-700"}`}
          >
            {label}
          </Link>
        ))}
      </nav>

      {/* logout stays at bottom */}
      <Link
        to="/logout"
        className="mt-auto px-4 py-2 bg-red-600 text-white hover:bg-red-500 text-center"
      >
        Logout
      </Link>
    </aside>
  );
}
