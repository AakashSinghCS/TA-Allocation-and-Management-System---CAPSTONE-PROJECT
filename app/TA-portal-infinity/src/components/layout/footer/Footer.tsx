import ubcLogo from "../../../assets/icons/ubc_footer_logo.png";
import instagramIcon from "../../../assets/icons/instagram_logo.png";
import youtubeIcon from "../../../assets/icons/youtube_logo.png";
import linkedinIcon from "../../../assets/icons/linkedin_logo.png";
import twitterIcon from "../../../assets/icons/facebook_logo.png";

export default function Footer() {
  return (
    <footer className="flex flex-col sm:flex-row items-center sm:justify-between bg-white border-t border-[#d1d5db] text-[#040941] px-2 sm:px-6 sm:py-1 gap-y-1">
      {/* UBC Logo and Navigation Links */}
      <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
        <img src={ubcLogo} alt="UBC logo" className="h-12 sm:h-16 w-auto hover:drop-shadow-[0_0_1em_#040941]" />

        <div className="flex flex-wrap justify-center sm:justify-start gap-x-2 sm:gap-x-4 gap-y-1 text-xs sm:text-sm font-medium tracking-wide">
          <a href="#" className="hover:opacity-70 transition-opacity" style={{ color: "#000000" }}>
            Terms of Use
          </a>
          <a href="#" className="hover:opacity-70 transition-opacity" style={{ color: "#000000" }}>
            Accessibility
          </a>
          <a href="#" className="hover:opacity-70 transition-opacity" style={{ color: "#000000" }}>
            Privacy
          </a>
          <a href="#" className="hover:opacity-70 transition-opacity" style={{ color: "#000000" }}>
            Copyright
          </a>
          <a href="#" className="hover:opacity-70 transition-opacity" style={{ color: "#000000" }}>
            Need Help?
          </a>
        </div>
      </div>

      {/* Social Icons */}
      <div className="flex items-center gap-2 sm:gap-2">
        
        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
          <img src={twitterIcon} alt="Twitter" className="h-6 w-6 sm:h-7 sm:w-7 hover:opacity-70 transition-opacity"/>
        </a>
        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
          <img src={instagramIcon} alt="Instagram" className="h-6 w-6 sm:h-7 sm:w-7 hover:opacity-70 transition-opacity"/>
        </a>
        <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" aria-label="YouTube" >
          <img src={youtubeIcon} alt="YouTube" className="h-6 w-6 sm:h-7 sm:w-7 hover:opacity-70 transition-opacity"/>
        </a>
        <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" >
          <img src={linkedinIcon} alt="LinkedIn" className="h-6 w-6 sm:h-7 sm:w-7 hover:opacity-70 transition-opacity" />
        </a>
     
      </div>
    </footer>
  );
}
