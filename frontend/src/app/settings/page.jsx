"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { api } from "@/lib/api";
import { 
  Sliders, 
  User, 
  ShieldCheck, 
  Bell, 
  Check, 
  Trash2, 
  ChevronDown, 
  ChevronUp, 
  FileText,
  Lock,
  UploadCloud
} from "lucide-react";

export default function SettingsPage() {
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [strictMode, setStrictMode] = useState(false);
  const [autoSuggest, setAutoSuggest] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [savedNotice, setSavedNotice] = useState("");

  useEffect(() => {
    async function loadUser() {
      try {
        const cands = await api.getCandidates();
        if (cands && cands.length > 0) {
          setCandidate(cands[0]);
        }
      } catch (e) {
        console.error("Settings load error:", e);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  const handleSave = () => {
    setSavedNotice("Preferences successfully saved.");
    setTimeout(() => setSavedNotice(""), 2500);
  };

  return (
    <div className="min-h-screen bg-[#F4EBDD] flex font-sans text-[#1E2D2D] selection:bg-[#2D8A8A]/20">
      <Sidebar />
      <div className="flex-1 ml-64 min-w-0 flex flex-col">
        <Navbar title="Preferences & Candidate Settings" folio="SETTINGS" />

        <main className="p-8 max-w-4xl mx-auto w-full space-y-6">
          
          {/* Header */}
          <div className="bg-[#FAF6EE] border border-[#E0CFB7] p-6 rounded-xs space-y-1.5 shadow-xs">
            <div className="flex items-center gap-2 font-mono-code text-[10px] text-[#224b4c] uppercase tracking-widest font-semibold">
              <span>Candidate Account</span>
              <span className="text-[#7D8F8F]">·</span>
              <span>Preferences</span>
            </div>
            <h1 className="font-editorial text-3xl text-[#1E2D2D] font-normal">
              Account & Screening Settings
            </h1>
            <p className="text-xs text-[#475858]">
              Manage your personal profile, ATS screening preferences, and privacy controls.
            </p>
          </div>

          {savedNotice && (
            <div className="p-3 bg-[#2D8A8A]/10 border border-[#2D8A8A]/30 text-[#2D8A8A] text-xs font-mono-code rounded-xs flex items-center gap-2">
              <Check size={14} />
              <span>{savedNotice}</span>
            </div>
          )}

          {/* 1. Candidate Profile Summary */}
          <div className="bg-[#FAF6EE] border border-[#E0CFB7] p-6 rounded-xs shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-[#E0CFB7] pb-3">
              <User size={16} className="text-[#224b4c]" />
              <h2 className="font-editorial text-xl text-[#1E2D2D]">
                Your Candidate Profile
              </h2>
            </div>

            {candidate ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono-code text-xs">
                <div className="p-3 bg-[#FAF5EB] border border-[#E0CFB7] rounded-xs space-y-1">
                  <span className="text-[10px] text-[#7D8F8F] uppercase">Candidate Name</span>
                  <div className="font-medium text-[#1E2D2D]">{candidate.full_name}</div>
                </div>
                <div className="p-3 bg-[#FAF5EB] border border-[#E0CFB7] rounded-xs space-y-1">
                  <span className="text-[10px] text-[#7D8F8F] uppercase">Contact Email</span>
                  <div className="font-medium text-[#1E2D2D]">{candidate.email || "Not specified"}</div>
                </div>
                <div className="p-3 bg-[#FAF5EB] border border-[#E0CFB7] rounded-xs space-y-1">
                  <span className="text-[10px] text-[#7D8F8F] uppercase">Active Role / Discipline</span>
                  <div className="font-medium text-[#1E2D2D]">{candidate.summary?.split(".")[0] || "Professional"}</div>
                </div>
                <div className="p-3 bg-[#FAF5EB] border border-[#E0CFB7] rounded-xs space-y-1">
                  <span className="text-[10px] text-[#7D8F8F] uppercase">Resume Status</span>
                  <div className="text-[#2D8A8A] font-semibold flex items-center gap-1">
                    <Check size={12} /> Active resume loaded
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 bg-[#FAF5EB] border border-[#E0CFB7] rounded-xs text-center space-y-3 font-mono-code text-xs">
                <p className="text-[#7D8F8F]">No resume has been uploaded yet.</p>
                <Link
                  href="/screener"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#224b4c] text-[#FFFFFF] text-xs font-semibold rounded-xs shadow-xs hover:bg-[#1a3a3b] transition-colors"
                >
                  <UploadCloud size={14} />
                  <span>Upload Your Resume</span>
                </Link>
              </div>
            )}
          </div>

          {/* 2. Screening & ATS Preferences */}
          <div className="bg-[#FAF6EE] border border-[#E0CFB7] p-6 rounded-xs shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-[#E0CFB7] pb-3">
              <Sliders size={16} className="text-[#224b4c]" />
              <h2 className="font-editorial text-xl text-[#1E2D2D]">
                Screening & Keyword Preferences
              </h2>
            </div>

            <div className="space-y-3 text-xs">
              <label className="flex items-center justify-between p-3.5 bg-[#FAF5EB] border border-[#E0CFB7] rounded-xs cursor-pointer hover:border-[#224b4c] transition-colors">
                <div>
                  <div className="font-medium text-[#1E2D2D]">Standard ATS Semantic Parsing</div>
                  <div className="text-[11px] text-[#7D8F8F] mt-0.5">
                    Evaluates both exact keywords and conceptual synonyms across role descriptions.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={!strictMode}
                  onChange={() => setStrictMode(!strictMode)}
                  className="w-4 h-4 accent-[#224b4c]"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 bg-[#FAF5EB] border border-[#E0CFB7] rounded-xs cursor-pointer hover:border-[#224b4c] transition-colors">
                <div>
                  <div className="font-medium text-[#1E2D2D]">Automatic Missing Skill Recommendations</div>
                  <div className="text-[11px] text-[#7D8F8F] mt-0.5">
                    Generate copy-ready accomplishment bullets and ATS keywords for every evaluated job.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={autoSuggest}
                  onChange={() => setAutoSuggest(!autoSuggest)}
                  className="w-4 h-4 accent-[#224b4c]"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 bg-[#FAF5EB] border border-[#E0CFB7] rounded-xs cursor-pointer hover:border-[#224b4c] transition-colors">
                <div>
                  <div className="font-medium text-[#1E2D2D]">High Suitability Match Notifications (80%+)</div>
                  <div className="text-[11px] text-[#7D8F8F] mt-0.5">
                    Notify when your resume achieves an 80%+ match with new industry roles.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={emailAlerts}
                  onChange={() => setEmailAlerts(!emailAlerts)}
                  className="w-4 h-4 accent-[#224b4c]"
                />
              </label>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleSave}
                className="px-5 py-2 bg-[#224b4c] hover:bg-[#1a3a3b] text-[#FFFFFF] text-xs font-medium rounded-xs shadow-xs transition-colors cursor-pointer"
              >
                Save Preferences
              </button>
            </div>
          </div>

          {/* 3. Privacy & Data Control */}
          <div className="bg-[#FAF6EE] border border-[#E0CFB7] p-6 rounded-xs shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-[#E0CFB7] pb-3">
              <Lock size={16} className="text-[#224b4c]" />
              <h2 className="font-editorial text-xl text-[#1E2D2D]">
                Privacy & Data Security
              </h2>
            </div>

            <div className="space-y-3 text-xs text-[#475858]">
              <div className="p-3 bg-[#FAF5EB] border border-[#E0CFB7] rounded-xs flex items-center justify-between">
                <div>
                  <span className="font-medium text-[#1E2D2D]">Resume Privacy:</span>
                  <span className="text-[11px] text-[#7D8F8F] ml-2 font-mono-code">Candidate-Only (Private)</span>
                </div>
                <span className="px-2 py-0.5 bg-[#2D8A8A]/10 text-[#2D8A8A] font-mono-code text-[10px] rounded-xs">
                  Protected
                </span>
              </div>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}
