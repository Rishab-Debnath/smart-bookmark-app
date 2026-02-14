Smart Bookmark App

I built this project all using the Next.js, App Router and Supabase and understand how modern full-stack apps handle authentication, secure user-specific data, and real-time updates.

The idea is simple:
    A clean bookmark manager where users can log in with Google, save links, and see their bookmarks update instantly, even across multiple tabs, without refreshing the page.

Tech Stack:
    Next.js (App Router)
    Supabase
    Authentication (Google OAuth)
    PostgreSQL Database
    Row Level Security (RLS)
    Realtime subscriptions
    Tailwind CSS
    Vercel (Deployment)
    Google Cloud Console (OAuth configuration)

Database Setup

Database: Smart Bookmark App
Table: bookmarks

Columns:
    id – uuid (primary key)
    user_id – uuid
    title – text
    url – text
    created_at – timestamp

Row Level Security (RLS)

To ensure users can only access their own bookmarks, I enabled Row Level Security on the bookmarks table.

Policy applied:
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id)

This ensures:
    Users can only read their own bookmarks
    Users can only insert bookmarks tied to their own user_id
    No user can access or modify another user’s data

Authentication Setup

I enabled Google OAuth inside Supabase and configured:

    Supabase Authentication → Providers → Google
    Google Cloud Console:
        Created OAuth 2.0 Client ID
        Application Type: Web Application
        Added:
            Authorized JavaScript Origins
            Authorized Redirect URIs
    Added Client ID and Secret back into Supabase

After setup, I verified login worked locally before continuing.

Features:
    Google Sign In
    Logout
    Protected Dashboard Route
    Add bookmark
    Delete bookmark
    URL auto-formatting (adds https:// if missing)
    Real-time updates
    Multi-tab sync without page refresh

Realtime Implementation

This was one of the most interesting parts.
I enabled Realtime for the bookmarks table in Supabase.

It listens for:
    INSERT
    DELETE
    UPDATE

Whenever something changes, state updates immediately no manual refresh required.
If you open two tabs and add/delete a bookmark, both update instantly.

----------------------------------------------------------------------------------------------------

⚠️ Problems I Ran Into (And How I Solved Them) ⚠️
This project was not smooth from start to finish. Here are the real issues I faced.

1. Multi-Tab Realtime Sync Was Not Working

Problem:
Bookmarks were adding correctly, but changes weren’t updating in other tabs unless I refreshed.

Why it happened:
Realtime wasn’t properly enabled for the table, and the subscription logic wasn’t filtering correctly by user.

Solution:
    Enabled Realtime explicitly for the bookmarks table in Supabase.
    Used:
        filter: user_id=eq.${userId}
    Properly handled INSERT, DELETE, and UPDATE events in the state.

After this, multi-tab sync worked perfectly.

2. OAuth Working Locally But Not in Production

Problem:
After deploying to Vercel, Google login failed.

Why it happened:
OAuth requires exact domain matching. Production URLs were not added in:
    Google Cloud Console
    Supabase Authentication → URL configuration

Solution:

I updated:
    Authorized JavaScript Origins (Google Console)
    Authorized Redirect URIs
    Supabase Site URL
    Supabase Redirect URLs

Once all production URLs were correctly configured, OAuth started working on Vercel.

This taught me how strict OAuth configuration really is.

3. Environment Variables Not Working on Deployment

Problem:
Supabase client wasn’t initializing in production.

Why it happened:
Environment variables were only set locally (.env.local) but not added to Vercel.

Solution:

Added the following in Vercel dashboard:
    NEXT_PUBLIC_SUPABASE_URL
    NEXT_PUBLIC_SUPABASE_ANON_KEY

Redeployed → fixed.

-------------------------------------------------------------------------------------

What I Learned
    OAuth requires exact domain configuration
    RLS is essential for real user data protection
    Realtime needs both backend enablement and correct frontend subscription
    Environment variables must be configured separately in production
    App Router + client components require careful auth handling