import { useAuth } from "./context/AuthContext";
import { Navigate, Outlet } from "react-router-dom";
import Header from "./components/layout/header/Header"
import Footer from "./components/layout/footer/Footer"
import SideNav from "./components/layout/sidenav/SideNav";

export default function App() {
  // Authentication check
  const { isAuthenticated } = useAuth();
  console.log("isAuthenticated:", isAuthenticated);
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return (
    <div className="flex flex-col h-screen">
      <Header />

      {/* content area: sidebar + page body */}
      <div className="flex flex-1 overflow-hidden">
        <SideNav />

        {/* child routes render here */}
        <main className="flex-1 overflow-y-auto bg-white p-6">
          <Outlet />
        </main>
      </div>

      <Footer />
    </div>
  );
}