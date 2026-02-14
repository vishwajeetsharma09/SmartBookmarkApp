"use client";

/**
 * Dashboard Page - Main app view
 * Premium design: single user context in header dropdown, clean layout
 */
import { AddBookmarkForm } from "@/components/AddBookmarkForm";
import { BookmarkList } from "@/components/BookmarkList";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useToast } from "@/hooks/useToast";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { LogOut } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const { showToast, ToastComponent } = useToast();
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserAvatar(user.user_metadata?.avatar_url ?? null);
        setUserEmail(user.email ?? null);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        router.push("/login");
      } else {
        setUserAvatar(session.user.user_metadata?.avatar_url ?? null);
        setUserEmail(session.user.email ?? null);
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setShowUserMenu(false);
    router.push("/login");
    router.refresh();
  };

  const handleAddSuccess = () => showToast("Bookmark added");
  const handleError = (message: string, type: "success" | "error" | "info" = "error") => {
    showToast(message, type);
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 dark:bg-stone-950 transition-colors">
      {/* Premium Header */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-stone-950/90 backdrop-blur-xl border-b border-stone-200/60 dark:border-stone-800/60 transition-colors">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="font-serif text-2xl tracking-tight text-stone-800 dark:text-stone-100">
            Smart Bookmark
          </h1>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 rounded-full pl-1 pr-3 py-1.5 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors outline-none focus:ring-2 focus:ring-amber-500/30 focus:ring-offset-2 dark:focus:ring-offset-stone-950"
                aria-expanded={showUserMenu}
                aria-haspopup="true"
              >
                {userAvatar ? (
                  <img
                    src={userAvatar}
                    alt=""
                    className="w-8 h-8 rounded-full ring-1 ring-stone-200 dark:ring-stone-700"
                    width={32}
                    height={32}
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-700 dark:text-amber-400 font-medium">
                    ?
                  </div>
                )}
              </button>
              {showUserMenu && (
                <div className="absolute right-0 top-full mt-2 w-56 rounded-xl bg-white dark:bg-stone-900 shadow-xl ring-1 ring-stone-200/80 dark:ring-stone-700 py-1 transition-colors">
                  {userEmail && (
                    <div className="px-4 py-3 border-b border-stone-100 dark:border-stone-800">
                      <p className="text-sm text-stone-500 dark:text-stone-400 truncate">{userEmail}</p>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-left text-sm text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
                  >
                    <LogOut className="w-4 h-4" aria-hidden />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-6 py-12">
        <section className="mb-12">
          <AddBookmarkForm onSuccess={handleAddSuccess} onError={handleError} />
        </section>
        <section>
          <h2 className="text-xs font-medium uppercase tracking-wider text-stone-400 dark:text-stone-500 mb-4">
            Your bookmarks
          </h2>
          <BookmarkList onError={(msg) => handleError(msg)} />
        </section>
      </main>

      {ToastComponent}
    </div>
  );
}
