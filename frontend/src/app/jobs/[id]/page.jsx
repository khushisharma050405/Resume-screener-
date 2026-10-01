"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import RequirementEditor from "@/components/RequirementEditor";
import { api } from "@/lib/api";
import { 
  Briefcase, 
  Trophy, 
  ArrowRight, 
  CheckCircle2, 
  Search, 
  Filter,
  Play,
  Sliders,
  ChevronRight,
  UserCheck
} from "lucide-react";

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;

  const [job, setJob] = useState(null);
  const [rankedMatches, setRankedMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [showWeightEditor, setShowWeightEditor] = useState(false);
  const [rescreening, setRescreening] = useState(false);
  const [notice, setNotice] = useState("");

  const loadJobAndRank = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const jobData = await api.getJob(id);
      setJob(jobData);
      const matches = await api.matchCandidates({ job_id: parseInt(id) });
      setRankedMatches(matches || []);
    } catch (err) {
      console.error("Error matching candidates:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobAndRank();
  }, [id]);

  const handleUpdateWeights = async (newWeights) => {
    try {
      setRescreening(true);
      await api.updateJob(id, { weight_config: newWeights });
      const screened = await api.screenJob(id);
      setNotice(`Updated weights and rescreened ${screened.candidates_screened} candidates!`);
      await loadJobAndRank();
    } catch (err) {
      alert("Failed to update weights: " + err.message);
    } finally {
      setRescreening(false);
    }
  };

  const filteredMatches = rankedMatches.filter(m => 
    (m.candidate_name || "").toLowerCase().includes(query.toLowerCase()) ||
    (m.matched_skills || []).some(s => s.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-[#F4EBDD] flex font-sans text-[#1E2D2D]">
      <Sidebar />
      <div className="flex-1 ml-64 min-w-0 flex flex-col">
        <Navbar title={`Candidate Screening · ${job?.title || "Job Position"}`} folio="FOLIO 03" />

        <main className="p-8 max-w-7xl mx-auto w-full space-y-6">
          
          {/* Header Job Dossier Card */}
          <div className="bg-[#FAF6EE] border border-[#E0CFB7] p-6 rounded-xs space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E0CFB7]">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono-code text-[10px] text-[#2D8A8A] uppercase tracking-widest font-semibold">
                    Job #{id} · {job?.department || "Engineering"}
                  </span>
                  <span className="font-mono-code text-[10px] text-[#7D8F8F]">
                    · {job?.location || "Remote"}
                  </span>
                </div>
                <h1 className="font-editorial text-3xl text-[#1E2D2D] mt-0.5">
                  {job?.title}
                </h1>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowWeightEditor(!showWeightEditor)}
                  className="px-3.5 py-1.5 bg-[#FAF5EB] hover:bg-[#E0CFB7]/40 text-[#1E2D2D] text-xs font-mono-code rounded-xs border border-[#E0CFB7] transition-colors inline-flex items-center gap-1.5"
                >
                  <Sliders size={12} />
                  <span>{showWeightEditor ? "Hide Weights" : "Tune Weights"}</span>
                </button>

                <button
                  onClick={() => handleUpdateWeights(job?.weight_config_json)}
                  disabled={rescreening}
                  className="px-4 py-1.5 bg-[#2D8A8A] hover:bg-[#236E6E] text-[#FAF6EE] text-xs font-medium rounded-xs border border-[#236E6E] transition-colors inline-flex items-center gap-1.5"
                >
                  <Play size={12} />
                  <span>{rescreening ? "Computing..." : "Re-Run Screening"}</span>
                </button>
              </div>
            </div>

            {notice && (
              <div className="p-3 bg-[#2D8A8A]/10 border border-[#2D8A8A]/30 text-[#2D8A8A] text-xs font-mono-code rounded-xs flex items-center justify-between">
                <span>{notice}</span>
                <button onClick={() => setNotice("")} className="underline text-[10px]">Dismiss</button>
              </div>
            )}

            {/* Extracted Criteria Pills */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1 font-mono-code text-xs text-[#475858]">
              <div>
                <span className="text-[10px] uppercase text-[#7D8F8F] block mb-1">Required Skills:</span>
                <div className="flex flex-wrap gap-1">
                  {(job?.required_skills_json || []).map((s, i) => (
                    <span key={i} className="px-1.5 py-0.5 bg-[#FAF5EB] border border-[#E0CFB7] rounded-xs text-[#1E2D2D] text-[10px]">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase text-[#7D8F8F] block mb-1">Seniority Threshold:</span>
                <span className="text-[#1E2D2D] font-semibold">{job?.min_experience_years}+ years minimum professional experience</span>
              </div>

              <div>
                <span className="text-[10px] uppercase text-[#7D8F8F] block mb-1">Education Standard:</span>
                <span className="text-[#1E2D2D] font-semibold">{job?.required_education || "Bachelor of Science or equivalent"}</span>
              </div>
            </div>

            <div className="text-xs text-[#475858] leading-relaxed pt-2 border-t border-[#E0CFB7] max-h-24 overflow-y-auto font-mono-code">
              {job?.raw_text}
            </div>
          </div>

          {/* Conditional Weight Tuner */}
          {showWeightEditor && (
            <RequirementEditor 
              initialWeights={job?.weight_config_json}
              onSaveWeights={handleUpdateWeights}
            />
          )}

          {/* Candidate Screening Leaderboard */}
          <div className="bg-[#FAF6EE] border border-[#E0CFB7] p-6 rounded-xs space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#E0CFB7]">
              <div>
                <span className="font-mono-code text-[10px] uppercase tracking-widest text-[#7D8F8F]">
                  Candidate Leaderboard
                </span>
                <h3 className="font-editorial text-xl text-[#1E2D2D] mt-0.5">
                  Ranked Screening Results ({rankedMatches.length} Candidates Evaluated)
                </h3>
              </div>

              {/* Search filter */}
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7D8F8F]" size={13} />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Filter candidates or skills..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#FAF5EB] border border-[#E0CFB7] rounded-xs font-mono-code focus:outline-none focus:border-[#2D8A8A] text-[#1E2D2D]"
                />
              </div>
            </div>

            <div className="overflow-hidden">
              <table className="editorial-table">
                <thead>
                  <tr>
                    <th>Rank & Candidate</th>
                    <th>Experience</th>
                    <th>Matched Competencies</th>
                    <th>Overall Match Score</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMatches.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-6 text-xs text-[#7D8F8F] font-mono-code">
                        No candidates match your filter.
                      </td>
                    </tr>
                  ) : (
                    filteredMatches.map((m, idx) => (
                      <tr key={m.id || idx} className="hover:bg-[#E0CFB7]/20 transition-colors">
                        <td>
                          <div className="flex items-center gap-2.5">
                            <span className="font-mono-code text-xs font-bold text-[#7D8F8F] w-6">
                              #{idx + 1}
                            </span>
                            <div>
                              <div className="font-medium text-xs text-[#1E2D2D]">{m.candidate_name}</div>
                              <div className="font-mono-code text-[10px] text-[#7D8F8F]">{m.candidate_role || "Applicant"}</div>
                            </div>
                          </div>
                        </td>
                        <td className="font-mono-code text-xs text-[#475858]">
                          {m.years_of_experience || 3.5} yrs
                        </td>
                        <td>
                          <div className="flex flex-wrap gap-1 max-w-sm">
                            {(m.matched_skills || []).slice(0, 4).map((s, i) => (
                              <span key={i} className="font-mono-code text-[9px] px-1 py-0.5 bg-[#FAF5EB] border border-[#2D8A8A]/40 rounded-xs text-[#1E2D2D]">
                                ✓ {s}
                              </span>
                            ))}
                            {(m.matched_skills || []).length > 4 && (
                              <span className="font-mono-code text-[9px] text-[#7D8F8F]">
                                +{(m.matched_skills || []).length - 4}
                              </span>
                            )}
                          </div>
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-[#E0CFB7]/60 h-2 rounded-xs overflow-hidden">
                              <div 
                                className="bg-[#2D8A8A] h-full rounded-xs" 
                                style={{ width: `${Math.min(100, m.overall_score)}%` }}
                              />
                            </div>
                            <span className="font-mono-code text-xs font-bold text-[#1E2D2D]">
                              {m.overall_score}%
                            </span>
                          </div>
                        </td>
                        <td className="text-right">
                          <div className="inline-flex items-center gap-2">
                            <Link
                              href={`/match/${m.id || id}`}
                              className="px-2.5 py-1 bg-[#2D8A8A] hover:bg-[#236E6E] text-[#FAF6EE] text-[10px] font-mono-code rounded-xs border border-[#236E6E] transition-colors inline-flex items-center gap-1"
                            >
                              <span>Match Dossier</span>
                              <ArrowRight size={10} />
                            </Link>
                            <Link
                              href={`/candidates/${m.candidate_id}`}
                              className="px-2.5 py-1 bg-[#FAF5EB] hover:bg-[#E0CFB7]/40 text-[#1E2D2D] text-[10px] font-mono-code rounded-xs border border-[#E0CFB7] transition-colors"
                            >
                              Profile
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}
