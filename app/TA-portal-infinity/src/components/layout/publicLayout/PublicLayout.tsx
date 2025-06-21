// src/components/layout/PublicLayout.tsx
import Header from '../header/Header';
import Footer from '../footer/Footer';
import { Outlet } from 'react-router-dom';

export default function PublicLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <Outlet />
      <Footer />
    </div>
  );
}
