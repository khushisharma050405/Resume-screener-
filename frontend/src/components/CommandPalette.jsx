"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, FileText, Users, Briefcase, Plus, MessageSquare, X, ArrowRight } from "lucide-react";

export default function CommandPalette({ isOpen, onClose }) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onClose ? onClose(!isOpen) : null;
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const COMMANDS = [
    { label: "Create Job Description (Job-Agnostic)", category: "Job Postings", icon: Plus, action: () => router.push("/jobs/create") },
    { label: "Upload & Parse Resumes (PDF / DOCX)", category: "Intake", icon: FileText, action: () => router.push("/resumes/upload") },
    { label: "Review Candidate Dossiers", category: "Candidates", icon: Users, action: () => router.push("/candidates") },
    { label: "Screen Resume Against Job & Get Suggestions", category: "Resume Screener", icon: MessageSquare, action: () => router.push("/screener") },
    { label: "Screening Match Breakdown", category: "Evaluation", icon: Briefcase, action: () => router.push("/match") },
    { label: "Side-by-Side Candidate Compare", category: "Evaluation", icon: Search, action: () => router.push("/compare") },
  ];

  const filtered = COMMANDS.filter(c => 
    c.label.toLowerCase().includes(query.toLowerCase()) || 
    c.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-[#1E2D2D]/40 backdrop-blur-xs flex items-start justify-center pt-24 px-4">
      <div className="bg-[#FAF6EE] border border-[#E0CFB7] shadow-xl max-w-xl w-full p-4 rounded-xs space-y-3">
        <div className="flex items-center gap-2 pb-3 border-b border-[#E0CFB7]">
          <Search size={15} className="text-[#7D8F8F]" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search actions, candidate skills, jobs (e.g. Python, Senior Full-Stack)..."
            className="w-full text-xs bg-transparent border-none focus:outline-none text-[#1E2D2D] placeholder-[#7D8F8F] font-mono-code"
          />
          <button 
            onClick={onClose} 
            className="text-[#7D8F8F] hover:text-[#1E2D2D] p-1 rounded-xs"
          >
            <X size={14} />
          </button>
        </div>

        <div className="space-y-1 max-h-72 overflow-y-auto pr-1">
          <div className="font-mono-code text-[9px] uppercase tracking-wider text-[#7D8F8F] px-2 py-1">
            Quick Commands · Press ↵ to Navigate
          </div>
          {filtered.length === 0 ? (
            <div className="p-4 text-center text-xs text-[#7D8F8F] font-mono-code">
              No matches found for "{query}"
            </div>
          ) : (
            filtered.map((cmd, idx) => {
              const Icon = cmd.icon;
              return (
                <div
                  key={idx}
                  onClick={() => { cmd.action(); onClose(); }}
                  className="flex items-center justify-between p-2.5 rounded-xs hover:bg-[#E0CFB7]/30 border border-transparent hover:border-[#E0CFB7] cursor-pointer transition-colors text-xs text-[#1E2D2D] group"
                >
                  <div className="flex items-center gap-2.5">
                    <Icon size={14} className="text-[#7D8F8F] group-hover:text-[#2D8A8A]" />
                    <span className="font-medium">{cmd.label}</span>
                  </div>
                  <span className="font-mono-code text-[9px] text-[#7D8F8F] uppercase tracking-wider border border-[#E0CFB7] px-1.5 py-0.5 rounded-xs">
                    {cmd.category}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
