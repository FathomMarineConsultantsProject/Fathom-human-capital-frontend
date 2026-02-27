"use client";

import { useEffect, useState } from "react";

type Application = {
  id: string;
  name: string;
  status: string;
  job: {
    title: string;
  };
};

type AIResult = {
  matchScore: number;
  strengths: string[];
  skillGaps: string[];
  summary: string;
};

export default function PredictivePage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, AIResult>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/applications")
      .then((res) => res.json())
      .then((data) => setApplications(data))
      .catch(() => setError("Failed to load applications"));
  }, []);

  async function analyze(applicationId: string) {
    setLoadingId(applicationId);
    setError(null);

    try {
      const res = await fetch("/api/ai/fit-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "AI request failed");
      }

      setResults((prev) => ({ ...prev, [applicationId]: data }));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Candidate Match Analysis</h2>

      {error && <div className="text-red-500 text-sm">{error}</div>}

      <div className="bg-white rounded-lg shadow border">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left p-3">Candidate</th>
              <th className="text-left p-3">Job</th>
              <th className="text-left p-3">Status</th>
              <th className="text-right p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((app) => (
              <>
                <tr key={app.id} className="border-b">
                  <td className="p-3">{app.name}</td>
                  <td className="p-3">{app.job?.title}</td>
                  <td className="p-3 capitalize">{app.status}</td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => analyze(app.id)}
                      className="px-3 py-1 bg-black text-white rounded text-xs"
                      disabled={loadingId === app.id}
                    >
                      {loadingId === app.id ? "Analyzing..." : "Analyze"}
                    </button>
                  </td>
                </tr>

                {results[app.id] && (
                  <tr className="bg-gray-50">
                    <td colSpan={4} className="p-4 space-y-3">
                      <div>
                        <span className="font-medium">Match Score:</span>{" "}
                        {results[app.id].matchScore}%
                      </div>

                      <div>
                        <span className="font-medium">Strengths:</span>
                        <ul className="list-disc list-inside text-sm">
                          {results[app.id].strengths.map((s, i) => (
                            <li key={i}>{s}</li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <span className="font-medium">Skill Gaps:</span>
                        <ul className="list-disc list-inside text-sm">
                          {results[app.id].skillGaps.map((g, i) => (
                            <li key={i}>{g}</li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <span className="font-medium">Summary:</span>
                        <div className="mt-2 space-y-4 text-sm text-gray-600">
                          {results[app.id].summary
                            .split(
                              /\s*(?=Strengths:|Weaknesses:|Hiring Recommendation:)/i
                            )
                            .filter((s) => s.trim())
                            .map((paragraph, i) => (
                              <p key={i} className="leading-relaxed">
                                {paragraph.trim()}
                              </p>
                            ))}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
