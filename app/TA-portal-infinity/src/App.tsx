// App.tsx
import { useAuth } from "./context/AuthContext";
import { Navigate, Outlet } from "react-router-dom";
import Header from "./components/layout/header/Header";
import Footer from "./components/layout/footer/Footer";
import SideNav from "./components/layout/sidebar/SideBar";
import { useState } from "react";

export default function App() {
  const { isAuthenticated } = useAuth();
  // 1) keep track of whether the sidebar is expanded
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen">
      {/* 2) pass both state and setter into SideNav */}
      <SideNav
        expanded={sidebarExpanded}
        setExpanded={setSidebarExpanded}
      />

      {/* 3) dynamically pad (or margin) the content */}
      <div
        className={`flex flex-col flex-1 transition-all duration-300 ${
          sidebarExpanded ? "pl-56" : "pl-20"
        }`}
      >
        <Header />
        <main className="flex-1 overflow-y-auto p-6 bg-white min-h-0">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
}
