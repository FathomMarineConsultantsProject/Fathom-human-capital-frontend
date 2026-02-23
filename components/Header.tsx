import TabNavigation from "./TabNavigation";

export default function Header() {
  return (
    <header className="border-b border-gray-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Advanced Talent Acquisition
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Comprehensive recruitment analytics and pipeline management
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button className="rounded-md border border-blue-600 bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700">
              LinkedIn Integration
            </button>
            <button className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">
              Export Analytics
            </button>
            <button className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">
              Post New Job
            </button>
          </div>
        </div>
        <TabNavigation />
      </div>
    </header>
  );
}
