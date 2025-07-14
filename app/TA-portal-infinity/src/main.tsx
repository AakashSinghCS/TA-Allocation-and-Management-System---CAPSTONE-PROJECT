import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { router } from "./router/router.tsx";
import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.tsx';
import './index.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(

  <StrictMode>
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>  
  </AuthProvider>
  </StrictMode >,
)
