"use client";

import React, { useState } from "react";
import { Users, Briefcase, FileText, PieChart, Settings } from "lucide-react";
import { useRouter } from "next/navigation";

interface Card {
  id: number;
  icon: React.ReactNode;
  title: string;
  description: string;
  path: string;
  available: boolean;
  hasSubmenu: boolean;
  submenu?: [
    {
      title?: string;
      path?: string;
      available?: boolean;
    },
  ];
}

const NominaDashboard = () => {
  const cards: Card[] = [
    {
      id: 1,
      title: "Nómina de Conductores",
      description:
        "Gestión de pagos y registros para el personal de conducción",
      icon: <Users size={40} />,
      path: "/conductores",
      available: true,
      hasSubmenu: false,
      submenu: [],
    },
    {
      id: 2,
      title: "Nómina Administrativa",
      description:
        "Gestión de pagos y registros para el personal administrativo",
      icon: <Briefcase size={40} />,
      path: "/administrativo",
      available: false,
      hasSubmenu: false,
      submenu: [],
    },
    {
      id: 3,
      title: "Reportes",
      description: "Generación de informes y estadísticas de nómina",
      icon: <FileText size={40} />,
      path: "/reportes",
      available: true,
      hasSubmenu: false,
      submenu: [],
    },
    {
      id: 4,
      title: "Análisis",
      description: "Visualización y análisis de datos de nómina",
      icon: <PieChart size={40} />,
      path: "/analisis",
      available: true,
      hasSubmenu: true,
      submenu: [
        {
          title: "Análisis de Conductores",
          path: "/conductores/analisis",
          available: true,
        },
        {
          title: "Análisis Administrativo",
          path: "/administrativo/analisis",
          available: false,
        },
      ],
    },
    {
      id: 5,
      title: "Configuración",
      description: "Ajustes y preferencias del sistema de nómina",
      icon: <Settings size={40} />,
      path: "/configuracion",
      available: true,
      hasSubmenu: false,
    },
  ];

  const [expandedCard, setExpandedCard] = useState(null);
  const router = useRouter();

  const handleCardClick = (card: Card) => {
    if (!card.available) {
      alert("Esta funcionalidad estará disponible próximamente");

      return;
    }

    if (card.hasSubmenu) {
      setExpandedCard(expandedCard === card.id ? null : card.id);
    } else {
      router.push(card.path);
    }
  };

  const handleSubmenuClick = (path: string, available: boolean, e) => {
    e.stopPropagation(); // Evita que se active el clic de la tarjeta padre

    if (!available) {
      alert("Esta funcionalidad estará disponible próximamente");

      return;
    }
    router.push(path);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-emerald-600 py-6 shadow-md">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-white">
            Sistema de Gestión de Nómina
          </h1>
          <p className="text-emerald-100 mt-2">
            Administración centralizada de nóminas de personal
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            Panel de Control
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative">
            {/* Overlay para submenús en modo popup */}
            {expandedCard !== null && (
              <div
                className="fixed inset-0 bg-black bg-opacity-20 z-20"
                onClick={() => setExpandedCard(null)}
              />
            )}

            {cards.map((card) => (
              <div
                key={card.id}
                className={`
                  bg-gray-50 rounded-lg shadow-md overflow-hidden 
                  transition-all duration-300 transform hover:scale-105
                  ${card.available ? "cursor-pointer" : "opacity-75 cursor-not-allowed"}
                  border-t-4 ${card.available ? "border-emerald-600" : "border-gray-400"}
                  ${expandedCard === card.id ? "relative z-10" : ""}
                `}
                onClick={() => handleCardClick(card)}
              >
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div
                      className={`${card.available ? "text-emerald-600" : "text-gray-400"}`}
                    >
                      {card.icon}
                    </div>
                    <h3 className="text-xl font-semibold ml-4 text-gray-800">
                      {card.title}
                    </h3>
                    {card.hasSubmenu && card.available && (
                      <svg
                        className={`h-5 w-5 ml-auto transition-transform ${expandedCard === card.id ? "rotate-180" : ""}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M19 9l-7 7-7-7"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                        />
                      </svg>
                    )}
                  </div>
                  <p className="text-gray-600">{card.description}</p>
                  {!card.available && (
                    <div className="mt-4 inline-block bg-gray-200 text-gray-600 px-3 py-1 rounded-full text-sm">
                      Próximamente
                    </div>
                  )}

                  {/* Quitamos el submenú en línea de aquí */}
                </div>

                {/* Footer de la card */}
                {card.available && !card.hasSubmenu && (
                  <div className="px-6 py-3 bg-gray-100 border-t border-gray-200">
                    <span className="text-emerald-600 font-medium flex items-center">
                      Acceder
                      <svg
                        className="h-4 w-4 ml-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M9 5l7 7-7 7"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                        />
                      </svg>
                    </span>
                  </div>
                )}

                {card.available && card.hasSubmenu && (
                  <div className="px-6 py-3 bg-gray-100 border-t border-gray-200">
                    <span className="text-emerald-600 font-medium flex items-center">
                      {expandedCard === card.id
                        ? "Cerrar opciones"
                        : "Ver opciones"}
                      <svg
                        className={`h-4 w-4 ml-2 transition-transform ${expandedCard === card.id ? "rotate-180" : ""}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M19 9l-7 7-7-7"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                        />
                      </svg>
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Submenú como popup flotante */}
          {expandedCard !== null &&
            cards.find((card) => card.id === expandedCard)?.hasSubmenu && (
              <div className="fixed inset-0 flex items-center justify-center z-30 pointer-events-none">
                <div className="bg-white rounded-lg shadow-lg w-96 p-4 mx-auto pointer-events-auto">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {cards.find((card) => card.id === expandedCard)?.title}
                    </h3>
                    <button
                      className="text-gray-500 hover:text-gray-700"
                      onClick={() => setExpandedCard(null)}
                    >
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M6 18L18 6M6 6l12 12"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                        />
                      </svg>
                    </button>
                  </div>

                  <p className="text-sm text-gray-500 mb-3">
                    Selecciona una opción:
                  </p>

                  <div className="space-y-2">
                    {cards
                      .find((card) => card.id === expandedCard)
                      ?.submenu.map((subItem, index) => (
                        <div
                          key={index}
                          className={`
                          p-3 rounded-md border border-gray-200 flex items-center justify-between
                          ${
                            subItem.available
                              ? "bg-white hover:bg-emerald-50 cursor-pointer"
                              : "bg-gray-100 opacity-60 cursor-not-allowed"
                          }
                        `}
                          onClick={(e) => {
                            handleSubmenuClick(
                              subItem.path,
                              subItem.available,
                              e,
                            );
                            setExpandedCard(null);
                          }}
                        >
                          <span
                            className={`${subItem.available ? "text-gray-700" : "text-gray-500"}`}
                          >
                            {subItem.title}
                          </span>
                          {subItem.available ? (
                            <svg
                              className="h-4 w-4 text-emerald-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M9 5l7 7-7 7"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                              />
                            </svg>
                          ) : (
                            <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                              Próximamente
                            </span>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            )}
        </section>

        <section className="bg-gray-50 rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Información del Sistema
          </h2>
          <div className="text-gray-600">
            <p className="mb-2">Última actualización: 28 de marzo, 2025</p>
            <p>
              Estado del sistema:{" "}
              <span className="text-green-500 font-medium">Activo</span>
            </p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default NominaDashboard;
