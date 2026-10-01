"use client";

import React, { useState, useMemo } from "react";
import { Eye, Layers, CheckCircle2, Info, ChevronRight, Sparkles, Filter } from "lucide-react";

// Editorial Palette for entity highlighting (Strictly No neon, No blue/purple gradients)
const ENTITY_STYLES = {
  PERSON: {
    bg: "bg-[#BFA889]/30",
    border: "border-[#BFA889]",
    text: "text-[#1E2D2D]",
    badge: "bg-[#BFA889]/25 text-[#1E2D2D] border-[#BFA889]",
    label: "Person"
  },
  SKILL: {
    bg: "bg-[#2D8A8A]/20",
    border: "border-[#2D8A8A]",
    text: "text-[#1E2D2D] font-medium",
    badge: "bg-[#2D8A8A]/15 text-[#1E2D2D] border-[#2D8A8A]",
    label: "Skill"
  },
  COMPANY: {
    bg: "bg-[#E0CFB7]/60",
    border: "border-[#BFA889]",
    text: "text-[#1E2D2D]",
    badge: "bg-[#E0CFB7] text-[#1E2D2D] border-[#BFA889]",
    label: "Company"
  },
  JOB_TITLE: {
    bg: "bg-[#475858]/15",
    border: "border-[#475858]",
    text: "text-[#1E2D2D]",
    badge: "bg-[#475858]/15 text-[#1E2D2D] border-[#475858]",
    label: "Job Title"
  },
  EDUCATION: {
    bg: "bg-[#BFA889]/20",
    border: "border-[#BFA889]",
    text: "text-[#1E2D2D]",
    badge: "bg-[#BFA889]/20 text-[#1E2D2D] border-[#BFA889]",
    label: "Education"
  },
  DEGREE: {
    bg: "bg-[#BFA889]/20",
    border: "border-[#BFA889]",
    text: "text-[#1E2D2D]",
    badge: "bg-[#BFA889]/20 text-[#1E2D2D] border-[#BFA889]",
    label: "Education"
  },
  UNIVERSITY: {
    bg: "bg-[#BFA889]/20",
    border: "border-[#BFA889]",
    text: "text-[#1E2D2D]",
    badge: "bg-[#BFA889]/20 text-[#1E2D2D] border-[#BFA889]",
    label: "Education"
  },
  PROJECT: {
    bg: "bg-[#2D8A8A]/15",
    border: "border-[#2D8A8A]",
    text: "text-[#1E2D2D]",
    badge: "bg-[#2D8A8A]/15 text-[#1E2D2D] border-[#2D8A8A]",
    label: "Project"
  },
  CERTIFICATION: {
    bg: "bg-[#BFA889]/35",
    border: "border-[#2D8A8A]",
    text: "text-[#1E2D2D]",
    badge: "bg-[#BFA889]/35 text-[#1E2D2D] border-[#2D8A8A]",
    label: "Certification"
  },
  EMAIL: {
    bg: "bg-[#E0CFB7]/40",
    border: "border-[#BFA889]",
    text: "text-[#1E2D2D]",
    badge: "bg-[#E0CFB7]/40 text-[#1E2D2D] border-[#BFA889]",
    label: "Email"
  },
  PHONE: {
    bg: "bg-[#E0CFB7]/40",
    border: "border-[#BFA889]",
    text: "text-[#1E2D2D]",
    badge: "bg-[#E0CFB7]/40 text-[#1E2D2D] border-[#BFA889]",
    label: "Phone"
  },
  LOCATION: {
    bg: "bg-[#FAF5EB]",
    border: "border-[#BFA889]",
    text: "text-[#1E2D2D]",
    badge: "bg-[#FAF5EB] text-[#1E2D2D] border-[#BFA889]",
    label: "Location"
  },
};

