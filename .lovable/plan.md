

## Redesign Platform Color Palette

Applying your brand colors across the entire platform:

| Color | Hex | Role |
|-------|-----|------|
| Dark Navy | #223469 | Dark text, dark surfaces, dark mode backgrounds |
| Golden Yellow | #feb415 | Accent color for CTAs, highlights, badges, and attention-grabbing elements |
| Medium Blue | #1d4597 | Primary brand color for buttons, links, active states |
| Light Blue-White | #f2f6fc | Background surfaces, light mode base |

### What Changes

**1. CSS Design Tokens (src/index.css)**
- Light mode: background becomes #f2f6fc-based, primary becomes #1d4597-based blue, accent becomes #feb415 golden yellow, foreground uses #223469 navy
- Dark mode: background uses deep navy (#223469-based), primary becomes lighter blue for contrast, accent stays golden yellow
- Gradients updated: primary gradient goes from #1d4597 to #223469, surface gradient uses #f2f6fc tones
- Sidebar colors updated to match

**2. Tailwind Config (tailwind.config.ts)**
- No structural changes needed -- it already references CSS variables

**3. Landing Page Components**
- **Hero.tsx**: Gradient text uses new blue-to-gold gradient instead of purple. CTA button uses golden yellow accent
- **CTABanner.tsx**: Background gradient uses navy-to-blue instead of purple
- **Benefits.tsx**: Dark section uses navy #223469 background
- **DualAudience.tsx**: Dark card uses navy background
- **ServiceCategories.tsx**: Icon gradient colors remain varied but primary references update automatically
- **StatsRow.tsx, Testimonials.tsx, HowItWorksSection.tsx**: Auto-update via CSS variable changes

**4. Auth Page (src/pages/Auth.tsx)**
- Left panel uses navy (#223469) background (already uses `bg-foreground`)
- Gradient accents and buttons auto-update via CSS variables

**5. Button Component (src/components/ui/button.tsx)**
- Auto-updates via CSS variables, no changes needed

**6. App Shell (src/components/AppShell.tsx)**
- Auto-updates via CSS variables, no changes needed

### Technical Details

The core change is in `src/index.css` CSS custom properties. Since the entire UI references these variables (`--primary`, `--accent`, `--foreground`, `--background`), most components update automatically. Only components with hardcoded color classes (like `from-blue-500`) or custom gradient text effects need individual updates.

**Files to modify:**
1. `src/index.css` -- Core color token overhaul (both light and dark mode)
2. `src/components/landing/Hero.tsx` -- Update gradient text to use blue-to-gold
3. `src/components/landing/CTABanner.tsx` -- Verify gradient background
4. `src/components/landing/LandingNav.tsx` -- Update "Get Started" button to use accent/gold for CTA emphasis
5. `src/components/landing/ServiceCategories.tsx` -- Update icon color references if needed
