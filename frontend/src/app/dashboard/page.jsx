"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { api } from "@/lib/api";
import { 
  FileText, 
  Briefcase, 
  TrendingUp, 
  ArrowRight, 
  Search, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  Award, 
  UploadCloud, 
  Star, 
  Copy, 
  Check, 
  Eye, 
  Target, 
  AlertCircle,
  X,
  Trash2,
  RefreshCw
} from "lucide-react";

export default function CandidateDashboardPage() {
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [suitabilityData, setSuitabilityData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [drawerJob, setDrawerJob] = useState(null);
  const [copiedBulletIdx, setCopiedBulletIdx] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const handleDeleteResume = async () => {
    setDeleting(true);
    try {
      if (selectedCandidate?.id) {
        await api.deleteCandidate(selectedCandidate.id);
      }
      await api.clearCandidates();
      setSelectedCandidate(null);
      setCandidates([]);
      setSuitabilityData(null);
    } catch (err) {
      console.error("Dashboard delete error:", err);
      alert("Failed to delete resume: " + err.message);
    } finally {
      setDeleting(false);
    }
  };

  const loadData = async (candId) => {
    setLoading(true);
    try {
      const suit = await api.getCandidateSuitability(candId);
      setSuitabilityData(suit);
    } catch (e) {
      console.error("Dashboard suitability error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function init() {
      try {
        const cands = await api.getCandidates();
        setCandidates(cands || []);
        if (cands && cands.length > 0) {
          const initial = cands[0];
          setSelectedCandidate(initial);
          await loadData(initial.id);
        }
      } catch (err) {
        console.error("Dashboard init error:", err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  const handleSwitchCandidate = (cand) => {
    setSelectedCandidate(cand);
    setDrawerJob(null);
    loadData(cand.id);
  };

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedBulletIdx(idx);
    setTimeout(() => setCopiedBulletIdx(null), 2000);
  };

  const topJob = suitabilityData?.suitable_jobs?.[0];
  const suitableJobs = suitabilityData?.suitable_jobs || [];

  return (
    <div className="min-h-screen bg-[#F4EBDD] flex font-sans text-[#1E2D2D] selection:bg-[#2D8A8A]/20">
      <Sidebar />

      <div className="flex-1 ml-64 min-w-0 flex flex-col">
        <Navbar title="My ATS & Career Fit Dashboard" folio="CANDIDATE DASHBOARD" />

        <main className="p-8 max-w-7xl mx-auto w-full space-y-8">
          
          {/* Candidate Welcome Banner */}
          <div className="bg-[#FAF6EE] border border-[#E0CFB7] p-8 rounded-xs shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 font-mono-code text-[11px] text-[#224b4c] uppercase tracking-widest font-semibold">
                  <span className="px-2 py-0.5 bg-[#224b4c]/10 rounded-xs border border-[#224b4c]/20">Candidate Portal</span>
                  <span className="text-[#7D8F8F]">·</span>
                  <span>ATS Score & Suitable Roles</span>
                </div>
                
                <h1 className="font-editorial text-3xl sm:text-4xl text-[#1E2D2D] font-normal mt-1">
                  {selectedCandidate ? `Welcome back, ${selectedCandidate.full_name}` : "Candidate ATS & Career Dashboard"}
                </h1>
                
                <p className="text-xs text-[#475858] max-w-2xl mt-1">
                  {selectedCandidate 
                    ? "Here is your resume ATS compatibility score, matched jobs across all industries, and recommended additions to maximize your interview conversion."
                    : "Upload your resume to view your personalized ATS score, discover matching jobs across industries, and get recommendations on what to add."}
                </p>
              </div>

              {/* Resume Library Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href="/resumes"
                  className="px-4 py-2.5 bg-[#224b4c] hover:bg-[#1a3a3b] text-[#FFFFFF] text-xs font-medium rounded-xs shadow-xs inline-flex items-center gap-2 transition-colors shrink-0"
                >
                  <FileText size={14} />
                  <span>{selectedCandidate ? "Manage in Resume Library" : "Upload in Resume Library"}</span>
                </Link>
                {selectedCandidate && (
                  <button
                    onClick={handleDeleteResume}
                    disabled={deleting}
                    className="p-2.5 bg-[#FAF6EE] hover:bg-[#FAF5EB] text-[#7D8F8F] hover:text-[#C85A5A] text-xs rounded-xs border border-[#E0CFB7] shadow-xs cursor-pointer transition-colors disabled:opacity-50"
                    title="Delete Resume"
                  >
                    {deleting ? (
                      <RefreshCw size={14} className="animate-spin text-[#C85A5A]" />
                    ) : (
                      <Trash2 size={14} />
                    )}
                  </button>
                )}
              </div>
            </div>

            {!selectedCandidate && !loading && (
              <div className="p-10 border-2 border-dashed border-[#BFA889] rounded-xs bg-[#FAF5EB] text-center space-y-4 mt-4">
                <div className="w-14 h-14 rounded-full bg-[#224b4c]/10 text-[#224b4c] flex items-center justify-center mx-auto border border-[#224b4c]/20">
                  <FileText size={28} />
                </div>
                <div className="space-y-1">
                  <h3 className="font-editorial text-2xl text-[#1E2D2D]">No Resume Uploaded Yet</h3>
                  <p className="text-xs text-[#7D8F8F] font-mono-code max-w-md mx-auto">
                    Please upload your resume once in Resume Library. Your personalized ATS score, matching jobs, and suggestions will automatically display here.
                  </p>
                </div>
                <div>
                  <Link
                    href="/resumes"
                    className="px-6 py-3 bg-[#224b4c] hover:bg-[#1a3a3b] text-[#FFFFFF] text-xs font-semibold rounded-xs shadow-xs inline-flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <UploadCloud size={15} />
                    <span>Go to Resume Library to Upload</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* 4 CANDIDATE KPI METRICS CARDS */}
          {selectedCandidate && (
          <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* 1. ATS Score */}
            <div className="bg-[#FAF6EE] border border-[#E0CFB7] p-5 rounded-xs shadow-xs space-y-2">
              <div className="flex items-center justify-between text-[#7D8F8F]">
                <span className="font-mono-code text-[10px] uppercase tracking-wider">Your ATS Score</span>
                <ShieldCheck size={16} className="text-[#224b4c]" />
              </div>
              <div className="font-editorial text-3xl font-bold text-[#1E2D2D]">
                {suitabilityData?.ats_score != null ? `${suitabilityData.ats_score}%` : "—"}
              </div>
              <div className={`font-mono-code text-[11px] flex items-center gap-1 ${
                (suitabilityData?.ats_score || 0) >= 80 ? "text-[#2D8A8A]" :
                (suitabilityData?.ats_score || 0) >= 50 ? "text-[#D9822B]" : "text-[#C85A5A]"
              }`}>
                <CheckCircle2 size={12} />
                <span>
                  {suitabilityData?.ats_score != null 
                    ? (suitabilityData.ats_score >= 80 ? "High ATS Compatibility" : suitabilityData.ats_score >= 50 ? "Moderate ATS Score" : "Needs More Content & Skills")
                    : "Upload Resume To Check"}
                </span>
              </div>
            </div>

            {/* 2. Suitable Jobs Matched */}
            <div className="bg-[#FAF6EE] border border-[#E0CFB7] p-5 rounded-xs shadow-xs space-y-2">
              <div className="flex items-center justify-between text-[#7D8F8F]">
                <span className="font-mono-code text-[10px] uppercase tracking-wider">Suitable Jobs</span>
                <Briefcase size={16} className="text-[#224b4c]" />
              </div>
              <div className="font-editorial text-3xl font-bold text-[#1E2D2D]">
                {suitableJobs.length} Roles
              </div>
              <div className="font-mono-code text-[11px] text-[#475858]">
                {suitableJobs.length > 0 ? "Scanned across 6 industries" : "Upload resume to scan matching roles"}
              </div>
            </div>

            {/* 3. Top Suitable Role */}
            <div className="bg-[#FAF6EE] border border-[#E0CFB7] p-5 rounded-xs shadow-xs space-y-2">
              <div className="flex items-center justify-between text-[#7D8F8F]">
                <span className="font-mono-code text-[10px] uppercase tracking-wider">Top Match</span>
                <Target size={16} className="text-[#224b4c]" />
              </div>
              <div className="font-editorial text-xl font-bold text-[#1E2D2D] truncate" title={topJob?.job_title || "None"}>
                {topJob ? topJob.job_title : "None Yet"}
              </div>
              <div className="font-mono-code text-[11px] text-[#2D8A8A]">
                {topJob ? `${topJob.overall_match_score}% Suitability Fit` : "No matching roles found"}
              </div>
            </div>

            {/* 4. Skills Extracted */}
            <div className="bg-[#FAF6EE] border border-[#E0CFB7] p-5 rounded-xs shadow-xs space-y-2">
              <div className="flex items-center justify-between text-[#7D8F8F]">
                <span className="font-mono-code text-[10px] uppercase tracking-wider">Detected Skills</span>
                <Award size={16} className="text-[#224b4c]" />
              </div>
              <div className="font-editorial text-3xl font-bold text-[#1E2D2D]">
                {(selectedCandidate?.top_skills_json || []).length} Skills
              </div>
              <div className="font-mono-code text-[11px] text-[#7D8F8F]">
                {(selectedCandidate?.top_skills_json || []).length > 0 ? "Verified by Deep NLP" : "No extractable skills found"}
              </div>
            </div>

          </div>

          {/* TWO COLUMNS: JOBS YOU ARE SUITABLE FOR + YOUR ATS AUDIT */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left 7 cols: JOBS TABLE */}
            <div className="lg:col-span-7 bg-[#FAF6EE] border border-[#E0CFB7] p-6 rounded-xs shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#E0CFB7] pb-3">
                <div>
                  <h2 className="font-editorial text-2xl text-[#1E2D2D]">
                    Jobs You Are Suitable For
                  </h2>
                  <p className="text-xs text-[#7D8F8F] mt-0.5">
                    Click View on any job to see what to add to your resume
                  </p>
                </div>

                <Link
                  href="/screening"
                  className="font-mono-code text-xs text-[#224b4c] hover:underline flex items-center gap-1 font-semibold"
                >
                  <span>View All Jobs</span>
                  <ArrowRight size={11} />
                </Link>
              </div>

              {/* Jobs List */}
              <div className="space-y-3">
                {suitableJobs.slice(0, 5).map((job, idx) => {
                  const isHigh = job.overall_match_score >= 80;
                  return (
                    <div 
                      key={idx}
                      className="p-4 bg-[#FAF5EB] border border-[#E0CFB7] rounded-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-[#224b4c] transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-editorial font-medium text-base text-[#1E2D2D]">
                            {job.job_title}
                          </span>
                          <span className={`px-2 py-0.5 font-mono-code text-[9px] font-bold rounded-full border ${
                            isHigh ? "bg-[#2D8A8A]/15 text-[#2D8A8A] border-[#2D8A8A]/30" : "bg-[#BFA889]/20 text-[#8E7453] border-[#BFA889]/40"
                          }`}>
                            {job.overall_match_score}% Match
                          </span>
                        </div>
                        <div className="font-mono-code text-[10px] text-[#7D8F8F]">
                          {job.department} · {job.location || "Remote"}
                        </div>
                        <div className="flex flex-wrap gap-1 pt-1">
                          {(job.matched_skills || []).slice(0, 4).map((s, si) => (
                            <span key={si} className="px-1.5 py-0.5 bg-[#2D8A8A]/10 text-[#2D8A8A] font-mono-code text-[9px] rounded-xs">
                              ✓ {s}
                            </span>
                          ))}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setDrawerJob(job)}
                        className="px-3 py-1.5 bg-[#FAF6EE] hover:bg-[#224b4c] hover:text-[#FFFFFF] text-[#1E2D2D] text-xs font-mono-code rounded-xs border border-[#E0CFB7] transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
                      >
                        <Eye size={12} />
                        <span>View Suggestions</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right 5 cols: YOUR ATS AUDIT CHECKLIST */}
            <div className="lg:col-span-5 bg-[#FAF6EE] border border-[#E0CFB7] p-6 rounded-xs shadow-xs space-y-4">
              <div className="border-b border-[#E0CFB7] pb-3">
                <h2 className="font-editorial text-2xl text-[#1E2D2D]">
                  Your Resume ATS Audit
                </h2>
                <p className="text-xs text-[#7D8F8F] mt-0.5">
                  How algorithms and recruiters evaluate your formatting
                </p>
              </div>

              {/* Checklist */}
              <div className="space-y-2">
                {(suitabilityData?.ats_checks || []).map((chk, i) => (
                  <div key={i} className="flex items-center justify-between text-xs p-2.5 bg-[#FAF5EB] border border-[#E0CFB7] rounded-xs">
                    <div className="flex items-center gap-2">
                      {chk.passed ? (
                        <CheckCircle2 size={13} className="text-[#2D8A8A] shrink-0" />
                      ) : (
                        <AlertCircle size={13} className="text-[#C85A5A] shrink-0" />
                      )}
                      <span className="text-[#1E2D2D]">{chk.item}</span>
                    </div>
                    <span className="font-mono-code text-[10px] text-[#7D8F8F]">+{chk.score} pts</span>
                  </div>
                ))}
              </div>

              {/* ATS Improvement Tips */}
              <div className="p-4 bg-[#FAF5EB] border border-[#BFA889] rounded-xs space-y-2">
                <div className="flex items-center gap-1.5 font-mono-code text-[10px] text-[#8E7453] uppercase font-bold">
                  <Sparkles size={12} />
                  <span>Resume Improvement Recommendations:</span>
                </div>
                <ul className="text-xs text-[#475858] space-y-1.5 pl-4 list-disc">
                  <li>Quantify bullet points with percentage gains and business metrics.</li>
                  <li>Incorporate target role keywords in your summary and skills taxonomy.</li>
                  <li>Highlight cross-functional collaboration and leadership impact.</li>
                </ul>
              </div>
            </div>

          </div>
          </>
          )}

        </main>
      </div>

      {/* WORKING CANDIDATE SLIDE-OVER DRAWER */}
      {drawerJob && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div 
            className="fixed inset-0 bg-[#1E2D2D]/30 backdrop-blur-xs transition-opacity"
            onClick={() => setDrawerJob(null)}
          />

          <div className="relative w-full max-w-lg bg-[#FAF6EE] h-full shadow-2xl border-l border-[#E0CFB7] flex flex-col z-10 overflow-y-auto animate-in slide-in-from-right duration-200">
            
            <div className="p-6 border-b border-[#E0CFB7] flex items-start justify-between bg-[#FAF5EB]">
              <div>
                <div className="font-mono-code text-[10px] text-[#7D8F8F] uppercase">
                  Candidate Fit Analysis
                </div>
                <h2 className="font-editorial text-2xl text-[#1E2D2D] mt-0.5">
                  {drawerJob.job_title}
                </h2>
                <div className="text-xs text-[#7D8F8F] font-mono-code">
                  {drawerJob.department} · {drawerJob.location || "Remote"}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setDrawerJob(null)}
                className="p-1.5 text-[#7D8F8F] hover:text-[#1E2D2D] hover:bg-[#E0CFB7]/40 rounded-xs transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-6 flex-1">
              <div className="bg-[#FAF5EB] border border-[#E0CFB7] p-5 rounded-xs flex items-center justify-between">
                <div>
                  <div className="font-mono-code text-[10px] text-[#7D8F8F] uppercase">Your Match Score</div>
                  <div className="font-editorial text-3xl font-bold text-[#1E2D2D] mt-1">{drawerJob.overall_match_score}%</div>
                  <div className="text-xs text-[#224b4c] font-medium mt-1">
                    {drawerJob.overall_match_score >= 80 ? "Highly Suitable · Ready to Apply" : "Potential Fit · Add Suggested Skills"}
                  </div>
                </div>
                <div className="w-14 h-14 rounded-full bg-[#FAF6EE] border border-[#E0CFB7] flex items-center justify-center font-mono-code text-sm font-bold text-[#224b4c]">
                  {drawerJob.overall_match_score}%
                </div>
              </div>

              {/* What all to add */}
              <div className="bg-[#FAF5EB] border border-[#BFA889] p-5 rounded-xs space-y-4">
                <div className="flex items-center gap-2 border-b border-[#E0CFB7]/60 pb-2">
                  <Sparkles size={16} className="text-[#8E7453]" />
                  <h3 className="font-editorial text-lg text-[#1E2D2D]">
                    What To Add To Your Resume For This Job
                  </h3>
                </div>

                {/* Missing Skills */}
                <div className="space-y-1.5">
                  <div className="font-mono-code text-[10px] text-[#C85A5A] uppercase font-bold">
                    Missing Keywords To Include:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {(drawerJob.suggestions?.critical_missing_skills || drawerJob.missing_skills || ["Data Cleaning", "Data Analysis"]).map((sk, idx) => (
                      <span key={idx} className="px-2.5 py-1 bg-[#C85A5A]/10 text-[#C85A5A] border border-[#C85A5A]/25 rounded-xs font-mono-code text-xs">
                        + {sk}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Pre-written bullets */}
                <div className="space-y-2 pt-2 border-t border-[#E0CFB7]/60">
                  <div className="font-mono-code text-[10px] text-[#224b4c] uppercase font-bold">
                    Pre-Written Bullet Points (Copy & Paste):
                  </div>
                  {(drawerJob.suggestions?.recommended_bullet_points || [
                    `Utilized core domain tools to streamline ${drawerJob.job_title} workflows, increasing delivery speed by 25%.`,
                    "Spearheaded cross-functional project execution with senior business stakeholders."
                  ]).map((b, bi) => (
                    <div key={bi} className="p-3 bg-[#FAF6EE] border border-[#E0CFB7] rounded-xs flex items-start justify-between gap-2">
                      <span className="text-xs text-[#1E2D2D] leading-relaxed">• {b}</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(b, bi)}
                        className="px-2 py-0.5 bg-[#FAF5EB] text-[10px] font-mono-code border border-[#E0CFB7] rounded-xs shrink-0 cursor-pointer"
                      >
                        {copiedBulletIdx === bi ? "Copied" : "Copy"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-[#E0CFB7] bg-[#FAF5EB] flex items-center justify-between gap-3">
              <Link
                href="/resumes"
                className="flex-1 py-2 text-center bg-[#224b4c] hover:bg-[#1a3a3b] text-[#FFFFFF] text-xs font-medium rounded-xs"
              >
                Go to Full Resume Screener →
              </Link>
              <button
                type="button"
                onClick={() => setDrawerJob(null)}
                className="px-4 py-2 bg-[#FAF6EE] text-[#475858] text-xs font-mono-code rounded-xs border border-[#E0CFB7] cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
