"use client";

import { useEffect, useMemo, useState } from "react";
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
import { Trash2 } from "lucide-react";

type Application = {
  id: string;
  name: string;
  status: string;
  skills?: string[] | null;
  extracted_skills?: string[] | null;
  years_experience?: number | null;
  job: { title: string } | { title: string }[] | null;
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

function getJobTitle(job: Application["job"]): string {
  if (!job) return "—";
  if (Array.isArray(job)) return job[0]?.title ?? "—";
  return job.title ?? "—";
}

async function refreshApplications(): Promise<Application[]> {
  const res = await fetch("/api/applications");
  if (!res.ok) throw new Error("Failed to load applications");
  return res.json();
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
  const [error, setError] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 }
    })
  );

  function loadApplications() {
    refreshApplications()
      .then(setApplications)
      .catch(() => setError("Failed to load applications"));
  }

  useEffect(() => {
    loadApplications();
  }, []);

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
      loadApplications();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to remove candidate");
    }
  }

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
                  <td className="p-3">{getJobTitle(app.job)}</td>
                  <td className="p-3 capitalize">{app.status}</td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => analyze(app.id)}
                        className="px-3 py-1 bg-black text-white rounded text-xs"
                        disabled={loadingId === app.id}
                      >
                        {loadingId === app.id ? "Analyzing..." : "Analyze"}
                      </button>
                      <button
                        type="button"
                        onClick={() => removeCandidate(app.id)}
                        className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                        aria-label="Remove candidate"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
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
                      if (confirm("Remove this candidate from the pipeline?")) {
                        fetch(`/api/applications/${id}`, { method: "DELETE" })
                          .then((res) => {
                            if (res.ok) loadApplications();
                            else setError("Failed to remove candidate");
                          })
                          .catch(() => setError("Failed to remove candidate"));
                      }
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
