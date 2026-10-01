"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { 
  Lock, 
  Mail, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  Check, 
  Sparkles, 
  Target,
  Award,
  BookOpen,
  Briefcase,
  GraduationCap
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("khushi.mehta@email.com");
  const [password, setPassword] = useState("demo123");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await api.login({ email, password });
      if (typeof window !== "undefined") {
        localStorage.setItem("resumeiq_token", res.access_token);
        localStorage.setItem("resumeiq_user", JSON.stringify(res.user));
      }
      router.push("/dashboard");
    } catch (err) {
      setError(err.message || "Invalid credentials. Use demo123");
    } finally {
      setLoading(false);
    }
  };

  const handle1ClickLogin = async () => {
    setEmail("khushi.mehta@email.com");
    setPassword("demo123");
    setLoading(true);
    setError("");
    try {
      const res = await api.login({ email: "khushi.mehta@email.com", password: "demo123" });
      if (typeof window !== "undefined") {
        localStorage.setItem("resumeiq_token", res.access_token);
        localStorage.setItem("resumeiq_user", JSON.stringify(res.user));
      }
      router.push("/dashboard");
    } catch (err) {
      setError(err.message || "Could not login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#F8F4ED] font-sans text-[#1E2D2D] selection:bg-[#2D8A8A]/20 overflow-x-hidden">
      
      {/* LEFT HALF: 100% Crisp Native Vector & Architectural UI (Zero Blur, Retina Razor Sharp) */}
      <div className="lg:w-[58%] xl:w-[60%] min-h-[640px] lg:min-h-screen relative bg-[#F4EBDD] flex flex-col justify-between p-8 sm:p-12 lg:p-14 border-b lg:border-b-0 lg:border-r border-[#E0CFB7] overflow-hidden">
        
        {/* Architectural 3D Plinth Layers & Soft Sand Lighting in CSS (No Raster Blur) */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-[#EADDC9]/60 to-[#DFCEB6]/30 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 left-0 w-[420px] h-[420px] rounded-full bg-gradient-to-tr from-[#D8C4A9]/40 to-transparent blur-2xl pointer-events-none" />
        
        {/* Subtle Arch Lighting Contour */}
        <div className="absolute top-0 left-1/3 w-[1px] h-full bg-gradient-to-b from-transparent via-[#E0CFB7]/60 to-transparent pointer-events-none" />

        {/* Top Brand Bar */}
        <div className="relative z-10 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            {/* Crisp SVG Organic Leaf Mark */}
            <div className="w-9 h-9 rounded-sm bg-[#224b4c] text-[#FAF6EE] flex items-center justify-center shadow-xs transition-transform group-hover:scale-105">
              <svg className="w-5 h-5 text-[#FAF6EE]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 0 0 8 20C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z" />
              </svg>
            </div>
            <div className="leading-tight">
              <div className="font-editorial text-2xl tracking-tight font-semibold text-[#1E2D2D]">
                Resume<span className="italic font-normal text-[#224b4c]">IQ</span>
              </div>
              <div className="font-mono-code text-[9px] uppercase tracking-widest text-[#7D8F8F]">
                Smarter Hiring  /  Better Teams
              </div>
            </div>
          </Link>
        </div>

        {/* Centerpiece: Left Typography + Tilted Crisp Maya Sharma Paper Sheet + Floating Pills */}
        <div className="relative z-10 my-auto py-8 grid grid-cols-1 xl:grid-cols-12 gap-8 items-center">
          
          {/* Left Text Block (5 cols) */}
          <div className="xl:col-span-5 space-y-5">
            <div className="inline-flex items-center gap-2 font-mono-code text-[11px] text-[#224b4c] uppercase tracking-wider font-semibold">
              <span className="w-5 h-[1.5px] bg-[#224b4c] inline-block" />
              <span>AI Resume Screener & ATS Matcher</span>
            </div>

            <h1 className="font-editorial text-4xl sm:text-5xl text-[#1E2D2D] leading-[1.08] font-normal tracking-tight">
              One screening engine. <span className="italic font-serif text-[#224b4c]">Any job.</span>
            </h1>

            <p className="text-xs sm:text-sm text-[#475858] leading-relaxed">
              <strong className="font-medium text-[#1E2D2D]">ResumeIQ</strong> helps candidates evaluate resume suitability, optimize ATS scores, and screen against any job description with tailored recommendations.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/screener"
                className="px-5 py-2.5 bg-[#224b4c] hover:bg-[#1a3a3b] text-[#FFFFFF] text-xs font-medium rounded-full transition-all inline-flex items-center gap-1.5 shadow-sm hover:shadow-md"
              >
                <span>Screen Resume</span>
                <ArrowRight size={13} />
              </Link>
              <button
                type="button"
                onClick={handle1ClickLogin}
                className="px-5 py-2.5 bg-[#FAF6EE] hover:bg-[#FAF5EB] text-[#1E2D2D] text-xs font-medium rounded-full border border-[#BFA889] transition-all inline-flex items-center gap-1.5 shadow-2xs"
              >
                <span>Try Demo</span>
              </button>
            </div>

            {/* Find the right people Pill */}
            <div className="pt-4 hidden sm:block">
              <div className="inline-flex items-center gap-3 p-3 bg-[#FAF6EE]/90 border border-[#E0CFB7] rounded-sm shadow-xs backdrop-blur-xs">
                <div className="w-8 h-8 rounded-full bg-[#224b4c]/10 text-[#224b4c] flex items-center justify-center shrink-0">
                  <Target size={16} />
                </div>
                <div className="leading-tight">
                  <div className="text-xs font-semibold text-[#1E2D2D]">Find the right people</div>
                  <div className="text-[10px] text-[#7D8F8F]">With AI that understands every role.</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Visual: Tilted Crisp Maya Sharma Paper Dossier & Floating Pills (7 cols) */}
          <div className="xl:col-span-7 relative flex items-center justify-center min-h-[440px]">
            
            {/* 3D Stone Plinth Simulation in pure CSS behind resume */}
            <div className="absolute bottom-0 w-80 h-28 bg-gradient-to-t from-[#DBCAB0] to-[#E8DCBE] rounded-t-sm border-t border-[#C7B59A] shadow-md transform -skew-x-3 pointer-events-none" />
            
            {/* Green Ceramic Sphere Graphic (Vector SVG) resting on the stone block */}
            <div className="absolute -bottom-2 -left-3 w-14 h-14 rounded-full bg-gradient-to-tr from-[#1E2D2D] via-[#2A4848] to-[#466B6B] shadow-lg border border-[#3E5C5C] z-20 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-white/20 blur-[1px] -mt-4 -ml-4" />
            </div>

            {/* Tilted Crisp Cream Paper Resume Sheet */}
            <div className="relative w-full max-w-[340px] bg-[#FAF6EE] border border-[#E0CFB7] p-6 rounded-sm shadow-xl transform -rotate-2 hover:rotate-0 transition-transform duration-300 z-10 space-y-4">
              
              {/* Header Profile Info */}
              <div className="border-b border-[#E0CFB7]/80 pb-3 flex items-start justify-between">
                <div className="space-y-0.5">
                  <h3 className="font-editorial text-2xl font-normal text-[#1E2D2D]">
                    Maya Sharma
                  </h3>
                  <div className="font-mono-code text-xs text-[#224b4c] font-semibold">
                    Product Designer
                  </div>
                  <div className="font-mono-code text-[10px] text-[#7D8F8F]">
                    maya.sharma@email.com · New Delhi
                  </div>
                </div>
              </div>

              {/* Experience Section with Green Bullet */}
              <div className="space-y-1.5">
                <div className="font-mono-code text-[10px] uppercase tracking-wider text-[#7D8F8F] font-semibold">
                  Experience
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#1E2D2D]">
                    <span className="w-2 h-2 rounded-full bg-[#224b4c]" />
                    <span>PixelCraft Technologies</span>
                  </div>
                  <div className="text-[11px] text-[#475858] pl-3.5">
                    Product Designer · 2024 – Present
                  </div>
                  {/* Subtle placeholder text bars */}
                  <div className="pl-3.5 pt-1 space-y-1">
                    <div className="h-1.5 bg-[#E0CFB7]/60 rounded-full w-full" />
                    <div className="h-1.5 bg-[#E0CFB7]/40 rounded-full w-3/4" />
                  </div>
                </div>
              </div>

              {/* Education Section with Green Bullet */}
              <div className="space-y-1.5 pt-1">
                <div className="font-mono-code text-[10px] uppercase tracking-wider text-[#7D8F8F] font-semibold">
                  Education
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#1E2D2D]">
                    <span className="w-2 h-2 rounded-full bg-[#224b4c]" />
                    <span>B.Tech in Computer Science</span>
                  </div>
                  <div className="text-[11px] text-[#475858] pl-3.5">
                    Delhi Institute of Technology · 2020 – 2024
                  </div>
                  <div className="pl-3.5 pt-1 space-y-1">
                    <div className="h-1.5 bg-[#E0CFB7]/50 rounded-full w-4/5" />
                  </div>
                </div>
              </div>

            </div>

            {/* Floating Card 1: AI Analyzing Badge (Top Right) */}
            <div className="absolute -top-6 -right-2 sm:right-2 bg-[#FAF6EE] border border-[#E0CFB7] p-3 rounded-sm shadow-md space-y-1.5 w-44 z-20">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#1E2D2D]">
                <Sparkles size={12} className="text-[#224b4c]" />
                <span>AI Analyzing...</span>
              </div>
              <div className="space-y-1 font-mono-code text-[9px] text-[#475858]">
                <div className="flex items-center justify-between text-[#224b4c]">
                  <span>Extracting skills</span>
                  <Check size={10} />
                </div>
                <div className="flex items-center justify-between text-[#224b4c]">
                  <span>Understanding experience</span>
                  <Check size={10} />
                </div>
                <div className="flex items-center justify-between text-[#1E2D2D]">
                  <span>Generating match score</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#224b4c] animate-ping" />
                </div>
              </div>
            </div>

            {/* Floating Stack Pills on the right */}
            <div className="absolute right-0 top-24 space-y-2 z-20 hidden sm:block">
              <div className="flex items-center gap-2 bg-[#FAF6EE] border border-[#E0CFB7] px-3 py-1.5 rounded-sm shadow-md text-left">
                <div className="w-6 h-6 rounded-full bg-[#224b4c]/10 text-[#224b4c] flex items-center justify-center shrink-0">
                  <Sparkles size={11} />
                </div>
                <div className="leading-none pr-1">
                  <div className="text-[10px] font-semibold text-[#1E2D2D]">Skills</div>
                  <div className="text-[9px] text-[#7D8F8F] font-mono-code">Figma, Research</div>
                </div>
                <span className="w-4 h-4 rounded-full bg-[#224b4c] text-white flex items-center justify-center text-[9px]">✓</span>
              </div>

              <div className="flex items-center gap-2 bg-[#FAF6EE] border border-[#E0CFB7] px-3 py-1.5 rounded-sm shadow-md text-left">
                <div className="w-6 h-6 rounded-full bg-[#224b4c]/10 text-[#224b4c] flex items-center justify-center shrink-0">
                  <Briefcase size={11} />
                </div>
                <div className="leading-none pr-1">
                  <div className="text-[10px] font-semibold text-[#1E2D2D]">Experience</div>
                  <div className="text-[9px] text-[#7D8F8F] font-mono-code">3+ years</div>
                </div>
                <span className="w-4 h-4 rounded-full bg-[#224b4c] text-white flex items-center justify-center text-[9px]">✓</span>
              </div>

              <div className="flex items-center gap-2 bg-[#FAF6EE] border border-[#E0CFB7] px-3 py-1.5 rounded-sm shadow-md text-left">
                <div className="w-6 h-6 rounded-full bg-[#224b4c]/10 text-[#224b4c] flex items-center justify-center shrink-0">
                  <GraduationCap size={11} />
                </div>
                <div className="leading-none pr-1">
                  <div className="text-[10px] font-semibold text-[#1E2D2D]">Education</div>
                  <div className="text-[9px] text-[#7D8F8F] font-mono-code">B.Tech</div>
                </div>
                <span className="w-4 h-4 rounded-full bg-[#224b4c] text-white flex items-center justify-center text-[9px]">✓</span>
              </div>
            </div>

            {/* Floating Match Score Ring Card (Bottom Right) */}
            <div className="absolute -bottom-6 right-2 sm:right-6 bg-[#FAF6EE] border border-[#E0CFB7] p-3 rounded-sm shadow-xl flex items-center gap-3 z-30">
              <div className="relative w-12 h-12 flex items-center justify-center">
                <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-[#E0CFB7]"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-[#224b4c]"
                    strokeDasharray="92, 100"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <span className="absolute font-editorial font-bold text-xs text-[#1E2D2D]">
                  92%
                </span>
              </div>
              <div className="leading-tight">
                <div className="font-mono-code text-[9px] uppercase tracking-wider text-[#7D8F8F]">
                  Match Score
                </div>
                <div className="font-bold text-xs text-[#224b4c]">
                  Strong Match
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Bottom Folio */}
        <div className="relative z-10 font-mono-code text-[10px] uppercase tracking-widest text-[#7D8F8F]">
          Scroll to explore ↓
        </div>
      </div>

      {/* RIGHT HALF: Centered Crisp Login Form matching Image 2 right side */}
      <div className="lg:w-[42%] xl:w-[40%] min-h-screen bg-[#F8F4ED] flex flex-col justify-between p-8 sm:p-12 lg:p-16 relative">
        
        {/* Top Header Navigation */}
        <div className="flex items-center justify-between pb-4 text-xs font-sans text-[#7D8F8F]">
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:text-[#1E2D2D] transition-colors">Help</Link>
            <span className="text-[#E0CFB7]">|</span>
            <button 
              type="button" 
              onClick={handle1ClickLogin} 
              className="hover:text-[#224b4c] transition-colors font-medium text-[#224b4c]"
            >
              Demo
            </button>
            <span className="text-[#E0CFB7]">|</span>
            <Link href="/" className="hover:text-[#1E2D2D] transition-colors">About</Link>
          </div>

          <div className="font-mono-code text-xs text-[#7D8F8F] flex items-center gap-1">
            <span>01 / 03</span>
            <span className="inline-block w-8 h-[1px] bg-[#7D8F8F]/60 ml-1"></span>
          </div>
        </div>

        {/* Centered Sign-in Form Content */}
        <div className="my-auto py-6 max-w-sm w-full mx-auto space-y-7">
          
          <div className="space-y-1.5">
            <h2 className="font-editorial text-4xl sm:text-5xl text-[#1E2D2D] font-normal tracking-tight">
              Welcome back
            </h2>
            <p className="text-sm text-[#7D8F8F]">
              Sign in to continue to your workspace.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-300 text-rose-800 text-xs font-mono-code rounded-md">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            
            {/* Email Address */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#475858]">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7D8F8F]" size={16} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="khushi.mehta@email.com"
                  className="w-full pl-10 pr-3.5 py-3 bg-[#FAF7F0] border border-[#E0CFB7] rounded-md text-xs text-[#1E2D2D] placeholder-[#A4B3B3] focus:outline-none focus:border-[#224b4c] focus:ring-1 focus:ring-[#224b4c]/20 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#475858]">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7D8F8F]" size={16} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-10 py-3 bg-[#FAF7F0] border border-[#E0CFB7] rounded-md text-xs text-[#1E2D2D] placeholder-[#A4B3B3] focus:outline-none focus:border-[#224b4c] focus:ring-1 focus:ring-[#224b4c]/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#7D8F8F] hover:text-[#1E2D2D]"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-xs pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-[#E0CFB7] text-[#224b4c] focus:ring-0 cursor-pointer accent-[#224b4c]"
                />
                <span className="text-xs text-[#475858]">Remember me</span>
              </label>
              <button
                type="button"
                onClick={handle1ClickLogin}
                className="text-xs text-[#224b4c] hover:underline font-medium"
              >
                Forgot password?
              </button>
            </div>

            {/* Sign in Button in #224b4c */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-[#224b4c] hover:bg-[#1a3a3b] text-[#FFFFFF] text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              <span>{loading ? "Signing in..." : "Sign in"}</span>
              <ArrowRight size={14} />
            </button>

            {/* 1-Click Fast Recruiter Demo Button */}
            <button
              type="button"
              onClick={handle1ClickLogin}
              className="w-full py-2.5 px-4 bg-[#FAF7F0] hover:bg-[#E0CFB7]/40 text-[#1E2D2D] text-xs font-mono-code rounded-md border border-[#E0CFB7] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>⚡ 1-Click Demo Login (Khushi Mehta)</span>
            </button>

            {/* Divider 'or' */}
            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-[#E0CFB7]"></div>
              <span className="flex-shrink mx-3 text-xs text-[#7D8F8F]">or</span>
              <div className="flex-grow border-t border-[#E0CFB7]"></div>
            </div>

            {/* Continue with Google */}
            <button
              type="button"
              onClick={handle1ClickLogin}
              className="w-full py-2.5 px-4 bg-[#FAF7F0] hover:bg-[#E0CFB7]/30 border border-[#E0CFB7] text-[#1E2D2D] text-xs font-medium rounded-md transition-colors flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z" />
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z" />
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z" />
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
              </svg>
              <span>Continue with Google</span>
            </button>

            <div className="text-center pt-2">
              <span className="text-xs text-[#7D8F8F]">
                New to ResumeIQ?{" "}
              </span>
              <Link href="/register" className="text-xs text-[#224b4c] hover:underline font-semibold">
                Create an account
              </Link>
            </div>

          </form>

        </div>

        {/* Bottom Folio */}
        <div className="relative flex items-center justify-between pt-6 border-t border-[#E0CFB7]/60 text-[10px] font-mono-code text-[#7D8F8F]">
          <span>BUILD  /  SCREEN  /  HIRE</span>
          
          <div className="flex items-center gap-1.5 text-[#224b4c]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#224b4c]"></span>
            <span>ResumeIQ Active</span>
          </div>
        </div>

      </div>

    </div>
  );
}
