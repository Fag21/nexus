"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { BookItem, VideoItem, FavoriteItem } from "@/types/index";

type Tab = "books" | "videos" | "favorites";

export function useFeed() {
  const [tab, setTab] = useState<Tab>("books");
  const [query, setQuery] = useState("");
  const [books, setBooks] = useState<BookItem[]>([]);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [favLoading, setFavLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounce ref
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // ── Fetch favorites on mount ─────────────────────────────────
  const fetchFavorites = useCallback(async () => {
    setFavLoading(true);
    try {
      const res = await fetch("/api/feed/favorite");
      if (!res.ok) throw new Error();
      setFavorites(await res.json());
    } catch {
      // silently fail — favorites are non-critical
    } finally {
      setFavLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  // ── Fetch books or videos ────────────────────────────────────
  const fetchContent = useCallback(
    async (type: "books" | "videos", q: string) => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({ type, q });
        const res = await fetch(`/api/feed?${params}`);
        if (!res.ok) throw new Error("Failed to load");
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        if (type === "books") setBooks(data);
        else setVideos(data);
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        setError(message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Load default content on tab change
  useEffect(() => {
    if (tab === "books") fetchContent("books", query);
    if (tab === "videos") fetchContent("videos", query);
  }, [tab]);   // eslint-disable-line react-hooks/exhaustive-deps

  // Debounced search — fires 500ms after user stops typing
  const handleSearch = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (tab !== "favorites") fetchContent(tab, value);
    }, 500);
  };

  // ── Favorites helpers ────────────────────────────────────────
  const isFavorite = (type: "BOOK" | "VIDEO", externalId: string) =>
    favorites.some((f) => f.type === type && f.externalId === externalId);

  const getFavoriteId = (type: "BOOK" | "VIDEO", externalId: string) =>
    favorites.find((f) => f.type === type && f.externalId === externalId)?.id;

  const addFavorite = async (item: {
    type: "BOOK" | "VIDEO";
    externalId: string;
    title: string;
    thumbnail?: string;
    metadata?: string;
  }) => {
    const res = await fetch("/api/feed/favorite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(item),
    });
    if (!res.ok) throw new Error("Failed to save");
    const saved = await res.json();
    setFavorites((prev) => [saved, ...prev]);
  };

  const removeFavorite = async (id: string) => {
    const res = await fetch(`/api/feed/favorite/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to remove");
    setFavorites((prev) => prev.filter((f) => f.id !== id));
  };

  const toggleFavorite = async (
    type: "BOOK" | "VIDEO",
    externalId: string,
    title: string,
    thumbnail?: string,
    metadata?: string
  ) => {
    const existingId = getFavoriteId(type, externalId);
    if (existingId) {
      await removeFavorite(existingId);
    } else {
      await addFavorite({ type, externalId, title, thumbnail, metadata });
    }
  };

  return {
    tab, setTab,
    query, handleSearch,
    books, videos, favorites,
    loading, favLoading, error,
    removeFavorite,
    isFavorite, toggleFavorite,
    refetchFavorites: fetchFavorites,
  };
}