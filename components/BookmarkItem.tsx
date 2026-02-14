"use client";

/**
 * Bookmark Item Component
 * Displays a single bookmark with delete button
 * XSS prevention: URL and title from DB are safely rendered (Next.js escapes by default, extra escape for link href)
 */
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ExternalLink, Trash2, Loader2 } from "lucide-react";
import type { Bookmark } from "@/lib/types";
import { truncateTitle } from "@/lib/utils";

interface BookmarkItemProps {
  bookmark: Bookmark;
  onDeleted: () => void;
  onError: (message: string) => void;
}

export function BookmarkItem({ bookmark, onDeleted, onError }: BookmarkItemProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const displayTitle = truncateTitle(bookmark.title);

  const handleDelete = async () => {
    if (!showConfirm) {
      setShowConfirm(true);
      return;
    }

    setIsDeleting(true);

    try {
      const supabase = createClient();

      const { error } = await supabase
        .from("bookmarks")
        .delete()
        .eq("id", bookmark.id);

      if (error) {
        if (error.code === "PGRST116" || error.message.includes("policy")) {
          onError("You don't have permission to delete this bookmark");
        } else {
          onError(error.message || "Failed to delete bookmark");
        }
        setIsDeleting(false);
        setShowConfirm(false);
        return;
      }

      onDeleted();
    } catch (err) {
      console.error("Delete bookmark error:", err);
      onError(
        err instanceof Error ? err.message : "Network error. Please try again."
      );
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  const handleCancelDelete = () => {
    setShowConfirm(false);
  };

  return (
    <li className="group flex items-center gap-4 rounded-xl bg-white dark:bg-stone-900 p-4 shadow-sm ring-1 ring-stone-200/50 dark:ring-stone-700/50 hover:ring-stone-300/70 dark:hover:ring-stone-600/70 hover:shadow-md transition-all duration-200">
      <a
        href={bookmark.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 min-w-0 flex items-center gap-3 text-left"
      >
        <span className="shrink-0 w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400 group-hover:bg-amber-100 dark:group-hover:bg-amber-900/50 transition-colors">
          <ExternalLink className="w-4 h-4" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-medium text-stone-900 dark:text-stone-100 truncate">{displayTitle}</p>
          <p className="text-sm text-stone-500 dark:text-stone-400 truncate">{bookmark.url}</p>
        </div>
      </a>
      <div className="shrink-0 flex items-center gap-2">
        {showConfirm ? (
          <>
            <span className="text-sm text-stone-500 dark:text-stone-400">Delete?</span>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-3 py-1.5 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              {isDeleting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Yes"
              )}
            </button>
            <button
              type="button"
              onClick={handleCancelDelete}
              disabled={isDeleting}
              className="px-3 py-1.5 text-sm rounded-lg bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-600 disabled:opacity-50 transition-colors"
            >
              No
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            aria-label="Delete bookmark"
            className="p-2 rounded-lg text-stone-400 dark:text-stone-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </li>
  );
}
