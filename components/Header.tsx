import TabNavigation from "./TabNavigation";
import { Button } from "./ui/Button";
import { Linkedin, Download, Plus } from "lucide-react";
import Link from "next/link";

export default function Header() {
  return (
    <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
              Advanced Talent Acquisition
            </h1>
            <p className="mt-1 mb-4 text-sm text-slate-500">
              Comprehensive recruitment analytics and pipeline management
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/api/linkedin/login">
              <Button variant="accent">
                <Linkedin className="h-4 w-4" />
                <span>LinkedIn Integration</span>
              </Button>
            </Link>
            <Button variant="secondary">
              <Download className="h-4 w-4" />
              <span>Export Analytics</span>
            </Button>
            <Link href="/jobs/new">
              <Button variant="primary">
                <Plus className="h-4 w-4" />
                <span>Post New Job</span>
              </Button>
            </Link>
          </div>
        </div>
        <TabNavigation />
      </div>
    </header>
  );
}
