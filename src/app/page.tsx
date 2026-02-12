'use client'

import { supabase } from '@/lib/supabaseClient'

export default function Home() {
  const handleLogin = async () => {
    if (!supabase) {
      alert('Supabase is not configured. Check your environment variables in .env.local and restart the dev server.');
      return;
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });

    if (error) {
      console.error(error);
      alert(error.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded-xl shadow-md text-center">
        <h1 className="text-2xl font-bold mb-6">
          Smart Bookmark App
        </h1>

        <button
          onClick={handleLogin}
          className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800"
        >
          Sign in with Google
        </button>
      </div>
    </div>
  );
}