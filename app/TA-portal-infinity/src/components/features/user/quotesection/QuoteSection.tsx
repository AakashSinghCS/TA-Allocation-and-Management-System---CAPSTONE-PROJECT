export default function QuoteSection() {
    return (
        <div className="flex flex-col justify-center items-center space-y-8 lg:space-y-12 px-4 sm:px-6 lg:px-8 py-8 lg:py-16">
            {/* Quote Icon */}
            <div className="flex flex-col items-center space-y-4 lg:space-y-6">
                <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center">
                    <svg className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z"/>
                    </svg>
                </div>
            </div>
            
            {/* Main Quote */}
            <div className="text-center max-w-xs sm:max-w-sm lg:max-w-md space-y-4 lg:space-y-6">
                <blockquote className="text-base sm:text-lg lg:text-lg font-medium text-gray-600 leading-relaxed italic px-2">
                    "Excellence is not a skill, it's an attitude."
                </blockquote>
                <p className="text-xs sm:text-sm lg:text-sm text-gray-500 font-medium">— Ralph Marston</p>
            </div>
            
            {/* Additional Simple Quotes - Hidden on mobile */}
            <div className="hidden sm:block space-y-4 lg:space-y-6 max-w-xs sm:max-w-sm text-center">
                <div>
                    <p className="text-xs sm:text-sm lg:text-sm text-gray-500 italic">"Success is the sum of small efforts repeated daily."</p>
                    <p className="text-xs lg:text-xs text-gray-400 mt-1 lg:mt-2">— Robert Collier</p>
                </div>
                
                <div>
                    <p className="text-xs sm:text-sm lg:text-sm text-gray-500 italic">"The future belongs to those who believe in the beauty of their dreams."</p>
                    <p className="text-xs lg:text-xs text-gray-400 mt-1 lg:mt-2">— Eleanor Roosevelt</p>
                </div>
            </div>
            
            {/* Simple Decorative Line */}
            <div className="w-12 sm:w-14 lg:w-16 h-px bg-gray-300 opacity-50"></div>
        </div>
    );
}
