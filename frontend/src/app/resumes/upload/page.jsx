"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  Zap,
  Loader2,
  Trash2,
  Eye,
  Check,
  ChevronLeft
} from "lucide-react";

const PIPELINE_STAGES = [
  "Resume document uploaded to intake buffer",
  "PDF / DOCX binary text extraction complete",
  "Resume section classification & layout normalization",
  "spaCy Named Entity Recognition (PERSON, ROLES, DATES)",
  "Hierarchical skill taxonomy & confidence scoring",
  "Experience duration & education degree extraction",
  "Generating 384-dimensional dense vector embeddings",
  "Candidate dossier created & indexed in database"
];

export default function UploadResumesPage() {
  const router = useRouter();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [currentStage, setCurrentStage] = useState(0);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [resumesList, setResumesList] = useState([]);

  const loadResumes = async () => {
    try {
      const data = await api.getResumes();
      setResumesList(data || []);
    } catch (e) {
      console.error("Error loading resumes list:", e);
    }
  };

  useEffect(() => {
    loadResumes();
  }, []);

  const handleFileChange = (f) => {
    if (f) {
      setFile(f);
      setError("");
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleUploadAndProcess = async (manualFile) => {
    const targetFile = manualFile || file;
    if (!targetFile) return;

    setUploading(true);
    setCurrentStage(0);
    setError("");

    const interval = setInterval(() => {
      setCurrentStage((prev) => {
        if (prev < PIPELINE_STAGES.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 380);

    try {
      const res = await api.uploadResume(targetFile);
      clearInterval(interval);
      setCurrentStage(PIPELINE_STAGES.length - 1);
      await loadResumes();
      setTimeout(() => {
        setUploading(false);
        setFile(null);
        if (res.id) {
          router.push(`/resumes/${res.id}`);
        }
      }, 700);
    } catch (err) {
      clearInterval(interval);
      setUploading(false);
      setError(err.message || "Resume parsing failed");
    }
  };

  return (
    <div className="min-h-screen bg-[#F4EBDD] flex font-sans text-[#1E2D2D] selection:bg-[#2D8A8A]/20">
      <Sidebar />
      <div className="flex-1 ml-64 min-w-0 flex flex-col">
        <Navbar title="Upload Resumes & NLP Intake" folio="RESUMES" />

        <main className="p-8 max-w-6xl mx-auto w-full space-y-6">
          
          {/* Back link */}
          <div>
            <Link
              href="/jobs"
              className="inline-flex items-center gap-1 font-mono-code text-xs text-[#7D8F8F] hover:text-[#1E2D2D] transition-colors"
            >
              <ChevronLeft size={13} />
              <span>Back to Jobs</span>
            </Link>
          </div>

          {/* Header matching Image 1 middle right */}
          <div className="bg-[#FAF6EE] border border-[#E0CFB7] p-6 rounded-xs shadow-xs space-y-1.5">
            <h1 className="font-editorial text-3xl font-normal text-[#1E2D2D]">
              Upload Resumes
            </h1>
            <p className="text-xs text-[#7D8F8F]">
              Add candidate resumes in PDF or DOCX format. Our AI will analyze and match them with the job requirements.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-300 text-rose-800 text-xs font-mono-code rounded-xs flex items-center gap-2">
              <AlertCircle size={15} /> {error}
            </div>
          )}

          {/* Big Drag & Drop Box matching Image 1 middle right */}
          <div className="bg-[#FAF6EE] border border-[#E0CFB7] p-8 rounded-xs shadow-xs space-y-6 relative">
            
            <div className="absolute top-6 right-8">
              <span className="font-mono-code text-[11px] text-[#7D8F8F] bg-[#FAF5EB] px-2.5 py-1 border border-[#E0CFB7] rounded-xs flex items-center gap-1.5">
                <FileText size={12} className="text-[#2D8A8A]" />
                <span>Multiple files supported</span>
              </span>
            </div>

            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className={`p-14 border-2 border-dashed rounded-xs text-center transition-all cursor-pointer ${
                dragOver 
                  ? "border-[#2D8A8A] bg-[#2D8A8A]/5" 
                  : "border-[#BFA889]/60 bg-[#FAF5EB] hover:border-[#2D8A8A]"
              }`}
            >
              <input
                type="file"
                id="resume-file-input"
                accept=".pdf,.docx,.doc,.txt"
                onChange={(e) => handleFileChange(e.target.files[0])}
                className="hidden"
              />
              <label htmlFor="resume-file-input" className="cursor-pointer space-y-3 block">
                <div className="w-12 h-12 rounded-full bg-[#FAF6EE] border border-[#E0CFB7] text-[#2D8A8A] flex items-center justify-center mx-auto shadow-xs">
                  <UploadCloud size={24} />
                </div>
                <div>
                  <div className="font-editorial text-xl text-[#1E2D2D]">
                    Drop resumes here
                  </div>
                  <p className="font-mono-code text-xs text-[#2D8A8A] mt-0.5">
                    or click to browse
                  </p>
                  <p className="font-mono-code text-[11px] text-[#7D8F8F] mt-1">
                    PDF, DOCX (Max 10MB each)
                  </p>
                </div>
                {file && (
                  <div className="font-mono-code text-xs text-[#2D8A8A] font-semibold pt-2">
                    Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
                  </div>
                )}
              </label>
            </div>

            {file && (
              <div className="flex justify-end">
                <button
                  type="button"
                  disabled={uploading}
                  onClick={() => handleUploadAndProcess()}
                  className="px-6 py-2.5 bg-[#2D8A8A] hover:bg-[#236E6E] text-[#FAF6EE] text-xs font-medium rounded-xs border border-[#236E6E] transition-colors inline-flex items-center gap-2 shadow-xs"
                >
                  <span>{uploading ? "Extracting Entities with spaCy..." : "Analyze Resume with AI →"}</span>
                </button>
              </div>
            )}
          </div>

          {/* Uploaded Files (5) matching Image 1 middle right */}
          <div className="bg-[#FAF6EE] border border-[#E0CFB7] p-6 rounded-xs space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-[#E0CFB7] pb-3">
              <div className="flex items-center gap-2">
                <h3 className="font-editorial text-xl text-[#1E2D2D] font-normal">
                  Uploaded Files ({resumesList.length || 5})
                </h3>
              </div>
              <span className="font-mono-code text-xs text-[#2D8A8A] hover:underline cursor-pointer">
                View all ({resumesList.length || 5})
              </span>
            </div>

            <div className="space-y-2.5">
              {resumesList.length === 0 ? (
                <div className="p-4 text-center font-mono-code text-xs text-[#7D8F8F]">
                  No resumes uploaded yet. Upload your resume above to get started.
                </div>
              ) : resumesList.map((f, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-[#FAF5EB] border border-[#E0CFB7] rounded-xs flex items-center justify-between text-xs hover:border-[#2D8A8A] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <FileText size={16} className="text-[#2D8A8A]" />
                    <div>
                      <div className="font-medium text-xs text-[#1E2D2D]">{f.filename || f.name}</div>
                      <div className="font-mono-code text-[10px] text-[#7D8F8F]">{f.file_size ? (f.file_size / 1024).toFixed(1) + " KB" : f.size || "DOC"}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {f.isProcessing ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 font-mono-code text-[10px] text-[#BFA889] bg-[#BFA889]/15 border border-[#BFA889]/30 rounded-xs animate-pulse">
                        <Loader2 size={10} className="animate-spin" />
                        <span>Processing</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 font-mono-code text-[10px] text-[#2D8A8A] bg-[#2D8A8A]/10 border border-[#2D8A8A]/30 rounded-xs">
                        <Check size={10} />
                        <span>Ready</span>
                      </span>
                    )}
                    <Link
                      href={`/resumes/${idx + 1}`}
                      className="px-2.5 py-1 bg-[#FAF6EE] hover:bg-[#2D8A8A] hover:text-[#FAF6EE] text-[#1E2D2D] text-[10px] font-mono-code rounded-xs border border-[#E0CFB7] transition-colors"
                    >
                      Inspect
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </main>
      </div>

    </div>
  );
}
