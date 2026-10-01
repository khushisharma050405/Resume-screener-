"use client";

import React, { useState } from "react";
import { Sliders, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";

export default function RequirementEditor({ initialWeights, onSaveWeights }) {
  const [weights, setWeights] = useState(initialWeights || {
    skill: 35,
    semantic: 30,
    experience: 15,
    education: 10,
    coverage: 10
  });

  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);

  const handleSliderChange = (key, value) => {
    setWeights(prev => ({
      ...prev,
      [key]: parseInt(value, 10) || 0
    }));
  };

  const handleSave = () => {
    if (totalWeight !== 100) {
      alert(`Total weight must equal 100%. Current sum: ${totalWeight}%`);
      return;
    }
    onSaveWeights(weights);
  };

  return (
    <div className="bg-[#FAF6EE] border border-[#E0CFB7] p-6 rounded-xs space-y-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E0CFB7]">
        <div>
          <span className="font-mono-code text-[10px] uppercase tracking-widest text-[#7D8F8F]">
            Recruiter Preference Tuning
          </span>
          <h3 className="font-editorial text-xl text-[#1E2D2D] mt-0.5">
            Configurable Scoring Weights
          </h3>
          <p className="text-xs text-[#475858]">
            Adjust the formula coefficients to prioritize candidate dimensions for this specific search.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className={`font-mono-code text-xs px-2.5 py-1 rounded-xs border ${
            totalWeight === 100 
              ? "bg-[#2D8A8A]/10 text-[#2D8A8A] border-[#2D8A8A] font-semibold"
              : "bg-rose-50 text-rose-700 border-rose-300"
          }`}>
            Sum: {totalWeight}% {totalWeight === 100 ? "(Balanced)" : "(Must equal 100%)"}
          </span>

          <button
            onClick={handleSave}
            disabled={totalWeight !== 100}
            className="px-3.5 py-1.5 bg-[#2D8A8A] hover:bg-[#236E6E] text-[#FAF6EE] font-medium text-xs rounded-xs border border-[#236E6E] transition-colors disabled:opacity-50 inline-flex items-center gap-1.5"
          >
            <RefreshCw size={12} />
            <span>Apply Weights</span>
          </button>
        </div>
      </div>

      {/* Sliders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { key: "skill", label: "Skill Taxonomy Match", desc: "Direct match against required & preferred skills" },
          { key: "semantic", label: "Semantic Vector Embedding", desc: "384-d cosine similarity between JD & resume text" },
          { key: "experience", label: "Years of Experience Fit", desc: "Alignment with role seniority expectation" },
          { key: "education", label: "Education Degree Level", desc: "Degree credentials (Bachelor, Master, PhD)" },
          { key: "coverage", label: "Required Skill Coverage", desc: "Percentage of strictly mandatory skills fulfilled" },
        ].map((item) => (
          <div key={item.key} className="p-3.5 rounded-xs bg-[#FAF5EB] border border-[#E0CFB7] space-y-2">
            <div className="flex justify-between items-center text-xs font-mono-code">
              <span className="font-medium text-[#1E2D2D]">{item.label}</span>
              <span className="font-bold text-[#2D8A8A]">{weights[item.key]}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="60"
              value={weights[item.key]}
              onChange={(e) => handleSliderChange(item.key, e.target.value)}
              className="w-full accent-[#2D8A8A] cursor-pointer"
            />
            <div className="text-[10px] text-[#7D8F8F] leading-tight">{item.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
