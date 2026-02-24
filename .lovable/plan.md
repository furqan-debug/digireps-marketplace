
# Add Depth, Content & Missing Pages

## Overview

After auditing the platform against Toptal, Upwork, Fiverr, and Freelancer.com, the following gaps were identified. This plan adds 4 new pages and enriches 3 existing pages with meaningful content sections -- making the platform feel complete for both clients and freelancers.

---

## New Pages

### 1. How It Works (`/how-it-works`) -- Public Page

A dedicated public page (accessible without login) that explains the platform process for both audiences. Inspired by Toptal's "Why Toptal" and Fiverr's "How Fiverr Works" pages.

**Content sections:**
- Hero: "How DigiReps Works" with two-path CTA (Hire Talent / Join as Freelancer)
- **For Clients** -- 4-step visual process:
  1. Browse vetted talent by category
  2. Review profiles, portfolios, and ratings
  3. Submit a project brief with budget and timeline
  4. Collaborate securely, approve delivery, release payment
- **For Freelancers** -- 4-step visual process:
  1. Apply and complete your profile
  2. Get vetted and approved by the DigiReps team
  3. Receive project briefs from clients
  4. Deliver work, get rated, earn payment
- FAQ accordion section (6-8 common questions)
- Bottom CTA banner

**Route:** `/how-it-works` (public, no auth required)

---

### 2. Client Settings (`/client/settings`)

Clients currently have no way to edit their own profile info (name, company, avatar). This page adds that.

**Content:**
- Edit display name
- Edit company name
- Upload/change avatar
- View account email (read-only)
- View timezone (auto-detected, read-only)
- Save button

**Route:** `/client/settings` (client role required)
**Nav:** Add "Settings" link to client navigation in AppShell

---

### 3. Freelancer Earnings (`/freelancer/earnings`)

A page showing the freelancer's financial overview -- completed orders, total earned, and payment history. Data is derived from the existing `orders` table (completed orders with budget values).

**Content:**
- Summary cards: Total Earned (sum of completed order budgets), Completed Projects count, Average Project Value
- Payment history table: lists all completed orders with title, client (masked), budget amount, completion date
- Empty state if no completed orders

**Route:** `/freelancer/earnings` (freelancer role required)
**Nav:** Add "Earnings" link to freelancer navigation in AppShell

---

### 4. Help / FAQ (`/help`) -- Public Page

A support/FAQ page accessible to everyone. Answers common questions and provides contact info.

**Content:**
- Search bar (filters FAQ items client-side)
- FAQ sections using accordion component:
  - **For Clients:** How do I hire? What is escrow? How do I dispute?
  - **For Freelancers:** How do I apply? How long is review? How do I get paid?
  - **General:** Is my data secure? How do I contact support? What are the fees?
- Contact support section with email link

**Route:** `/help` (public, no auth required)

---

## Enriching Existing Pages

### 5. Landing Page (`src/pages/Index.tsx`) -- Add Depth

Currently thin -- just hero, stats, how-it-works, benefits, categories, CTA, and footer. Compared to competitors, it lacks social proof and dual-audience messaging.

**New sections to add (between existing sections):**
- **Testimonials section** (after benefits): 3 testimonial cards with name, role, quote, and star rating. Uses static placeholder data.
- **For Clients vs For Freelancers** split section (before CTA): Two-column layout explaining value for each audience, each with its own CTA button.
- **Trusted By logos** row (after hero stats): Simple row of company name text badges (e.g., "TechCorp", "DesignLab", "StartupXYZ") as placeholder social proof.

---

### 6. Client Dashboard (`src/pages/ClientDashboard.tsx`) -- Add Widgets

Currently shows only stats + 2 action cards. Feels empty compared to Upwork's client home.

**New sections:**
- **Recent Orders** widget: Show last 3 orders with title, status badge, and "View" link. Fetched from Supabase.
- **Recommended Action** card: Contextual nudge -- "You have 0 active projects. Start by finding talent." or "You have a delivery waiting for review."

---

### 7. Freelancer Dashboard (`src/pages/FreelancerDashboard.tsx`) -- Add Widgets

Currently shows status banners + stats + sidebar. Missing earnings info and reviews.

**New sections (for approved freelancers only):**
- **Earnings Summary** card: Total earned from completed orders (sum of budgets). Shows in the performance grid.
- **Recent Reviews** widget: Last 2-3 ratings received, showing star count and review text. Fetched from `ratings` table.

---

## Routing & Navigation Changes

### App.tsx -- New Routes
```text
/how-it-works     -> HowItWorks (public)
/help             -> Help (public)
/client/settings  -> ClientSettings (client role)
/freelancer/earnings -> FreelancerEarnings (freelancer role)
```

### AppShell.tsx -- Nav Updates
- Client nav: Add "Settings" item with User icon pointing to `/client/settings`
- Freelancer nav: Add "Earnings" item with DollarSign icon pointing to `/freelancer/earnings`
- Footer: Update "Terms of Service" and "Privacy Policy" links to point to `/help`

### Landing Page Nav
- Add "How It Works" link in the header nav bar (next to Sign In)
- Add "How It Works" and "Help" links in the footer

---

## Files Changed Summary

| File | Action | Description |
|------|--------|-------------|
| `src/pages/HowItWorks.tsx` | Create | Public page explaining process for clients and freelancers |
| `src/pages/Help.tsx` | Create | FAQ and support page with accordion |
| `src/pages/client/ClientSettings.tsx` | Create | Client profile editing page |
| `src/pages/freelancer/Earnings.tsx` | Create | Freelancer earnings and payment history |
| `src/App.tsx` | Edit | Add 4 new routes |
| `src/components/AppShell.tsx` | Edit | Add Settings and Earnings nav items, update footer links |
| `src/pages/Index.tsx` | Edit | Add testimonials, dual-audience section, trusted-by logos |
| `src/pages/ClientDashboard.tsx` | Edit | Add recent orders widget and action nudge |
| `src/pages/FreelancerDashboard.tsx` | Edit | Add earnings summary and recent reviews widgets |

---

## Technical Notes

- All new pages use existing UI components (Card, Badge, Button, Accordion) and the AppShell layout
- Earnings are calculated from the `orders` table: `SUM(budget) WHERE freelancer_id = user.id AND status = 'completed'`
- Client Settings updates the `profiles` table (display_name, company fields) using `.eq('user_id', user.id)`
- FAQ data is hardcoded -- no new database tables needed
- Testimonials use static placeholder data -- no new tables needed
- All pages follow existing design patterns (motion animations, dossier-card styling, consistent typography)
