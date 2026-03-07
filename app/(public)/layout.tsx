export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex justify-center py-16 px-6">
      <div className="w-full max-w-3xl">
        {children}
      </div>
    </div>
  );
}
