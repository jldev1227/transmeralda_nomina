// client-layout.tsx
"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import NominaNavbar from "@/components/ui/navbarNomina";
import DynamicTitle from "@/components/ui/dynamicTitle";
import LiquidacionDetalleModal from "@/components/liquidacionDetalleModal";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [is404Page, setIs404Page] = useState(false);

  // Verificar si el contenido renderizado es la página 404
  useEffect(() => {
    // Buscar elementos específicos que solo existen en tu página 404
    // Por ejemplo, si tu página 404 tiene un elemento con id="not-found-page"
    const is404 = document.getElementById("not-found-page") !== null;

    setIs404Page(is404);
  }, [pathname]);

  return (
    <div className="relative flex flex-col h-screen">
      <DynamicTitle />
      {!is404Page && <NominaNavbar />}
      <main className="bg-gray-50 flex-grow">{children}</main>
      <LiquidacionDetalleModal />

      {/* Footer - solo se muestra si NO es la página 404 */}
      {!is404Page && (
        <footer className="bg-white border-t border-gray-200 py-4">
          <div className="max-w-7xl mx-auto px-6">
            <p className="text-sm text-gray-500 text-center">
              &copy; {new Date().getFullYear()} Sistema de Gestión de Nómina.
              Todos los derechos reservados.
            </p>
          </div>
        </footer>
      )}
    </div>
  );
}
