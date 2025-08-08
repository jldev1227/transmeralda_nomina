// app/conductores/desprendible/layout.tsx
import React from "react";

export default function DesprendibleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Layout simple sin AuthProvider para desprendibles */}
      <div className="container mx-auto py-8">{children}</div>
    </div>
  );
}
