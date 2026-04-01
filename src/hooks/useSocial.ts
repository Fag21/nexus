"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import type { SocialPlan } from "@/types/social";

interface UseSocialState {
  plans: SocialPlan[];
  loading: boolean;
  addPlan: (appName: string, dailyLimit: number) => Promise<void>;
  updateLimit: (id: string, limit: number) => Promise<void>;
  deletePlan: (id: string) => Promise<void>;
  logUsage: (planId: string, minutes: number) => Promise<void>;
}

export function useSocial(): UseSocialState {
  const [plans, setPlans] = useState<SocialPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await axios.get<SocialPlan[]>("/api/social");
        setPlans(res.data);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  const addPlan = async (appName: string, dailyLimit: number) => {
    const res = await axios.post<SocialPlan>("/api/social", { appName, dailyLimit });
    setPlans((prev) => [...prev, res.data]);
  };

  const updateLimit = async (id: string, limit: number) => {
    const res = await axios.patch<SocialPlan>(`/api/social/${id}`, { dailyLimit: limit });
    setPlans((prev) => prev.map((p) => (p.id === id ? res.data : p)));
  };

  const deletePlan = async (id: string) => {
    await axios.delete(`/api/social/${id}`);
    setPlans((prev) => prev.filter((p) => p.id !== id));
  };

  const logUsage = async (planId: string, minutes: number) => {
    await axios.post("/api/social/log", { planId, minutesUsed: minutes });
    // Re-fetch to keep server as source of truth (limits, aggregates, etc.)
    const res = await axios.get<SocialPlan[]>("/api/social");
    setPlans(res.data);
  };

  return { plans, loading, addPlan, updateLimit, deletePlan, logUsage };
}

