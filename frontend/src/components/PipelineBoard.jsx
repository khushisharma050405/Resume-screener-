"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Users, ArrowRight, CheckCircle2, Star, UserCheck, Eye } from "lucide-react";

const STAGES = [
  { id: "ALL", label: "All Applicants", color: "bg-slate-100 text-slate-700 border-slate-200" },
  { id: "SCREENED", label: "Screened", color: "bg-blue-50 text-blue-700 border-blue-200" },
  { id: "STRONG_MATCH", label: "Strong Match", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { id: "SHORTLISTED", label: "Shortlisted", color: "bg-purple-50 text-purple-700 border-purple-200" },
  { id: "INTERVIEW", label: "Interview Scheduled", color: "bg-amber-50 text-amber-700 border-amber-200" },
];

export default function PipelineBoard({ matches = [], onUpdateStage }) {
  const [selectedStageFilter, setSelectedStageFilter] = useState("ALL");

  const filteredMatches = selectedStageFilter === "ALL"
    ? matches
    : matches.filter(m => (m.stage || "SCREENED") === selectedStageFilter);

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">Interactive Candidate Recruitment Pipeline</h3>
          <p className="text-xs text-slate-500">Filter and progress candidates across recruitment stages</p>
        </div>
      </div>

      {/* Stage Pills Navigation */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {STAGES.map((s) => {
          const count = s.id === "ALL" ? matches.length : matches.filter(m => (m.stage || "SCREENED") === s.id).length;
          const isActive = selectedStageFilter === s.id;
          return (
            <button
              key={s.id}
              onClick={() => setSelectedStageFilter(s.id)}
              className={`p-3.5 rounded-2xl border text-left transition-all space-y-1 ${
                isActive
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-md"
                  : "bg-slate-50 text-slate-800 border-slate-200/80 hover:bg-indigo-50/50"
              }`}
            >
              <div className="text-lg font-extrabold">{count}</div>
              <div className="text-[11px] font-bold tracking-tight">{s.label}</div>
            </button>
          );
        })}
      </div>

      {/* Candidates List in Pipeline */}
      <div className="space-y-3 pt-2">
        {filteredMatches.map((m) => (
          <div
            key={m.id}
            className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 hover:bg-white hover:border-indigo-200 hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gradient-bg text-white font-bold flex items-center justify-center">
                {m.candidate_name[0]}
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">{m.candidate_name}</h4>
                <p className="text-xs text-slate-500 font-medium">{m.candidate_role || "Candidate"}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-extrabold text-xs border border-emerald-200">
                {m.overall_score}% Match
              </span>

              {/* Stage selector dropdown */}
              <select
                value={m.stage || "SCREENED"}
                onChange={(e) => onUpdateStage(m.id, e.target.value)}
                className="px-3 py-1.5 text-xs font-bold bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="SCREENED">Screened</option>
                <option value="STRONG_MATCH">Strong Match</option>
                <option value="SHORTLISTED">Shortlisted</option>
                <option value="INTERVIEW">Interview</option>
              </select>

              <Link
                href={`/match/${m.id}`}
                className="px-3.5 py-1.5 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 font-bold text-xs transition-colors flex items-center gap-1"
              >
                <Eye size={13} /> Detail
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
