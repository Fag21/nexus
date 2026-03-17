"use client";
import { useState, useEffect } from "react";
import { DashboardData } from "@/types";

export function useDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch_ = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/dashboard");
      if (!res.ok) throw new Error("Failed to load");
      setData(await res.json());
    } catch {
      setError("Could not load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch_(); }, []);

  return { data, loading, error, refetch: fetch_ };
}