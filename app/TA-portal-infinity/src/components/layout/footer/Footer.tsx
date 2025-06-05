//This is just an example. Please redo this page later.

export default function Footer() {
  return (
    <footer className="bg-gray-100 border-t p-4 text-sm">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center gap-4">
        {/* crest / logo (optional) */}
        <img src="/ubc-crest.svg" alt="" className="h-10 w-auto" />

        <p className="flex-1 text-gray-600">
          © {new Date().getFullYear()} University of British Columbia
        </p>

        <nav className="flex gap-4">
          <a href="#" className="hover:underline">Terms of Use</a>
          <a href="#" className="hover:underline">Privacy</a>
          <a href="#" className="hover:underline">Accessibility</a>
        </nav>
      </div>
    </footer>
  );
}
