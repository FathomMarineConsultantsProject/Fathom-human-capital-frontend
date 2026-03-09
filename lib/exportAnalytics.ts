export async function downloadAnalyticsReport(): Promise<void> {
  const res = await fetch(`/api/export-analytics?ts=${Date.now()}`, {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error("Export failed");
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "recruitment-analytics-report.html";
  link.click();
  URL.revokeObjectURL(url);
}
