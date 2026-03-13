"use client";

import { useState } from "react";
import { Linkedin, Send, Zap } from "lucide-react";
import PanelCard from "@/components/PanelCard";
import PostToLinkedInForm from "@/components/linkedin/PostToLinkedInForm";

export default function LinkedInToolsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex items-start gap-4">
            <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
              <Linkedin className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                LinkedIn Posting Tools
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-500">
                Create recruiter-ready posts, generate copy with AI, attach assets,
                and publish directly to LinkedIn.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <PanelCard title="Quick Actions" icon={<Zap className="h-4 w-4" />}>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-4 text-left transition-colors hover:bg-slate-50"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-slate-100 p-2 text-slate-600">
                  <Send className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-800">
                    Post to LinkedIn
                  </p>
                  <p className="text-xs text-slate-500">
                    Draft a new post and publish it to your LinkedIn feed.
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center gap-2 rounded-lg border border-blue-300 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-600">
                Open
              </span>
            </button>
          </PanelCard>

          <PanelCard title="Workflow" icon={<Linkedin className="h-4 w-4" />}>
            <div className="space-y-3 text-sm text-slate-600">
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                1. Start with a manual draft or use AI for a recruiter-ready post.
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                2. Attach images or PDF documents for the posting session.
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                3. Publish directly through the LinkedIn API route.
              </div>
            </div>
          </PanelCard>
        </div>
      </div>

      <PostToLinkedInForm
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
