

## Place DigiReps Brand Logos Across the Website

### Logo Assets

You've provided two logo types:
- **Square icon** (`14-1.png`) -- the "dR" monogram on dark blue, perfect for small logo spots and favicon
- **Full horizontal logo** (`DigiReps_LOGO_TM_white_1.png`) -- the full "DigiReps" wordmark in white, ideal for larger brand areas like the footer

### Where Each Logo Will Be Placed

| Location | Current | New Logo | Why |
|----------|---------|----------|-----|
| **Browser tab (favicon)** | Shield icon | Square icon (`14-1.png`) | Brand recognition in browser |
| **Landing navbar** | Shield icon + text "DigiReps" | Square icon as logo mark + text | Consistent branding |
| **App shell navbar** (logged-in pages) | Shield icon + text | Square icon as logo mark + text | Consistent branding |
| **Landing footer** | Shield icon + text | Full white horizontal logo image | Larger brand presence on dark background |
| **Auth page** (sign-in/sign-up) | Shield icon + text | Square icon + text | Brand consistency |
| **Help page header** | Shield icon + text | Square icon + text | Brand consistency |
| **How It Works page header** | Shield icon + text | Square icon + text | Brand consistency |
| **App shell footer** | Shield icon + text | Small square icon + text | Consistent with nav |

### Technical Details

**Step 1: Copy logo files into the project**
- Copy `14-1.png` to `public/favicon.png` (replaces current favicon)
- Copy `14-1.png` to `src/assets/logo-icon.png` (for use in React components)
- Copy `DigiReps_LOGO_TM_white_1.png` to `src/assets/logo-full-white.png` (for footer/dark backgrounds)

**Step 2: Update `index.html`**
- Update favicon reference to use the new icon

**Step 3: Update components (6 files)**
Replace the `Shield` icon with `<img>` tags using the imported logo:

- `LandingNav.tsx` -- Replace Shield icon div with the square logo image
- `LandingFooter.tsx` -- Replace Shield icon + text with the full white horizontal logo
- `AppShell.tsx` -- Replace Shield icon in both the header logo and footer
- `Auth.tsx` -- Replace Shield icons on both desktop and mobile logo sections
- `Help.tsx` -- Replace Shield icon in header
- `HowItWorks.tsx` -- Replace Shield icon in header

Each replacement will use `<img src={logoIcon} className="h-8 w-8 rounded-xl" />` (sized appropriately per location), removing the gradient background div since the square icon already has its own dark blue background with rounded corners.

