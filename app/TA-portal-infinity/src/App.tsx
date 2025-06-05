import { Outlet, Link } from "react-router-dom";

export default function App() {
  return (
    <>
      <header className="p-4 shadow">
        <nav className="flex gap-4">
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
        </nav>
      </header>

      {/* The child route element renders here */}
      <main className="p-6">
        <Outlet />
      </main>
    </>
  );
}