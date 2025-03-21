"use client";

import type { ThemeProviderProps } from "next-themes";

import * as React from "react";
import { HeroUIProvider } from "@heroui/system";
import { useRouter } from "next/navigation";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { NominaProvider } from "@/context/NominaContext";
import { NotificationContainer } from "@/components/ui/notificacionContainer";
import { NotificationProvider } from "@/context/NotificacionContext";

export interface ProvidersProps {
  children: React.ReactNode;
  themeProps?: ThemeProviderProps;
}

declare module "@react-types/shared" {
  interface RouterConfig {
    routerOptions: NonNullable<
      Parameters<ReturnType<typeof useRouter>["push"]>[1]
    >;
  }
}

export function Providers({ children, themeProps }: ProvidersProps) {
  const router = useRouter();

  return (
    <HeroUIProvider navigate={router.push}>
      <NotificationProvider>
        <NominaProvider>
        <NotificationContainer />
          <NextThemesProvider {...themeProps}>{children}</NextThemesProvider>
        </NominaProvider>
      </NotificationProvider>
    </HeroUIProvider>
  );
}
