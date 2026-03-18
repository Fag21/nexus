"use client";
import { useEffect, useRef } from "react";
import toast from "react-hot-toast";
import type { TodaySummary } from "@/types/social";

export function useSocialAlert(summaries: TodaySummary[]) {
  const alerted = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (typeof Notification === "undefined") return;

    summaries.forEach((s) => {
      const overKey = `over-${s.planId}`;
      const warnKey = `warn-${s.planId}`;

      if (s.isOver && !alerted.current.has(overKey)) {
        alerted.current.add(overKey);
        toast.error(
          `${s.appName} limit reached — ${s.usedToday}/${s.dailyLimit} min used`,
          { duration: 6000, position: "top-center" }
        );
        if (Notification.permission === "granted") {
          new Notification(`${s.appName} limit reached!`, {
            body: `You used ${s.usedToday} of your ${s.dailyLimit} min daily limit.`,
          });
        }
      } else if (s.isNearLimit && !alerted.current.has(warnKey)) {
        alerted.current.add(warnKey);
        toast(`${s.appName}: only ${s.dailyLimit - s.usedToday} min left today`, {
          duration: 4000,
          icon: "⚠️",
        });
      }
    });
  }, [summaries]);
}