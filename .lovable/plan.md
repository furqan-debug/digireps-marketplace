

## Plan: Database Indexes + Advanced Features

### Step 1 — Add performance indexes (migration)
Create indexes on all frequently queried foreign keys:
- `orders(client_id)`, `orders(freelancer_id)`, `orders(category_id)`, `orders(status)`
- `messages(order_id)`, `messages(sender_id)`
- `ratings(reviewee_id)`, `ratings(reviewer_id)`, `ratings(order_id)`
- `profiles(user_id)` — already unique, but confirm index exists
- `violations(user_id)`, `violations(order_id)`
- `freelancer_services(freelancer_id)`, `freelancer_services(category_id)`
- `portfolio_items(freelancer_id)`

### Step 2 — Add `is_read` to messages (migration)
- `ALTER TABLE messages ADD COLUMN is_read boolean DEFAULT false`
- Update types will auto-regenerate
- Update OrderDetail chat UI to show unread indicators and mark messages as read when viewed

### Step 3 — Create `order_milestones` table (migration)
```sql
CREATE TABLE public.order_milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  title text NOT NULL,
  amount numeric NOT NULL,
  due_date timestamptz,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);
```
- Add RLS: participants + admin can view; client creates; participants update status
- Wire into OrderDetail page with milestone progress UI

### Step 4 — Create `disputes` table (migration)
```sql
CREATE TABLE public.disputes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  opened_by uuid NOT NULL,
  reason text NOT NULL,
  admin_resolution text,
  status text DEFAULT 'open',
  created_at timestamptz DEFAULT now(),
  resolved_at timestamptz
);
```
- Add RLS: participants + admin can view; participants can open; admin resolves
- Add dispute UI in OrderDetail for clients to open disputes and admin to resolve

### Step 5 — Create `platform_settings` table (migration)
Single-row settings table for global commission rate and other platform config:
```sql
CREATE TABLE public.platform_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  commission_rate numeric NOT NULL DEFAULT 10.00,
  updated_at timestamptz DEFAULT now()
);
```
- Lock `commission_rate` on orders table via a trigger that copies from `platform_settings` on INSERT (preventing manual override)
- Admin-only RLS

### Step 6 — Update frontend components
- **OrderDetail**: Add milestone section, dispute button, unread message badges
- **Admin pages**: Add dispute management view, platform settings page
- **Types**: Will auto-update after migrations

### What is NOT needed (already exists)
- ON DELETE rules — all present
- Unique constraints on ratings and freelancer_services — already exist
- Updated_at triggers — already on profiles and orders
- Soft delete — current RLS already restricts deletion to admin-only, which is equivalent protection

