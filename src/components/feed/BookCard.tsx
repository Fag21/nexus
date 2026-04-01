"use client";
import { useState } from "react";
import Image from "next/image";
import { BookItem } from "@/types/index";

interface Props {
  book: BookItem;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

export function BookCard({ book, isFavorite, onToggleFavorite }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const isLong = book.description?.length > 160;

  return (
    <div
      style={{
        background: "var(--color-background-primary)",
        border: "0.5px solid var(--color-border-tertiary)",
        borderRadius: 12, padding: "14px 16px",
        display: "flex", flexDirection: "column", gap: 0,
        height: "100%",
        transition: "border-color 0.15s",
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.borderColor = "var(--color-border-secondary)")
      }
      onMouseLeave={(e) =>
        (e.currentTarget.style.borderColor = "var(--color-border-tertiary)")
      }
    >
      {/* Cover + title row */}
      <div style={{ display: "flex", gap: 12, marginBottom: 10 }}>
        {/* Book cover */}
        <div
          style={{
            width: 56, height: 80,
            borderRadius: 6, overflow: "hidden",
            flexShrink: 0, background: "var(--color-background-secondary)",
            display: "flex", alignItems: "center", justifyContent: "center",
            border: "0.5px solid var(--color-border-tertiary)",
          }}
        >
          {book.thumbnail && !imgError ? (
            <Image
              src={book.thumbnail}
              alt={book.title}
              width={56}
              height={80}
              style={{ objectFit: "cover", width: "100%", height: "100%" }}
              onError={() => setImgError(true)}
              unoptimized
            />
          ) : (
            <span style={{ fontSize: 22 }}>📘</span>
          )}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            display: "flex", alignItems: "flex-start",
            justifyContent: "space-between", gap: 6,
          }}>
            <h3
              style={{
                fontSize: 13, fontWeight: 500,
                lineHeight: 1.4, margin: 0,
                color: "var(--color-text-primary)",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {book.title}
            </h3>

            {/* Heart button */}
            <button
              onClick={onToggleFavorite}
              style={{
                background: "transparent", border: "none",
                cursor: "pointer", padding: 2,
                fontSize: 16, flexShrink: 0,
                transition: "transform 0.15s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "scale(1.2)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "scale(1)")
              }
              title={isFavorite ? "Remove from saved" : "Save book"}
            >
              {isFavorite ? "❤️" : "🤍"}
            </button>
          </div>

          <p style={{
            fontSize: 11.5, color: "var(--color-text-secondary)",
            margin: "4px 0 0",
          }}>
            {book.authors?.join(", ") || "Unknown Author"}
          </p>

          {/* Meta row */}
          <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
            {book.publishedDate && (
              <span
                style={{
                  fontSize: 10, padding: "1px 6px", borderRadius: 4,
                  background: "var(--color-background-secondary)",
                  color: "var(--color-text-secondary)",
                  border: "0.5px solid var(--color-border-tertiary)",
                }}
              >
                {book.publishedDate.slice(0, 4)}
              </span>
            )}
            {book.pageCount && (
              <span
                style={{
                  fontSize: 10, padding: "1px 6px", borderRadius: 4,
                  background: "var(--color-background-secondary)",
                  color: "var(--color-text-secondary)",
                  border: "0.5px solid var(--color-border-tertiary)",
                }}
              >
                {book.pageCount}p
              </span>
            )}
            {book.categories?.[0] && (
              <span
                style={{
                  fontSize: 10, padding: "1px 6px", borderRadius: 4,
                  background: "var(--color-background-info)",
                  color: "var(--color-text-info)",
                  border: "0.5px solid var(--color-border-info)",
                }}
              >
                {book.categories[0].split(" / ")[0]}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      {book.description && (
        <>
          <p
            style={{
              fontSize: 12, lineHeight: 1.6,
              color: "var(--color-text-secondary)",
              margin: 0,
              display: "-webkit-box",
              WebkitLineClamp: expanded ? undefined : 3,
              WebkitBoxOrient: expanded ? undefined : "vertical",
              overflow: expanded ? "visible" : "hidden",
            }}
          >
            {book.description}
          </p>
          {isLong && (
            <button
              onClick={() => setExpanded(!expanded)}
              style={{
                marginTop: 4, fontSize: 11,
                color: "var(--color-text-info)",
                background: "transparent", border: "none",
                cursor: "pointer", padding: 0, textAlign: "left",
              }}
            >
              {expanded ? "Show less ↑" : "Read more ↓"}
            </button>
          )}
        </>
      )}

      {/* Preview link */}
      {book.previewLink && (
        <a
          href={book.previewLink}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-block", marginTop: 10,
            fontSize: 12,
            color: "var(--color-text-info)",
            textDecoration: "none",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.textDecoration = "underline")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.textDecoration = "none")
          }
        >
          Preview on Google Books →
        </a>
      )}
    </div>
  );
}