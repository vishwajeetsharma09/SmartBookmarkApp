"use client";

/**
 * Add Bookmark Form Component
 * Handles validation: empty fields, invalid URL, duplicate URL
 * Prevents double submit, trims whitespace, normalizes URL
 */
import { useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { normalizeUrl, isValidUrl, truncateTitle } from "@/lib/utils";
import type { ToastType } from "@/components/Toast";

interface AddBookmarkFormProps {
  onSuccess: () => void;
  onError: (message: string, type?: ToastType) => void;
}

export function AddBookmarkForm({ onSuccess, onError }: AddBookmarkFormProps) {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      const trimmedUrl = url.trim();
      const trimmedTitle = title.trim();

      // Validate empty fields
      if (!trimmedUrl) {
        onError("URL is required", "error");
        return;
      }

      if (!trimmedTitle) {
        onError("Title is required", "error");
        return;
      }

      // Validate URL format
      if (!isValidUrl(trimmedUrl)) {
        onError("Please enter a valid URL", "error");
        return;
      }

      const normalizedUrl = normalizeUrl(trimmedUrl);
      const safeTitle = truncateTitle(trimmedTitle);

      setIsSubmitting(true);

      try {
        const supabase = createClient();

        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          onError("You must be logged in to add bookmarks", "error");
          setIsSubmitting(false);
          return;
        }

        const { error } = await supabase.from("bookmarks").insert({
          user_id: user.id,
          title: safeTitle,
          url: normalizedUrl,
        });

        if (error) {
          // Check for duplicate URL (unique constraint violation)
          if (error.code === "23505") {
            onError("This URL is already saved", "error");
          } else if (error.code === "PGRST116") {
            // RLS policy violation
            onError("You don't have permission to add bookmarks", "error");
          } else {
            onError(error.message || "Failed to add bookmark", "error");
          }
          setIsSubmitting(false);
          return;
        }

        onSuccess();
        setUrl("");
        setTitle("");
      } catch (err) {
        console.error("Add bookmark error:", err);
        onError(
          err instanceof Error ? err.message : "Network error. Please try again.",
          "error"
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [url, title, onSuccess, onError]
  );

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl bg-white dark:bg-stone-900 p-6 shadow-sm ring-1 ring-stone-200/60 dark:ring-stone-700/50 hover:shadow-md transition-shadow duration-200"
    >
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 space-y-3">
          <input
            type="url"
            placeholder="https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={isSubmitting}
            className="w-full px-4 py-3 rounded-xl border border-stone-200 dark:border-stone-600 bg-stone-50/50 dark:bg-stone-800/50 text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/50 focus:bg-white dark:focus:bg-stone-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            autoComplete="url"
            maxLength={2048}
          />
          <input
            type="text"
            placeholder="Bookmark title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isSubmitting}
            className="w-full px-4 py-3 rounded-xl border border-stone-200 dark:border-stone-600 bg-stone-50/50 dark:bg-stone-800/50 text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/50 focus:bg-white dark:focus:bg-stone-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            autoComplete="off"
            maxLength={200}
          />
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 dark:focus:ring-offset-stone-900 disabled:opacity-60 disabled:cursor-not-allowed transition-colors shrink-0 self-end sm:self-auto"
        >
          {isSubmitting ? "Adding..." : "Add"}
        </button>
      </div>
    </form>
  );
}
