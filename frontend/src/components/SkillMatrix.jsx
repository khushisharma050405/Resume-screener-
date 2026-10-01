"use client";

import React, { useState } from "react";
import { Search, Sparkles, X, Check } from "lucide-react";

const CATEGORIES = ["ALL", "AI/ML", "Programming", "Frameworks & Libraries", "Databases", "Cloud & DevOps", "Analytics & Data Science"];

export default function SkillMatrix({ skills = [] }) {
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [skillQuery, setSkillQuery] = useState("");
  const [activeSkillModal, setActiveSkillModal] = useState(null);

  const filteredSkills = skills.filter(s => {
    const matchesCat = selectedCategory === "ALL" || (s.category || "").toLowerCase() === selectedCategory.toLowerCase();
    const matchesQuery = (s.name || "").toLowerCase().includes(skillQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  return (
    <div className="bg-[#FAF6EE] border border-[#E0CFB7] p-6 rounded-xs space-y-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E0CFB7]">
        <div>
          <span className="font-mono-code text-[10px] uppercase tracking-widest text-[#7D8F8F]">
            Skill Ontology Index
          </span>
          <h3 className="font-editorial text-xl text-[#1E2D2D] mt-0.5">
            Extracted Competency Taxonomy Matrix
          </h3>
          <p className="text-xs text-[#475858]">
            Filter skills by engineering domain. Click any skill chip to inspect NLP extraction confidence and source sentence.
          </p>
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-60">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7D8F8F]" size={13} />
          <input
            type="text"
            value={skillQuery}
            onChange={(e) => setSkillQuery(e.target.value)}
            placeholder="Search skills (e.g. PyTorch)..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#FAF5EB] border border-[#E0CFB7] rounded-xs font-mono-code focus:outline-none focus:border-[#2D8A8A] text-[#1E2D2D]"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-1.5 p-1.5 bg-[#FAF5EB] rounded-xs border border-[#E0CFB7] font-mono-code text-xs">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-2.5 py-1 rounded-xs transition-colors ${
              selectedCategory === cat
                ? "bg-[#1E2D2D] text-[#FAF6EE] font-semibold"
                : "text-[#475858] hover:bg-[#E0CFB7]/40"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Interactive Skill Chips Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
        {filteredSkills.map((skill, idx) => {
          const confidencePct = Math.round((skill.confidence_score || 0.9) * 100);
          return (
            <div
              key={idx}
              onClick={() => setActiveSkillModal(skill)}
              className="p-2.5 rounded-xs bg-[#FAF5EB] border border-[#E0CFB7] hover:border-[#2D8A8A] cursor-pointer transition-colors space-y-1 group"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-xs text-[#1E2D2D] group-hover:text-[#2D8A8A] transition-colors truncate pr-1">
                  {skill.name}
                </span>
                <span className="font-mono-code text-[9px] text-[#2D8A8A] font-semibold shrink-0">
                  {confidencePct}%
                </span>
              </div>
              <p className="font-mono-code text-[9px] text-[#7D8F8F] truncate">{skill.category || "Core Skill"}</p>
            </div>
          );
        })}
      </div>

      {/* Skill Context Modal */}
      {activeSkillModal && (
        <div className="fixed inset-0 z-50 bg-[#1E2D2D]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF6EE] border border-[#E0CFB7] shadow-xl max-w-md w-full p-6 rounded-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#E0CFB7] pb-3">
              <div>
                <span className="font-mono-code text-[9px] uppercase tracking-widest text-[#7D8F8F]">Competency Inspector</span>
                <h4 className="font-editorial text-xl text-[#1E2D2D]">{activeSkillModal.name}</h4>
              </div>
              <button onClick={() => setActiveSkillModal(null)} className="text-[#7D8F8F] hover:text-[#1E2D2D] p-1">
                <X size={15} />
              </button>
            </div>

            <div className="space-y-2 text-xs font-mono-code text-[#475858]">
              <div className="flex justify-between items-center bg-[#FAF5EB] p-2.5 rounded-xs border border-[#E0CFB7]">
                <span>Domain Taxonomy:</span>
                <span className="font-bold text-[#1E2D2D]">{activeSkillModal.category || "Core Skill"}</span>
              </div>

              <div className="flex justify-between items-center bg-[#FAF5EB] p-2.5 rounded-xs border border-[#E0CFB7]">
                <span>Extraction Confidence:</span>
                <span className="font-bold text-[#2D8A8A]">{Math.round((activeSkillModal.confidence_score || 0.9) * 100)}%</span>
              </div>

              {activeSkillModal.source_sentence && (
                <div className="bg-[#FAF5EB] p-3 rounded-xs border border-[#E0CFB7] space-y-1">
                  <div className="text-[9px] uppercase text-[#7D8F8F]">Extracted Source Sentence:</div>
                  <div className="italic text-[#1E2D2D] font-sans text-xs">
                    "{activeSkillModal.source_sentence}"
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setActiveSkillModal(null)}
              className="w-full py-2 bg-[#2D8A8A] text-[#FAF6EE] text-xs font-medium rounded-xs border border-[#236E6E] hover:bg-[#236E6E] transition-colors"
            >
              Close Inspection
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
