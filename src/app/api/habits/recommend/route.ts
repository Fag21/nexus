import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import type { BookItem, VideoItem } from "@/types";

// Recommends real books + videos to help build/break a given habit.
// Books come from the keyless Google Books API; videos from YouTube Data API.
// Both degrade gracefully to an empty list so one failing source never breaks the page.

interface GoogleVolume {
  id: string;
  volumeInfo?: {
    title?: string;
    authors?: string[];
    description?: string;
    pageCount?: number;
    publishedDate?: string;
    previewLink?: string;
    categories?: string[];
    imageLinks?: { thumbnail?: string; smallThumbnail?: string };
  };
}

interface YouTubeSearchItem {
  id?: { videoId?: string };
  snippet?: {
    title?: string;
    channelTitle?: string;
    description?: string;
    publishedAt?: string;
    thumbnails?: { medium?: { url?: string }; default?: { url?: string } };
  };
}

async function fetchBooks(query: string): Promise<BookItem[]> {
  try {
    const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
      query
    )}&maxResults=6&orderBy=relevance&printType=books`;
    const res = await fetch(url, { next: { revalidate: 60 * 60 } });
    if (!res.ok) return [];
    const data = (await res.json()) as { items?: GoogleVolume[] };
    return (data.items ?? []).map((v) => {
      const info = v.volumeInfo ?? {};
      return {
        id: v.id,
        title: info.title ?? "Untitled",
        authors: info.authors ?? [],
        description: info.description ?? "",
        thumbnail:
          info.imageLinks?.thumbnail?.replace("http://", "https://") ??
          info.imageLinks?.smallThumbnail?.replace("http://", "https://") ??
          "",
        pageCount: info.pageCount,
        publishedDate: info.publishedDate,
        previewLink: info.previewLink,
        categories: info.categories,
      } satisfies BookItem;
    });
  } catch {
    return [];
  }
}

async function fetchVideos(query: string): Promise<VideoItem[]> {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) return [];
  try {
    const url =
      `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video` +
      `&maxResults=6&relevanceLanguage=en&safeSearch=strict` +
      `&q=${encodeURIComponent(query)}&key=${key}`;
    const res = await fetch(url, { next: { revalidate: 60 * 60 } });
    if (!res.ok) return [];
    const data = (await res.json()) as { items?: YouTubeSearchItem[] };
    return (data.items ?? [])
      .filter((it) => it.id?.videoId)
      .map((it) => {
        const s = it.snippet ?? {};
        return {
          id: it.id!.videoId!,
          videoId: it.id!.videoId!,
          title: s.title ?? "Untitled",
          channelTitle: s.channelTitle ?? "",
          description: s.description ?? "",
          thumbnail: s.thumbnails?.medium?.url ?? s.thumbnails?.default?.url ?? "",
          publishedAt: s.publishedAt ?? "",
        } satisfies VideoItem;
      });
  } catch {
    return [];
  }
}

export async function GET(req: Request) {
  const session = await auth();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const name = (searchParams.get("habit") ?? "").trim();
  const type = (searchParams.get("type") ?? "BUILD").toUpperCase();
  if (!name)
    return NextResponse.json({ error: "Missing habit" }, { status: 400 });

  const isBreak = type === "BREAK";
  const bookQuery = isBreak
    ? `how to quit ${name} habit`
    : `${name} habit building self improvement`;
  const videoQuery = isBreak
    ? `how to break the habit of ${name}`
    : `how to build a ${name} habit`;

  const [books, videos] = await Promise.all([
    fetchBooks(bookQuery),
    fetchVideos(videoQuery),
  ]);

  return NextResponse.json({ books, videos });
}
