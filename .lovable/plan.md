

# Freelancer Profile Creation and Manual Verification Workflow -- Full Upgrade

## Overview

This upgrade adds new application statuses (draft, submitted, under_review, revision_required, suspended), structured work experience/education/languages as JSONB columns, pricing/availability fields, admin feedback with revision workflow, profile completeness scoring, verified badge UI, and admin-only field protection via a database trigger.

---

## Phase 1: Database Migration

A single migration that performs the following:

### 1.1 Extend `application_status` enum
Add four new values:
- `draft`
- `submitted`
- `under_review`
- `revision_required`
- `suspended`

### 1.2 New columns on `profiles`
| Column | Type | Default |
|--------|------|---------|
| `work_experience` | jsonb | `'[]'` |
| `education` | jsonb | `'[]'` |
| `languages` | jsonb | `'[]'` |
| `availability_status` | text | `'available'` |
| `preferred_pricing_model` | text | null |
| `response_time_expectation` | text | null |
| `admin_feedback` | text | null |
| `profile_completion_score` | integer | 0 |

### 1.3 Admin field protection trigger
Create a `protect_admin_fields()` trigger function that fires BEFORE UPDATE on `profiles`. If the caller is NOT admin (checked via `is_admin()`), the trigger silently resets these fields to their OLD values:
- `application_status`
- `is_suspended`
- `freelancer_level`
- `admin_feedback`

This prevents non-admin users from escalating their own status while keeping the existing RLS policy intact.

### 1.4 Profile completeness function and trigger
Create `calculate_profile_completeness()` that computes a 0-100 score:

| Field | Points |
|-------|--------|
| display_name filled | 10 |
| avatar_url filled | 10 |
| bio >= 50 chars | 15 |
| headline filled | 5 |
| skills >= 3 items | 15 |
| At least 1 work_experience entry | 15 |
| At least 1 education entry | 5 |
| At least 1 language entry | 5 |
| At least 1 certification entry | 5 |
| At least 1 portfolio item (subquery) | 15 |

A trigger `update_profile_completeness` runs BEFORE INSERT OR UPDATE on `profiles` to auto-calculate and store the score.

---

## Phase 2: Fix Build Errors + Update Types

### 2.1 Fix PortfolioItem type errors
The build errors are caused by `project_data: Json` not being assignable to `any[]`. Fix by casting in both `FreelancerProfile.tsx` (line 74) and `EditProfile.tsx` (line 177) -- cast `portfolioRes.data` with `as unknown as PortfolioItem[]`.

### 2.2 Update `types.ts`
Update the `application_status` enum to include the new values. Add the new profile columns to the Row/Insert/Update types.

### 2.3 Update `AuthContext.tsx` Profile interface
Add: `work_experience`, `education`, `languages`, `availability_status`, `preferred_pricing_model`, `response_time_expectation`, `admin_feedback`, `profile_completion_score`.
Update `application_status` union type to include new statuses.

---

## Phase 3: Wizard Restructure (EditProfile.tsx)

Expand from 5 steps to 8:

1. **Identity** -- Name, headline, photo, country, timezone (existing, unchanged)
2. **Expertise and Summary** -- Skills, categories, experience years, bio (existing, unchanged)
3. **Work Experience** -- Add/remove structured entries (title, company, description, start_year, end_year, is_current)
4. **Education and Certifications** -- Education entries (degree, institution, year) + existing certifications module
5. **Languages** -- Add/remove language + proficiency level (native/fluent/conversational/basic)
6. **Pricing and Availability** -- Hourly rate, preferred pricing model, availability status, response time expectation
7. **Portfolio** -- Existing functionality preserved
8. **Review and Submit** -- Completeness checklist with blocking/warning validation, submit button

### Pre-submission validation (on Review step):
**Blocking (prevents submission):**
- Display name required
- Bio >= 50 characters
- >= 3 skills
- >= 1 service category
- >= 1 work experience OR experience_years >= 2
- Profile completion score >= 60%

**Warnings (shown but non-blocking):**
- Profile photo
- Education entries
- Certifications
- Languages
- >= 1 portfolio item

### Save logic update
`handleSaveProfile` will include the new JSONB fields: `work_experience`, `education`, `languages`, `availability_status`, `preferred_pricing_model`, `response_time_expectation`.

---

## Phase 4: Admin Review Enhancements (Applications.tsx)

