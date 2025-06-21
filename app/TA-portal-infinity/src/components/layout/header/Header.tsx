import { Link } from "react-router-dom";
import ubcLogo from "../../../assets/ubc-logo.png";
import capIcon from "../../../assets/grad-cap.png";

export default function Header() {
  return (
    <header className="flex flex-col sm:flex-row items-center justify-between bg-[#040941] text-white px-4 sm:px-9 py-2">
      
      {/* UBC Logo and Name */}
      <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
        <Link to="/" className="flex items-center">
          <img
            src={ubcLogo}
            alt="UBC logo"
            className="h-20 sm:h-20 w-auto transition hover:drop-shadow-[0_0_1em_#FFFFFF]"
          />
        </Link>
        <span className="text-center font-medium tracking-wide text-base sm:text-lg text-white hover:text-gray-200 transition-colors">
          UNIVERSITY OF BRITISH COLUMBIA
        </span>
      </div>

      {/* TA Portal icon */}
      <Link to="/" className="flex items-center gap-2 mt-2 sm:mt-0">
        <img src={capIcon} alt="Grad cap" className="h-20 sm:h-20 w-auto transition hover:drop-shadow-[0_0_1em_#FFFFFF]" />
      </Link>
    </header>
  );
}
