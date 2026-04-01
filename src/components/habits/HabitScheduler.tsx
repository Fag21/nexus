// src/components/habits/HabitScheduler.tsx
"use client";
import { useEffect } from "react";
import { Habit } from "@/types/index";

export function HabitScheduler({ habits }: { habits: Habit[] }) {
  useEffect(() => {
    if (typeof Notification === "undefined") return;

    // Request notification permission on mount
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }

    const checkAlerts = () => {
      const now = new Date();
      const timeNow = `${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}`;

      habits.forEach((habit) => {
        if (habit.scheduledTime === timeNow && Notification.permission === "granted") {
          new Notification(`Time for: ${habit.name}`, {
            body: "Your habit reminder is here. Stay consistent!",
            icon: "/nexus-icon.png",
          });
        }
      });
    };

    // Check every minute
    const interval = setInterval(checkAlerts, 60000);
    return () => clearInterval(interval);
  }, [habits]);

  return null; // This component renders nothing — it is just logic
}