### 4.1 New status badges
Add to `STATUS_BADGE` config:
- `submitted` -- blue/info
- `under_review` -- indigo
- `revision_required` -- amber with feedback icon
- `suspended` -- red/destructive

### 4.2 New action buttons
For each applicant card, show contextual buttons:
- **Submitted**: "Start Review" (sets `under_review`), "Approve", "Reject"
- **Under Review**: "Approve", "Request Revision", "Reject", "Suspend"
- **Revision Required**: "Approve", "Reject"
- **Approved**: "Suspend"

### 4.3 Admin feedback
When clicking "Request Revision" or "Suspend", a textarea appears for the admin to type feedback. This saves to `admin_feedback` along with the status change.

### 4.4 Richer applicant cards
Display additional fields: headline, work_experience count, languages, hourly_rate, profile_completion_score (as a small progress bar).

---

## Phase 5: Freelancer Dashboard Updates (FreelancerDashboard.tsx)

### 5.1 New status banners
Add to `STATUS_CONFIG`:
- `submitted` -- blue, "Profile Submitted"
- `under_review` -- indigo, "Under Review"
- `revision_required` -- amber, "Revision Required" with admin feedback displayed
- `suspended` -- red, "Account Suspended" with admin feedback

### 5.2 Revision Required banner
Shows the admin feedback text and a "Revise Profile" CTA button that navigates to EditProfile.

### 5.3 Suspended banner
Shows the admin feedback and a support contact note. No edit access.

### 5.4 Profile completeness bar
Display `profile_completion_score` from the profile in the sidebar card.

---

## Phase 6: Verified Badge

### 6.1 Helper utility
New file `src/lib/verified-badge.ts`:
```text
Criteria: application_status === 'approved' 
          AND !is_suspended 
          AND profile_completion_score >= 80
```
Returns `{ isVerified, label, icon }`.

### 6.2 Badge UI
A small blue shield icon (ShieldCheck from lucide) with "Verified" text. Appears on:
- Freelancer cards in Discover page (next to name)
- FreelancerProfile hero section
- Admin applicant cards

---

## Phase 7: Discovery and Public Profile Enhancements

### 7.1 Discover.tsx
- Add verified badge on freelancer cards
- Add "Verified" filter chip
- Add "Available Now" filter chip (checks `availability_status === 'available'`)
- Show response time on cards when available
- Show language count/badges on cards
- Fetch new fields: `availability_status`, `languages`, `response_time_expectation`, `profile_completion_score`

### 7.2 FreelancerProfile.tsx
- Add verified badge in hero section
- Add **Work Experience** section with timeline layout
- Add **Education** section
- Add **Languages** section with proficiency badges
- Show availability status and hourly rate in sidebar
- Show response time indicator
- Show pricing model preference

---

## Files Summary

| File | Action | Description |
|------|--------|-------------|
| New migration SQL | Create | Enum changes, new columns, triggers, completeness function |
| `src/integrations/supabase/types.ts` | Edit | Add new enum values, new profile columns |
| `src/contexts/AuthContext.tsx` | Edit | Expand Profile interface with new fields |
| `src/pages/freelancer/EditProfile.tsx` | Major edit | 8-step wizard, work history/education/languages/pricing steps, validation |
| `src/pages/FreelancerDashboard.tsx` | Edit | New status banners, revision feedback, completeness bar |
| `src/pages/admin/Applications.tsx` | Edit | New action buttons, feedback textarea, richer cards |
| `src/pages/client/Discover.tsx` | Edit | Verified badge, availability filter, language badges |
| `src/pages/client/FreelancerProfile.tsx` | Edit | Work experience timeline, education, languages, verified badge, fix build error |
| `src/lib/verified-badge.ts` | Create | Verified badge helper |
| `src/lib/activity-status.ts` | No change | Already complete |

---

## Technical Notes

- `ALTER TYPE ... ADD VALUE` is non-reversible in PostgreSQL -- standard and safe for enum extension.
- The `protect_admin_fields()` trigger uses `is_admin()` which internally calls `auth.uid()`. Non-admins silently have sensitive fields reset to OLD values without breaking the UPDATE.
- Profile completeness is materialized as an integer column updated by trigger, avoiding runtime computation on every read.
- All new data uses JSONB columns on `profiles` consistent with existing `certifications` pattern. Arrays are small (< 20 items each).
- No new npm dependencies required.
- No routing changes needed -- wizard steps are purely frontend state.

