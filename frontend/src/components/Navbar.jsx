"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Command, ArrowRight, Bell, CheckCircle2 } from "lucide-react";
import CommandPalette from "@/components/CommandPalette";

export default function Navbar({ title = "Resume Screener & Job Fit", folio = "FOLIO 01" }) {
  const router = useRouter();
  const [showCommandPalette, setShowCommandPalette] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setShowCommandPalette((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-30 h-16 bg-[#FAF6EE]/95 backdrop-blur-xs border-b border-[#E0CFB7] px-6 flex items-center justify-between">
        {/* Folio / Page title */}
        <div className="flex items-center gap-3">
          <span className="font-mono-code text-[10px] tracking-widest text-[#7D8F8F] uppercase border border-[#E0CFB7] px-1.5 py-0.5 rounded-xs">
            {folio}
          </span>
          <div>
            <h1 className="font-editorial text-lg text-[#1E2D2D] font-normal leading-tight">
              {title}
            </h1>
          </div>
        </div>

        {/* Global Search Input */}
        <div 
          onClick={() => setShowCommandPalette(true)}
          className="relative w-80 flex items-center cursor-pointer group"
        >
          <Search className="absolute left-3 text-[#7D8F8F] group-hover:text-[#2D8A8A] transition-colors" size={14} />
          <div className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#FAF5EB] hover:bg-[#F4EBDD] border border-[#E0CFB7] rounded-xs text-[#7D8F8F] font-normal flex items-center justify-between transition-colors">
            <span>Search jobs, required skills, suggestions...</span>
            <kbd className="px-1.5 py-0.5 text-[9px] font-mono-code font-semibold bg-[#FAF6EE] text-[#475858] rounded-xs border border-[#E0CFB7] flex items-center gap-0.5">
              <Command size={9} /> K
            </kbd>
          </div>
        </div>

        {/* Right Section: Screen Resume CTA, Date, Notification, Khushi Mehta */}
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#FAF6EE] bg-[#224b4c] hover:bg-[#1a3a3b] rounded-xs transition-colors shadow-xs"
          >
            <CheckCircle2 size={13} />
            <span>My ATS Dashboard</span>
          </Link>

          <span className="font-mono-code text-[11px] text-[#7D8F8F] hidden sm:inline-block">
            Sep 30, 2026
          </span>

          <button 
            onClick={() => setShowCommandPalette(true)}
            className="p-1.5 text-[#7D8F8F] hover:text-[#1E2D2D] hover:bg-[#E0CFB7]/30 rounded-xs transition-colors relative"
            title="Notifications"
          >
            <Bell size={16} />
            <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[#2D8A8A]"></span>
          </button>

          <div className="flex items-center gap-2.5 pl-3 border-l border-[#E0CFB7]">
            <div className="w-7 h-7 rounded-full bg-[#E0CFB7] text-[#1E2D2D] font-mono-code font-bold text-xs flex items-center justify-center border border-[#BFA889]">
              KM
            </div>
            <div className="hidden md:block leading-tight text-left">
              <div className="text-xs font-semibold text-[#1E2D2D]">Khushi Mehta</div>
              <div className="text-[9px] font-mono-code text-[#224b4c] font-semibold">Candidate</div>
            </div>
          </div>
        </div>
      </header>

      {/* Global Command Palette */}
      <CommandPalette 
        isOpen={showCommandPalette} 
        onClose={() => setShowCommandPalette(false)} 
      />
    </>
  );
}
