

# Curated Freelance Marketplace MVP

## Overview
A controlled, quality-first freelance marketplace where clients are matched with vetted freelancers through a service-first discovery flow. No open search, no external contact sharing — all communication and payments stay on-platform.

---

## Phase 1: Foundation — Auth, Roles & Profiles

### Authentication & Roles
- Email/password signup and login for all users
- Three roles: **Client**, **Freelancer**, **Admin**
- Role assigned at signup (client vs freelancer application) with admin role managed separately
- Role-based route protection throughout the app

### Client Profile
- Name, company (optional), country/timezone
- Simple onboarding after signup

### Freelancer Application & Profile
- Freelancers apply with: name/alias, country/timezone, skills, years of experience, a short bio
- Status: **pending → approved / rejected** (admin decides)
- Once approved, freelancer completes profile visible to clients:
  - First name or alias only
  - Country/timezone, skills, experience years
  - Verified badge + level (verified/pro/elite)
  - Rating display

### Admin Panel (Users)
- View all freelancer applications
- Approve or reject freelancers
- Suspend any user (client or freelancer)

---

## Phase 2: Services, Discovery & Portfolio

### Service Categories
- 5 preset categories: **Web Development, UI/UX Design, Video Editing, Copywriting, Mobile Development**
- Seeded in the database, not editable in MVP

### Portfolio System
- Freelancers upload portfolio images to platform storage (Supabase Storage)
- No external links allowed — images hosted on-platform only
- Portfolio images displayed on freelancer's limited profile

### Client Discovery Flow
- Client selects a **service category**
- Optionally sets **budget range** and **timeline**
- System returns **top 5–10 approved freelancers** for that service, sorted by level and rating
- No search bar, no browsing — service-first only
- Client sees the limited profile (no email, phone, links)

---

## Phase 3: Project Briefs & Orders

### Project Brief Submission
- Client selects a freelancer and submits a project brief:
  - Title, description, budget (minimum $100), deadline
- Brief sent to freelancer as a project invitation

### Order Lifecycle
- **Statuses**: pending → accepted → in_progress → delivered → completed / disputed
- Freelancer accepts or declines the brief
- On acceptance, client "pays" → simulated escrow (money held status in DB)
- Freelancer marks as delivered
- Client approves → escrow released (simulated), order completed
- Platform commission percentage tracked in the order record

### Refund Rules (Simulated)
- Admin can trigger refund if freelancer fails to deliver or misses deadline
- Refund status tracked in orders table

---

## Phase 4: Real-Time Chat with Anti-Bypass

### Chat System
- Real-time messaging between client and freelancer per project/order
- Built on Supabase Realtime subscriptions
- Messages stored in database with sender, timestamp, content

### Anti-Bypass Rules (enforced server-side via Edge Function)
- Before saving a message, scan content for:
  - Email patterns
  - Phone number patterns
  - URLs
  - Blocked words: gmail, whatsapp, telegram, instagram, skype, discord, etc.
- If violation detected:
  - Message is **blocked** (not sent)
  - Warning shown: *"Sharing contact info is against platform rules."*
  - Violation logged in a violations table
- **3 violations → automatic account suspension**

---

## Phase 5: Ratings & Freelancer Levels

### Rating System
- After order completion, both client and freelancer leave a rating (1–5 stars) and optional review text
- Ratings displayed on freelancer profile
- Average rating calculated and shown

### Freelancer Levels
- **Verified** (default on approval)
- **Pro** — after 5+ completed jobs, 4.5+ avg rating, no violations
- **Elite** — after 15+ completed jobs, 4.8+ avg rating, fast response time, no violations
- Level upgrades managed by admin in MVP (not auto-calculated)

---

## Phase 6: Admin Panel (Full)

### Admin Dashboard
- **Freelancer management**: approve/reject applications, suspend users, upgrade levels
- **Order oversight**: view all orders, trigger refunds
- **Violation log**: view all chat violations, see user violation counts
- **Service categories**: view active categories
- **User list**: view all clients and freelancers, suspension controls

---

## Security & Access Rules

- **Freelancer profiles**: clients never see email, phone, external links, or social media
- **Chat messages**: validated server-side before storage; violations blocked
- **Row-Level Security**: every table has RLS policies ensuring users only access their own data; admins access everything via a secure role-check function
- **Freelancer visibility**: only approved freelancers appear in discovery
- **Budget minimum**: $100 enforced on project brief submission

---

## Pages Summary

| Page | Who sees it |
|------|------------|
| Landing / Home | Everyone |
| Login / Signup | Everyone |
| Client Dashboard | Client |
| Service Selection + Freelancer Results | Client |
| Freelancer Profile (limited view) | Client |
| Submit Project Brief | Client |
| My Orders | Client & Freelancer |
| Order Detail + Chat | Client & Freelancer |
| Freelancer Dashboard | Freelancer |
| Freelancer Application | Freelancer (pre-approval) |
| Edit My Profile + Portfolio | Freelancer |
| Admin Dashboard | Admin |
| Admin: Freelancer Applications | Admin |
| Admin: Users | Admin |
| Admin: Orders | Admin |
| Admin: Violations | Admin |

