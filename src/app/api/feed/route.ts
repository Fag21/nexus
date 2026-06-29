import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import type { BookItem, VideoItem } from "@/types/index";

// When the search box is empty we still want a populated feed, so fall back to
// an on-brand personal-growth query.
const DEFAULT_QUERY = "personal development self improvement";

// ── Google Books ────────────────────────────────────────────────────────────
async function fetchBooks(q: string): Promise<BookItem[]> {
  const url = new URL("https://www.googleapis.com/books/v1/volumes");
  url.searchParams.set("q", q);
  url.searchParams.set("maxResults", "20");
  url.searchParams.set("printType", "books");
  url.searchParams.set("orderBy", "relevance");

  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error("Google Books request failed");
  const data = await res.json();

  type GoogleVolume = {
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
  };

  return ((data.items as GoogleVolume[]) ?? []).map((v) => {
    const info = v.volumeInfo ?? {};
    const rawThumb = info.imageLinks?.thumbnail ?? info.imageLinks?.smallThumbnail ?? "";
    return {
      id: v.id,
      title: info.title ?? "Untitled",
      authors: info.authors ?? [],
      description: info.description ?? "",
      // Google returns http:// links; next/image only allows the https host.
      thumbnail: rawThumb.replace(/^http:\/\//, "https://"),
      pageCount: info.pageCount,
      publishedDate: info.publishedDate,
      previewLink: info.previewLink,
      categories: info.categories,
    } satisfies BookItem;
  });
}

// ── YouTube Data API v3 ──────────────────────────────────────────────────────
async function fetchVideos(q: string): Promise<VideoItem[]> {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) throw new Error("YouTube search is not configured");

  const url = new URL("https://www.googleapis.com/youtube/v3/search");
  url.searchParams.set("part", "snippet");
  url.searchParams.set("type", "video");
  url.searchParams.set("maxResults", "20");
  url.searchParams.set("q", q);
  url.searchParams.set("key", key);

  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error("YouTube request failed");
  const data = await res.json();

  type YouTubeItem = {
    id?: { videoId?: string };
    snippet?: {
      title?: string;
      description?: string;
      channelTitle?: string;
      publishedAt?: string;
      thumbnails?: {
        high?: { url?: string };
        medium?: { url?: string };
        default?: { url?: string };
      };
    };
  };

  return ((data.items as YouTubeItem[]) ?? [])
    .filter((it) => it.id?.videoId)
    .map((it) => {
      const s = it.snippet ?? {};
      const videoId = it.id!.videoId!;
      const thumb =
        s.thumbnails?.high?.url ??
        s.thumbnails?.medium?.url ??
        s.thumbnails?.default?.url ??
        "";
      return {
        id: videoId,
        videoId,
        title: s.title ?? "Untitled",
        channelTitle: s.channelTitle ?? "",
        description: s.description ?? "",
        thumbnail: thumb,
        publishedAt: s.publishedAt ?? "",
      } satisfies VideoItem;
    });
}

export async function GET(req: NextRequest) {
  const session = await auth();
  const userId = (session as { user?: { id?: string } } | null | undefined)?.user?.id;
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") === "videos" ? "videos" : "books";
  const q = searchParams.get("q")?.trim() || DEFAULT_QUERY;

  try {
    const items = type === "videos" ? await fetchVideos(q) : await fetchBooks(q);
    return NextResponse.json(items);
  } catch (e) {
    // Surface the real upstream cause in the dev terminal — the 502 body only
    // carries a short message.
    console.error(`[feed] ${type} fetch failed for q="${q}":`, e);
    const message = e instanceof Error ? e.message : "Failed to load feed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
