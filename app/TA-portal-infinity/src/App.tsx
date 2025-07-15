import { useAuth } from "./context/AuthContext";
import { Navigate, Outlet } from "react-router-dom";
import Header from "./components/layout/header/Header";
import Footer from "./components/layout/footer/Footer";
import SideNav from "./components/layout/sidebar/SideBar";

export default function App() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    // ensure entire app is at least screen-height
    <div className="flex min-h-screen">
      {/* fixed sidebar always on the left */}
      <div className="fixed top-0 left-0 h-screen z-20">
        <SideNav />
      </div>

      {/* push everything right by sidebar width */}
      <div className="flex flex-col flex-1 pl-20">
        {/* header scrolls away with page */}
        <Header />

        {/* make main take up remaining space, scroll its children, and prevent outer gray gap */}
        <main className="flex-1 overflow-y-auto p-6 bg-white min-h-0">
          <Outlet />
        </main>

        {/* footer follows content, no fixed positioning */}
        <Footer />
      </div>
    </div>
  );
}
