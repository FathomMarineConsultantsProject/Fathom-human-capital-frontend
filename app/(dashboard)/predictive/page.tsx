"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragEndEvent
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { Trash2, CheckSquare, X } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Application = {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  status: string;
  skills?: string[] | null;
  extracted_skills?: string[] | null;
  years_experience?: number | null;
  education?: string | null;
  source?: string | null;
  resume_text?: string | null;
  resume_url?: string | null;
  job?: { title: string } | { title: string }[] | null;
  jobs?: { title: string } | null;
};

type AIResult = {
  matchScore: number;
  strengths: string[];
  skillGaps: string[];
  summary: string;
};

const PIPELINE_STAGES = [
  "applied",
  "screening",
  "interview",
  "offer",
  "hired"
] as const;

type PipelineStage = (typeof PIPELINE_STAGES)[number];

function getSkillsDisplay(app: Application): string {
  const skills = app.extracted_skills ?? app.skills;
  if (!skills || !Array.isArray(skills)) return "—";
  return skills.slice(0, 5).join(", ") + (skills.length > 5 ? "…" : "");
}

function getJobTitle(app: Application): string {
  const job = app.jobs ?? app.job;
  if (!job) return "—";
  if (Array.isArray(job)) return job[0]?.title ?? "—";
  return job.title ?? "—";
}

function SortableCandidateCard({
  app,
  aiScore,
  disabled,
  onRemove
}: {
  app: Application;
  aiScore?: number;
  disabled: boolean;
  onRemove: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({
      id: app.id,
      data: { currentStatus: (app.status || "applied").toLowerCase() }
    });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white shadow-sm rounded-lg p-4 border ${
        isDragging ? "opacity-60" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-medium text-slate-900">{app.name}</p>
          <p className="mt-1 text-xs text-slate-600">{getSkillsDisplay(app)}</p>
          <p className="mt-0.5 text-xs text-slate-500">
            {app.years_experience != null ? `${app.years_experience} yrs exp` : "—"}
            {aiScore != null && (
              <span className="ml-2 font-medium text-slate-700">
                • {aiScore}% match
              </span>
            )}
          </p>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRemove(app.id);
              }}
              className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600"
              aria-label="Remove candidate"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
            <button
            type="button"
            className="cursor-grab rounded bg-slate-200 px-2 py-1 text-xs text-slate-700 hover:bg-slate-300 disabled:opacity-50"
            disabled={disabled}
            {...attributes}
            {...listeners}
            aria-label="Drag candidate card"
          >
            Drag
          </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PipelineColumn({
  stage,
  count,
  children
}: {
  stage: PipelineStage;
  count: number;
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stage });

  return (
    <div
      ref={setNodeRef}
      className={`w-72 flex-shrink-0 rounded-lg border border-slate-200 bg-slate-50 ${
        isOver ? "ring-2 ring-slate-300" : ""
      }`}
    >
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
        <h3 className="text-sm font-semibold capitalize text-slate-900">
          {stage}
        </h3>
        <span className="text-xs text-slate-500">{count}</span>
      </div>

      <div className="space-y-3 p-3">{children}</div>
    </div>
  );
}

