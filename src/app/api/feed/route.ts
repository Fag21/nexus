import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import type { BookItem, VideoItem } from "@/types/index";

// When the search box is empty we still want a populated feed, so fall back to
// an on-brand personal-growth query.
const DEFAULT_QUERY = "personal development self improvement";

// ── Curated fallback books in case of API rate-limiting or errors ───────────
const MOCK_BOOKS: BookItem[] = [
  {
    id: "gSluDwAAQBAJ",
    title: "Atomic Habits: An Easy & Proven Way to Build Good Habits & Break Bad Ones",
    authors: ["James Clear"],
    description: "No matter your goals, Atomic Habits offers a proven framework for improving--every day. James Clear, one of the world's leading experts on habit formation, reveals practical strategies that will teach you exactly how to form good habits, break bad ones, and master the tiny behaviors that lead to remarkable results.",
    thumbnail: "https://books.google.com/books/content?id=gSluDwAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api",
    pageCount: 320,
    publishedDate: "2018-10-16",
    previewLink: "https://books.google.com/books?id=gSluDwAAQBAJ",
    categories: ["Self-Help"]
  },
  {
    id: "B4z5CwAAQBAJ",
    title: "Deep Work: Rules for Focused Success in a Distracted World",
    authors: ["Cal Newport"],
    description: "One of the most valuable skills in our economy is becoming increasingly rare. If you master this skill, you'll achieve extraordinary results. Deep work is the ability to focus without distraction on a cognitively demanding task.",
    thumbnail: "https://books.google.com/books/content?id=B4z5CwAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api",
    pageCount: 304,
    publishedDate: "2016-01-05",
    previewLink: "https://books.google.com/books?id=B4z5CwAAQBAJ",
    categories: ["Business & Economics"]
  },
  {
    id: "s181DwAAQBAJ",
    title: "The 7 Habits of Highly Effective People: 30th Anniversary Edition",
    authors: ["Stephen R. Covey"],
    description: "A beloved classic, this book presents a holistic, integrated, principle-centered approach for solving personal and professional problems. With penetrating insights and pointed anecdotes, Covey reveals a step-by-step pathway for living with fairness, integrity, honesty, and human dignity.",
    thumbnail: "https://books.google.com/books/content?id=s181DwAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api",
    pageCount: 432,
    publishedDate: "2020-05-19",
    previewLink: "https://books.google.com/books?id=s181DwAAQBAJ",
    categories: ["Self-Help"]
  },
  {
    id: "fdjQDQAAQBAJ",
    title: "Mindset: The New Psychology of Success",
    authors: ["Carol S. Dweck"],
    description: "Dweck explains why it's not just our abilities and talent that bring us success—but whether we approach them with a fixed or growth mindset. She makes clear how a simple belief about ourselves guides a large part of our lives.",
    thumbnail: "https://books.google.com/books/content?id=fdjQDQAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api",
    pageCount: 320,
    publishedDate: "2007-12-26",
    previewLink: "https://books.google.com/books?id=fdjQDQAAQBAJ",
    categories: ["Self-Help"]
  },
  {
    id: "Gx26a094t9IC",
    title: "Thinking, Fast and Slow",
    authors: ["Daniel Kahneman"],
    description: "Kahneman takes us on a groundbreaking tour of the mind and explains the two systems that drive the way we think. System 1 is fast, intuitive, and emotional; System 2 is slower, more deliberative, and more logical.",
    thumbnail: "https://books.google.com/books/content?id=Gx26a094t9IC&printsec=frontcover&img=1&zoom=1&source=gbs_api",
    pageCount: 499,
    publishedDate: "2011-10-25",
    previewLink: "https://books.google.com/books?id=Gx26a094t9IC",
    categories: ["Self-Help"]
  },
  {
    id: "I43nnQAACAAJ",
    title: "The Power of Habit: Why We Do What We Do in Life and Business",
    authors: ["Charles Duhigg"],
    description: "In The Power of Habit, award-winning business reporter Charles Duhigg takes us to the thrilling edge of scientific discoveries that explain why habits exist and how they can be changed. Distilling vast amounts of information into engrossing narratives, Duhigg presents a whole new understanding of human nature and its potential.",
    thumbnail: "https://books.google.com/books/content?id=I43nnQAACAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api",
    pageCount: 371,
    publishedDate: "2012-02-28",
    previewLink: "https://books.google.com/books?id=I43nnQAACAAJ",
    categories: ["Self-Help"]
  }
];

