

## Plan: Project Marketplace (Post & Bid)

### Overview
Add a public project board where clients post project briefs and approved freelancers browse and submit bids/comments. All text inputs are scanned for contact info using the same anti-bypass patterns from the existing `send-message` Edge Function.

---

### Step 1 — Database: `projects` table (migration)
```sql
CREATE TABLE public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES service_categories(id),
  title text NOT NULL,
  description text NOT NULL,
  budget numeric NOT NULL CHECK (budget >= 100),
  deadline timestamptz,
  status text NOT NULL DEFAULT 'open',  -- open, closed, awarded
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX idx_projects_client ON projects(client_id);
CREATE INDEX idx_projects_category ON projects(category_id);
CREATE INDEX idx_projects_status ON projects(status);
```
RLS: Anyone authenticated can read open projects. Clients insert/update their own. No delete (admin only).

### Step 2 — Database: `project_bids` table (migration)
```sql
CREATE TABLE public.project_bids (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  freelancer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount numeric NOT NULL CHECK (amount >= 100),
  message text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(project_id, freelancer_id)
);
CREATE INDEX idx_bids_project ON project_bids(project_id);
CREATE INDEX idx_bids_freelancer ON project_bids(freelancer_id);
```
RLS: Approved freelancers can insert their own bid. Project owner + bid owner + admin can view. No edit/delete (admin only).

### Step 3 — Edge Function: `submit-bid`
Reuses the same anti-bypass detection logic from `send-message` to scan both the bid message and project descriptions before saving. Blocks and logs violations if contact info is detected.

### Step 4 — Edge Function: `post-project`
Scans project title and description for contact info before inserting into the `projects` table. Blocks if violations detected.

### Step 5 — Frontend: Client "Post a Project" page
- New page at `/client/projects/new` with form: title, description, category, budget ($100 min), deadline
- Styled consistently with existing `SubmitBrief` page design
- Add "Post Project" link to `clientNav` in AppShell

### Step 6 — Frontend: Project Board (browse page)
- New page at `/freelancer/projects` — lists all open projects with category filter, search, and sort
- Each card shows: title, budget, category, deadline, bid count, client first name
- Add "Projects" link to `freelancerNav` in AppShell

### Step 7 — Frontend: Project Detail + Bid submission
- New page at `/projects/:projectId` (shared route, accessible to client owner + freelancers)
- Shows full project details, existing bids (visible to project owner), and bid form (for freelancers)
- Freelancer bid form: amount + message, submitted via `submit-bid` Edge Function
- Client view: sees all bids with freelancer name/level/rating, can click to view profile or "Award" (creates an order and closes the project)

### Step 8 — Add nav links
- Client nav: add "Post Project" item
- Freelancer nav: add "Projects" item

---

### Safety enforcement
- **Post-project Edge Function**: scans title + description for emails, phones, URLs, blocked words, social engineering phrases
- **Submit-bid Edge Function**: scans bid message with identical patterns
- Both log violations to the existing `violations` table and count toward the 3-strike suspension
- Client-side validation also rejects obvious patterns before submission (defense in depth)
- No freelancer contact info is exposed on bid cards (only display name, level, rating)

### Technical approach
- 2 new database tables with RLS
- 2 new Edge Functions (reusing anti-bypass logic)
- 3 new frontend pages + nav updates
- Types auto-regenerate after migration

