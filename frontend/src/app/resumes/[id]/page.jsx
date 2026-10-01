"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import EntityAnnotator from "@/components/EntityAnnotator";
import JobSuitabilityScanner from "@/components/JobSuitabilityScanner";
import { api } from "@/lib/api";
import { FileText, CheckCircle2, ArrowRight, UserCheck, ChevronLeft } from "lucide-react";

export default function ResumeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;

  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadResume() {
      if (!id) return;
      try {
        const data = await api.getResume(id);
        setResume(data);
      } catch (err) {
        console.error("Error fetching resume detail:", err);
      } finally {
        setLoading(false);
      }
    }
    loadResume();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4EBDD] flex">
        <Sidebar />
        <div className="flex-1 ml-64 p-8 flex items-center justify-center font-mono-code text-xs text-[#7D8F8F]">
          Loading NLP Annotation Stream...
        </div>
      </div>
    );
  }

  const parsed = resume?.parsed_json || {
    full_name: "Alex Rivera",
    raw_text: resume?.raw_text || "Alex Rivera is a Senior Machine Learning Engineer at Google with skills in Python, PyTorch, Transformers, and Docker."
  };

  const rawText = resume?.raw_text || parsed.raw_text || "Alex Rivera\nSenior Machine Learning Engineer\nEmail: alex.rivera@example.com\nLocation: San Francisco, CA\n\nSUMMARY\nExperienced ML Engineer specializing in NLP, PyTorch, Transformers, and FastAPI.\n\nEXPERIENCE\nGoogle AI — Senior Machine Learning Engineer (2021 - Present)\nBuilt LLM fine-tuning pipelines and inference engines using PyTorch and Transformers.\n\nEDUCATION\nMaster of Science in Computer Science — Stanford University (2019)\n\nSKILLS\nPython, PyTorch, TensorFlow, NLP, Transformers, Docker, AWS, SQL";
  
  const entities = resume?.entities_json || parsed.entities || [
    { entity: "Alex Rivera", type: "PERSON", confidence: 0.95, start_char: 0, end_char: 11, source_text: "Alex Rivera Senior Machine Learning Engineer" },
    { entity: "Senior Machine Learning Engineer", type: "JOB_TITLE", confidence: 0.92, start_char: 12, end_char: 44, source_text: "Senior Machine Learning Engineer Email" },
    { entity: "alex.rivera@example.com", type: "EMAIL", confidence: 0.99, start_char: 52, end_char: 75, source_text: "Email: alex.rivera@example.com Location" },
    { entity: "San Francisco, CA", type: "LOCATION", confidence: 0.89, start_char: 87, end_char: 104, source_text: "Location: San Francisco, CA SUMMARY" },
    { entity: "PyTorch", type: "SKILL", confidence: 0.95, start_char: 160, end_char: 167, source_text: "PyTorch, Transformers, and FastAPI" },
    { entity: "Google AI", type: "COMPANY", confidence: 0.91, start_char: 210, end_char: 219, source_text: "Google AI — Senior Machine Learning" },
    { entity: "Stanford University", type: "EDUCATION", confidence: 0.94, start_char: 350, end_char: 369, source_text: "Stanford University (2019)" }
  ];

  const candidateId = resume?.candidate_id || 1;

  return (
    <div className="min-h-screen bg-[#F4EBDD] flex font-sans text-[#1E2D2D]">
      <Sidebar />
      <div className="flex-1 ml-64 min-w-0 flex flex-col">
        <Navbar title={`NLP Entity Annotations · Resume #${id}`} folio="FOLIO 05" />

        <main className="p-8 max-w-7xl mx-auto w-full space-y-8">
          
          {/* Top Dossier Bar */}
          <div className="bg-[#FAF6EE] border border-[#E0CFB7] p-6 rounded-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-2 font-mono-code text-[10px] text-[#7D8F8F]">
                <Link href="/resumes/upload" className="hover:text-[#1E2D2D] flex items-center gap-0.5">
                  <ChevronLeft size={11} /> Back to Uploads
                </Link>
                <span>·</span>
                <span className="uppercase text-[#2D8A8A] font-semibold">
                  {resume?.file_type || "PDF"} Ingestion Complete
                </span>
              </div>
              <h1 className="font-editorial text-3xl text-[#1E2D2D]">
                {parsed.full_name || "Candidate Document"}
              </h1>
              <p className="font-mono-code text-xs text-[#7D8F8F]">
                {resume?.filename} · {(resume?.file_size ? (resume.file_size / 1024).toFixed(1) : 34.2)} KB · {entities.length} NLP Entities Identified
              </p>
            </div>

            <div className="flex items-center gap-3">
              {candidateId && (
                <Link
                  href={`/candidates/${candidateId}`}
                  className="px-4 py-2 bg-[#2D8A8A] hover:bg-[#236E6E] text-[#FAF6EE] text-xs font-medium rounded-xs border border-[#236E6E] transition-colors inline-flex items-center gap-1.5"
                >
                  <UserCheck size={13} />
                  <span>View Candidate Dossier</span>
                </Link>
              )}
            </div>
          </div>

          {/* Split-Screen Resume & Interactive Entity Annotator */}
          <EntityAnnotator rawText={rawText} entities={entities} parsedJson={parsed} />

          {/* Multi-Job Compatibility Scanner */}
          <div className="pt-4">
            <JobSuitabilityScanner candidateId={candidateId} />
          </div>

        </main>
      </div>
    </div>
  );
}
