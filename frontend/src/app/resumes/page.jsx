"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { api } from "@/lib/api";
import { 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Award,
  Briefcase,
  GraduationCap,
  RefreshCw,
  Trash2,
  ExternalLink,
  ChevronRight,
  LayoutDashboard,
  GitCompare,
  Mail,
  Phone,
  MapPin
} from "lucide-react";

export default function MyResumesPage() {
  const router = useRouter();
  const [candidates, setCandidates] = useState([]);
  const [activeCandidate, setActiveCandidate] = useState(null);
  const [suitability, setSuitability] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const cands = await api.getCandidates();
      setCandidates(cands || []);
      if (cands && cands.length > 0) {
        const primary = cands[0];
        setActiveCandidate(primary);
        try {
          const suit = await api.getCandidateSuitability(primary.id);
          setSuitability(suit);
        } catch (e) {
          console.error("Error loading candidate suitability:", e);
        }
      } else {
        setActiveCandidate(null);
        setSuitability(null);
      }
    } catch (err) {
      console.warn("Backend not yet connected or cold-starting:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleFileUpload = async (file) => {
    if (!file) return;

    setError("");
    setUploading(true);
    setUploadProgress("Uploading resume file...");

    try {
      setTimeout(() => setUploadProgress("Extracting text and structure..."), 400);
      setTimeout(() => setUploadProgress("Identifying skills & credentials with AI..."), 900);
      setTimeout(() => setUploadProgress("Calculating ATS score and connecting to dashboard..."), 1400);

      const res = await api.uploadResume(file);
      await loadData();
      setUploadProgress("Done!");
      setTimeout(() => {
        setUploading(false);
        setUploadProgress("");
      }, 500);
    } catch (err) {
      console.error("Upload error:", err);
      setError(err.message || "Failed to process resume file. Please ensure it is a valid PDF or DOCX file.");
      setUploading(false);
      setUploadProgress("");
    }
  };

  const handleFileInputChange = (e) => {
    const f = e.target.files?.[0];
    if (f) handleFileUpload(f);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFileUpload(f);
  };

  const handleRemoveResume = async () => {
    setDeleting(true);
    setError("");
    try {
      if (activeCandidate?.id) {
        await api.deleteCandidate(activeCandidate.id);
      }
      await api.clearCandidates();
      setActiveCandidate(null);
      setSuitability(null);
      setCandidates([]);
      await loadData();
    } catch (e) {
      console.error("Error clearing candidate:", e);
      setError("Failed to delete resume: " + (e.message || "Unknown error"));
    } finally {
      setDeleting(false);
    }
  };

  const atsScore = suitability?.ats_score ?? 85;
  const isHighAts = atsScore >= 80;
  const isModerateAts = atsScore >= 50 && atsScore < 80;

  return (
    <div className="min-h-screen bg-[#F4EBDD] flex font-sans text-[#1E2D2D] selection:bg-[#2D8A8A]/20">
      <Sidebar />

      <div className="flex-1 ml-64 min-w-0 flex flex-col">
        <Navbar title="My Resumes & ATS Profile" folio="MY RESUMES" />

        <main className="p-8 max-w-6xl mx-auto w-full space-y-6">

          {/* Page Header */}
          <div className="bg-[#FAF6EE] border border-[#E0CFB7] p-6 rounded-xs shadow-xs space-y-2">
            <div className="flex items-center gap-2 font-mono-code text-[11px] text-[#224b4c] uppercase tracking-widest font-semibold">
              <span className="px-2 py-0.5 bg-[#224b4c]/10 rounded-xs border border-[#224b4c]/20">Resume Hub</span>
              <span className="text-[#7D8F8F]">·</span>
              <span>Upload Once, Connect Everywhere</span>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="font-editorial text-3xl text-[#1E2D2D] font-normal">
                  My Resume
                </h1>
                <p className="text-xs text-[#475858] mt-1 max-w-2xl leading-relaxed">
                  Upload your resume here once. Our AI will parse your skills, evaluate ATS compatibility, and connect your profile directly to your ATS Dashboard and job matches.
                </p>
              </div>

              {activeCandidate && (
                <div className="flex items-center gap-2 shrink-0">
                  <label className="px-3.5 py-2 bg-[#224b4c] hover:bg-[#1a3a3b] text-[#FFFFFF] text-xs font-semibold rounded-xs shadow-xs inline-flex items-center gap-1.5 cursor-pointer transition-colors">
                    <RefreshCw size={13} />
                    <span>{uploading ? "Updating..." : "Replace Resume"}</span>
                    <input
                      type="file"
                      accept=".pdf,.docx,.txt"
                      onChange={handleFileInputChange}
                      disabled={uploading}
                      className="hidden"
                    />
                  </label>
                  <button
                    onClick={handleRemoveResume}
                    disabled={deleting || uploading}
                    className="p-2 bg-[#FAF6EE] hover:bg-[#FAF5EB] text-[#7D8F8F] hover:text-[#C85A5A] text-xs rounded-xs border border-[#E0CFB7] shadow-xs cursor-pointer transition-colors disabled:opacity-50"
                    title="Remove Resume"
                  >
                    {deleting ? (
                      <RefreshCw size={15} className="animate-spin text-[#C85A5A]" />
                    ) : (
                      <Trash2 size={15} />
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="p-3.5 bg-[#C85A5A]/10 border border-[#C85A5A]/30 text-[#C85A5A] text-xs rounded-xs flex items-center gap-2">
              <AlertCircle size={15} />
              <span>{error}</span>
            </div>
          )}

          {/* =========================================================================
              STATE 1: NO RESUME UPLOADED YET
              Prompt candidate to upload their resume once here
              ========================================================================= */}
          {!activeCandidate && !loading && (
            <div className="space-y-6">
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                className={`p-14 border-2 border-dashed rounded-xs bg-[#FAF6EE] text-center space-y-6 transition-all shadow-xs ${
                  isDragOver ? "border-[#224b4c] bg-[#FAF5EB] scale-[1.01]" : "border-[#BFA889] hover:border-[#224b4c]"
                }`}
              >
                <div className="w-16 h-16 rounded-full bg-[#224b4c]/10 text-[#224b4c] flex items-center justify-center mx-auto border border-[#224b4c]/20">
                  {uploading ? (
                    <RefreshCw className="animate-spin text-[#224b4c]" size={32} />
                  ) : (
                    <UploadCloud size={34} />
                  )}
                </div>

                <div className="space-y-2">
                  <h2 className="font-editorial text-3xl text-[#1E2D2D]">
                    {uploading ? uploadProgress : "Upload Your Resume to Begin"}
                  </h2>
                  <p className="text-xs text-[#7D8F8F] font-mono-code max-w-lg mx-auto">
                    Upload your resume in PDF, DOCX, or TXT format. Upload once to unlock your ATS Dashboard, check your score, and find matching jobs.
                  </p>
                </div>

                {!uploading && (
                  <div>
                    <label className="px-6 py-3 bg-[#224b4c] hover:bg-[#1a3a3b] text-[#FFFFFF] text-xs font-semibold rounded-xs shadow-xs inline-flex items-center gap-2 cursor-pointer transition-colors">
                      <UploadCloud size={16} />
                      <span>Choose Resume File (.pdf / .docx)</span>
                      <input
                        type="file"
                        accept=".pdf,.docx,.txt"
                        onChange={handleFileInputChange}
                        disabled={uploading}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}

                {/* 3 Value Pillars */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8 border-t border-[#E0CFB7] text-left font-mono-code text-[11px] text-[#475858]">
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck size={16} className="text-[#224b4c] shrink-0" />
                    <span>Upload once — feeds all screens</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 size={16} className="text-[#224b4c] shrink-0" />
                    <span>Clean AI NLP skill extraction</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Sparkles size={16} className="text-[#224b4c] shrink-0" />
                    <span>Direct connection to ATS Dashboard</span>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* =========================================================================
              STATE 2: RESUME IS UPLOADED & CONNECTED
              Display active resume dossier, ATS score, skills, and direct dashboard CTA
              ========================================================================= */}
          {activeCandidate && (
            <div className="space-y-6">

              {/* 1. Connection Status Banner */}
              <div className="bg-[#FAF6EE] border border-[#2D8A8A]/40 p-4 rounded-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#2D8A8A]/10 text-[#2D8A8A] flex items-center justify-center shrink-0 border border-[#2D8A8A]/20">
                    <CheckCircle2 size={16} />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-[#1E2D2D] flex items-center gap-2">
                      <span>Resume Connected to ATS Dashboard</span>
                      <span className="px-2 py-0.5 bg-[#2D8A8A]/15 text-[#2D8A8A] font-mono-code text-[10px] rounded-xs font-semibold">Active</span>
                    </div>
                    <div className="text-[11px] text-[#7D8F8F]">
                      Your parsed resume is automatically driving your ATS Score and matching jobs.
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href="/dashboard"
                    className="px-4 py-2 bg-[#224b4c] hover:bg-[#1a3a3b] text-[#FFFFFF] text-xs font-semibold rounded-xs shadow-xs inline-flex items-center gap-1.5 transition-colors"
                  >
                    <LayoutDashboard size={13} />
                    <span>View ATS Dashboard →</span>
                  </Link>
                  <Link
                    href="/screening"
                    className="px-3.5 py-2 bg-[#FAF5EB] hover:bg-[#E0CFB7]/40 text-[#1E2D2D] text-xs font-medium rounded-xs border border-[#E0CFB7] shadow-xs inline-flex items-center gap-1.5 transition-colors"
                  >
                    <GitCompare size={13} />
                    <span>Suitable Jobs</span>
                  </Link>
                </div>
              </div>

              {/* 2. Candidate Dossier & Quick ATS Metrics */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Left 8 cols: Candidate Info & Skills */}
                <div className="lg:col-span-8 bg-[#FAF6EE] border border-[#E0CFB7] p-6 rounded-xs shadow-xs space-y-6">
                  
                  {/* Top Candidate Profile Row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E0CFB7] pb-5">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-[#E0CFB7] text-[#1E2D2D] font-editorial font-bold text-xl flex items-center justify-center border border-[#BFA889] shrink-0">
                        {activeCandidate.full_name?.split(" ").map(n => n[0]).join("") || "C"}
                      </div>
                      <div>
                        <h2 className="font-editorial text-2xl text-[#1E2D2D]">
                          {activeCandidate.full_name}
                        </h2>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-[#7D8F8F] font-mono-code mt-1">
                          {activeCandidate.email && (
                            <span className="flex items-center gap-1">
                              <Mail size={12} className="text-[#224b4c]" />
                              <span>{activeCandidate.email}</span>
                            </span>
                          )}
                          {activeCandidate.phone && (
                            <span className="flex items-center gap-1">
                              <Phone size={12} className="text-[#224b4c]" />
                              <span>{activeCandidate.phone}</span>
                            </span>
                          )}
                          {activeCandidate.location && (
                            <span className="flex items-center gap-1">
                              <MapPin size={12} className="text-[#224b4c]" />
                              <span>{activeCandidate.location}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#FAF5EB] border border-[#E0CFB7] px-3.5 py-2 rounded-xs text-right shrink-0">
                      <div className="font-mono-code text-xs font-semibold text-[#1E2D2D] flex items-center gap-1.5 justify-end">
                        <FileText size={13} className="text-[#224b4c]" />
                        <span>Uploaded Resume</span>
                      </div>
                      <div className="font-mono-code text-[10px] text-[#7D8F8F]">
                        {activeCandidate.years_of_experience ? `${activeCandidate.years_of_experience} yrs experience` : "Parsed Document"}
                      </div>
                    </div>
                  </div>

                  {/* Extracted Skills Section */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Award size={15} className="text-[#224b4c]" />
                        <h3 className="font-editorial text-lg text-[#1E2D2D]">
                          Extracted Skills Taxonomy ({(activeCandidate.top_skills_json || []).length})
                        </h3>
                      </div>
                      <span className="text-[10px] font-mono-code text-[#7D8F8F] uppercase">
                        Verified by NLP
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {(activeCandidate.top_skills_json || []).length > 0 ? (
                        activeCandidate.top_skills_json.map((skill, idx) => (
                          <span
                            key={idx}
                            className="font-mono-code text-xs px-2.5 py-1 bg-[#FAF5EB] border border-[#E0CFB7] rounded-xs text-[#1E2D2D]"
                          >
                            {skill}
                          </span>
                        ))
                      ) : (
                        <p className="text-xs text-[#7D8F8F] italic font-mono-code">
                          No specific skills detected in this document.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Professional Summary */}
                  {activeCandidate.summary && (
                    <div className="space-y-2 pt-2 border-t border-[#E0CFB7]">
                      <div className="flex items-center gap-2">
                        <FileText size={14} className="text-[#224b4c]" />
                        <h4 className="font-editorial text-base text-[#1E2D2D]">
                          Executive Summary
                        </h4>
                      </div>
                      <p className="text-xs text-[#475858] leading-relaxed bg-[#FAF5EB] p-3.5 border border-[#E0CFB7] rounded-xs">
                        {activeCandidate.summary}
                      </p>
                    </div>
                  )}

                </div>

                {/* Right 4 cols: ATS Readiness & Dashboard Link */}
                <div className="lg:col-span-4 space-y-6">

                  {/* ATS Readiness Card */}
                  <div className="bg-[#FAF6EE] border border-[#E0CFB7] p-6 rounded-xs shadow-xs space-y-4 text-center">
                    <div className="font-mono-code text-[10px] uppercase tracking-wider text-[#7D8F8F]">
                      Your Resume ATS Score
                    </div>
                    
                    <div className="inline-flex flex-col items-center justify-center w-24 h-24 rounded-full bg-[#FAF5EB] border-2 border-[#224b4c] mx-auto shadow-inner">
                      <span className="font-editorial text-3xl font-bold text-[#1E2D2D]">
                        {suitability?.ats_score != null ? `${suitability.ats_score}%` : "85%"}
                      </span>
                      <span className="font-mono-code text-[9px] text-[#2D8A8A] font-semibold">
                        Ready
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="font-semibold text-xs text-[#1E2D2D]">
                        {isHighAts ? "High ATS Compatibility" : isModerateAts ? "Moderate ATS Readiness" : "Needs Content & Skills"}
                      </div>
                      <p className="text-[11px] text-[#7D8F8F]">
                        {suitability?.suitable_jobs ? `${suitability.suitable_jobs.length} industry jobs matched` : "Connected to your dashboard"}
                      </p>
                    </div>

                    <div className="pt-2">
                      <Link
                        href="/dashboard"
                        className="w-full py-2.5 px-4 bg-[#224b4c] hover:bg-[#1a3a3b] text-[#FFFFFF] text-xs font-semibold rounded-xs shadow-xs inline-flex items-center justify-center gap-2 transition-colors"
                      >
                        <LayoutDashboard size={14} />
                        <span>Go to My ATS Dashboard</span>
                      </Link>
                    </div>
                  </div>

                  {/* Quick Guide Card */}
                  <div className="bg-[#FAF5EB] border border-[#E0CFB7] p-5 rounded-xs space-y-3 font-mono-code text-xs text-[#475858]">
                    <div className="font-editorial text-base text-[#1E2D2D] font-normal">
                      Next Steps
                    </div>
                    <ul className="space-y-2 text-[11px] list-disc pl-4 text-[#7D8F8F]">
                      <li>Check your ATS audit in <Link href="/dashboard" className="text-[#224b4c] underline">My ATS Dashboard</Link></li>
                      <li>Explore matching roles in <Link href="/screening" className="text-[#224b4c] underline">Jobs I am Suitable For</Link></li>
                      <li>To update your resume anytime, click Replace Resume above.</li>
                    </ul>
                  </div>

                </div>

              </div>

            </div>
          )}

        </main>
      </div>
    </div>
  );
}
