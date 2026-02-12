'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [bookmarks, setBookmarks] = useState<any[]>([])
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const router = useRouter()

  useEffect(() => {

    const getUserAndBookmarks = async () => {
      if (!supabase) {
        alert('Supabase is not configured.')
        return
      }
      const { data } = await supabase.auth.getUser()

      if (!data.user) {
        router.push('/')
        return
      }

      setUser(data.user)

      const { data: bookmarksData } = await supabase
        .from('bookmarks')
        .select('*')
        .order('created_at', { ascending: false })

      setBookmarks(bookmarksData || [])
    }

    getUserAndBookmarks()
  }, [router])

  const addBookmark = async () => {
    if (!title || !url) return
    if (!supabase) {
      alert('Supabase is not configured.')
      return
    }
    const { error } = await supabase.from('bookmarks').insert([
      {
        title,
        url,
        user_id: user.id,
      },
    ])

    if (!error) {
      setTitle('')
      setUrl('')
      location.reload()
    } else {
      alert(error.message)
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

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-bold">Dashboard</h1>
          <button onClick={logout} className="text-red-600">
            Logout
          </button>
        </div>

        <div className="mb-6">
          <input
            type="text"
            placeholder="Bookmark Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full mb-3 p-2 border rounded"
          />
          <input
            type="text"
            placeholder="https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full mb-3 p-2 border rounded"
          />
          <button
            onClick={addBookmark}
            className="w-full bg-black text-white p-2 rounded"
          >
            Add Bookmark
          </button>
        </div>

        <div>
          {bookmarks.map((bookmark) => (
            <div
              key={bookmark.id}
              className="border p-3 mb-2 rounded"
            >
              <h2 className="font-semibold">{bookmark.title}</h2>
              <a
                href={bookmark.url}
                target="_blank"
                className="text-blue-600 text-sm"
              >
                {bookmark.url}
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}