"use client";

import { useState } from "react";
import { Download } from "lucide-react";

export default function ExportAnalyticsButton() {
  const [loading, setLoading] = useState(false);

  async function handleExport() {
    setLoading(true);
    try {
      const res = await fetch("/api/export-analytics");
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "recruitment-analytics-export.csv";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      console.error("Export failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={loading}
      className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"
    >
      <Download className="h-4 w-4" />
      {loading ? "Exporting..." : "Export Analytics"}
    </button>
  );
}
