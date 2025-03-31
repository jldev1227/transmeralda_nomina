export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "Sistema de Nómina",
  description: "Gestión centralizada de nóminas de personal.",
  navItems: [
    {
      label: "Inicio",
      href: "/",
    },
    {
      label: "Conductores",
      href: "/conductores",
    },
    {
      label: "Administrativo",
      href: "/administrativo",
    },
    {
      label: "Reportes",
      href: "/reportes",
    },
    {
      label: "Análisis",
      href: "/analisis",
    },
    {
      label: "Configuración",
      href: "/configuracion",
    },
  ],
  navMenuItems: [
    {
      label: "Dashboard",
      href: "/",
    },
    {
      label: "Conductores",
      href: "/conductores",
    },
    {
      label: "Administrativo",
      href: "/administrativo",
    },
    {
      label: "Reportes",
      href: "/reportes",
    },
    {
      label: "Configuración",
      href: "/configuracion",
    },
    {
      label: "Ayuda",
      href: "/ayuda",
    },
    {
      label: "Cerrar Sesión",
      href: "/logout",
    },
  ],
  // links: {
  //   github: "https://github.com/tu-usuario/sistema-nomina",
  //   twitter: "https://twitter.com/tu-usuario",
  //   docs: "https://tudominio.com/docs",
  //   support: "https://tudominio.com/soporte",
  // },
};
