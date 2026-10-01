"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { api } from "@/lib/api";
import { GitCompare, ArrowRight, Briefcase } from "lucide-react";

export default function MatchIndexPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await api.getJobs();
        setJobs(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="min-h-screen bg-[#F4EBDD] flex font-sans text-[#1E2D2D]">
      <Sidebar />
      <div className="flex-1 ml-64 min-w-0 flex flex-col">
        <Navbar title="Match Analysis · Role Directory" folio="FOLIO 07" />

        <main className="p-8 max-w-7xl mx-auto w-full space-y-6">
          
          <div className="bg-[#FAF6EE] border border-[#E0CFB7] p-6 rounded-xs space-y-1.5 shadow-xs">
            <span className="font-mono-code text-[10px] text-[#2D8A8A] uppercase tracking-widest font-semibold">
              Multi-Factor Semantic Matching
            </span>
            <h1 className="font-editorial text-3xl text-[#1E2D2D]">
              Select Job Description to Inspect Match Analysis
            </h1>
            <p className="text-xs text-[#475858]">
              Evaluate candidate alignment, skill gaps, and 384-dimensional sentence embedding similarities for any active search.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((j) => (
              <div key={j.id} className="bg-[#FAF6EE] border border-[#E0CFB7] p-6 rounded-xs flex flex-col justify-between space-y-4 hover:border-[#2D8A8A] transition-colors shadow-xs">
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="font-mono-code text-[10px] px-1.5 py-0.5 bg-[#FAF5EB] border border-[#E0CFB7] rounded-xs text-[#7D8F8F]">
                      {j.department || "Engineering"}
                    </span>
                    <span className="font-mono-code text-[10px] text-[#2D8A8A] font-semibold">
                      {j.min_experience_years}+ yrs
                    </span>
                  </div>
                  <h3 className="font-editorial text-xl text-[#1E2D2D]">{j.title}</h3>
                  <p className="text-xs text-[#475858] line-clamp-3 leading-relaxed font-mono-code">
                    {j.raw_text}
                  </p>
                </div>

                <Link
                  href={`/jobs/${j.id}`}
                  className="w-full py-2 bg-[#2D8A8A] hover:bg-[#236E6E] text-[#FAF6EE] text-xs font-medium rounded-xs border border-[#236E6E] transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>Analyze & Screen Candidates</span>
                  <ArrowRight size={12} />
                </Link>
              </div>
            ))}
          </div>

        </main>
      </div>
    </div>
  );
}
