"use client";

import React, { useState, useEffect } from "react";
import {
  Home,
  Users,
  PieChart,
  Settings,
  Menu,
  X,
  ChevronDown,
  CircleUserRound,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import Link from "next/link";

import { useAuth } from "@/context/AuthContext";

interface NavigationItem {
  icon: React.ReactNode;
  name: string;
  path: string;
  submenu?: { name: string; path: string }[];
  disabled?: boolean;
}

const NominaNavbar = () => {
  const { user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | number | null>(
    null,
  );
  const router = useRouter();
  const pathname = usePathname();

  // Función para verificar si una ruta está activa
  const isRouteActive = (
    itemPath: string,
    submenu?: { name: string; path: string }[],
  ) => {
    // Verificar ruta principal
    if (pathname === itemPath) return true;

    // Verificar subrutas si existen
    if (submenu) {
      return submenu.some(
        (subItem) =>
          pathname === subItem.path || pathname.startsWith(subItem.path + "/"),
      );
    }

    // Para rutas que no son exactas, verificar si la ruta actual comienza con la ruta del item
    if (itemPath !== "/" && pathname.startsWith(itemPath + "/")) return true;

    return false;
  };

  const navigation: NavigationItem[] = [
    {
      name: "Inicio",
      path: "/",
      icon: <Home size={20} />,
    },
    {
      name: "Conductores",
      path: "/conductores",
      icon: <Users size={20} />,
    },
    {
      name: "Análisis",
      path: "/analisis",
      icon: <PieChart size={20} />,
    },
    {
      name: "Configuración",
      path: "/configuracion",
      icon: <Settings size={20} />,
    },
  ];

  const handleNavigation = (path: string, disabled = false) => {
    if (disabled) {
      alert("Esta sección estará disponible próximamente");

      return;
    }
    router.push(path);
    setIsMenuOpen(false);
    setActiveDropdown(null);
  };

  const toggleDropdown = (index: string | number | null) => {
    setActiveDropdown(activeDropdown === index ? null : index);
  };

  // Cerrar menús cuando cambie la ruta
  useEffect(() => {
    setIsMenuOpen(false);
    setActiveDropdown(null);
  }, [pathname]);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;

      if (!target.closest("[data-dropdown]")) {
        setActiveDropdown(null);
      }
    };

    if (activeDropdown !== null) {
      document.addEventListener("mousedown", handleClickOutside);

      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [activeDropdown]);

  // No mostrar navbar en la página de inicio
  if (pathname === "/") return null;

  // Función para obtener el nombre de la página actual
  const getCurrentPageName = () => {
    // Buscar en navegación principal
    const mainItem = navigation.find((item) =>
      isRouteActive(item.path, item.submenu),
    );

    if (mainItem) {
      // Si tiene submenu, buscar la página específica
      if (mainItem.submenu) {
        const subItem = mainItem.submenu.find(
          (sub) => pathname === sub.path || pathname.startsWith(sub.path + "/"),
        );

        if (subItem) {
          return `${mainItem.name} - ${subItem.name}`;
        }
      }

      return mainItem.name;
    }

    // Fallback: usar el pathname para generar un nombre
    const pathSegments = pathname.split("/").filter(Boolean);

    return (
      pathSegments[pathSegments.length - 1]?.charAt(0).toUpperCase() +
        pathSegments[pathSegments.length - 1]?.slice(1) || "Página Actual"
    );
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          {/* Logo & Brand */}
          <Link className="flex" href={"/"}>
            <div className="flex-shrink-0 flex items-center">
              <div className="flex items-center">
                <div className="h-8 w-8 bg-emerald-600 rounded-md flex items-center justify-center">
                  <span className="text-white font-bold">T</span>
                </div>
                <span
                  className="ml-2 text-gray-900 font-semibold text-lg truncate w-48 sm:w-auto"
                  title="Sistema de Nómina para Bonos y Recargos"
                >
                  Sistema de Nómina para Bonos y Recargos
                </span>
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex space-x-4 lg:items-center">
            {navigation.map((item, index) => {
              const isActive = isRouteActive(item.path, item.submenu);

              return (
                <div
                  key={item.name}
                  data-dropdown
                  className="relative inline-block text-left"
                >
                  <div>
                    <button
                      className={`
                        group inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
                        ${
                          isActive
                            ? "text-emerald-600 bg-emerald-50"
                            : item.disabled
                              ? "text-gray-400 cursor-not-allowed"
                              : "text-gray-700 hover:text-emerald-600 hover:bg-gray-50"
                        }
                      `}
                      type="button"
                      onClick={() =>
                        item.submenu && item.submenu.length > 0
                          ? toggleDropdown(index)
                          : handleNavigation(item.path, item.disabled)
                      }
                    >
                      <span className="mr-2">{item.icon}</span>
                      {item.name}
                      {item.submenu && (
                        <ChevronDown
                          className={`ml-1 h-4 w-4 transition-transform ${
                            activeDropdown === index
                              ? "transform rotate-180"
                              : ""
                          }`}
                        />
                      )}
                    </button>
                  </div>

                  {/* Dropdown for submenu items */}
                  {item.submenu && activeDropdown === index && (
                    <div className="absolute z-10 mt-1 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                      <div
                        aria-labelledby="options-menu"
                        aria-orientation="vertical"
                        className="py-1"
                        role="menu"
                      >
                        {item.submenu.map((subItem) => {
                          const isSubActive =
                            pathname === subItem.path ||
                            pathname.startsWith(subItem.path + "/");

                          return (
                            <button
                              key={subItem.name}
                              className={`
                                flex w-full px-4 py-2 text-sm transition-colors
                                ${
                                  isSubActive
                                    ? "text-emerald-600 bg-emerald-50"
                                    : item.disabled
                                      ? "text-gray-400 cursor-not-allowed"
                                      : "text-gray-700 hover:bg-gray-50 hover:text-emerald-600"
                                }
                              `}
                              role="menuitem"
                              onClick={(e) => {
                                e.preventDefault();
                                handleNavigation(subItem.path, item.disabled);
                              }}
                            >
                              {subItem.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            <Link
              className="group inline-flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:text-emerald-600 hover:bg-gray-50 transition-colors"
              href={process.env.NEXT_PUBLIC_AUTH_SYSTEM ?? ""}
              type="button"
            >
              <span className="mr-2">¡Hola {user?.nombre}!</span>
              <CircleUserRound
                className="group-hover:text-emerald-600 transition-colors"
                size={28}
              />
            </Link>
          </nav>

          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center">
            <button
              aria-controls="mobile-menu"
              aria-expanded={isMenuOpen}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-emerald-600 hover:bg-gray-50 focus:outline-none transition-colors"
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <span className="sr-only">Abrir menú principal</span>
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="lg:hidden" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
            <div>
              <div className="w-full flex items-center pl-3 pr-4 py-2 text-base font-medium rounded-md text-gray-700">
                <span className="mr-2">
                  <CircleUserRound size={24} />
                </span>
                ¡Hola {user?.nombre}!
              </div>
            </div>
            {navigation.map((item, index) => {
              const isActive = isRouteActive(item.path, item.submenu);

              return (
                <div key={item.name}>
                  <button
                    className={`
                      w-full flex items-center pl-3 pr-4 py-2 text-base font-medium rounded-md transition-colors
                      ${
                        isActive
                          ? "text-emerald-600 bg-emerald-50"
                          : item.disabled
                            ? "text-gray-400 cursor-not-allowed"
                            : "text-gray-700 hover:text-emerald-600 hover:bg-gray-50"
                      }
                    `}
                    onClick={() =>
                      item.submenu
                        ? toggleDropdown(index)
                        : handleNavigation(item.path, item.disabled)
                    }
                  >
                    <span className="mr-3">{item.icon}</span>
                    {item.name}
                    {item.submenu && (
                      <ChevronDown
                        className={`ml-auto h-5 w-5 transition-transform ${
                          activeDropdown === index ? "transform rotate-180" : ""
                        }`}
                      />
                    )}
                  </button>

                  {/* Mobile submenu */}
                  {item.submenu && activeDropdown === index && (
                    <div className="pl-12 mt-1 space-y-1">
                      {item.submenu.map((subItem) => {
                        const isSubActive =
                          pathname === subItem.path ||
                          pathname.startsWith(subItem.path + "/");

                        return (
                          <button
                            key={subItem.name}
                            className={`
                              block py-2 text-base font-medium transition-colors
                              ${
                                isSubActive
                                  ? "text-emerald-600"
                                  : item.disabled
                                    ? "text-gray-400 cursor-not-allowed"
                                    : "text-gray-700 hover:text-emerald-600"
                              }
                            `}
                            onClick={(e) => {
                              e.preventDefault();
                              handleNavigation(subItem.path, item.disabled);
                            }}
                          >
                            {subItem.name}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Breadcrumb */}
      <div className="bg-gray-50 border-t border-b border-gray-200">
        <div className="max-w-7xl mx-auto py-2 px-4 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="flex">
            <ol className="flex items-center space-x-3 text-sm">
              <li className="flex items-center">
                <button
                  className="text-gray-500 hover:text-emerald-600 transition-colors"
                  onClick={() => handleNavigation("/")}
                >
                  <Home size={16} />
                  <span className="sr-only">Inicio</span>
                </button>
              </li>
              {pathname !== "/" && (
                <li className="flex items-center">
                  <svg
                    aria-hidden="true"
                    className="flex-shrink-0 h-5 w-5 text-gray-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      clipRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      fillRule="evenodd"
                    />
                  </svg>
                  <span className="ml-4 text-gray-700 font-medium">
                    {getCurrentPageName()}
                  </span>
                </li>
              )}
            </ol>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default NominaNavbar;
