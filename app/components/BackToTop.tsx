"use client";

import { useEffect, useState } from "react";

export default function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      
      if (docHeight > 0) {
        const scrollPercent = (scrollTop / docHeight) * 100;
        setProgress(scrollPercent);
      }

      setIsVisible(scrollTop > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 transition-all duration-500 ease-in-out ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0 pointer-events-none"
      }`}
    >
      <button
        onClick={scrollToTop}
        className="group relative flex items-center justify-center p-4 rounded-full bg-white shadow-2xl hover:scale-110 active:scale-90 transition-all border border-slate-100"
      >
        {/* Progress Ring 
          Added w-14 and h-14 (standard Tailwind) instead of w-[58px].
          Added viewBox so the circles (centered at 29,29) aren't cut off.
        */}
        <svg 
          className="absolute -rotate-90 w-14 h-14" 
          viewBox="0 0 58 58"
        >
          {/* Background Track */}
          <circle
            cx="29"
            cy="29"
            r={radius}
            stroke="currentColor"
            strokeWidth="4"
            fill="transparent"
            className="text-amber-100" // Changed from amber-900 to 100 so the progress is visible
          />
          {/* Progress Bar */}
          <circle
            cx="29"
            cy="29"
            r={radius}
            stroke="currentColor"
            strokeWidth="4"
            fill="transparent"
            strokeDasharray={circumference}
            style={{ 
                strokeDashoffset: offset,
                transition: "stroke-dashoffset 0.1s linear" 
            }}
            strokeLinecap="round"
            className="text-amber-900"
          />
        </svg>

        {/* Arrow Icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={3}
          stroke="currentColor"
          className="w-5 h-5 text-amber-600 group-hover:text-amber-700 z-10"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.5 15.75l7.5-7.5 7.5 7.5"
          />
        </svg>
      </button>
    </div>
  );
}