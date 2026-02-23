

# Fix Freelancer Onboarding Flow -- Complete Overhaul

## Critical Bugs Found

### Bug 1: Application submission silently fails (SHOWSTOPPER)
The `protect_admin_fields` database trigger blocks ALL non-admin users from changing `application_status`. When a freelancer clicks "Submit for Verification", the trigger resets the status back to its old value. The submission appears to succeed but nothing actually changes.

**Fix:** Update the trigger to allow freelancers to set their OWN status to `submitted` (but nothing else).

### Bug 2: Wrong column in submission query
Line 283 uses `.eq('id', user.id)` but `user.id` is `auth.uid()` which maps to the `user_id` column, not `id`. The update silently matches zero rows.

**Fix:** Change to `.eq('user_id', user.id)`.

### Bug 3: Wizard detection logic is broken
`isNewProfile` checks `!profile?.bio && (!profile?.skills || profile.skills.length === 0)`. If a user saves progress on step 1-2 (name + skills), they get kicked to edit mode and lose the wizard forever -- even though they never submitted.

**Fix:** Base wizard mode on `application_status` being null, `draft`, or `revision_required` instead of content checks.

### Bug 4: Submit button ignores blocking validation
The "Engage Elite Network" button on the Review step has no `disabled` check for `allBlockingPass`. Users can submit incomplete profiles.

**Fix:** Disable the button when blocking requirements are not met.

### Bug 5: Profile completeness score always shows 0
The Review step reads `profile.profile_completion_score` from the database. But since the user hasn't saved yet when they reach Review, it shows 0. The local `calculateProfileStrength` function uses a completely different scoring system than the DB trigger.

**Fix:** Replace the local scoring with a single client-side function that mirrors the DB logic, and use it everywhere consistently.

---

## UX Issues Found

### Issue 1: Confusing button labels
"Execute Next Phase" and "Engage Elite Network" are jargon. Should be "Continue" and "Submit for Review".

### Issue 2: Step labels overflow on mobile
All 8 wizard step names shown horizontally will overflow on small screens.

### Issue 3: No "is_current" toggle for work experience
Users can't mark a job as current -- they have to leave end year blank, which isn't intuitive.

### Issue 4: DOM getElementById pattern is fragile
Work experience, education, and language forms use `document.getElementById` instead of React state. This is error-prone and breaks React conventions.

### Issue 5: Edit mode missing key sections
- No service categories editor
- No experience years field
- Live preview sidebar doesn't show new fields (work experience, languages, pricing)

### Issue 6: No "Save as Draft" in wizard
Users can't save progress and return later without advancing steps.

### Issue 7: Avatar adjust dialog broken in edit mode
The "Adjust Photo" button opens the modal even when there's no preview image to adjust.

---

## Implementation Plan

### Phase 1: Database Migration Fix
Create a new migration to update the `protect_admin_fields` trigger. Allow the profile owner to set `application_status` to `submitted` only (from null, draft, or revision_required).

### Phase 2: Complete EditProfile.tsx Rewrite
This file has accumulated too many intertwined issues to patch individually. A clean rewrite addressing all issues:

**Wizard mode detection:**
- Show wizard when `application_status` is null, `draft`, or `revision_required`
- Show edit mode when `approved`, `submitted`, `under_review`, etc.

**Form state management:**
- Replace all `document.getElementById` patterns with proper React controlled state for work experience, education, and language forms
- Each "add" form gets its own state object

**Unified completeness scoring:**
- Single `calculateCompleteness()` function used everywhere
- Mirrors the DB trigger logic exactly (10 + 10 + 15 + 5 + 15 + 15 + 5 + 5 + 5 + 15 = 100)
- Updates in real-time as user fills fields

**Wizard UX improvements:**
- Step labels: show only current step name on mobile, show dots for progress
- Button labels: "Continue" / "Back" / "Submit for Review"
- "Save Draft" button on every step
- Review step submit button disabled when blocking requirements fail
- "is_current" checkbox on work experience form

**Edit mode improvements:**
- Add service categories section
- Add experience years field
- Live preview shows work experience count, languages, hourly rate, availability
- "Adjust Photo" only available when avatar exists

**Submission fix:**
- Use `.eq('user_id', user.id)` instead of `.eq('id', user.id)`
- Save profile data first, then update status in same call (not separate query)
- Validate blocking requirements before submission

### Phase 3: Minor Dashboard Cleanup
- No code changes needed for FreelancerDashboard.tsx -- it's already well-structured

---

## Files Changed

| File | Action | Description |
|------|--------|-------------|
| New migration SQL | Create | Fix protect_admin_fields trigger to allow self-submission |
| `src/pages/freelancer/EditProfile.tsx` | Major rewrite | Fix all 5 bugs + all 7 UX issues |

---

## Technical Details

### Migration SQL
```text
The trigger will be updated to:
- Allow setting application_status to 'submitted' when the caller owns the profile
  AND the current status is NULL, 'draft', or 'revision_required'
- Continue blocking all other status changes for non-admins
```

### Completeness Score (client-side mirror of DB function)
```text
display_name filled     = 10
avatar_url filled       = 10  
bio >= 50 chars         = 15
headline filled         = 5
skills >= 3             = 15
work_experience >= 1    = 15
education >= 1          = 5
languages >= 1          = 5
certifications >= 1     = 5
portfolio >= 1          = 15
Total                   = 100
```

### Wizard Step Flow (cleaned up)
```text
Step 1: Personal Info (name, headline, photo, location)
Step 2: Expertise (skills, categories, experience, bio)
Step 3: Work Experience (controlled form with is_current toggle)
Step 4: Education & Certifications
Step 5: Languages  
Step 6: Pricing & Availability
Step 7: Portfolio
Step 8: Review & Submit (real-time score, blocking/warning checklist)
```