// ── Curated fallback videos in case of API rate-limiting or errors ───────────
const MOCK_VIDEOS: VideoItem[] = [
  {
    id: "U_yp5aJEC2Q",
    videoId: "U_yp5aJEC2Q",
    title: "How to Build a Habit with 4 Simple Rules - Atomic Habits Summary",
    channelTitle: "Productivity Game",
    description: "An animated summary of Atomic Habits by James Clear, detailing the 4 laws of behavior change.",
    thumbnail: "https://img.youtube.com/vi/U_yp5aJEC2Q/hqdefault.jpg",
    publishedAt: "2018-11-20T14:00:00Z"
  },
  {
    id: "gTaJhjQHn58",
    videoId: "gTaJhjQHn58",
    title: "Deep Work: How to Focus in a Distracted World (Cal Newport)",
    channelTitle: "FightMediocrity",
    description: "Animated book review and key concepts from Deep Work by Cal Newport.",
    thumbnail: "https://img.youtube.com/vi/gTaJhjQHn58/hqdefault.jpg",
    publishedAt: "2016-01-28T16:22:00Z"
  },
  {
    id: "wfSXhEzss1g",
    videoId: "wfSXhEzss1g",
    title: "THE 7 HABITS OF HIGHLY EFFECTIVE PEOPLE BY STEPHEN COVEY - ANIMATED BOOK SUMMARY",
    channelTitle: "FightMediocrity",
    description: "A summary of the core principles of Stephen Covey's classic book.",
    thumbnail: "https://img.youtube.com/vi/wfSXhEzss1g/hqdefault.jpg",
    publishedAt: "2015-08-30T10:15:00Z"
  },
  {
    id: "arj7oStGLkU",
    videoId: "arj7oStGLkU",
    title: "Inside the mind of a master procrastinator | Tim Urban",
    channelTitle: "TED",
    description: "Tim Urban takes us on a journey through YouTube binges and explains why we procrastinate.",
    thumbnail: "https://img.youtube.com/vi/arj7oStGLkU/hqdefault.jpg",
    publishedAt: "2016-04-06T15:00:00Z"
  }
];

function processBooksResponse(data: any): BookItem[] {
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

// ── Google Books ────────────────────────────────────────────────────────────
async function fetchBooks(q: string): Promise<BookItem[]> {
  try {
    const url = new URL("https://www.googleapis.com/books/v1/volumes");
    url.searchParams.set("q", q);
    url.searchParams.set("maxResults", "20");
    url.searchParams.set("printType", "books");
    url.searchParams.set("orderBy", "relevance");

    const key = process.env.YOUTUBE_API_KEY;
    if (key && !key.startsWith("AIza...")) {
      url.searchParams.set("key", key);
    }

    const res = await fetch(url, { next: { revalidate: 3600 } });
    
    // If blocked or rate-limited with key, retry without key
    if (!res.ok && key && !key.startsWith("AIza...")) {
      console.warn(`[feed] Google Books fetch with key failed (${res.status}). Retrying without key...`);
      url.searchParams.delete("key");
      const retryRes = await fetch(url, { next: { revalidate: 3600 } });
      if (!retryRes.ok) {
        throw new Error(`Google Books API returned status ${retryRes.status}`);
      }
      return processBooksResponse(await retryRes.json());
    }

    if (!res.ok) {
      throw new Error(`Google Books API returned status ${res.status}`);
    }

    return processBooksResponse(await res.json());
  } catch (err) {
    console.error("[feed] Google Books request failed, falling back to curated mock books list.", err);
    if (q && q !== DEFAULT_QUERY) {
      const lowerQ = q.toLowerCase();
      const filtered = MOCK_BOOKS.filter(
        (b) =>
          b.title.toLowerCase().includes(lowerQ) ||
          b.authors.some((a) => a.toLowerCase().includes(lowerQ)) ||
          b.description.toLowerCase().includes(lowerQ)
      );
      if (filtered.length > 0) return filtered;
    }
    return MOCK_BOOKS;
  }
}

// ── YouTube Data API v3 ──────────────────────────────────────────────────────
async function fetchVideos(q: string): Promise<VideoItem[]> {
  try {
    const key = process.env.YOUTUBE_API_KEY;
    if (!key || key.startsWith("AIza...")) {
      throw new Error("YouTube search is not configured or key is placeholder");
    }

    const url = new URL("https://www.googleapis.com/youtube/v3/search");
    url.searchParams.set("part", "snippet");
    url.searchParams.set("type", "video");
    url.searchParams.set("maxResults", "20");
    url.searchParams.set("q", q);
    url.searchParams.set("key", key);

    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) {
      throw new Error(`YouTube API returned status ${res.status}`);
    }
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
  } catch (err) {
    console.error("[feed] YouTube fetch failed, falling back to curated mock videos list.", err);
    if (q && q !== DEFAULT_QUERY) {
      const lowerQ = q.toLowerCase();
      const filtered = MOCK_VIDEOS.filter(
        (v) =>
          v.title.toLowerCase().includes(lowerQ) ||
          v.channelTitle.toLowerCase().includes(lowerQ) ||
          v.description.toLowerCase().includes(lowerQ)
      );
      if (filtered.length > 0) return filtered;
    }
    return MOCK_VIDEOS;
  }
}

export async function GET(req: NextRequest) {
  const session = await auth();
  const userId = (session as { user?: { id?: string } } | null | undefined)?.user?.id;
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") === "videos" ? "videos" : "books";
  const q = searchParams.get("q")?.trim() || DEFAULT_QUERY;

  const items = type === "videos" ? await fetchVideos(q) : await fetchBooks(q);
  return NextResponse.json(items);
}
