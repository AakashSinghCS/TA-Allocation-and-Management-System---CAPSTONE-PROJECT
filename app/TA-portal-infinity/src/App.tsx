import { useAuth } from "./context/AuthContext";
import { Navigate, Outlet } from "react-router-dom";
import Header from "./components/layout/header/Header";
import Footer from "./components/layout/footer/Footer";
import { UserRole } from './interfaces/enum/UserRole';
import SideNavStudent from "./components/layout/sidebar_student/SidebarStudent";
import SideNavInstructor from "./components/layout/sidebar_instructor/SidebarInstructor";
import SideNavCoordinator from "./components/layout/sidebar_coordinator/SidebarCoordinator";

export default function App() {
  const { isAuthenticated, userRoles } = useAuth();

  // if (!isAuthenticated) {
  //   return <Navigate to="/login" replace />;
  // }

  const role = userRoles[0]; 

  const renderSidebar = () => {
    switch (role) {
      case UserRole.STUDENT:
        return <SideNavStudent />;
      case UserRole.INSTRUCTOR:
        return <SideNavInstructor />;
      case UserRole.COORDINATOR:
        return <SideNavCoordinator />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        {renderSidebar()}
        <main className="flex-1 overflow-y-auto bg-white p-6">
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );
}
