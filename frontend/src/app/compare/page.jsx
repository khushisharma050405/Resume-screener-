"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CompareRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/screener");
  }, [router]);

  return (
    <div className="min-h-screen bg-[#F4EBDD] flex items-center justify-center font-mono-code text-xs text-[#224b4c]">
      Redirecting to Resume Screener...
    </div>
  );
}
