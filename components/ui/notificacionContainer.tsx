// src/components/ui/NotificationContainer.tsx
import React from "react";

import { Notification } from "./notificacion";

import { useNotification } from "@/context/NotificacionContext";

export const NotificationContainer: React.FC = () => {
  const { notifications, removeNotification } = useNotification();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col items-end space-y-2 max-w-sm">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className="transform transition-all duration-500 ease-in-out"
          style={{
            animation: "slideIn 0.3s ease-out forwards",
          }}
        >
          <Notification
            notification={notification}
            onDismiss={removeNotification}
          />
        </div>
      ))}
    </div>
  );
};