export default function PredictivePage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, AIResult>>({});
  const [activeAnalysisId, setActiveAnalysisId] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AIResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<Application | null>(
    null
  );
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedApplicationIds, setSelectedApplicationIds] = useState<string[]>(
    []
  );
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 }
    })
  );

  async function loadApplications() {
    try {
      const { data, error } = await supabase
        .from("applications")
        .select(`
          *,
          jobs (
            title
          )
        `)
        .returns<Application[]>();

      if (error) {
        throw error;
      }

      setApplications(data ?? []);
      setError(null);
    } catch (_err) {
      setError("Failed to load applications");
    }
  }

  useEffect(() => {
    loadApplications();
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel("predictive-applications-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "applications",
        },
        () => {
          loadApplications();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "jobs",
        },
        () => {
          loadApplications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    setSelectedApplicationIds((prev) =>
      prev.filter((id) => applications.some((app) => app.id === id))
    );
  }, [applications]);

  async function updateStatus(applicationId: string, newStatus: string) {
    setUpdatingId(applicationId);
    setError(null);
    try {
      const res = await fetch(`/api/applications/${applicationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update status");
      }
      loadApplications();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  }

  async function removeCandidate(applicationId: string) {
    if (!confirm("Remove this candidate from the pipeline?")) return;
    setError(null);
    try {
      const res = await fetch(`/api/applications/${applicationId}`, {
        method: "DELETE"
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to remove candidate");
      }
      await loadApplications();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to remove candidate");
    }
  }

  function toggleSelectionMode() {
    setSelectionMode((prev) => {
      if (prev) {
        setSelectedApplicationIds([]);
      }
      return !prev;
    });
  }

  function toggleCandidateSelection(applicationId: string) {
    setSelectedApplicationIds((prev) =>
      prev.includes(applicationId)
        ? prev.filter((id) => id !== applicationId)
        : [...prev, applicationId]
    );
  }

  function toggleSelectAllCandidates() {
    setSelectedApplicationIds((prev) =>
      prev.length === applications.length ? [] : applications.map((app) => app.id)
    );
  }

  async function removeSelectedCandidates() {
    if (selectedApplicationIds.length === 0 || bulkDeleting) return;
    const confirmed = confirm(
      `Remove ${selectedApplicationIds.length} selected candidate(s) from the pipeline?`
    );
    if (!confirmed) return;

    setError(null);
    setBulkDeleting(true);

    const failed: string[] = [];
    for (const applicationId of selectedApplicationIds) {
      try {
        const res = await fetch(`/api/applications/${applicationId}`, {
          method: "DELETE"
        });
        if (!res.ok) {
          failed.push(applicationId);
        }
      } catch {
        failed.push(applicationId);
      }
    }

    setBulkDeleting(false);
    setSelectionMode(false);
    setSelectedApplicationIds([]);

    if (failed.length > 0) {
      setError("Some selected candidates could not be removed. Please retry.");
    }

    await loadApplications();
  }

  async function analyze(candidate: Application) {
    if (activeAnalysisId === candidate.id) {
      setActiveAnalysisId(null);
      setAnalysisResult(null);
      return;
    }

    setActiveAnalysisId(candidate.id);
    setAnalysisResult(null);
    setLoadingId(candidate.id);
    setError(null);

    try {
      const res = await fetch("/api/ai/fit-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId: candidate.id })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "AI request failed");
      }

      setResults((prev) => ({ ...prev, [candidate.id]: data }));
      setAnalysisResult(data);
    } catch (err: any) {
      setError(err.message);
      setActiveAnalysisId(null);
      setAnalysisResult(null);
    } finally {
      setLoadingId(null);
    }
  }

  function getSkillTags(app: Application): string[] {
    const raw = app.extracted_skills ?? app.skills;
    if (!raw || !Array.isArray(raw)) return [];
    return raw.filter(Boolean).map((s) => String(s).trim()).filter(Boolean);
  }

  const pipeline = useMemo(() => {
    const grouped: Record<PipelineStage, Application[]> = {
      applied: [],
      screening: [],
      interview: [],
      offer: [],
      hired: []
    };

    for (const app of applications) {
      const status = String(app.status || "applied").toLowerCase() as PipelineStage;
      if (PIPELINE_STAGES.includes(status)) grouped[status].push(app);
    }

    return grouped;
  }, [applications]);

  const stageItems = useMemo(() => {
    return PIPELINE_STAGES.reduce((acc, stage) => {
      acc[stage] = pipeline[stage].map((a) => a.id);
      return acc;
    }, {} as Record<PipelineStage, string[]>);
  }, [pipeline]);

  function findStageForId(id: string): PipelineStage | null {
    if ((PIPELINE_STAGES as readonly string[]).includes(id)) {
      return id as PipelineStage;
    }
    for (const stage of PIPELINE_STAGES) {
      if (stageItems[stage].includes(id)) return stage;
    }
    return null;
  }

  async function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    const fromStage = findStageForId(activeId);
    const toStage = findStageForId(overId);

    if (!fromStage || !toStage || fromStage === toStage) return;

    // Optimistic UI update
    setApplications((prev) =>
      prev.map((a) =>
        a.id === activeId ? { ...a, status: toStage } : a
      )
    );

    await updateStatus(activeId, toStage);
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Candidate Match Analysis</h2>

      {error && <div className="text-red-500 text-sm">{error}</div>}

      <div className="bg-white rounded-lg shadow border">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b bg-slate-50 px-3 py-2">
          <span className="text-xs text-slate-600">
            {selectionMode
              ? `${selectedApplicationIds.length} selected`
              : "Manage candidates"}
          </span>
          <div className="flex flex-wrap items-center gap-2">
            {!selectionMode ? (
              <button
                type="button"
                onClick={toggleSelectionMode}
                className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
              >
                <CheckSquare className="h-3.5 w-3.5" />
                Select
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={toggleSelectAllCandidates}
                  className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                >
                  {selectedApplicationIds.length === applications.length
                    ? "Clear all"
                    : "Select all"}
                </button>
                <button
                  type="button"
                  onClick={removeSelectedCandidates}
                  disabled={selectedApplicationIds.length === 0 || bulkDeleting}
                  className="inline-flex items-center gap-1.5 rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  {bulkDeleting ? "Removing..." : "Delete selected"}
                </button>
                <button
                  type="button"
                  onClick={toggleSelectionMode}
                  className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                >
                  <X className="h-3.5 w-3.5" />
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              {selectionMode && <th className="text-left p-3">Select</th>}
              <th className="text-left p-3">Candidate</th>
              <th className="text-left p-3">Job</th>
              <th className="text-left p-3">Status</th>
              <th className="text-right p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((app) => (
              <Fragment key={app.id}>
                <tr className="border-b">
                  {selectionMode && (
                    <td className="p-3">
                      <input
                        type="checkbox"
                        checked={selectedApplicationIds.includes(app.id)}
                        onChange={() => toggleCandidateSelection(app.id)}
                        className="h-4 w-4 rounded border-slate-300 text-slate-700 focus:ring-slate-400"
                        aria-label={`Select ${app.name}`}
                      />
                    </td>
                  )}
                  <td className="p-3">{app.name}</td>
                  <td className="p-3">{getJobTitle(app)}</td>
                  <td className="p-3 capitalize">{app.status}</td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => analyze(app)}
                        className="px-3 py-1 bg-black text-white rounded text-xs"
                        disabled={loadingId === app.id}
                      >
                        {loadingId === app.id
                          ? "Analyzing..."
                          : activeAnalysisId === app.id
                          ? "Close"
                          : "Analyze"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedCandidate(app)}
                        className="px-3 py-1 rounded bg-gray-200 text-xs text-slate-800 hover:bg-gray-300"
                      >
                        Details
                      </button>
                      <button
                        type="button"
                        onClick={() => removeCandidate(app.id)}
                        className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                        aria-label="Remove candidate"
                        disabled={selectionMode}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
                {activeAnalysisId === app.id && analysisResult && (
                  <tr className="bg-gray-50">
                    <td colSpan={selectionMode ? 5 : 4} className="p-4 space-y-3">
                      <div>
                        <span className="font-medium">Match Score:</span>{" "}
                        {analysisResult.matchScore}%
                      </div>

                      <div>
                        <span className="font-medium">Strengths:</span>
                        <ul className="list-disc list-inside text-sm">
                          {analysisResult.strengths.map((s, i) => (
                            <li key={i}>{s}</li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <span className="font-medium">Skill Gaps:</span>
                        <ul className="list-disc list-inside text-sm">
                          {analysisResult.skillGaps.map((g, i) => (
                            <li key={i}>{g}</li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <span className="font-medium">Summary:</span>
                        <div className="mt-2 space-y-4 text-sm text-gray-600">
                          {analysisResult.summary
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
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {selectedCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  Candidate Details
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  {getJobTitle(selectedCandidate)} •{" "}
                  {String(selectedCandidate.status || "—").toUpperCase()}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCandidate(null)}
                className="rounded bg-slate-100 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-200"
              >
                Close
              </button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    Candidate Info
                  </h3>
                  <div className="mt-2 space-y-2 text-sm text-slate-700">
                    <p>
                      <span className="font-medium">Name:</span>{" "}
                      {selectedCandidate.name}
                    </p>
                    <p>
                      <span className="font-medium">Email:</span>{" "}
                      {selectedCandidate.email ?? "—"}
                    </p>
                    <p>
                      <span className="font-medium">Phone:</span>{" "}
                      {selectedCandidate.phone ?? "—"}
                    </p>
                    <p>
                      <span className="font-medium">Experience:</span>{" "}
                      {selectedCandidate.years_experience != null
                        ? `${selectedCandidate.years_experience} years`
                        : "—"}
                    </p>
                    <p>
                      <span className="font-medium">Education:</span>{" "}
                      {selectedCandidate.education ?? "—"}
                    </p>
                    <p>
                      <span className="font-medium">Source:</span>{" "}
                      {selectedCandidate.source ?? "—"}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Skills</h3>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {getSkillTags(selectedCandidate).length === 0 ? (
                      <span className="text-sm text-slate-500">—</span>
                    ) : (
                      getSkillTags(selectedCandidate).map((skill) => (
                        <span
                          key={skill}
                          className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-800"
                        >
                          {skill}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Resume</h3>
                  {selectedCandidate.resume_url && (
                    <a
                      href={selectedCandidate.resume_url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-block text-sm text-slate-700 underline"
                    >
                      Open resume
                    </a>
                  )}
                  {!selectedCandidate.resume_url && (
                    <p className="mt-2 text-sm text-slate-500">
                      No resume uploaded
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="pt-4">
        <h2 className="text-xl font-semibold">Candidate Pipeline</h2>
        <p className="mt-1 text-sm text-slate-500">
          Drag candidates between stages to update their status.
        </p>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {PIPELINE_STAGES.map((stage) => (
            <PipelineColumn
              key={stage}
              stage={stage}
              count={pipeline[stage].length}
            >
              <SortableContext
                items={stageItems[stage]}
                strategy={verticalListSortingStrategy}
              >
                {pipeline[stage].map((app) => (
                  <SortableCandidateCard
                    key={app.id}
                    app={app}
                    aiScore={results[app.id]?.matchScore}
                    disabled={updatingId === app.id}
                    onRemove={(id) => {
                      void removeCandidate(id);
                    }}
                  />
                ))}
              </SortableContext>

              {pipeline[stage].length === 0 && (
                <div className="rounded-lg border border-dashed border-slate-200 bg-white p-4 text-center text-sm text-slate-400">
                  Drop candidates here
                </div>
              )}
            </PipelineColumn>
          ))}
        </div>
      </DndContext>
    </div>
  );
}
