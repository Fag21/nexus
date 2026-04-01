"use client";
import Image from "next/image";
import { FavoriteItem } from "@/types/index";

interface Props {
  favorites: FavoriteItem[];
  onRemove: (id: string) => Promise<void>;
}

function FavoritesSection({
  title,
  items,
  onRemove,
}: {
  title: string;
  items: FavoriteItem[];
  onRemove: (id: string) => Promise<void>;
}) {
  if (items.length === 0) return null;

  return (
    <div style={{ marginBottom: 28 }}>
      <h3
        style={{
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.8px",
          textTransform: "uppercase",
          color: "var(--color-text-secondary)",
          marginBottom: 12,
        }}
      >
        {title} · {items.length}
      </h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {items.map((item) => {
          const meta = JSON.parse(item.metadata ?? "{}") as Record<
            string,
            unknown
          >;
          const author =
            typeof meta.author === "string" ? meta.author : undefined;
          const channel =
            typeof meta.channel === "string" ? meta.channel : undefined;

          return (
            <div
              key={item.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 14px",
                background: "var(--color-background-primary)",
                border: "0.5px solid var(--color-border-tertiary)",
                borderRadius: 10,
              }}
            >
              {/* Thumbnail */}
              <div
                style={{
                  width: item.type === "VIDEO" ? 64 : 36,
                  height: 36,
                  borderRadius: 6,
                  overflow: "hidden",
                  flexShrink: 0,
                  background: "var(--color-background-secondary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {item.thumbnail ? (
                  <Image
                    src={item.thumbnail}
                    alt={item.title}
                    width={item.type === "VIDEO" ? 64 : 36}
                    height={36}
                    style={{
                      objectFit: "cover",
                      width: "100%",
                      height: "100%",
                    }}
                    unoptimized
                  />
                ) : (
                  <span style={{ fontSize: 14 }}>
                    {item.type === "BOOK" ? "📘" : "🎥"}
                  </span>
                )}
              </div>

              {/* Title */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    margin: 0,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    color: "var(--color-text-primary)",
                  }}
                >
                  {item.title}
                </p>
                {author && (
                  <p
                    style={{
                      fontSize: 11,
                      color: "var(--color-text-secondary)",
                      margin: "2px 0 0",
                    }}
                  >
                    {author}
                  </p>
                )}
                {channel && (
                  <p
                    style={{
                      fontSize: 11,
                      color: "var(--color-text-secondary)",
                      margin: "2px 0 0",
                    }}
                  >
                    {channel}
                  </p>
                )}
              </div>

              {/* Type badge */}
              <span
                style={{
                  fontSize: 10,
                  padding: "2px 7px",
                  borderRadius: 4,
                  fontWeight: 500,
                  flexShrink: 0,
                  background:
                    item.type === "BOOK"
                      ? "var(--color-background-info)"
                      : "var(--color-background-warning)",
                  color:
                    item.type === "BOOK"
                      ? "var(--color-text-info)"
                      : "var(--color-text-warning)",
                  border: `0.5px solid ${
                    item.type === "BOOK"
                      ? "var(--color-border-info)"
                      : "var(--color-border-warning)"
                  }`,
                }}
              >
                {item.type === "BOOK" ? "Book" : "Video"}
              </span>

              {/* Remove button */}
              <button
                onClick={() => onRemove(item.id)}
                style={{
                  fontSize: 11,
                  padding: "3px 8px",
                  color: "var(--color-text-secondary)",
                  flexShrink: 0,
                }}
              >
                Remove
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function FavoritesTab({ favorites, onRemove }: Props) {
  const books = favorites.filter((f) => f.type === "BOOK");
  const videos = favorites.filter((f) => f.type === "VIDEO");

  if (favorites.length === 0) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "48px 24px",
          color: "var(--color-text-secondary)",
        }}
      >
        <div style={{ fontSize: 36, marginBottom: 12 }}>🤍</div>
        <p style={{ fontSize: 14, marginBottom: 4 }}>No saved items yet</p>
        <p style={{ fontSize: 13 }}>
          Tap the heart on any book or video to save it here.
        </p>
      </div>
    );
  }

  return (
    <div>
      <FavoritesSection title="Saved books" items={books} onRemove={onRemove} />
      <FavoritesSection
        title="Saved videos"
        items={videos}
        onRemove={onRemove}
      />
    </div>
  );
}
