'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [bookmarks, setBookmarks] = useState<any[]>([])
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Load bookmarks and subscribe to real-time changes
  useEffect(() => {
    if (!supabase) return;

    let channel: any;

    const init = async () => {
      setLoading(true);

      const { data } = await supabase!.auth.getUser();

      if (!data.user) {
        router.push('/');
        setLoading(false);
        return;
      }

      const userId = data.user.id;
      setUser(data.user);

      // Fetch initial bookmarks for this user
      const { data: bookmarksData } = await supabase!
        .from('bookmarks')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      setBookmarks(bookmarksData || []);
      setLoading(false);

      // Subscribe to real-time changes on this user's bookmarks
      channel = supabase!
        .channel('bookmarks-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'bookmarks',
            filter: `user_id=eq.${userId}`,
          },
          (payload) => {
            if (payload.eventType === 'INSERT') {
              setBookmarks((prev) => [payload.new, ...prev]);
            } else if (payload.eventType === 'DELETE') {
              setBookmarks((prev) =>
                prev.filter((b) => b.id !== payload.old.id)
              );
            } else if (payload.eventType === 'UPDATE') {
              setBookmarks((prev) =>
                prev.map((b) => (b.id === payload.new.id ? payload.new : b))
              );
            }
          }
        )
        .subscribe();
    };

    init();

    return () => {
      if (channel) {
        supabase!.removeChannel(channel);
      }
    };
  }, [router]);

  const addBookmark = async () => {
    if (!title || !url) return;
    if (!supabase) {
      alert('Supabase is not configured.');
      return;
    }
    let formattedUrl = url.trim();
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = 'https://' + formattedUrl;
    }
    const { error } = await supabase.from('bookmarks').insert([
      {
        title,
        url: formattedUrl,
        user_id: user?.id,
      },
    ]);

    if (!error) {
      // Clear inputs; the new bookmark will arrive via Realtime
      setTitle('');
      setUrl('');
    } else {
      alert(error.message);
    }
  }

  const logout = async () => {
    if (!supabase) {
      alert('Supabase is not configured.')
      return
    }
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="flex flex-col items-center">
          <span className="animate-spin text-blue-600 dark:text-blue-400 text-5xl mb-4">🔄</span>
          <p className="text-lg text-slate-600 dark:text-slate-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 mb-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Dashboard</h1>
              <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">Manage your bookmarks</p>
            </div>
            <button 
              onClick={logout} 
              className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-medium shadow-md hover:from-red-600 hover:to-red-700 transition-all transform hover:scale-105 active:scale-95"
            >
              Logout
            </button>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-slate-700 dark:to-slate-600 p-6 rounded-xl border border-blue-200 dark:border-slate-600">
            <h2 className="text-lg font-semibold mb-4 text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <span className="text-xl">➕</span> Add New Bookmark
            </h2>
            <input
              type="text"
              placeholder="Bookmark Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full mb-3 p-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
            />
            <input
              type="url"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full mb-4 p-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
            />
            <button
              onClick={addBookmark}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 rounded-lg font-semibold shadow-md hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 active:scale-95"
            >
              Add Bookmark
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
            <span className="text-2xl">📚</span> Your Bookmarks
          </h2>
          {bookmarks.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 text-center">
              <span className="text-6xl mb-4 block">📖</span>
              <p className="text-slate-500 dark:text-slate-400">No bookmarks yet. Add your first one above!</p>
            </div>
          ) : (
            bookmarks.map((bookmark) => (
              <div
                key={bookmark.id}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5 rounded-xl shadow-md hover:shadow-xl transition-all transform hover:scale-[1.02] group flex flex-col md:flex-row md:items-center md:justify-between gap-4"
              >
                <div>
                  <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-100 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{bookmark.title}</h3>
                  <a
                    href={bookmark.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 text-sm hover:text-purple-600 dark:hover:text-purple-400 transition-colors break-all flex items-center gap-2"
                  >
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    {bookmark.url}
                  </a>
                </div>
                <button
                  onClick={async () => {
                    if (!window.confirm('Are you sure you want to delete this bookmark?')) return;
                    if (!supabase) {
                      alert('Supabase is not configured.');
                      return;
                    }
                    const { error } = await supabase
                      .from('bookmarks')
                      .delete()
                      .eq('id', bookmark.id);
                    if (!error) {
                      setBookmarks(bookmarks.filter(b => b.id !== bookmark.id));
                    } else {
                      alert(error.message);
                    }
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-medium shadow-md hover:from-red-600 hover:to-red-700 transition-all transform hover:scale-105 active:scale-95"
                >
                  Delete
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}