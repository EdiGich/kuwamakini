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
      {/* Fancy Animated Button */}
      <button
        className="group relative flex h-10 w-10 flex-col items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:bg-slate-50 active:scale-95 focus:outline-none"
        aria-label="Toggle navigation"
        onClick={() => setOpen((o) => !o)}
      >
        <div className="relative h-5 w-6">
          {/* Top Line */}
          <span
            className={`absolute block h-0.5 w-6 bg-slate-900 transition-all duration-300 ease-in-out ${
              open ? "top-2 rotate-45" : "top-0"
            }`}
          ></span>
          {/* Middle Line */}
          <span
            className={`absolute top-2 block h-0.5 w-6 bg-slate-900 transition-all duration-300 ${
              open ? "opacity-0" : "opacity-100"
            }`}
          ></span>
          {/* Bottom Line */}
          <span
            className={`absolute block h-0.5 w-6 bg-slate-900 transition-all duration-300 ease-in-out ${
              open ? "top-2 -rotate-45" : "top-4"
            }`}
          ></span>
        </div>
      </button>

      {/* Fancy Dropdown Menu */}
      <div
        className={`absolute right-0 mt-3 w-56 origin-top-right overflow-hidden rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-xl shadow-2xl transition-all duration-300 ease-out z-50 ${
          open 
            ? "scale-100 opacity-100 translate-y-0" 
            : "scale-95 opacity-0 -translate-y-2 pointer-events-none"
        }`}
      >
        <div className="p-2">
          <MenuLink href="/" label="Dashboard" icon="📊" onClick={() => setOpen(false)} />
          <MenuLink href="/privacy-policy" label="Privacy Policy" icon="🛡️" onClick={() => setOpen(false)} />
          <MenuLink href="/about-us" label="About Us" icon="💡" onClick={() => setOpen(false)} />
        </div>
        
        {/* Decorative footer for the menu */}
        <div className="bg-slate-50 p-3 text-[10px] uppercase tracking-widest text-slate-400 text-center font-bold">
          Kuwa Makini • Be careful!
        </div>
      </div>
    </div>
  );
}

// Sub-component for clean mapping
function MenuLink({ href, label, icon, onClick }: { href: string; label: string; icon: string; onClick: () => void }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="group flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-amber-50 hover:text-amber-700"
    >
      <span className="text-lg transition-transform group-hover:scale-120">{icon}</span>
      {label}
    </Link>
  );
}