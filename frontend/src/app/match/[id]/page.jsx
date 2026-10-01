"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import MatchScoreBreakdown from "@/components/MatchScoreBreakdown";
import SkillGapChart from "@/components/SkillGapChart";
import MatchRadarChart from "@/components/MatchRadarChart";
import { api } from "@/lib/api";
import { ChevronLeft, ArrowRight, UserCheck } from "lucide-react";

export default function MatchDetailPage() {
  const params = useParams();
  const id = params?.id;

  const [matchData, setMatchData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMatch() {
      if (!id) return;
      try {
        const data = await api.getMatch(id);
        setMatchData(data);
      } catch (err) {
        console.error("Error loading match detail:", err);
      } finally {
        setLoading(false);
      }
    }
    loadMatch();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4EBDD] flex">
        <Sidebar />
        <div className="flex-1 ml-64 p-8 flex items-center justify-center font-mono-code text-xs text-[#7D8F8F]">
          Loading AI Candidate Match Analysis...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4EBDD] flex font-sans text-[#1E2D2D]">
      <Sidebar />
      <div className="flex-1 ml-64 min-w-0 flex flex-col">
        <Navbar title={`Match Intelligence · Dossier #${id}`} folio="FOLIO 07" />

        <main className="p-8 max-w-7xl mx-auto w-full space-y-6">
          
          {/* Back Navigation Bar */}
          <div className="flex items-center justify-between font-mono-code text-xs text-[#7D8F8F]">
            <Link href="/match" className="hover:text-[#1E2D2D] inline-flex items-center gap-1">
              <ChevronLeft size={13} />
              <span>Back to Match Directory</span>
            </Link>

            {matchData?.candidate_id && (
              <Link 
                href={`/candidates/${matchData.candidate_id}`}
                className="text-[#2D8A8A] hover:underline inline-flex items-center gap-1 font-semibold"
              >
                <span>View Full Candidate Profile</span>
                <ArrowRight size={11} />
              </Link>
            )}
          </div>

          {/* Transparent Multi-Factor Score Breakdown */}
          <MatchScoreBreakdown matchData={matchData} />

          {/* 2-Column: Skill Gap Analysis & Multi-Dimensional Radar */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            <div className="lg:col-span-7">
              <SkillGapChart 
                matchedSkills={matchData?.matched_skills || []} 
                missingSkills={matchData?.missing_skills || []} 
              />
            </div>

            <div className="lg:col-span-5 bg-[#FAF6EE] border border-[#E0CFB7] p-6 rounded-xs space-y-4 shadow-xs">
              <div>
                <span className="font-mono-code text-[10px] uppercase tracking-widest text-[#7D8F8F]">
                  Radar Alignment
                </span>
                <h3 className="font-editorial text-xl text-[#1E2D2D] mt-0.5">
                  Multi-Dimensional Competency Polygon
                </h3>
              </div>
              <MatchRadarChart matchData={matchData} />
            </div>

          </div>

        </main>
      </div>
    </div>
  );
}
