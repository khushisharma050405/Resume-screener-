"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  GitCompare, 
  History, 
  Sliders, 
  BarChart3, 
  CheckCircle2,
  Sparkles,
  LogOut, 
  ChevronLeft, 
  ChevronRight 
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Resume Library", href: "/resumes", icon: FileText },
  { label: "Career Matches", href: "/screening", icon: GitCompare },
  { label: "Analysis History", href: "/history", icon: History },
  { label: "Preferences", href: "/settings", icon: Sliders },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("resumeiq_token");
      localStorage.removeItem("resumeiq_user");
    }
    router.push("/login");
  };

  return (
    <aside
      className={`fixed top-0 left-0 z-40 h-screen bg-[#FAF6EE] border-r border-[#E0CFB7] transition-all duration-200 flex flex-col justify-between ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      <div>
        {/* Brand Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-[#E0CFB7]">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xs bg-[#2D8A8A] text-[#FAF6EE] flex items-center justify-center font-editorial font-bold text-base shadow-xs">
              <svg className="w-5 h-5 text-[#FAF6EE]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 0 0 8 20C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z" />
              </svg>
            </div>
            {!collapsed && (
              <div className="leading-none">
                <div className="font-editorial text-lg tracking-tight font-semibold text-[#1E2D2D]">
                  Resume<span className="italic font-normal text-[#2D8A8A]">IQ</span>
                </div>
                <div className="font-mono-code text-[9px] uppercase tracking-widest text-[#7D8F8F] mt-0.5">
                  Resume Screener
                </div>
              </div>
            )}
          </Link>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 text-[#7D8F8F] hover:text-[#1E2D2D] hover:bg-[#E0CFB7]/30 rounded-xs transition-colors"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>

        {/* Navigation Items (Without AI Assistant & Without standalone Jobs creation) */}
        <nav className="px-3 py-4 space-y-1 overflow-y-auto max-h-[calc(100vh-170px)]">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href) && item.href !== "/dashboard");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-xs text-xs font-normal transition-colors ${
                  isActive
                    ? "bg-[#E0CFB7]/40 text-[#2D8A8A] font-semibold border-l-2 border-[#2D8A8A]"
                    : "text-[#475858] hover:text-[#1E2D2D] hover:bg-[#FAF5EB]"
                }`}
                title={collapsed ? item.label : undefined}
              >
                <Icon size={16} className={isActive ? "text-[#2D8A8A]" : "text-[#7D8F8F]"} />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Candidate Stamp: Khushi Mehta */}
      <div className="p-3 border-t border-[#E0CFB7] bg-[#FAF5EB]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-[#E0CFB7] text-[#1E2D2D] font-mono-code font-bold text-xs flex items-center justify-center shrink-0 border border-[#BFA889]">
              KM
            </div>
            {!collapsed && (
              <div className="min-w-0 text-left leading-tight">
                <div className="text-xs font-semibold text-[#1E2D2D] truncate">
                  Khushi Mehta
                </div>
                <div className="text-[10px] font-mono-code text-[#7D8F8F]">
                  Candidate
                </div>
              </div>
            )}
          </div>
          {!collapsed && (
            <button
              onClick={handleLogout}
              className="p-1 text-[#7D8F8F] hover:text-[#C85A5A] transition-colors"
              title="Sign out"
            >
              <LogOut size={14} />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
