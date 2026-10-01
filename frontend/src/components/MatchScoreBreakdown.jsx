"use client";

import React from "react";
import { CheckCircle2, Award, SlidersHorizontal, Calculator } from "lucide-react";

export default function MatchScoreBreakdown({ matchData }) {
  if (!matchData) return null;

  const {
    overall_score = 0,
    skill_match_score = 0,
    semantic_score = 0,
    experience_score = 0,
    education_score = 0,
    required_skill_coverage = 0,
    match_reasons = []
  } = matchData;

  const FACTORS = [
    { label: "Skill Taxonomy Alignment", weight: "35%", score: skill_match_score, color: "bg-[#2D8A8A]" },
    { label: "Semantic Embedding Cosine", weight: "30%", score: semantic_score, color: "bg-[#2D8A8A]/80" },
    { label: "Experience Threshold Fit", weight: "15%", score: experience_score, color: "bg-[#BFA889]" },
    { label: "Education Degree Level", weight: "10%", score: education_score, color: "bg-[#BFA889]/80" },
    { label: "Mandatory Skill Coverage", weight: "10%", score: required_skill_coverage, color: "bg-[#475858]" },
  ];

  return (
    <div className="bg-[#FAF6EE] border border-[#E0CFB7] p-6 rounded-xs space-y-6 shadow-xs">
      
      {/* Header with Large Editorial Match Score */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E0CFB7]">
        <div>
          <span className="font-mono-code text-[10px] uppercase tracking-widest text-[#7D8F8F]">
            Evaluation Matrix · Candidate ↔ Role
          </span>
          <h3 className="font-editorial text-2xl text-[#1E2D2D] mt-0.5">
            {matchData.candidate_name} <span className="text-[#7D8F8F] font-normal">for</span> {matchData.job_title}
          </h3>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-5 py-2.5 rounded-xs border border-[#2D8A8A] bg-[#2D8A8A]/10 text-center">
            <div className="font-editorial text-3xl font-normal text-[#1E2D2D] leading-none">
              {overall_score}%
            </div>
            <div className="font-mono-code text-[9px] uppercase tracking-widest text-[#2D8A8A] font-semibold mt-1">
              Overall Match
            </div>
          </div>
        </div>
      </div>

      {/* Mathematical Transparent Formula Stamp */}
      <div className="p-3 bg-[#FAF5EB] border border-[#E0CFB7] rounded-xs flex items-center justify-between font-mono-code text-[11px] text-[#475858]">
        <div className="flex items-center gap-2">
          <Calculator size={13} className="text-[#2D8A8A]" />
          <span>Formula: 0.35·Skill + 0.30·Semantic + 0.15·Exp + 0.10·Edu + 0.10·Coverage</span>
        </div>
        <span className="text-[#7D8F8F]">100% Recruiter Weighted</span>
      </div>

      {/* Multi-Factor Progress Breakdown */}
      <div className="space-y-3">
        <div className="font-mono-code text-[10px] uppercase tracking-wider text-[#475858] font-semibold flex items-center gap-1.5">
          <SlidersHorizontal size={13} className="text-[#2D8A8A]" /> Multi-Factor Component Scoring
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {FACTORS.map((f, i) => (
            <div key={i} className="p-3.5 rounded-xs bg-[#FAF5EB] border border-[#E0CFB7] space-y-2">
              <div className="flex justify-between text-xs font-mono-code">
                <span className="text-[#1E2D2D]">{f.label} <span className="text-[#7D8F8F]">({f.weight})</span></span>
                <span className="font-bold text-[#1E2D2D]">{f.score}%</span>
              </div>
              <div className="w-full bg-[#E0CFB7]/60 rounded-xs h-1.5 overflow-hidden">
                <div
                  className={`h-full rounded-xs ${f.color} transition-all duration-300`}
                  style={{ width: `${Math.min(100, f.score)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Explainable AI Decision Reasons */}
      {match_reasons.length > 0 && (
        <div className="p-4 rounded-xs bg-[#FAF5EB] border border-[#E0CFB7] space-y-2.5">
          <div className="font-mono-code text-[10px] uppercase tracking-wider text-[#1E2D2D] font-semibold flex items-center gap-1.5">
            <Award size={13} className="text-[#2D8A8A]" /> Explainable Match Justification
          </div>
          <ul className="space-y-1.5 text-xs text-[#475858]">
            {match_reasons.map((reason, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <CheckCircle2 size={13} className="text-[#2D8A8A] shrink-0 mt-0.5" />
                <span className="leading-relaxed">{reason}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