export default function EntityAnnotator({ rawText = "", entities = [], parsedJson = {} }) {
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [filterType, setFilterType] = useState("ALL");

  // Normalize entity types to the 7 core categories
  const normalizedEntities = useMemo(() => {
    return entities.map(e => {
      let t = e.type;
      if (t === "DEGREE" || t === "UNIVERSITY") t = "EDUCATION";
      return { ...e, type: t };
    });
  }, [entities]);

  const uniqueTypes = useMemo(() => {
    const types = Array.from(new Set(normalizedEntities.map(e => e.type)));
    // Prioritize standard order
    const priority = ["PERSON", "SKILL", "COMPANY", "JOB_TITLE", "EDUCATION", "PROJECT", "CERTIFICATION"];
    return types.sort((a, b) => {
      const ia = priority.indexOf(a);
      const ib = priority.indexOf(b);
      return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
    });
  }, [normalizedEntities]);

  // Compute non-overlapping character spans for inline text rendering
  const renderedSegments = useMemo(() => {
    if (!rawText) return [];

    // Filter valid entities with valid start/end offsets
    const sorted = [...normalizedEntities]
      .filter(e => typeof e.start_char === "number" && typeof e.end_char === "number" && e.start_char < e.end_char && e.end_char <= rawText.length)
      .sort((a, b) => a.start_char - b.start_char || (b.end_char - b.start_char) - (a.end_char - a.start_char));

    const nonOverlapping = [];
    let lastEnd = 0;

    for (const ent of sorted) {
      if (ent.start_char >= lastEnd) {
        nonOverlapping.push(ent);
        lastEnd = ent.end_char;
      }
    }

    // Build segments array
    const segments = [];
    let cursor = 0;

    for (const ent of nonOverlapping) {
      if (ent.start_char > cursor) {
        segments.push({
          isEntity: false,
          text: rawText.slice(cursor, ent.start_char)
        });
      }
      segments.push({
        isEntity: true,
        entity: ent,
        text: rawText.slice(ent.start_char, ent.end_char)
      });
      cursor = ent.end_char;
    }

    if (cursor < rawText.length) {
      segments.push({
        isEntity: false,
        text: rawText.slice(cursor)
      });
    }

    return segments;
  }, [rawText, normalizedEntities]);

  const displayedEntities = filterType === "ALL"
    ? normalizedEntities
    : normalizedEntities.filter(e => e.type === filterType);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      
      {/* Left Column: Split-Screen Original Document Text with Inline Highlights */}
      <div className="lg:col-span-7 space-y-4">
        
        {/* Header Bar */}
        <div className="bg-[#FAF6EE] border border-[#E0CFB7] p-4 rounded-xs flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Eye size={16} className="text-[#2D8A8A]" />
            <h3 className="font-editorial text-base text-[#1E2D2D]">
              Original Resume · NLP Entity Highlighting
            </h3>
          </div>
          <span className="font-mono-code text-[10px] text-[#7D8F8F] uppercase tracking-wider">
            {normalizedEntities.length} Entities Detected
          </span>
        </div>

        {/* Filter Badges */}
        <div className="flex flex-wrap items-center gap-1.5 p-2 bg-[#FAF5EB] border border-[#E0CFB7] rounded-xs font-mono-code text-[11px]">
          <span className="text-[#7D8F8F] text-[10px] uppercase tracking-wider px-1 mr-1 flex items-center gap-1">
            <Filter size={10} /> Filter:
          </span>
          <button
            onClick={() => setFilterType("ALL")}
            className={`px-2 py-0.5 rounded-xs transition-colors ${
              filterType === "ALL"
                ? "bg-[#2D8A8A] text-[#FAF6EE] font-semibold"
                : "text-[#475858] hover:bg-[#E0CFB7]/40"
            }`}
          >
            All ({normalizedEntities.length})
          </button>
          {uniqueTypes.map(type => {
            const count = normalizedEntities.filter(e => e.type === type).length;
            const style = ENTITY_STYLES[type] || ENTITY_STYLES.SKILL;
            const isSelected = filterType === type;
            return (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-2 py-0.5 rounded-xs transition-colors border ${
                  isSelected
                    ? "bg-[#1E2D2D] text-[#FAF6EE] border-[#1E2D2D] font-semibold"
                    : `${style.badge} hover:bg-[#E0CFB7]`
                }`}
              >
                {type} ({count})
              </button>
            );
          })}
        </div>

        {/* Document Text Container with Interactive Inline Highlights */}
        <div className="bg-[#FAF6EE] border border-[#E0CFB7] p-6 rounded-xs font-mono-code text-xs leading-relaxed max-h-[620px] overflow-y-auto whitespace-pre-wrap select-text text-[#1E2D2D]">
          {renderedSegments.length > 0 ? (
            renderedSegments.map((seg, idx) => {
              if (!seg.isEntity) {
                return <span key={idx}>{seg.text}</span>;
              }

              const ent = seg.entity;
              const isTypeMatch = filterType === "ALL" || ent.type === filterType;
              const isSelected = selectedEntity && selectedEntity.start_char === ent.start_char;
              const style = ENTITY_STYLES[ent.type] || ENTITY_STYLES.SKILL;

              return (
                <mark
                  key={idx}
                  onClick={() => setSelectedEntity(ent)}
                  className={`cursor-pointer transition-all border-b-2 px-1 py-0.5 rounded-xs mx-0.5 group relative inline-block ${
                    isTypeMatch 
                      ? `${style.bg} ${style.border} ${style.text}` 
                      : "opacity-40 bg-transparent border-transparent text-[#7D8F8F]"
                  } ${isSelected ? "ring-2 ring-[#2D8A8A] font-bold" : ""}`}
                  title={`${ent.type} (${Math.round((ent.confidence || 0.9) * 100)}% confidence) — Click to inspect`}
                >
                  <span>{seg.text}</span>
                  <span className="font-mono-code text-[8px] uppercase tracking-wider ml-1 px-1 bg-[#1E2D2D]/10 rounded-xs text-[#1E2D2D] opacity-75">
                    {ent.type}
                  </span>
                </mark>
              );
            })
          ) : (
            rawText
          )}
        </div>
      </div>

      {/* Right Column: AI Entity Inspector & Extracted Structured Dossier */}
      <div className="lg:col-span-5 space-y-4">
        
        {/* Method explanation box */}
        <div className="bg-[#FAF5EB] border border-[#E0CFB7] p-5 rounded-xs space-y-2">
          <div className="flex items-center gap-2">
            <Sparkles size={15} className="text-[#2D8A8A]" />
            <h4 className="font-editorial text-base text-[#1E2D2D]">
              NLP Entity Annotation Method
            </h4>
          </div>
          <p className="text-xs text-[#475858] leading-relaxed">
            Extracted using rule-based grammar patterns, spaCy statistical Named Entity Recognition (`en_core_web_sm`), and a 6-domain hierarchical skill ontology.
          </p>
        </div>

        {/* Selected Entity Card */}
        {selectedEntity ? (
          <div className="bg-[#FAF6EE] border-2 border-[#2D8A8A] p-5 rounded-xs space-y-3 shadow-xs">
            <div className="flex items-center justify-between border-b border-[#E0CFB7] pb-2.5">
              <span className={`font-mono-code text-[10px] uppercase tracking-wider px-2 py-0.5 border rounded-xs ${ENTITY_STYLES[selectedEntity.type]?.badge || "bg-[#FAF5EB]"}`}>
                {selectedEntity.type}
              </span>
              <span className="font-mono-code text-xs text-[#2D8A8A] font-semibold">
                {Math.round((selectedEntity.confidence || 0.95) * 100)}% Confidence
              </span>
            </div>

            <div>
              <div className="font-mono-code text-[9px] uppercase tracking-widest text-[#7D8F8F]">Detected Entity</div>
              <div className="font-editorial text-2xl text-[#1E2D2D] mt-0.5">{selectedEntity.entity}</div>
            </div>

            {selectedEntity.source_text && (
              <div>
                <div className="font-mono-code text-[9px] uppercase tracking-widest text-[#7D8F8F]">Source Context Sentence</div>
                <div className="text-xs text-[#475858] italic bg-[#FAF5EB] p-2.5 rounded-xs border border-[#E0CFB7] mt-1">
                  "{selectedEntity.source_text}"
                </div>
              </div>
            )}

            <div className="flex items-center justify-between text-[11px] font-mono-code text-[#7D8F8F] pt-2 border-t border-[#E0CFB7]">
              <span>Start: {selectedEntity.start_char} · End: {selectedEntity.end_char}</span>
              <button
                onClick={() => setSelectedEntity(null)}
                className="text-[#2D8A8A] hover:underline"
              >
                Clear Selection
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-[#FAF6EE] border border-dashed border-[#BFA889] p-6 rounded-xs text-center space-y-2">
            <Info size={18} className="text-[#7D8F8F] mx-auto" />
            <div className="font-editorial text-base text-[#1E2D2D]">No Entity Selected</div>
            <p className="text-xs text-[#475858] max-w-xs mx-auto leading-relaxed">
              Click on any highlighted entity in the left document text to inspect its exact character span, confidence score, and source sentence.
            </p>
          </div>
        )}

        {/* Entity List by Category */}
        <div className="bg-[#FAF6EE] border border-[#E0CFB7] p-5 rounded-xs space-y-3">
          <div className="font-editorial text-base text-[#1E2D2D] border-b border-[#E0CFB7] pb-2 flex justify-between items-center">
            <span>Detected Entities List</span>
            <span className="font-mono-code text-[10px] text-[#7D8F8F]">
              {displayedEntities.length} items
            </span>
          </div>

          <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1 font-mono-code text-xs">
            {displayedEntities.map((e, idx) => {
              const isSelected = selectedEntity && selectedEntity.start_char === e.start_char;
              const style = ENTITY_STYLES[e.type] || ENTITY_STYLES.SKILL;
              return (
                <div
                  key={idx}
                  onClick={() => setSelectedEntity(e)}
                  className={`p-2 rounded-xs border cursor-pointer transition-colors flex items-center justify-between ${
                    isSelected
                      ? "bg-[#E0CFB7]/60 border-[#2D8A8A]"
                      : "bg-[#FAF5EB] border-[#E0CFB7] hover:bg-[#E0CFB7]/30"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate pr-2">
                    <span className={`text-[9px] px-1 py-0.5 border rounded-xs uppercase tracking-wider shrink-0 ${style.badge}`}>
                      {e.type}
                    </span>
                    <span className="text-[#1E2D2D] font-medium truncate">{e.entity}</span>
                  </div>
                  <span className="text-[10px] text-[#7D8F8F] shrink-0">
                    {Math.round((e.confidence || 0.9) * 100)}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
}
