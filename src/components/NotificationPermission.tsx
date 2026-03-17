// src/components/NotificationPermission.tsx
"use client";
import { useEffect } from "react";

export function NotificationPermission() {
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);
  return null;
}