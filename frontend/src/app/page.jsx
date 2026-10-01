"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ArrowRight, 
  FileText, 
  CheckCircle2, 
  Sparkles, 
  Users, 
  Briefcase, 
  ShieldCheck,
  Search,
  ChevronRight,
  TrendingUp,
  Award,
  Layers,
  Sliders,
  Check,
  Building,
  GraduationCap
} from "lucide-react";
import { api } from "@/lib/api";

export default function LandingPage() {
  const [activeCandidate, setActiveCandidate] = useState(null);
  const [selectedJobId, setSelectedJobId] = useState(1);
  const [jobs, setJobs] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [matchScore, setMatchScore] = useState(92);

  useEffect(() => {
    async function loadData() {
      try {
        const [jobsData, candsData] = await Promise.all([
          api.getJobs().catch(() => []),
          api.getCandidates().catch(() => [])
        ]);
        setJobs(jobsData || []);
        setCandidates(candsData || []);
        if (candsData && candsData.length > 0) {
          const maya = candsData.find(c => c.full_name?.includes("Maya")) || candsData[0];
          setActiveCandidate(maya);
        }
      } catch (e) {
        console.error("Error loading landing data:", e);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    if (activeCandidate && selectedJobId) {
      if (activeCandidate.full_name?.includes("Maya")) {
        setMatchScore(selectedJobId === 1 ? 92 : selectedJobId === 2 ? 41 : 32);
      } else if (activeCandidate.full_name?.includes("Arjun")) {
        setMatchScore(selectedJobId === 1 ? 87 : 42);
      } else if (activeCandidate.full_name?.includes("Alex")) {
        setMatchScore(selectedJobId === 4 ? 72 : 28);
      } else {
        setMatchScore(75);
      }
    }
  }, [activeCandidate, selectedJobId]);

  return (
    <div className="min-h-screen bg-[#F4EBDD] text-[#1E2D2D] flex flex-col font-sans selection:bg-[#2D8A8A]/20">
      
      {/* Top Editorial Masthead (Header) */}
      <header className="border-b border-[#E0CFB7] bg-[#FAF6EE] sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Organic Leaf Logo Icon */}
            <div className="w-8 h-8 rounded-xs bg-[#2D8A8A] text-[#FAF6EE] flex items-center justify-center font-editorial font-bold text-base shadow-xs">
              <svg className="w-5 h-5 text-[#FAF6EE]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 0 0 8 20C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z" />
              </svg>
            </div>
            <div>
              <span className="font-editorial text-xl tracking-tight font-semibold text-[#1E2D2D]">
                Resume<span className="italic font-normal text-[#2D8A8A]">IQ</span>
              </span>
              <span className="hidden sm:inline-block ml-3 pl-3 border-l border-[#E0CFB7] font-mono-code text-[10px] text-[#7D8F8F] uppercase tracking-widest">
                Candidate Career & ATS Screener
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 font-mono-code text-xs text-[#475858]">
            <Link href="#features" className="hover:text-[#1E2D2D] transition-colors">Product</Link>
            <Link href="#methodology" className="hover:text-[#1E2D2D] transition-colors">Features</Link>
            <Link href="#pricing" className="hover:text-[#1E2D2D] transition-colors">Pricing</Link>
            <Link href="#resources" className="hover:text-[#1E2D2D] transition-colors">Resources</Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-3.5 py-1.5 text-xs font-mono-code text-[#475858] hover:text-[#1E2D2D] hover:bg-[#E0CFB7]/30 border border-[#E0CFB7] rounded-xs transition-colors"
            >
              Login
            </Link>
            <Link
              href="/dashboard"
              className="px-4 py-1.5 text-xs font-medium text-[#FAF6EE] bg-[#2D8A8A] hover:bg-[#236E6E] border border-[#236E6E] rounded-xs transition-colors inline-flex items-center gap-1.5"
            >
              <span>Get Started</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section matching Image 1 top-left and Image 2 */}
      <section className="relative overflow-hidden border-b border-[#E0CFB7] bg-[#F4EBDD] py-14 lg:py-20">
        
        {/* Soft Organic Decorative Shapes in background (from reference) */}
        <div className="absolute top-0 right-1/4 w-[450px] h-[450px] rounded-full bg-[#E0CFB7]/35 blur-3xl pointer-events-none -z-0" />
        <div className="absolute -bottom-10 left-10 w-[350px] h-[350px] rounded-full bg-[#BFA889]/20 blur-2xl pointer-events-none -z-0" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Hero Column */}
            <div className="lg:col-span-6 space-y-6">
              
              <div className="inline-flex items-center gap-2 font-mono-code text-[11px] text-[#2D8A8A] font-medium tracking-wider uppercase">
                <span className="w-6 h-[1.5px] bg-[#2D8A8A] inline-block" />
                <span>For Job Seekers & Candidates</span>
              </div>

              <h1 className="font-editorial text-5xl sm:text-6xl text-[#1E2D2D] leading-[1.08] tracking-tight font-normal">
                Upload your resume. <span className="italic font-serif text-[#2D8A8A]">Know where you fit.</span>
              </h1>

              <p className="text-base sm:text-lg text-[#475858] leading-relaxed max-w-xl font-normal">
                <strong className="font-medium text-[#1E2D2D]">ResumeIQ</strong> checks your resume against Applicant Tracking Systems, calculates your instant ATS score, discovers the jobs across all industries you are most suitable for, and tells you exactly what to add to get hired.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  href="/screener"
                  className="px-6 py-3 bg-[#2D8A8A] hover:bg-[#236E6E] text-[#FAF6EE] text-sm font-medium rounded-full border border-[#236E6E] transition-all inline-flex items-center gap-2 shadow-xs hover:shadow-md"
                >
                  <span>Upload Resume & Get ATS Score</span>
                  <ArrowRight size={15} />
                </Link>
                <Link
                  href="/login"
                  className="px-6 py-3 bg-[#FAF6EE] hover:bg-[#FAF5EB] text-[#1E2D2D] text-sm font-medium rounded-full border border-[#BFA889] transition-all inline-flex items-center gap-2 shadow-xs"
                >
                  <span>Try Demo</span>
                </Link>
              </div>

              {/* "Find the right people" Badge */}
              <div className="pt-6">
                <div className="inline-flex items-center gap-3 p-3 bg-[#FAF6EE]/80 border border-[#E0CFB7] rounded-xs backdrop-blur-xs">
                  <div className="w-8 h-8 rounded-full bg-[#2D8A8A]/10 text-[#2D8A8A] flex items-center justify-center">
                    <Users size={16} />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-[#1E2D2D]">Find the right people</div>
                    <div className="text-[11px] text-[#7D8F8F]">With AI that understands every role.</div>
                  </div>
                </div>
              </div>

              {/* Scroll prompt */}
              <div className="pt-4 font-mono-code text-[10px] uppercase tracking-widest text-[#7D8F8F] flex items-center gap-2">
                <span>Scroll to explore</span>
                <span className="animate-bounce">↓</span>
              </div>
            </div>

            {/* Right Hero Column: Floating Resume Dossier Sheet & AI Tags (Visual Reference Direction) */}
            <div className="lg:col-span-6 relative min-h-[500px] flex items-center justify-center">
              
              {/* Main Candidate Resume Sheet */}
              <div className="relative w-full max-w-md bg-[#FAF6EE] border border-[#E0CFB7] p-7 rounded-sm shadow-lg space-y-5 transform hover:-translate-y-1 transition-transform duration-300">
                
                {/* Header Profile Info */}
                <div className="border-b border-[#E0CFB7] pb-4 flex items-start justify-between">
                  <div className="space-y-1">
                    <h3 className="font-editorial text-2xl font-normal text-[#1E2D2D]">
                      Maya Sharma
                    </h3>
                    <p className="font-mono-code text-xs text-[#2D8A8A] font-semibold">
                      Product Designer · 3 years experience
                    </p>
                    <p className="font-mono-code text-[11px] text-[#7D8F8F]">
                      maya.sharma@email.com · New Delhi, India
                    </p>
                  </div>
                  <span className="px-2.5 py-0.5 bg-[#2D8A8A]/15 text-[#2D8A8A] text-[10px] font-mono-code font-bold uppercase rounded-full border border-[#2D8A8A]/30">
                    Strong Match
                  </span>
                </div>

                {/* Experience snippet */}
                <div className="space-y-2">
                  <div className="font-mono-code text-[10px] uppercase tracking-wider text-[#7D8F8F] font-semibold">
                    Experience
                  </div>
                  <div className="p-3 bg-[#FAF5EB] border border-[#E0CFB7] rounded-xs space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#2D8A8A]" />
                      <span className="font-semibold text-xs text-[#1E2D2D]">PixelCraft Technologies</span>
                    </div>
                    <div className="text-[11px] text-[#475858] pl-4">
                      Product Designer · 2024 – Present
                    </div>
                  </div>
                </div>

                {/* Education snippet */}
                <div className="space-y-2">
                  <div className="font-mono-code text-[10px] uppercase tracking-wider text-[#7D8F8F] font-semibold">
                    Education
                  </div>
                  <div className="p-3 bg-[#FAF5EB] border border-[#E0CFB7] rounded-xs space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#2D8A8A]" />
                      <span className="font-semibold text-xs text-[#1E2D2D]">B.Tech in Computer Science</span>
                    </div>
                    <div className="text-[11px] text-[#475858] pl-4">
                      Delhi Institute of Technology · 2020 – 2024
                    </div>
                  </div>
                </div>

                {/* Skills Row */}
                <div className="pt-2 border-t border-[#E0CFB7]">
                  <div className="font-mono-code text-[10px] uppercase tracking-wider text-[#7D8F8F] mb-1.5">
                    Matched Skills
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {["Figma", "User Research", "Wireframing", "Prototyping", "Design Systems"].map((s, idx) => (
                      <span key={idx} className="font-mono-code text-[10px] px-2 py-0.5 bg-[#FAF5EB] border border-[#E0CFB7] rounded-xs text-[#1E2D2D]">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating Element 1: AI Analyzing Badge (Top Right) */}
              <div className="absolute -top-4 right-0 sm:-right-4 bg-[#FAF6EE] border border-[#E0CFB7] p-3.5 rounded-sm shadow-md space-y-2 w-52 z-20">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#1E2D2D]">
                  <Sparkles size={13} className="text-[#2D8A8A]" />
                  <span>AI Analyzing...</span>
                </div>
                <div className="space-y-1 font-mono-code text-[10px] text-[#475858]">
                  <div className="flex items-center justify-between text-[#2D8A8A]">
                    <span>Extracting skills</span>
                    <Check size={11} />
                  </div>
                  <div className="flex items-center justify-between text-[#2D8A8A]">
                    <span>Understanding experience</span>
                    <Check size={11} />
                  </div>
                  <div className="flex items-center justify-between text-[#1E2D2D]">
                    <span>Generating match score</span>
                    <span className="w-2 h-2 rounded-full bg-[#2D8A8A] animate-ping" />
                  </div>
                </div>
              </div>

              {/* Floating Element 2: Match Score Gauge (Bottom Right) */}
              <div className="absolute -bottom-4 right-0 sm:right-2 bg-[#FAF6EE] border border-[#E0CFB7] p-4 rounded-sm shadow-lg flex items-center gap-4 z-20">
                <div className="relative w-14 h-14 flex items-center justify-center">
                  <svg className="w-14 h-14 transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-[#E0CFB7]"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-[#2D8A8A]"
                      strokeDasharray="92, 100"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <span className="absolute font-editorial font-bold text-sm text-[#1E2D2D]">
                    92%
                  </span>
                </div>
                <div>
                  <div className="font-mono-code text-[10px] uppercase tracking-wider text-[#7D8F8F]">
                    Match Score
                  </div>
                  <div className="font-bold text-sm text-[#2D8A8A]">
                    Strong Match
                  </div>
                </div>
              </div>

              {/* Floating Pill: Skill Match (Top Left) */}
              <div className="absolute top-16 -left-4 hidden sm:flex items-center gap-2 bg-[#FAF6EE] border border-[#E0CFB7] px-3 py-1.5 rounded-full shadow-md z-20">
                <CheckCircle2 size={13} className="text-[#2D8A8A]" />
                <span className="font-mono-code text-xs text-[#1E2D2D]">Skills: Figma, User Research</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Interactive Demonstration Strip: Recruiter Can Test Job-Agnostic Matching Live */}
      <section className="py-16 bg-[#FAF6EE] border-b border-[#E0CFB7]" id="methodology">
        <div className="max-w-7xl mx-auto px-6 space-y-8">
          
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <div className="font-mono-code text-[10px] uppercase tracking-widest text-[#224b4c] font-semibold">
              Candidate Career Fit Engine
            </div>
            <h2 className="font-editorial text-3xl sm:text-4xl text-[#1E2D2D] font-normal">
              Upload your resume and discover <span className="italic text-[#2D8A8A]">which jobs you are suitable for</span>.
            </h2>
            <p className="text-xs text-[#475858] leading-relaxed">
              Our deep NLP parser extracts your skills, evaluates your resume format against Applicant Tracking Systems, and tells you what all to add to become suitable for open roles across every industry.
            </p>
          </div>

          {/* Interactive Candidate Quick Upload & Scan Box */}
          <div className="bg-[#FAF5EB] border border-[#E0CFB7] p-8 rounded-sm max-w-3xl mx-auto space-y-6 shadow-xs text-center">
            <div className="p-8 border-2 border-dashed border-[#BFA889] rounded-xs bg-[#FAF6EE] flex flex-col items-center justify-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#224b4c]/10 text-[#224b4c] flex items-center justify-center">
                <FileText size={24} />
              </div>
              <div>
                <h3 className="font-editorial text-xl text-[#1E2D2D]">
                  Upload Your Resume (.PDF or .DOCX)
                </h3>
                <p className="text-xs text-[#7D8F8F] font-mono-code mt-1">
                  Your resume is analyzed specifically for you — no other candidate data.
                </p>
              </div>
              <Link
                href="/screener"
                className="px-6 py-2.5 bg-[#224b4c] hover:bg-[#1a3a3b] text-[#FFFFFF] text-xs font-medium rounded-xs border border-[#224b4c] transition-colors inline-flex items-center gap-2 shadow-xs cursor-pointer"
              >
                <span>Upload My Resume & Calculate ATS Score</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left pt-2 font-mono-code text-xs">
              <div className="p-3 bg-[#FAF6EE] border border-[#E0CFB7] rounded-xs">
                <div className="text-[#224b4c] font-bold">1. ATS Health Audit</div>
                <div className="text-[11px] text-[#7D8F8F] mt-1">Pass rate score, contact detection, section structure</div>
              </div>
              <div className="p-3 bg-[#FAF6EE] border border-[#E0CFB7] rounded-xs">
                <div className="text-[#224b4c] font-bold">2. Suitable Jobs Matching</div>
                <div className="text-[11px] text-[#7D8F8F] mt-1">Scanned across Tech, Design, Finance, Healthcare & more</div>
              </div>
              <div className="p-3 bg-[#FAF6EE] border border-[#E0CFB7] rounded-xs">
                <div className="text-[#224b4c] font-bold">3. What All To Add</div>
                <div className="text-[11px] text-[#7D8F8F] mt-1">Actionable missing skills, copy-ready bullets, keywords</div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 4 Pillars Methodology Section */}
      <section className="py-20 border-b border-[#E0CFB7] bg-[#F4EBDD]" id="features">
        <div className="max-w-7xl mx-auto px-6 space-y-12">
          
          <div className="text-center space-y-3 max-w-xl mx-auto">
            <div className="font-mono-code text-[10px] uppercase tracking-widest text-[#2D8A8A] font-semibold">
              Architectural Rigor
            </div>
            <h2 className="font-editorial text-3xl sm:text-4xl text-[#1E2D2D] font-normal">
              Engineered for genuine recruitment intelligence.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                num: "01",
                title: "Job-Agnostic Ingestion",
                desc: "Enter any job description across any domain. NLP dynamically decomposes requirements into skills, experience, tools, and education.",
                icon: Briefcase
              },
              {
                num: "02",
                title: "spaCy Named Entity Recognition",
                desc: "Unstructured PDF and DOCX files are parsed with character-level entity tagging for candidates, companies, dates, and competencies.",
                icon: FileText
              },
              {
                num: "03",
                title: "Dense Semantic Embeddings",
                desc: "SentenceTransformers (all-MiniLM-L6-v2) generates 384-dimensional dense vectors to capture semantic meaning beyond exact keyword matching.",
                icon: Layers
              },
              {
                num: "04",
                title: "Explainable Skill-Gap Matrix",
                desc: "Inspect why your resume matched, view matched vs missing competencies, view matched vs missing competencies, and adjust custom scoring weights in real time.",
                icon: Sliders
              }
            ].map((col, idx) => {
              const Icon = col.icon;
              return (
                <div key={idx} className="bg-[#FAF6EE] border border-[#E0CFB7] p-6 rounded-xs space-y-4 shadow-xs">
                  <div className="flex justify-between items-start">
                    <span className="font-mono-code text-[11px] text-[#2D8A8A] font-semibold">
                      {col.num}
                    </span>
                    <Icon size={16} className="text-[#BFA889]" />
                  </div>
                  <h3 className="font-editorial text-xl font-normal text-[#1E2D2D]">
                    {col.title}
                  </h3>
                  <p className="text-xs text-[#475858] leading-relaxed">
                    {col.desc}
                  </p>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* Candidate Call to Action Footer Strip */}
      <footer className="py-12 bg-[#FAF6EE] border-t border-[#E0CFB7]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <div className="font-editorial text-xl text-[#1E2D2D] font-normal">
              Ready to screen your first candidate pool?
            </div>
            <div className="font-mono-code text-[11px] text-[#7D8F8F]">
              ResumeIQ · Editorial AI Screening Platform · Build / Screen / Hire
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="px-5 py-2.5 bg-[#2D8A8A] hover:bg-[#236E6E] text-[#FAF6EE] text-xs font-medium rounded-xs border border-[#236E6E] transition-colors inline-flex items-center gap-1.5"
            >
              <span>Upload My Resume & Check ATS Score</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
