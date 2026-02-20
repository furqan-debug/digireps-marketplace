

# High-End Profile Creation Engine

## Overview

This plan introduces a structured profile creation wizard, automatic timezone detection, LinkedIn-style experience/certification modules, real-time activity status tracking, and an advanced search UI for clients to discover talent by verified credentials and availability.

---

## 1. Database Changes

### New columns on `profiles` table
- `headline` (text, nullable) — A short professional title like "Senior Full-Stack Engineer"
- `last_active_at` (timestamptz, default now()) — Tracks real-time activity for online/away/offline status
- `certifications` (jsonb, default '[]') — Array of structured certification objects

Each certification object follows this structure:
```text
{
  "name": "AWS Solutions Architect",
  "issuer": "Amazon Web Services",
  "year": 2024,
  "verified": false
}
```

### Why JSONB instead of a separate table
Certifications are tightly coupled to the profile, rarely queried independently, and the array is small (typically under 20 items). JSONB avoids JOIN overhead and keeps the profile fetch as a single query. Admin can mark items as `verified: true` in the future.

### Activity tracking
A lightweight approach: update `last_active_at` on the client side every 5 minutes while the user has the app open. No cron job or realtime channel needed — just a `setInterval` in the AuthProvider that calls a single UPDATE.

---

## 2. Auto Timezone Detection

Use the browser's `Intl.DateTimeFormat().resolvedOptions().timeZone` API (e.g., returns "America/New_York") to:
- **On signup**: Automatically set the timezone in the profile via the `handle_new_user` trigger (passed as user metadata), removing the need for manual input.
- **On profile edit**: Pre-fill the timezone field with the detected value if it's currently empty. Show it as a read-only display with a "Change" toggle for manual override.

---

## 3. Multi-Step Profile Creation Wizard (Freelancers)

Replace the current monolithic EditProfile form with a guided 4-step wizard that appears when a freelancer's profile is incomplete (no bio, no skills, no categories selected). The wizard is a single page component with step navigation — not separate routes.

### Steps:
1. **Identity** — Display name, headline, country (auto-detected timezone shown)
2. **Expertise** — Skills input (tag-based), experience years, marketplace segments (categories)
3. **Credentials** — Certifications module (add/remove structured entries: name, issuer, year)
4. **Portfolio** — Upload images, add titles/descriptions
5. **Review and Submit** — Preview card + submit application button

Each step validates before allowing progression. Progress bar at the top shows completion.

If the profile is already complete (returning freelancer), they see the current two-column edit layout with the new fields integrated.

---

## 4. LinkedIn-Style Credentials Module

A dedicated section in the profile editor and public profile view:
- Each certification is a card showing: name, issuer, year
- Admin-verified certifications get a blue checkmark badge
- "Add Certification" button opens an inline form with 3 fields
- Certifications display on the public FreelancerProfile page in a dedicated "Verified Credentials" section

---

## 5. Activity Status System

### How it works:
- AuthProvider runs a `setInterval` (every 5 minutes) that updates `profiles.last_active_at = now()` for the current user
- On `visibilitychange` (tab becomes visible again), immediately update
- On sign out or tab close, stop the interval

### Status logic (computed client-side from `last_active_at`):
- **Online** (green dot): last active within 5 minutes
- **Away** (amber dot): last active 5-30 minutes ago
- **Offline** (gray dot): last active more than 30 minutes ago

### Where it appears:
- Freelancer cards on the Discover page (small colored dot next to avatar)
- FreelancerProfile hero section (status pill next to name)
- Identity Preview sidebar on EditProfile

---

## 6. Enhanced Search UI for Clients (Discover Page)

Upgrade the Discover page with:
- **Text search bar**: Filters freelancers by display_name, headline, bio, or skills (client-side filtering on the loaded result set for simplicity)
- **Filter chips**: "Online Now", "Pro+", "Elite Only", experience range
- **Sort options**: "Highest Rated", "Most Experienced", "Recently Active"
- **Real-time availability indicators** on every freelancer card
- **Credential badges** shown on cards when a freelancer has verified certifications

The search bar is prominently placed at the top of the page with a glassmorphism style, replacing the current category-only navigation.

---

## Files to Change

### Database
- **Migration**: Add `headline`, `last_active_at`, `certifications` columns to `profiles`

### Backend (AuthContext)
- `src/contexts/AuthContext.tsx` — Add `last_active_at` heartbeat interval, add timezone auto-detection on signup, update Profile interface with new fields

### Profile Creation / Edit
- `src/pages/freelancer/EditProfile.tsx` — Major rewrite: add step wizard for new profiles, integrate certifications module, auto-timezone, headline field
- `src/pages/Auth.tsx` — Pass detected timezone as user metadata during signup

### Discovery / Public Profile
- `src/pages/client/Discover.tsx` — Add search bar, filter chips, sort controls, activity status dots, credential badges on cards
- `src/pages/client/FreelancerProfile.tsx` — Add activity status pill, credentials section, headline display

### Shared Utilities
- `src/lib/activity-status.ts` (new) — Helper to compute online/away/offline from a timestamp, shared across components

---

## Technical Details

### Timezone detection code
```text
const detectedTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
// Returns e.g. "Europe/London", "America/New_York"
```

### Activity heartbeat (in AuthProvider)
```text
useEffect(() => {
  if (!user) return;
  const beat = () => supabase.from("profiles")
    .update({ last_active_at: new Date().toISOString() })
    .eq("user_id", user.id);
  
  beat(); // immediate
  const interval = setInterval(beat, 5 * 60 * 1000);
  
  const onVisible = () => {
    if (document.visibilityState === "visible") beat();
  };
  document.addEventListener("visibilitychange", onVisible);
  
  return () => {
    clearInterval(interval);
    document.removeEventListener("visibilitychange", onVisible);
  };
}, [user]);
```

### Certification JSONB structure
```text
[
  { "name": "PMP", "issuer": "PMI", "year": 2023, "verified": false },
  { "name": "AWS SAA", "issuer": "Amazon", "year": 2024, "verified": true }
]
```

### Activity status helper
```text
export function getActivityStatus(lastActiveAt: string | null) {
  if (!lastActiveAt) return { status: "offline", color: "bg-gray-400", label: "Offline" };
  const diff = Date.now() - new Date(lastActiveAt).getTime();
  const mins = diff / 60000;
  if (mins < 5) return { status: "online", color: "bg-emerald-500", label: "Online" };
  if (mins < 30) return { status: "away", color: "bg-amber-500", label: "Away" };
  return { status: "offline", color: "bg-gray-400", label: "Offline" };
}
```

