"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { api } from "@/lib/api";
import { History, FileText, Eye, Trash2, Search } from "lucide-react";

export default function HistoryPage() {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterQuery, setFilterQuery] = useState("");

  const loadData = async () => {
    try {
      const data = await api.getResumes();
      setResumes(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (id) => {
    try {
      await api.deleteResume(id);
      setResumes(resumes.filter(r => r.id !== id));
    } catch (err) {
      alert("Failed to delete resume: " + err.message);
    }
  };

  const filtered = resumes.filter(r =>
    (r.filename || "").toLowerCase().includes(filterQuery.toLowerCase()) ||
    (r.parsed_json?.full_name || "").toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F4EBDD] flex font-sans text-[#1E2D2D]">
      <Sidebar />
      <div className="flex-1 ml-64 min-w-0 flex flex-col">
        <Navbar title="Ingestion Audit Ledger" folio="FOLIO 13" />

        <main className="p-8 max-w-7xl mx-auto w-full space-y-6">
          
          <div className="bg-[#FAF6EE] border border-[#E0CFB7] p-6 rounded-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
            <div className="space-y-1">
              <span className="font-mono-code text-[10px] text-[#2D8A8A] uppercase tracking-widest font-semibold">
                Document Ingestion Audit
              </span>
              <h1 className="font-editorial text-3xl text-[#1E2D2D]">
                Historical Resume Ingestion Stream
              </h1>
              <p className="text-xs text-[#475858]">
                Complete audit trail of uploaded resume files, extracted candidates, and status logs.
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7D8F8F]" size={13} />
              <input
                type="text"
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                placeholder="Filter by filename or candidate..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#FAF5EB] border border-[#E0CFB7] rounded-xs font-mono-code focus:outline-none focus:border-[#2D8A8A] text-[#1E2D2D]"
              />
            </div>
          </div>

          <div className="bg-[#FAF6EE] border border-[#E0CFB7] rounded-xs overflow-hidden shadow-xs">
            <table className="editorial-table">
              <thead>
                <tr>
                  <th>Document Record</th>
                  <th>Candidate Name</th>
                  <th>Format & Size</th>
                  <th>Ingestion Timestamp</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-xs text-[#7D8F8F] font-mono-code">
                      No records match your filter.
                    </td>
                  </tr>
                ) : (
                  filtered.map((r) => (
                    <tr key={r.id} className="hover:bg-[#E0CFB7]/20 transition-colors font-mono-code text-xs">
                      <td>
                        <div className="font-bold text-[#1E2D2D]">{r.filename}</div>
                        <div className="text-[10px] text-[#7D8F8F]">Doc ID #{r.id}</div>
                      </td>
                      <td>
                        <span className="text-[#1E2D2D] font-medium">
                          {r.parsed_json?.full_name || "Candidate Profile"}
                        </span>
                      </td>
                      <td className="text-[#475858]">
                        {r.file_type || "PDF"} · {(r.file_size ? (r.file_size / 1024).toFixed(1) : 34.2)} KB
                      </td>
                      <td className="text-[#7D8F8F]">
                        {new Date(r.uploaded_at || Date.now()).toLocaleDateString()}
                      </td>
                      <td className="text-right">
                        <div className="inline-flex items-center gap-2">
                          <Link
                            href={`/resumes/${r.id}`}
                            className="px-2.5 py-1 bg-[#FAF5EB] hover:bg-[#E0CFB7]/40 text-[#1E2D2D] text-xs rounded-xs border border-[#E0CFB7] transition-colors inline-flex items-center gap-1"
                          >
                            <Eye size={11} />
                            <span>Annotations</span>
                          </Link>
                          <button
                            onClick={() => handleDelete(r.id)}
                            className="p-1 text-[#7D8F8F] hover:text-red-700 transition-colors"
                            title="Delete Record"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

        </main>
      </div>
    </div>
  );
}
