"use client";

/**
 * BookmarkList Component
 * Fetches bookmarks, subscribes to Realtime for INSERT/DELETE
 * Cleans up subscriptions on unmount
 * Handles loading, empty, and error states
 */
import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { BookmarkItem } from "./BookmarkItem";
import { Bookmark } from "lucide-react";
import type { Bookmark as BookmarkType } from "@/lib/types";

interface BookmarkListProps {
  onError: (message: string) => void;
}

export function BookmarkList({ onError }: BookmarkListProps) {
  const [bookmarks, setBookmarks] = useState<BookmarkType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookmarks = useCallback(async () => {
    try {
      const supabase = createClient();

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        setError("Not authenticated");
        setIsLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from("bookmarks")
        .select("*")
        .order("created_at", { ascending: false });

      if (fetchError) {
        setError(fetchError.message);
        onError(fetchError.message);
        return;
      }

      setBookmarks(data ?? []);
      setError(null);
    } catch (err) {
      console.error("Fetch bookmarks error:", err);
      const msg =
        err instanceof Error ? err.message : "Failed to load bookmarks";
      setError(msg);
      onError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [onError]);

  useEffect(() => {
    fetchBookmarks();
  }, [fetchBookmarks]);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel("bookmarks-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bookmarks",
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setBookmarks((prev) => [payload.new as BookmarkType, ...prev]);
          } else if (payload.eventType === "DELETE") {
            setBookmarks((prev) =>
              prev.filter((b) => b.id !== (payload.old as { id: string }).id)
            );
          }
        }
      )
      .subscribe((status) => {
        if (status === "CHANNEL_ERROR") {
          console.warn("Realtime channel error - will retry on reconnect");
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleDeleted = useCallback(() => {
    // Realtime will update the list automatically
    // But we can optionally refetch for consistency
    fetchBookmarks();
  }, [fetchBookmarks]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-10 h-10 border-2 border-amber-500/30 border-t-amber-600 rounded-full animate-spin" />
        <p className="mt-5 text-sm text-stone-500 dark:text-stone-400">Loading bookmarks...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl bg-white dark:bg-stone-900 p-12 text-center shadow-sm ring-1 ring-stone-200/50 dark:ring-stone-700/50 transition-colors">
        <p className="font-medium text-red-600 dark:text-red-400">Failed to load bookmarks</p>
        <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">{error}</p>
      </div>
    );
  }

  if (bookmarks.length === 0) {
    return (
      <div className="rounded-2xl bg-white dark:bg-stone-900 p-16 text-center shadow-sm ring-1 ring-stone-200/50 dark:ring-stone-700/50 transition-colors">
        <Bookmark className="mx-auto w-14 h-14 text-stone-300 dark:text-stone-600" aria-hidden />
        <p className="mt-4 font-medium text-stone-700 dark:text-stone-300">No bookmarks yet</p>
        <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
          Add your first bookmark above to get started
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-3" role="list">
      {bookmarks.map((bookmark) => (
        <BookmarkItem
          key={bookmark.id}
          bookmark={bookmark}
          onDeleted={handleDeleted}
          onError={onError}
        />
      ))}
    </ul>
  );
}
