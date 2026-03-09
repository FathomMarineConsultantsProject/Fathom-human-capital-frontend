"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { Button } from "./ui/Button";
import { downloadAnalyticsReport } from "@/lib/exportAnalytics";

export default function ExportAnalyticsNavbarButton() {
  const [loading, setLoading] = useState(false);

  async function handleExportAnalytics() {
    setLoading(true);
    try {
      await downloadAnalyticsReport();
    } catch {
      console.error("Export failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      type="button"
      variant="secondary"
      onClick={handleExportAnalytics}
      disabled={loading}
    >
      <Download className="h-4 w-4" />
      <span>{loading ? "Exporting..." : "Export Analytics"}</span>
    </Button>
  );
}
