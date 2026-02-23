import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "Advanced Talent Acquisition",
  description: "Comprehensive recruitment analytics and pipeline management dashboard."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-background">
          <Header />
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
