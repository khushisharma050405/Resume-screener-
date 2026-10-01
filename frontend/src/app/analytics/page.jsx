"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { api } from "@/lib/api";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell, 
  PieChart, 
  Pie, 
  LineChart, 
  Line 
} from "recharts";
import { BarChart3, TrendingUp, Users, Award, Briefcase } from "lucide-react";

const PALETTE = ["#2D8A8A", "#BFA889", "#E0CFB7", "#475858", "#1E2D2D"];

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await api.getAnalytics();
        setAnalytics(data);
      } catch (err) {
        console.error("Analytics error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const summary = analytics?.summary || {
    total_resumes: 12,
    total_candidates: 10,
    total_jobs: 5,
    average_match_score: 84.6,
    shortlisted_candidates: 4
  };

  const skillDist = analytics?.skill_distribution || [
    { name: "Python", count: 8 },
    { name: "React", count: 6 },
    { name: "PyTorch", count: 5 },
    { name: "PostgreSQL", count: 5 },
    { name: "Docker", count: 4 },
    { name: "FastAPI", count: 4 },
    { name: "AWS", count: 3 },
    { name: "Figma", count: 2 },
  ];

  const scoreBuckets = [
    { range: "90–100% (High Alignment)", count: 3 },
    { range: "80–89% (Strong Match)", count: 4 },
    { range: "70–79% (Qualified)", count: 2 },
    { range: "60–69% (Moderate)", count: 1 },
    { range: "< 60% (Marginal)", count: 0 },
  ];

  const experienceDist = [
    { exp: "0–2 yrs", count: 2 },
    { exp: "3–5 yrs", count: 5 },
    { exp: "6–8 yrs", count: 2 },
    { exp: "9+ yrs", count: 1 },
  ];

  return (
    <div className="min-h-screen bg-[#F4EBDD] flex font-sans text-[#1E2D2D]">
      <Sidebar />
      <div className="flex-1 ml-64 min-w-0 flex flex-col">
        <Navbar title="Recruitment Analytics & Insights" folio="FOLIO 10" />

        <main className="p-8 max-w-7xl mx-auto w-full space-y-8">
          
          {/* Header */}
          <div className="bg-[#FAF6EE] border border-[#E0CFB7] p-6 rounded-xs space-y-1.5 shadow-xs">
            <span className="font-mono-code text-[10px] text-[#2D8A8A] uppercase tracking-widest font-semibold">
              Telemetry & Statistical Ledger
            </span>
            <h1 className="font-editorial text-3xl text-[#1E2D2D]">
              Screening Metrics & Talent Distribution
            </h1>
            <p className="text-xs text-[#475858]">
              Aggregate distributions across candidate skill competencies, score bands, and screening velocity.
            </p>
          </div>

          {/* Key KPI Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Evaluated Candidates", val: summary.total_candidates, sub: "Deconstructed in DB" },
              { label: "Mean Match Score", val: `${summary.average_match_score}%`, sub: "Vector & Skill Avg" },
              { label: "Shortlist Conversion", val: `${Math.round((summary.shortlisted_candidates / Math.max(1, summary.total_candidates)) * 100)}%`, sub: `${summary.shortlisted_candidates} Top Tier` },
              { label: "Job Role Openings", val: summary.total_jobs, sub: "Active Searches" },
            ].map((k, i) => (
              <div key={i} className="bg-[#FAF6EE] border border-[#E0CFB7] p-4 rounded-xs space-y-1 shadow-xs">
                <div className="font-mono-code text-[10px] uppercase text-[#7D8F8F]">{k.label}</div>
                <div className="font-editorial text-2xl text-[#1E2D2D]">{k.val}</div>
                <div className="font-mono-code text-[10px] text-[#475858]">{k.sub}</div>
              </div>
            ))}
          </div>

          {/* 2-Column Section: Skill Frequency + Score Distribution */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Skill Frequency */}
            <div className="bg-[#FAF6EE] border border-[#E0CFB7] p-6 rounded-xs space-y-4 shadow-xs">
              <div>
                <span className="font-mono-code text-[10px] uppercase tracking-widest text-[#7D8F8F]">Competency Density</span>
                <h3 className="font-editorial text-xl text-[#1E2D2D] mt-0.5">Skill Frequency Distribution</h3>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={skillDist.slice(0, 8)} margin={{ left: -10, right: 10, top: 10, bottom: 20 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#1E2D2D", fontFamily: "monospace" }} interval={0} angle={-25} textAnchor="end" />
                    <YAxis tick={{ fontSize: 10, fill: "#7D8F8F", fontFamily: "monospace" }} />
                    <Tooltip contentStyle={{ backgroundColor: "#FAF6EE", borderColor: "#E0CFB7", fontSize: "11px", fontFamily: "monospace" }} />
                    <Bar dataKey="count" radius={[2, 2, 0, 0]}>
                      {skillDist.map((_, i) => (
                        <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Score Distribution */}
            <div className="bg-[#FAF6EE] border border-[#E0CFB7] p-6 rounded-xs space-y-4 shadow-xs">
              <div>
                <span className="font-mono-code text-[10px] uppercase tracking-widest text-[#7D8F8F]">Score Spread</span>
                <h3 className="font-editorial text-xl text-[#1E2D2D] mt-0.5">Candidate Match Score Bands</h3>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={scoreBuckets} layout="vertical" margin={{ left: 20, right: 10, top: 10, bottom: 10 }}>
                    <XAxis type="number" tick={{ fontSize: 10, fill: "#7D8F8F", fontFamily: "monospace" }} />
                    <YAxis dataKey="range" type="category" width={140} tick={{ fontSize: 9, fill: "#1E2D2D", fontFamily: "monospace" }} />
                    <Tooltip contentStyle={{ backgroundColor: "#FAF6EE", borderColor: "#E0CFB7", fontSize: "11px", fontFamily: "monospace" }} />
                    <Bar dataKey="count" fill="#2D8A8A" radius={[0, 2, 2, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

          {/* Experience Distribution Card */}
          <div className="bg-[#FAF6EE] border border-[#E0CFB7] p-6 rounded-xs space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-[#E0CFB7] pb-3">
              <div>
                <span className="font-mono-code text-[10px] uppercase tracking-widest text-[#7D8F8F]">Seniority Tiers</span>
                <h3 className="font-editorial text-xl text-[#1E2D2D] mt-0.5">Years of Experience Demographics</h3>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {experienceDist.map((item, idx) => (
                <div key={idx} className="p-4 bg-[#FAF5EB] border border-[#E0CFB7] rounded-xs space-y-1 font-mono-code text-center">
                  <div className="text-xs text-[#7D8F8F]">{item.exp}</div>
                  <div className="font-editorial text-3xl text-[#1E2D2D]">{item.count}</div>
                  <div className="text-[10px] text-[#2D8A8A]">{Math.round((item.count / 10) * 100)}% of talent pool</div>
                </div>
              ))}
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}
