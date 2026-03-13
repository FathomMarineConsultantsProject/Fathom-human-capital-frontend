"use client";

import { useState } from "react";
import { Loader2, Linkedin, Sparkles, Trash2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

type PostToLinkedInFormProps = {
  open: boolean;
  onClose: () => void;
};

type StatusState = {
  type: "idle" | "success" | "error";
  message: string;
};

export default function PostToLinkedInForm({
  open,
  onClose
}: PostToLinkedInFormProps) {
  const [title, setTitle] = useState("");
  const [postContent, setPostContent] = useState("");
  const [role, setRole] = useState("");
  const [location, setLocation] = useState("");
  const [company, setCompany] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [status, setStatus] = useState<StatusState>({
    type: "idle",
    message: ""
  });

  if (!open) {
    return null;
  }

  async function handleGenerateWithAi() {
    if (!role.trim() || !location.trim() || !company.trim()) {
      setStatus({
        type: "error",
        message: "Role, location, and company are required for AI writing."
      });
      return;
    }

    setIsGenerating(true);
    setStatus({ type: "idle", message: "" });

    try {
      const response = await fetch("/api/linkedin/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          role,
          location,
          company
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate LinkedIn post");
      }

      setPostContent(data.postText || "");
      setStatus({
        type: "success",
        message: "AI draft generated successfully."
      });
    } catch (error) {
      setStatus({
        type: "error",
        message:
          error instanceof Error ? error.message : "Failed to generate LinkedIn post"
      });
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!postContent.trim()) {
      setStatus({
        type: "error",
        message: "Post content is required."
      });
      return;
    }

    setIsPosting(true);
    setStatus({
      type: "idle",
      message: "Posting..."
    });

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("postText", postContent);

      files.forEach((file) => {
        formData.append("mediaFiles", file);
      });

      const response = await fetch("/api/linkedin/post", {
        method: "POST",
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error posting to LinkedIn");
      }

      setStatus({
        type: "success",
        message: "Posted successfully."
      });
    } catch (error) {
      setStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Error posting"
      });
    } finally {
      setIsPosting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              Post to LinkedIn
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Write, generate, and publish a LinkedIn post.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 px-6 py-6">
          <div className="grid gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Role
              </label>
              <input
                value={role}
                onChange={(event) => setRole(event.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                placeholder="Senior Recruiter"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Location
              </label>
              <input
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                placeholder="Dubai, UAE"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Company
              </label>
              <input
                value={company}
                onChange={(event) => setCompany(event.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                placeholder="Fathhom Human Capital"
              />
            </div>
            <div className="md:col-span-3">
              <Button
                type="button"
                variant="accent"
                onClick={handleGenerateWithAi}
                disabled={isGenerating || isPosting}
              >
                {isGenerating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                <span>{isGenerating ? "Writing..." : "Write with AI"}</span>
              </Button>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Post Title
            </label>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-400"
              placeholder="Optional headline for your post"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Post Content
            </label>
            <textarea
              value={postContent}
              onChange={(event) => setPostContent(event.target.value)}
              rows={10}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-400"
              placeholder="Write your LinkedIn post here..."
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Media Upload
            </label>
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center">
              <Upload className="mb-2 h-5 w-5 text-slate-500" />
              <span className="text-sm font-medium text-slate-700">
                Upload images or PDF documents
              </span>
              <span className="mt-1 text-xs text-slate-500">
                PNG, JPG, JPEG, GIF, WEBP, PDF
              </span>
              <input
                type="file"
                multiple
                accept="image/*,.pdf,application/pdf"
                className="hidden"
                onChange={(event) => {
                  const selectedFiles = Array.from(event.target.files || []);
                  setFiles(selectedFiles);
                }}
              />
            </label>
            {files.length > 0 ? (
              <div className="mt-3 space-y-2">
                {files.map((file) => (
                  <div
                    key={`${file.name}-${file.size}`}
                    className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
                  >
                    <div className="min-w-0 flex-1">
                      <span className="block truncate">{file.name}</span>
                    </div>
                    <div className="ml-4 flex items-center gap-2">
                      <span className="text-xs text-slate-500">
                        {Math.ceil(file.size / 1024)} KB
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setFiles((currentFiles) =>
                            currentFiles.filter(
                              (currentFile) =>
                                !(
                                  currentFile.name === file.name &&
                                  currentFile.size === file.size &&
                                  currentFile.lastModified === file.lastModified
                                )
                            )
                          )
                        }
                        className="rounded-md p-1 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                        aria-label={`Remove ${file.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          {status.message ? (
            <div
              className={`rounded-lg border px-4 py-3 text-sm ${
                status.type === "error"
                  ? "border-red-200 bg-red-50 text-red-700"
                  : status.type === "success"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-blue-200 bg-blue-50 text-blue-700"
              }`}
            >
              {status.message}
            </div>
          ) : null}

          <div className="flex flex-wrap items-center justify-end gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isPosting}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isPosting || isGenerating}>
              {isPosting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Linkedin className="h-4 w-4" />
              )}
              <span>{isPosting ? "Posting..." : "Post to LinkedIn"}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
