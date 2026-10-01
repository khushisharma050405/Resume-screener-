"use client";

import React from "react";
import { Check, X, ShieldAlert, CheckCircle2 } from "lucide-react";

export default function SkillGapChart({ matchedSkills = [], missingSkills = [] }) {
  const total = matchedSkills.length + missingSkills.length;
  const coveragePct = total > 0 ? Math.round((matchedSkills.length / total) * 100) : 100;

  return (
    <div className="bg-[#FAF6EE] border border-[#E0CFB7] p-6 rounded-xs space-y-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E0CFB7]">
        <div>
          <span className="font-mono-code text-[10px] uppercase tracking-widest text-[#7D8F8F]">
            Skill Taxonomy Analysis
          </span>
          <h3 className="font-editorial text-xl text-[#1E2D2D] mt-0.5">
            Skill Gap & Requirement Alignment
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-mono-code text-xs px-2.5 py-1 bg-[#2D8A8A]/10 border border-[#2D8A8A] rounded-xs text-[#2D8A8A] font-semibold">
            {matchedSkills.length} Matched ({coveragePct}%)
          </span>
          <span className="font-mono-code text-xs px-2.5 py-1 bg-[#FAF5EB] border border-[#BFA889] rounded-xs text-[#7D8F8F]">
            {missingSkills.length} Missing
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Matched Skills */}
        <div className="p-4 rounded-xs bg-[#FAF5EB] border border-[#E0CFB7] space-y-3">
          <div className="font-mono-code text-[10px] uppercase tracking-wider text-[#2D8A8A] font-semibold flex items-center gap-1.5">
            <Check size={12} strokeWidth={3} /> Matched Role Competencies ({matchedSkills.length})
          </div>
          <div className="flex flex-wrap gap-1.5">
            {matchedSkills.map((skill, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 bg-[#FAF6EE] text-[#1E2D2D] border border-[#2D8A8A]/40 rounded-xs font-mono-code text-xs font-medium flex items-center gap-1"
              >
                <span className="text-[#2D8A8A]">✓</span> {skill}
              </span>
            ))}
            {matchedSkills.length === 0 && (
              <p className="text-xs text-[#7D8F8F] font-mono-code italic">No skills matched yet.</p>
            )}
          </div>
        </div>

        {/* Missing Skills */}
        <div className="p-4 rounded-xs bg-[#FAF5EB] border border-[#E0CFB7] space-y-3">
          <div className="font-mono-code text-[10px] uppercase tracking-wider text-[#475858] font-semibold flex items-center gap-1.5">
            <X size={12} strokeWidth={3} className="text-[#7D8F8F]" /> Missing Role Competencies ({missingSkills.length})
          </div>
          <div className="flex flex-wrap gap-1.5">
            {missingSkills.map((skill, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 bg-[#FAF6EE] text-[#7D8F8F] border border-[#BFA889]/60 rounded-xs font-mono-code text-xs flex items-center gap-1 line-through decoration-[#BFA889]"
              >
                <span>✕</span> {skill}
              </span>
            ))}
            {missingSkills.length === 0 && (
              <p className="text-xs text-[#2D8A8A] font-mono-code font-medium">
                100% Skill Coverage: All required competencies present.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
