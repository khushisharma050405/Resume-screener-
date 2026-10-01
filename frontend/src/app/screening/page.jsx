"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { api } from "@/lib/api";
import { 
  Briefcase, 
  Search, 
  Filter, 
  ArrowRight, 
  Eye, 
  MoreVertical, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Download, 
  Star, 
  ShieldCheck, 
  Award,
  UploadCloud,
  FileText,
  Copy,
  Check,
  Building,
  Target
} from "lucide-react";

export default function CandidateSuitableJobsPage() {
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [suitabilityData, setSuitabilityData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Drawer states
  const [drawerJob, setDrawerJob] = useState(null);
  const [activeDropdownJobId, setActiveDropdownJobId] = useState(null);
  const [savedJobIds, setSavedJobIds] = useState(new Set([1, 6]));
  const [copiedBulletIdx, setCopiedBulletIdx] = useState(null);

  // File upload state
  const [uploading, setUploading] = useState(false);
  const [uploadNotice, setUploadNotice] = useState("");

  // Load candidate and their suitability across all jobs
  const loadCandidateData = async (candId) => {
    setLoading(true);
    try {
      const suit = await api.getCandidateSuitability(candId);
      setSuitabilityData(suit);
    } catch (e) {
      console.error("Error loading candidate suitability:", e);
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
          await loadCandidateData(initial.id);
        }
      } catch (err) {
        console.error("Init error:", err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  const handleSwitchCandidate = (cand) => {
    setSelectedCandidate(cand);
    setDrawerJob(null);
    loadCandidateData(cand.id);
  };

  // Upload candidate's resume directly via FormData
  const handleResumeUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadNotice("");
    try {
      const res = await api.uploadResume(file);
      const updated = await api.getCandidates();
      setCandidates(updated || []);
      const newCand = updated?.find(c => c.id === res.candidate_id) || updated?.[0];
      if (newCand) {
        setSelectedCandidate(newCand);
        await loadCandidateData(newCand.id);
        setUploadNotice(`✓ Successfully parsed ${file.name}! Your ATS score and suitable jobs are updated below.`);
      }
    } catch (err) {
      console.error("Upload error:", err);
      setUploadNotice("Upload failed. Please ensure the file is a readable PDF or DOCX.");
    } finally {
      setUploading(false);
    }
  };

  const toggleSaveJob = (id) => {
    setSavedJobIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleCopyBullet = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedBulletIdx(idx);
    setTimeout(() => setCopiedBulletIdx(null), 2000);
  };

  const allSuitableJobs = suitabilityData?.suitable_jobs || [];

  const filteredJobs = allSuitableJobs.filter(j => {
    const matchesSearch = j.job_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          j.department?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (j.matched_skills || []).some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    if (!matchesSearch) return false;

    if (activeTab === "high") return j.overall_match_score >= 80;
    if (activeTab === "moderate") return j.overall_match_score >= 60 && j.overall_match_score < 80;
    if (activeTab === "saved") return savedJobIds.has(j.job_id);
    return true;
  });

  return (
    <div className="min-h-screen bg-[#F4EBDD] flex font-sans text-[#1E2D2D] selection:bg-[#2D8A8A]/20">
      <Sidebar />

      <div className="flex-1 ml-64 min-w-0 flex flex-col">
        <Navbar title="Jobs You Are Suitable For & What To Add" folio="CANDIDATE CAREER FIT" />

        <main className="p-8 max-w-7xl mx-auto w-full space-y-6">
          
          {/* Active Candidate Header Bar */}
          <div className="bg-[#FAF6EE] border border-[#E0CFB7] p-6 rounded-xs shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 font-mono-code text-[10px] uppercase tracking-widest text-[#224b4c] font-semibold">
                  <span className="px-2 py-0.5 bg-[#224b4c]/10 rounded-xs border border-[#224b4c]/20">Candidate Portal</span>
                  <span className="text-[#7D8F8F]">·</span>
                  <span>Personalized Job Recommendations</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <h1 className="font-editorial text-3xl text-[#1E2D2D] font-normal">
                    Jobs You Are Suitable For
                  </h1>
                  <span className="font-mono-code text-xs text-[#7D8F8F]">
                    · Scanned across {allSuitableJobs.length} diverse industry roles
                  </span>
                </div>
              </div>

              {/* Link to My Resumes */}
              <div className="flex items-center gap-3">
                <Link
                  href="/resumes"
                  className="px-4 py-2 bg-[#224b4c] hover:bg-[#1a3a3b] text-[#FFFFFF] text-xs font-medium rounded-xs border border-[#224b4c] transition-colors inline-flex items-center gap-2 shadow-xs"
                >
                  <FileText size={14} />
                  <span>{selectedCandidate ? "My Resume Profile" : "Upload in My Resumes"}</span>
                </Link>
              </div>
            </div>

            {uploadNotice && (
              <div className="p-2.5 bg-[#2D8A8A]/10 border border-[#2D8A8A]/30 text-[#2D8A8A] text-xs font-mono-code rounded-xs flex items-center justify-between">
                <span>{uploadNotice}</span>
                <button onClick={() => setUploadNotice("")} className="underline text-[10px] cursor-pointer">Dismiss</button>
              </div>
            )}

            {/* If no resume uploaded yet */}
            {!selectedCandidate && !uploading && (
              <div className="p-10 border-2 border-dashed border-[#BFA889] rounded-xs bg-[#FAF5EB] text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-[#224b4c]/10 text-[#224b4c] flex items-center justify-center mx-auto border border-[#224b4c]/20">
                  <FileText size={28} />
                </div>
                <div className="space-y-1">
                  <h3 className="font-editorial text-2xl text-[#1E2D2D]">No Resume Uploaded Yet</h3>
                  <p className="text-xs text-[#7D8F8F] font-mono-code max-w-md mx-auto">
                    Please upload your resume once in My Resumes. Your personalized job recommendations and skills match will automatically appear here.
                  </p>
                </div>
                <div>
                  <Link
                    href="/resumes"
                    className="px-6 py-3 bg-[#224b4c] hover:bg-[#1a3a3b] text-[#FFFFFF] text-xs font-semibold rounded-xs shadow-xs inline-flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <UploadCloud size={15} />
                    <span>Go to My Resumes to Upload</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            )}

            {/* Candidate Resume & ATS Summary Strip */}
            {selectedCandidate && (
              <div className="pt-3 border-t border-[#E0CFB7] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#E0CFB7] text-[#1E2D2D] font-editorial font-bold text-sm flex items-center justify-center border border-[#BFA889]">
                    {selectedCandidate.full_name?.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-xs text-[#1E2D2D]">
                        Active Resume: {selectedCandidate.full_name}
                      </span>
                      <span className="text-[10px] font-mono-code text-[#7D8F8F]">
                        ({selectedCandidate.email})
                      </span>
                    </div>
                    <div className="font-mono-code text-[10px] text-[#224b4c]">
                      {selectedCandidate.headline || selectedCandidate.summary?.slice(0, 45) || "Candidate Profile"}
                    </div>
                  </div>
                </div>

                {/* Candidate's ATS Score Badge */}
                <div className="flex items-center gap-3 bg-[#FAF5EB] px-3.5 py-1.5 rounded-xs border border-[#E0CFB7]">
                  <div className="text-right">
                    <div className="font-mono-code text-[9px] uppercase text-[#7D8F8F]">Your Resume ATS Score</div>
                    <div className="font-editorial text-sm font-bold text-[#224b4c]">
                      {suitabilityData?.ats_score != null ? `${suitabilityData.ats_score}% Ready` : "—"}
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-[#224b4c]/10 text-[#224b4c] flex items-center justify-center font-mono-code text-xs font-bold border border-[#224b4c]/20">
                    {suitabilityData?.ats_score != null ? `${suitabilityData.ats_score}%` : "—"}
                  </div>
                </div>
              </div>
            )}

            </div>

          {/* MAIN JOBS TABLE: The Jobs YOU Are Suitable For */}
          {selectedCandidate && (
          <div className="bg-[#FAF6EE] border border-[#E0CFB7] rounded-xs shadow-xs p-6 space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E0CFB7] pb-4">
              <div className="flex items-center gap-2 font-mono-code text-xs">
                {[
                  { id: "all", label: `All Matching Jobs (${allSuitableJobs.length})` },
                  { id: "high", label: "High Suitability (80%+)" },
                  { id: "moderate", label: "Moderate Fit (60-79%)" },
                  { id: "saved", label: `Saved Jobs (${savedJobIds.size})` },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-3 py-1 rounded-xs transition-colors cursor-pointer ${
                      activeTab === tab.id
                        ? "bg-[#224b4c] text-[#FFFFFF] font-medium"
                        : "text-[#7D8F8F] hover:text-[#1E2D2D] hover:bg-[#E0CFB7]/30"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#7D8F8F]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search job title or required skill..."
                    className="pl-8 pr-3 py-1.5 text-xs bg-[#FAF5EB] border border-[#E0CFB7] rounded-xs text-[#1E2D2D] focus:outline-none focus:border-[#224b4c] w-64"
                  />
                </div>
              </div>
            </div>

            {/* Jobs You Are Suitable For Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E0CFB7] text-[#7D8F8F] font-mono-code text-[11px]">
                    <th className="py-2.5 px-3 w-8">
                      <Star size={12} className="text-[#7D8F8F]" />
                    </th>
                    <th className="py-2.5 px-3 font-normal">Job Role & Department</th>
                    <th className="py-2.5 px-3 font-normal">Location</th>
                    <th className="py-2.5 px-3 font-normal">Your Match Score</th>
                    <th className="py-2.5 px-3 font-normal">Suitability Fit</th>
                    <th className="py-2.5 px-3 font-normal">Your Matched Skills</th>
                    <th className="py-2.5 px-3 font-normal">Missing Skills To Add</th>
                    <th className="py-2.5 px-3 font-normal text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E0CFB7]">
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="text-center py-8 font-mono-code text-[#7D8F8F]">
                        Calculating your suitability and tailored suggestions...
                      </td>
                    </tr>
                  ) : filteredJobs.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-8 font-mono-code text-[#7D8F8F]">
                        No jobs found matching your filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredJobs.map((job) => {
                      const isSaved = savedJobIds.has(job.job_id);
                      const isHigh = job.overall_match_score >= 80;
                      const isModerate = job.overall_match_score >= 60 && job.overall_match_score < 80;

                      return (
                        <tr key={job.job_id} className="hover:bg-[#FAF5EB] transition-colors group">
                          {/* 1. Bookmark / Save Job */}
                          <td className="py-3 px-3">
                            <button
                              type="button"
                              onClick={() => toggleSaveJob(job.job_id)}
                              className="text-[#7D8F8F] hover:text-[#E5A83B] transition-colors cursor-pointer"
                              title={isSaved ? "Saved Job" : "Save Job"}
                            >
                              <Star size={14} className={isSaved ? "fill-[#E5A83B] text-[#E5A83B]" : ""} />
                            </button>
                          </td>

                          {/* 2. Job Title & Department */}
                          <td className="py-3 px-3">
                            <div>
                              <button
                                type="button"
                                onClick={() => setDrawerJob(job)}
                                className="font-medium text-xs text-[#1E2D2D] hover:text-[#224b4c] text-left cursor-pointer font-serif text-sm"
                              >
                                {job.job_title}
                              </button>
                              <div className="font-mono-code text-[10px] text-[#7D8F8F]">
                                {job.department}
                              </div>
                            </div>
                          </td>

                          {/* 3. Location */}
                          <td className="py-3 px-3 font-mono-code text-[#475858]">
                            {job.location || "Remote"}
                          </td>

                          {/* 4. Your Match Score with Visual Bar */}
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2">
                              <span className="font-editorial font-bold text-sm text-[#1E2D2D] w-8">
                                {job.overall_match_score}%
                              </span>
                              <div className="w-16 h-1.5 bg-[#E0CFB7]/60 rounded-full overflow-hidden">
                                <div 
                                  className="h-full rounded-full" 
                                  style={{ 
                                    width: `${job.overall_match_score}%`, 
                                    backgroundColor: isHigh ? "#2D8A8A" : isModerate ? "#BFA889" : "#7D8F8F" 
                                  }} 
                                />
                              </div>
                            </div>
                          </td>

                          {/* 5. Suitability Badge */}
                          <td className="py-3 px-3">
                            <span className={`px-2.5 py-0.5 font-mono-code text-[10px] font-bold rounded-full border ${
                              isHigh 
                                ? "bg-[#2D8A8A]/15 text-[#2D8A8A] border-[#2D8A8A]/30" 
                                : isModerate 
                                  ? "bg-[#BFA889]/25 text-[#8E7453] border-[#BFA889]/40" 
                                  : "bg-[#E0CFB7]/40 text-[#7D8F8F] border-[#E0CFB7]"
                            }`}>
                              {isHigh ? "Highly Suitable" : isModerate ? "Potential Fit" : "Low Fit"}
                            </span>
                          </td>

                          {/* 6. Matched Skills */}
                          <td className="py-3 px-3">
                            <div className="flex flex-wrap gap-1 max-w-[200px]">
                              {(job.matched_skills || []).length === 0 ? (
                                <span className="font-mono-code text-[10px] text-[#7D8F8F]">None detected</span>
                              ) : (
                                (job.matched_skills || []).slice(0, 3).map((s, idx) => (
                                  <span key={idx} className="font-mono-code text-[9px] px-1.5 py-0.5 bg-[#2D8A8A]/10 text-[#2D8A8A] rounded-xs">
                                    ✓ {s}
                                  </span>
                                ))
                              )}
                              {(job.matched_skills || []).length > 3 && (
                                <span className="font-mono-code text-[9px] text-[#7D8F8F]">
                                  +{(job.matched_skills || []).length - 3}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* 7. Missing Skills To Add */}
                          <td className="py-3 px-3">
                            <div className="flex flex-wrap gap-1 max-w-[180px]">
                              {(job.missing_skills || []).length === 0 ? (
                                <span className="font-mono-code text-[10px] text-[#2D8A8A]">All skills matched!</span>
                              ) : (
                                (job.missing_skills || []).slice(0, 2).map((s, idx) => (
                                  <span key={idx} className="font-mono-code text-[9px] px-1.5 py-0.5 bg-[#C85A5A]/10 text-[#C85A5A] rounded-xs">
                                    + {s}
                                  </span>
                                ))
                              )}
                              {(job.missing_skills || []).length > 2 && (
                                <span className="font-mono-code text-[9px] text-[#7D8F8F]">
                                  +{(job.missing_skills || []).length - 2}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* 8. ACTIONS: Working [ View ] and [ ... ] */}
                          <td className="py-3 px-3 text-right">
                            <div className="inline-flex items-center gap-1.5 relative">
                              
                              {/* Working View Button -> Opens Slide-Over Drawer showing what to add */}
                              <button
                                type="button"
                                onClick={() => {
                                  setDrawerJob(job);
                                  setActiveDropdownJobId(null);
                                }}
                                className="px-2.5 py-1 bg-[#FAF6EE] hover:bg-[#224b4c] hover:text-[#FFFFFF] text-[#1E2D2D] text-[11px] font-mono-code rounded-xs border border-[#E0CFB7] transition-colors cursor-pointer shadow-xs inline-flex items-center gap-1"
                              >
                                <Eye size={11} />
                                <span>View</span>
                              </button>

                              {/* Working Three Dots Menu */}
                              <button
                                type="button"
                                onClick={() => setActiveDropdownJobId(activeDropdownJobId === job.job_id ? null : job.job_id)}
                                className="p-1 text-[#7D8F8F] hover:text-[#1E2D2D] hover:bg-[#E0CFB7]/40 rounded-xs transition-colors cursor-pointer"
                                title="More Actions"
                              >
                                <MoreVertical size={13} />
                              </button>

                              {/* Dropdown Menu */}
                              {activeDropdownJobId === job.job_id && (
                                <div className="absolute right-0 top-8 z-50 w-52 bg-[#FAF6EE] border border-[#E0CFB7] rounded-xs shadow-md py-1 text-left font-sans text-xs animate-in fade-in duration-150">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setDrawerJob(job);
                                      setActiveDropdownJobId(null);
                                    }}
                                    className="w-full px-3 py-1.5 text-left text-[#1E2D2D] hover:bg-[#FAF5EB] flex items-center gap-2 cursor-pointer"
                                  >
                                    <Sparkles size={12} className="text-[#224b4c]" />
                                    <span>View What To Add</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      toggleSaveJob(job.job_id);
                                      setActiveDropdownJobId(null);
                                    }}
                                    className="w-full px-3 py-1.5 text-left text-[#1E2D2D] hover:bg-[#FAF5EB] flex items-center gap-2 cursor-pointer"
                                  >
                                    <Star size={12} className={isSaved ? "text-[#E5A83B]" : "text-[#7D8F8F]"} />
                                    <span>{isSaved ? "Remove from Saved" : "Save This Job"}</span>
                                  </button>

                                  <Link
                                    href="/resumes"
                                    className="w-full px-3 py-1.5 text-left text-[#1E2D2D] hover:bg-[#FAF5EB] flex items-center gap-2"
                                  >
                                    <ShieldCheck size={12} className="text-[#2D8A8A]" />
                                    <span>Full Resume ATS Audit</span>
                                  </Link>
                                </div>
                              )}

                            </div>
                          </td>

                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

          </div>
          )}

        </main>
      </div>

      {/* WORKING CANDIDATE SLIDE-OVER DRAWER: "WHAT ALL YOU CAN ADD FOR THIS JOB" */}
      {drawerJob && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-[#1E2D2D]/30 backdrop-blur-xs transition-opacity"
            onClick={() => setDrawerJob(null)}
          />

          {/* Drawer Panel */}
          <div className="relative w-full max-w-lg bg-[#FAF6EE] h-full shadow-2xl border-l border-[#E0CFB7] flex flex-col z-10 overflow-y-auto animate-in slide-in-from-right duration-200">
            
            {/* Drawer Header */}
            <div className="p-6 border-b border-[#E0CFB7] flex items-start justify-between bg-[#FAF5EB]">
              <div>
                <div className="font-mono-code text-[10px] text-[#7D8F8F] uppercase tracking-wider">
                  Suitability Analysis For Your Resume
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

            {/* Drawer Content */}
            <div className="p-6 space-y-6 flex-1">
              
              {/* Suitability Score Banner */}
              <div className="bg-[#FAF5EB] border border-[#E0CFB7] p-5 rounded-xs flex items-center justify-between gap-4">
                <div>
                  <div className="font-mono-code text-[10px] text-[#7D8F8F] uppercase tracking-wider">
                    Your Match Score
                  </div>
                  <div className="font-editorial text-3xl font-bold text-[#1E2D2D] mt-1">
                    {drawerJob.overall_match_score}%
                  </div>
                  <div className="text-xs text-[#224b4c] font-medium mt-1">
                    {drawerJob.overall_match_score >= 80 ? "Highly Suitable · Ready to Apply" : "Potential Fit · Add Suggested Keywords"}
                  </div>
                </div>

                <div className="w-16 h-16 rounded-full bg-[#FAF6EE] border border-[#E0CFB7] flex items-center justify-center font-mono-code text-base font-bold text-[#224b4c] shrink-0">
                  {drawerJob.overall_match_score}%
                </div>
              </div>

              {/* Matched Skills You Already Have */}
              <div className="bg-[#FAF5EB] border border-[#E0CFB7] p-5 rounded-xs space-y-3">
                <div className="flex items-center gap-2 border-b border-[#E0CFB7]/60 pb-2">
                  <CheckCircle2 size={15} className="text-[#2D8A8A]" />
                  <h3 className="font-editorial text-base text-[#1E2D2D]">
                    Skills You Already Have That Match:
                  </h3>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(drawerJob.matched_skills || []).map((s, idx) => (
                    <span key={idx} className="px-2 py-0.5 bg-[#2D8A8A]/10 text-[#2D8A8A] font-mono-code text-xs rounded-xs">
                      ✓ {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* WHAT ALL YOU CAN ADD TO YOUR RESUME */}
              <div className="bg-[#FAF5EB] border border-[#BFA889] p-5 rounded-xs space-y-4">
                <div className="flex items-center gap-2 border-b border-[#E0CFB7]/60 pb-2">
                  <Sparkles size={16} className="text-[#8E7453]" />
                  <h3 className="font-editorial text-lg text-[#1E2D2D]">
                    What All You Can Add To Your Resume
                  </h3>
                </div>

                {/* 1. Critical Missing Skills */}
                <div className="space-y-1.5">
                  <div className="font-mono-code text-[10px] text-[#C85A5A] uppercase font-bold">
                    1. Missing Skills To Include:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {(drawerJob.suggestions?.critical_missing_skills || drawerJob.missing_skills || ["Data Cleaning", "Data Analysis"]).map((sk, idx) => (
                      <span key={idx} className="px-2.5 py-1 bg-[#C85A5A]/10 text-[#C85A5A] border border-[#C85A5A]/25 rounded-xs font-mono-code text-xs">
                        + {sk}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 2. Recommended Bullet Points */}
                <div className="space-y-2 pt-2 border-t border-[#E0CFB7]/60">
                  <div className="font-mono-code text-[10px] text-[#224b4c] uppercase font-bold">
                    2. Recommended Copy-Pasteable Bullet Points:
                  </div>
                  
                  <div className="space-y-2">
                    {(drawerJob.suggestions?.recommended_bullet_points || [
                      `Utilized hands-on domain tools to streamline core workflows relevant to ${drawerJob.job_title}, improving efficiency by 25%.`,
                      "Collaborated directly with cross-functional stakeholders to deliver measurable project milestones.",
                      `Incorporated key industry frameworks into the end-to-end delivery lifecycle.`
                    ]).map((bullet, idx) => (
                      <div key={idx} className="p-3 bg-[#FAF6EE] border border-[#E0CFB7] rounded-xs flex items-start justify-between gap-2.5">
                        <div className="text-xs text-[#1E2D2D] leading-relaxed">
                          • {bullet}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopyBullet(bullet, idx)}
                          className="px-2 py-0.5 bg-[#FAF5EB] hover:bg-[#E0CFB7]/40 text-[#475858] text-[10px] font-mono-code rounded-xs border border-[#E0CFB7] shrink-0 flex items-center gap-1 cursor-pointer"
                        >
                          {copiedBulletIdx === idx ? (
                            <>
                              <Check size={10} className="text-[#2D8A8A]" />
                              <span className="text-[#2D8A8A] font-semibold">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy size={10} />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. Recommended Certifications */}
                <div className="space-y-1.5 pt-2 border-t border-[#E0CFB7]/60">
                  <div className="font-mono-code text-[10px] text-[#8E7453] uppercase font-bold">
                    3. Recommended Certifications:
                  </div>
                  <div className="text-xs text-[#1E2D2D] space-y-1">
                    {(drawerJob.suggestions?.recommended_certifications || [
                      `Certified Specialist in ${drawerJob.job_title.split(" ")[0]}`,
                      "Agile / Project Leadership Practitioner"
                    ]).map((cert, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 text-xs text-[#475858]">
                        <Award size={12} className="text-[#8E7453] shrink-0" />
                        <span>{cert}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-[#E0CFB7] bg-[#FAF5EB] flex items-center justify-between gap-3">
              <Link
                href="/resumes"
                className="flex-1 py-2 text-center bg-[#224b4c] hover:bg-[#1a3a3b] text-[#FFFFFF] text-xs font-medium rounded-xs transition-colors"
              >
                Go to ATS Optimizer & Screener →
              </Link>
              <button
                type="button"
                onClick={() => setDrawerJob(null)}
                className="px-4 py-2 bg-[#FAF6EE] hover:bg-[#E0CFB7]/40 text-[#475858] text-xs font-mono-code rounded-xs border border-[#E0CFB7] transition-colors cursor-pointer"
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
