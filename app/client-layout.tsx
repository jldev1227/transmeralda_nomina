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

  // Patrones para rutas que NO deben mostrar componentes
  const hideNavbarPatterns = [
    /\/desprendible(\/|$)/, // Cualquier ruta que contenga /desprendible
    /\/print(\/|$)/, // Si tienes otras rutas como print
  ];

  const hideModalPatterns = [/\/desprendible(\/|$)/];

  const shouldShowNavbar =
    !is404Page && !hideNavbarPatterns.some((pattern) => pattern.test(pathname));

  const shouldShowModal = !hideModalPatterns.some((pattern) =>
    pattern.test(pathname),
  );

  useEffect(() => {
    const is404 = document.getElementById("not-found-page") !== null;

    setIs404Page(is404);
  }, [pathname]);

  return (
    <div className="relative flex flex-col h-screen">
      <DynamicTitle />
      {shouldShowNavbar && <NominaNavbar />}
      <main className="bg-gray-50 flex-grow">{children}</main>
      {shouldShowModal && <LiquidacionDetalleModal />}
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
