"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function HamburgerMenu() {
  const [open, setOpen] = useState(false);

  // Close menu when clicking outside
  useEffect(() => {
    if (!open) return;
    const closeMenu = () => setOpen(false);
    window.addEventListener("click", closeMenu);
    return () => window.removeEventListener("click", closeMenu);
  }, [open]);

  return (
    <div className="relative inline-block text-left" onClick={(e) => e.stopPropagation()}>
      {/* Fancy Animated Button - Now Dark Themed */}
      <button
        className={`group relative flex h-10 w-10 flex-col items-center justify-center rounded-xl border transition-all active:scale-95 focus:outline-none ${
          open 
            ? "bg-amber-500 border-amber-500 shadow-lg shadow-amber-500/20" 
            : "bg-slate-900 border-slate-700 hover:border-amber-500/50"
        }`}
        aria-label="Toggle navigation"
        onClick={() => setOpen((o) => !o)}
      >
        <div className="relative h-5 w-6">
          {/* Top Line */}
          <span
            className={`absolute block h-0.5 w-6 transition-all duration-300 ease-in-out ${
              open ? "top-2 rotate-45 bg-slate-900" : "top-0 bg-white"
            }`}
          ></span>
          {/* Middle Line */}
          <span
            className={`absolute top-2 block h-0.5 w-6 transition-all duration-300 ${
              open ? "opacity-0 bg-slate-900" : "opacity-100 bg-white"
            }`}
          ></span>
          {/* Bottom Line */}
          <span
            className={`absolute block h-0.5 w-6 transition-all duration-300 ease-in-out ${
              open ? "top-2 -rotate-45 bg-slate-900" : "top-4 bg-white"
            }`}
          ></span>
        </div>
      </button>

      {/* Fancy Dropdown Menu - Now Dark Glassmorphism */}
      <div
        className={`absolute right-0 mt-3 w-64 origin-top-right overflow-hidden rounded-2xl border border-slate-700 bg-slate-900/90 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all duration-300 ease-out z-50 ${
          open 
            ? "scale-100 opacity-100 translate-y-0" 
            : "scale-95 opacity-0 -translate-y-2 pointer-events-none"
        }`}
      >
        <div className="p-2 space-y-1">
          <MenuLink href="/" label="Dashboard" icon="📊" onClick={() => setOpen(false)} />
          <MenuLink href="/how-reporting-works" label="How Reporting Works" icon="🔍" onClick={() => setOpen(false)} />
          <MenuLink href="/privacy-policy" label="Privacy Policy" icon="🛡️" onClick={() => setOpen(false)} />
          <MenuLink href="/community-guidelines" label="Community Guidelines" icon="📜" onClick={() => setOpen(false)} />
          <MenuLink href="/about-us" label="About Us" icon="💡" onClick={() => setOpen(false)} />
          <MenuLink href="/contact" label="Contact" icon="✉️" onClick={() => setOpen(false)} />
        </div>
        
        {/* Decorative footer for the menu */}
        <div className="bg-slate-800/50 p-3 text-[10px] uppercase tracking-[0.2em] text-slate-500 text-center font-black">
          Kuwa Makini • Be careful!
        </div>
      </div>
    </div>
  );
}

// Sub-component for clean mapping - Now with Dark Hover States
function MenuLink({ href, label, icon, onClick }: { href: string; label: string; icon: string; onClick: () => void }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-slate-300 transition-all hover:bg-amber-500/10 hover:text-amber-500 border border-transparent hover:border-amber-500/20"
    >
      <span className="text-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6 drop-shadow-md">
        {icon}
      </span>
      {label}
    </Link>
  );
}