"use client";

import React from "react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from "recharts";

export default function MatchRadarChart({ matchData }) {
  if (!matchData) return null;

  const data = [
    { subject: "Skill Match", score: matchData.skill_match_score || 85, fullMark: 100 },
    { subject: "Semantic Embedding", score: matchData.semantic_score || 90, fullMark: 100 },
    { subject: "Experience Fit", score: matchData.experience_score || 80, fullMark: 100 },
    { subject: "Education Level", score: matchData.education_score || 95, fullMark: 100 },
    { subject: "Skill Coverage", score: matchData.required_skill_coverage || 88, fullMark: 100 },
  ];

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
          <PolarGrid stroke="#E0CFB7" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: "#1E2D2D", fontSize: 10, fontFamily: "monospace", fontWeight: 500 }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9, fill: "#7D8F8F", fontFamily: "monospace" }} />
          <Radar name="Candidate Dimension" dataKey="score" stroke="#2D8A8A" fill="#2D8A8A" fillOpacity={0.3} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: "#FAF6EE", 
              borderRadius: "2px", 
              border: "1px solid #E0CFB7", 
              fontSize: "11px",
              fontFamily: "monospace",
              color: "#1E2D2D"
            }} 
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
