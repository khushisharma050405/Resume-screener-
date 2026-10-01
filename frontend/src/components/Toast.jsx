"use client";

import React from "react";
import { Check, AlertCircle, Info, X } from "lucide-react";

export default function Toast({ message, type = "success", onClose }) {
  if (!message) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xs border border-[#2D8A8A] bg-[#FAF6EE] text-[#1E2D2D] shadow-lg text-xs font-mono-code">
        <span className="w-4 h-4 rounded-xs bg-[#2D8A8A] text-[#FAF6EE] flex items-center justify-center text-[10px] shrink-0">
          ✓
        </span>
        <span>{message}</span>
        {onClose && (
          <button onClick={onClose} className="ml-3 text-[#7D8F8F] hover:text-[#1E2D2D]">
            <X size={12} />
          </button>
        )}
      </div>
    </div>
  );
}
