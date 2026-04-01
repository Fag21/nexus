"use client";
import { useState } from "react";
import Image from "next/image";
import { VideoItem } from "@/types/index";

interface Props {
  video: VideoItem;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

export function VideoCard({ video, isFavorite, onToggleFavorite }: Props) {
  const [playing, setPlaying] = useState(false);
  const [imgError, setImgError] = useState(false);

  const youtubeUrl = `https://www.youtube.com/watch?v=${video.videoId}`;
  const embedUrl = `https://www.youtube.com/embed/${video.videoId}?autoplay=1&rel=0`;
  const formattedDate = video.publishedAt
    ? new Date(video.publishedAt).toLocaleDateString("en", {
        month: "short", year: "numeric",
      })
    : "";

  return (
    <div
      style={{
        background: "var(--color-background-primary)",
        border: "0.5px solid var(--color-border-tertiary)",
        borderRadius: 12, overflow: "hidden",
        display: "flex", flexDirection: "column",
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
      {/* Thumbnail / Player */}
      <div
        style={{
          position: "relative", width: "100%",
          paddingTop: "56.25%",
          background: "var(--color-background-secondary)",
          cursor: "pointer",
          overflow: "hidden",
        }}
        onClick={() => setPlaying(true)}
      >
        {playing ? (
          <iframe
            src={embedUrl}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{
              position: "absolute", inset: 0,
              width: "100%", height: "100%",
              border: "none",
            }}
          />
        ) : (
          <>
            {video.thumbnail && !imgError ? (
              <Image
                src={video.thumbnail}
                alt={video.title}
                fill
                style={{ objectFit: "cover" }}
                onError={() => setImgError(true)}
                unoptimized
              />
            ) : (
              <div
                style={{
                  position: "absolute", inset: 0,
                  display: "flex", alignItems: "center",
                  justifyContent: "center", fontSize: 32,
                }}
              >
                🎥
              </div>
            )}

            {/* Play button overlay */}
            <div
              style={{
                position: "absolute", inset: 0,
                display: "flex", alignItems: "center",
                justifyContent: "center",
                background: "rgba(0,0,0,0.2)",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "rgba(0,0,0,0.4)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "rgba(0,0,0,0.2)")
              }
            >
              <div
                style={{
                  width: 44, height: 44,
                  background: "rgba(255,255,255,0.95)",
                  borderRadius: "50%",
                  display: "flex", alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg
                  width="16" height="16" viewBox="0 0 16 16" fill="none"
                >
                  <path
                    d="M5 3.5L13 8L5 12.5V3.5Z"
                    fill="#1A1F16"
                  />
                </svg>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: "12px 14px", flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{
          display: "flex", alignItems: "flex-start",
          justifyContent: "space-between", gap: 8, marginBottom: 6,
        }}>
          <h3
            style={{
              fontSize: 13, fontWeight: 500, lineHeight: 1.4, margin: 0,
              color: "var(--color-text-primary)",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              flex: 1,
            }}
          >
            {video.title}
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
            title={isFavorite ? "Remove from saved" : "Save video"}
          >
            {isFavorite ? "❤️" : "🤍"}
          </button>
        </div>

        {/* Channel + date */}
        <div style={{
          display: "flex", alignItems: "center",
          gap: 8, marginBottom: 8,
        }}>
          <span
            style={{
              fontSize: 11, padding: "1px 7px", borderRadius: 4,
              background: "var(--color-background-warning)",
              color: "var(--color-text-warning)",
              border: "0.5px solid var(--color-border-warning)",
              fontWeight: 500,
            }}
          >
            Video
          </span>
          <span style={{ fontSize: 11.5, color: "var(--color-text-secondary)" }}>
            {video.channelTitle}
          </span>
          {formattedDate && (
            <span style={{ fontSize: 11, color: "var(--color-text-secondary)", marginLeft: "auto" }}>
              {formattedDate}
            </span>
          )}
        </div>

        {/* Description */}
        {video.description && (
          <p
            style={{
              fontSize: 12, lineHeight: 1.55,
              color: "var(--color-text-secondary)",
              margin: 0, flex: 1,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {video.description}
          </p>
        )}

        {/* Watch link */}
        <a
          href={youtubeUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-block", marginTop: 10,
            fontSize: 12, color: "var(--color-text-info)",
            textDecoration: "none",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.textDecoration = "underline")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.textDecoration = "none")
          }
        >
          Watch on YouTube →
        </a>
      </div>
    </div>
  );
}