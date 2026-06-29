"use client";
import { useFeed } from "@/hooks/useFeed";
import { SectionTabs } from "./SectionTabs";
import { SearchBar } from "./SearchBar";
import { BookCard } from "./BookCard";
import { VideoCard } from "./VideoCard";
import { FavoritesTab } from "./FavoritesTab";

export function FeedPage() {
  const {
    tab, setTab,
    query, handleSearch,
    books, videos, favorites,
    loading, error,
    removeFavorite,
    isFavorite, toggleFavorite,
  } = useFeed();

  const showSearch = tab !== "favorites";

  return (
    <div className="app-container">

      {/* Header row — tabs + search */}
      <div style={{
        display: "flex", alignItems: "center",
        justifyContent: "space-between",
        gap: 16, marginBottom: 24,
        flexWrap: "wrap",
      }}>
        <SectionTabs
          active={tab}
          onChange={setTab}
          favCount={favorites.length}
        />
        {showSearch && (
          <div style={{ flex: 1, minWidth: 220, maxWidth: 360 }}>
            <SearchBar
              value={query}
              onChange={handleSearch}
              placeholder={
                tab === "books"
                  ? "Search books..."
                  : "Search videos..."
              }
            />
          </div>
        )}
      </div>

      {/* Error state */}
      {error && (
        <div
          style={{
            padding: "12px 16px", borderRadius: 10, marginBottom: 20,
            background: "var(--color-background-danger)",
            border: "0.5px solid var(--color-border-danger)",
            fontSize: 13, color: "var(--color-text-danger)",
          }}
        >
          {error}
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: 14,
        }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              style={{
                height: 180, borderRadius: 12,
                background: "var(--color-background-secondary)",
                border: "0.5px solid var(--color-border-tertiary)",
                animation: "pulse 1.4s ease-in-out infinite",
                animationDelay: `${i * 0.08}s`,
              }}
            />
          ))}
          <style>{`
            @keyframes pulse {
              0%,100%{ opacity:1; }
              50%{ opacity:0.5; }
            }
          `}</style>
        </div>
      )}

      {/* Books grid */}
      {!loading && tab === "books" && (
        <>
          {books.length === 0 ? (
            <div style={{
              textAlign: "center", padding: "48px 24px",
              color: "var(--color-text-secondary)", fontSize: 14,
            }}>
              No books found. Try a different search.
            </div>
          ) : (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: 14,
            }}>
              {books.map((book) => (
                <BookCard
                  key={book.id}
                  book={book}
                  isFavorite={isFavorite("BOOK", book.id)}
                  onToggleFavorite={() =>
                    toggleFavorite(
                      "BOOK", book.id, book.title, book.thumbnail,
                      JSON.stringify({ author: book.authors?.[0] })
                    )
                  }
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Videos grid */}
      {!loading && tab === "videos" && (
        <>
          {videos.length === 0 ? (
            <div style={{
              textAlign: "center", padding: "48px 24px",
              color: "var(--color-text-secondary)", fontSize: 14,
            }}>
              No videos found. Try a different search.
            </div>
          ) : (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: 14,
            }}>
              {videos.map((video) => (
                <VideoCard
                  key={video.id}
                  video={video}
                  isFavorite={isFavorite("VIDEO", video.videoId)}
                  onToggleFavorite={() =>
                    toggleFavorite(
                      "VIDEO", video.videoId, video.title, video.thumbnail,
                      JSON.stringify({ channel: video.channelTitle })
                    )
                  }
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Favorites tab */}
      {tab === "favorites" && (
        <FavoritesTab
        favorites={favorites}
        onRemove={removeFavorite}
        />
      )}
    </div>
  );
}