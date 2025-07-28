import { Suspense } from 'react';
import Header from '../header/Header';
import Footer from '../footer/Footer';
import { Outlet } from 'react-router-dom';

export default function PublicLayout() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen w-full bg-white">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid"></div>
        </div>
      }
    >
      <div className="flex flex-col min-h-screen">
        <Header />
        <Outlet />
        <Footer />
      </div>
    </Suspense>
  );
}
