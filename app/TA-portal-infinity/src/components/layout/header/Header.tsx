//This is just an example. Please redo this page later.

import { Link } from "react-router-dom";

export default function Header() {
  return (
    <header className="flex items-center justify-between bg-sky-900 text-white h-14 px-4">
      {/* left — school branding */}
      <div className="flex items-center gap-3">
        {/* replace with a real SVG or PNG in /public */}
        <img src="/ubc-logo.svg" alt="UBC logo" className="h-8 w-auto" />
        <span className="hidden sm:inline font-semibold tracking-wide">
          University of British Columbia
        </span>
      </div>

      {/* right — app name links back to home */}
      <Link to="/" className="text-lg font-bold hover:opacity-80">
        TA Portal
      </Link>
    </header>
  );
}
