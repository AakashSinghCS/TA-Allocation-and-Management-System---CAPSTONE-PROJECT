import { useLocation } from 'react-router-dom';

export default function ErrorPage() {
  const { state } = useLocation() as { state?: { message?: string } };
  return (
    <main className="h-screen grid place-items-center text-center">
      <div>
        <h1 className="text-3xl font-bold mb-2">Something went wrong</h1>
        <p className="text-slate-600">
          {state?.message ?? 'Unexpected error.'}
        </p>
      </div>
    </main>
  );
}
