
# Implementation Plan: N A Pharma Project Setup

## Overview

This plan converts the design document into an ordered sequence of coding tasks. Each task builds on the previous one — scaffolding first, then the design system, then utilities and hooks, then reusable UI components, then layout and navigation, then pages, and finally domain-specific components and tests. No task leaves orphaned code; every piece is wired into the application before moving on.

The implementation language is **JavaScript (JSX)** as specified in the design document.

## Tasks

- [x] 1. Scaffold the Vite + React project and install all dependencies
  - Run `npm create vite@latest na-pharma -- --template react` to generate the project
  - Install runtime dependencies: `react-router-dom`, `framer-motion`, `lucide-react`
  - Install Tailwind CSS toolchain: `tailwindcss`, `postcss`, `autoprefixer`
  - Install dev/test dependencies: `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`, `fast-check`, `jsdom`
  - Run `npx tailwindcss init -p` to generate `tailwind.config.js` and `postcss.config.js`
  - Verify `package.json` contains all required packages
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 2. Configure the Tailwind CSS design system
  - [x] 2.1 Configure `tailwind.config.js` with design tokens
    - Set `content` glob to `['./index.html', './src/**/*.{js,jsx}']`
    - Add `primary` color scale (green 50–900) to `theme.extend.colors`
    - Add `secondary` color scale (blue 50–900) to `theme.extend.colors`
    - Add `neutral` color scale (gray 50–900) to `theme.extend.colors`
    - Add `fontFamily.sans` with `['Inter', 'system-ui', 'sans-serif']`
    - Add `borderRadius` tokens: `xl`, `2xl`, `3xl`
    - Add `boxShadow` tokens: `soft`, `soft-lg`
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [x] 2.2 Create `src/styles/index.css` with Tailwind directives and global base styles
    - Add `@tailwind base`, `@tailwind components`, `@tailwind utilities` directives
    - Import Inter font from Google Fonts via `@import` or add `<link>` to `index.html`
    - Set `body` base styles: `font-sans text-neutral-900 bg-white antialiased`
    - _Requirements: 3.6_

  - [x] 2.3 Update `src/main.jsx` to import `./styles/index.css`
    - Replace the default Vite CSS import with the new `index.css`
    - _Requirements: 3.6_

  - [x] 2.4 Configure Vitest in `vite.config.js`
    - Add `test` block: `environment: 'jsdom'`, `globals: true`, `setupFiles: ['./src/__tests__/setup.js']`
    - Create `src/__tests__/setup.js` that imports `@testing-library/jest-dom`
    - _Requirements: 1.6_

- [x] 3. Create utility files
  - [x] 3.1 Create `src/utils/cn.js` — Tailwind class merging utility
    - Install `clsx` and `tailwind-merge` packages
    - Export a `cn(...inputs)` function that passes inputs through `clsx` then `twMerge`
    - _Requirements: 2.8_

- [x] 4. Create custom React hooks
  - [x] 4.1 Create `src/hooks/useScrolled.js`
    - Accept a `threshold` parameter (default `20`)
    - Use `useState(false)` and `useEffect` to attach a `scroll` event listener on `window`
    - Return `true` when `window.scrollY > threshold`, `false` otherwise
    - Clean up the event listener on unmount
    - _Requirements: 2.7, 6.8_

  - [x] 4.2 Create `src/hooks/useMobileMenu.js`
    - Accept an optional `initialState` parameter (default `false`)
    - Use `useState(initialState)` to track `isOpen`
    - Return `{ isOpen, toggle, close }`
    - When `isOpen` is `true`, set `document.body.style.overflow = 'hidden'`; restore on close/unmount
    - _Requirements: 2.7, 6.5, 6.6_

  - [x] 4.3 Create `src/hooks/useCartCount.js`
    - Return a hardcoded `0` (stub for this phase)
    - Export as default
    - _Requirements: 2.7_

  - [x] 4.4 Create `src/hooks/useWishlistCount.js`
    - Return a hardcoded `0` (stub for this phase)
    - Export as default
    - _Requirements: 2.7_

- [x] 5. Build the reusable UI component library (`src/components/ui/`)
  - [x] 5.1 Create `src/components/ui/Button.jsx`
    - Implement `variant` prop: `primary`, `secondary`, `outline`, `ghost`, `danger`
    - Implement `size` prop: `sm`, `md`, `lg`
    - Implement `isLoading` prop: show `<Loader2 className="animate-spin" />` from Lucide, set `disabled`
    - Implement `leftIcon` and `rightIcon` slots
    - Apply `focus:ring-2 focus:ring-primary-500 focus:ring-offset-2` on all variants
    - Use `cn()` utility to merge variant + size + custom `className`
    - Forward `...rest` props to the underlying `<button>` element
    - _Requirements: 2.1_

  - [x] 5.2 Create `src/components/ui/Input.jsx`
    - Render a `<label>` linked to `<input>` via `htmlFor` / `id` (derived from `label` prop)
    - Implement `leftIcon` and `rightIcon` slots with absolute positioning inside the input wrapper
    - Implement `error` prop: red border, `aria-invalid="true"`, `aria-describedby="{id}-error"`, error message below
    - Implement `helperText` prop: subtle hint text below the input
    - Apply focus ring: `focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`
    - Forward `...rest` props to the `<input>` element
    - _Requirements: 2.1_

  - [x] 5.3 Create `src/components/ui/Modal.jsx`
    - Accept `isOpen`, `onClose`, `title`, `children`, `size` props
    - Render inside `<AnimatePresence>` from Framer Motion
    - Animate backdrop: `opacity 0 → 1`; animate panel: `scale 0.95 + opacity 0 → scale 1 + opacity 1` (spring)
    - Close on backdrop click and on `Escape` keydown (attach/remove listener in `useEffect`)
    - Implement focus trap: query focusable elements, cycle with `Tab` / `Shift+Tab`
    - Lock body scroll when open; restore on close/unmount
    - Apply size-based `max-w-*` class: `sm → max-w-sm`, `md → max-w-md`, `lg → max-w-lg`, `xl → max-w-xl`
    - _Requirements: 2.1_

  - [x] 5.4 Create `src/components/ui/LoadingSkeleton.jsx`
    - Accept `variant`, `count`, `className` props
    - Render `count` skeleton items using `bg-neutral-200 animate-pulse`
    - Shape per variant: `text → h-4 w-full rounded`, `card → h-48 w-full rounded-2xl`, `avatar → h-10 w-10 rounded-full`, `table-row → h-12 w-full rounded-lg`
    - When `count > 1`, wrap items in a `flex flex-col gap-3` container
    - _Requirements: 2.1_

  - [x] 5.5 Create `src/components/ui/SectionContainer.jsx`
    - Accept `as` (default `'section'`), `py` (default `'md'`), `className`, `children` props
    - Always apply `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`
    - Map `py` to padding classes: `sm → py-8`, `md → py-12`, `lg → py-16 lg:py-24`, `xl → py-24 lg:py-32`
    - Render as the element specified by `as` prop
    - _Requirements: 2.1_

  - [x] 5.6 Create `src/components/ui/DashboardCard.jsx`
    - Accept `title`, `value`, `icon`, `trend`, `trendValue`, `color` props
    - Apply gradient background based on `color`: e.g., `from-primary-50 to-primary-100`
    - Apply glass effect: `bg-white/80 backdrop-blur-sm border border-white/20 shadow-soft`
    - Render trend indicator: green up-arrow for `up`, red down-arrow for `down`, gray dash for `neutral`
    - Wrap in `motion.div` with `whileHover={{ y: -2 }}` from Framer Motion
    - _Requirements: 2.1_

- [x] 6. Build the Navbar component and all sub-components
  - [x] 6.1 Create `src/components/navbar/HamburgerButton.jsx`
    - Accept `isOpen` and `onClick` props
    - Animate three bar elements using Framer Motion: top bar rotates +45°, middle fades out, bottom rotates −45° when `isOpen` is true
    - Apply `aria-label="Toggle navigation menu"` and `aria-expanded={isOpen}`
    - _Requirements: 6.5_

  - [x] 6.2 Create `src/components/navbar/NavLinks.jsx`
    - Accept `links` (array of `{ label, to }`) and optional `onLinkClick` props
    - Render each link using `<NavLink>` from React Router DOM
    - Apply active class `text-primary-600 font-semibold border-b-2 border-primary-600` when `isActive` is true
    - Apply `whileHover={{ y: -1 }}` via Framer Motion on each link
    - Call `onLinkClick` when a link is clicked (for closing mobile drawer)
    - _Requirements: 6.2, 6.4_

  - [x] 6.3 Create `src/components/navbar/NavActions.jsx`
    - Accept `cartCount`, `wishlistCount`, `onLinkClick` props
    - Render Cart icon with badge (green `bg-primary-600` pill) when `cartCount > 0`
    - Render Wishlist icon with badge when `wishlistCount > 0`
    - Render Login (`variant="outline"`) and Register (`variant="primary"`) using the `Button` component
    - Apply `whileHover={{ scale: 1.1 }}` on icon buttons
    - _Requirements: 6.3_

  - [x] 6.4 Create `src/components/navbar/MobileDrawer.jsx`
    - Accept `isOpen`, `onClose`, `cartCount`, `wishlistCount` props
    - Animate with Framer Motion: `x: '100%' → x: 0` (spring: stiffness 300, damping 30)
    - Render a semi-transparent backdrop that fades in behind the drawer
    - Include a close button (`✕`) in the top-right corner with `aria-label="Close navigation menu"`
    - Render `<NavLinks>` and `<NavActions>` stacked vertically inside the drawer
    - Nav links have `py-3` tap targets (minimum 44px height)
    - _Requirements: 6.5, 6.6_

  - [x] 6.5 Create `src/components/navbar/Navbar.jsx`
    - Use `useScrolled(20)`, `useMobileMenu()`, `useCartCount()`, `useWishlistCount()` hooks
    - Apply `fixed top-0 left-0 right-0 z-50 h-16 bg-white`
    - Add `shadow-soft transition-shadow duration-300` when `isScrolled` is true
    - Render logo (SVG mark + "N A Pharma" text) on the left
    - Render `<NavLinks>` in the center (hidden on mobile: `hidden md:flex`)
    - Render `<NavActions>` on the right (hidden on mobile: `hidden md:flex`)
    - Render `<HamburgerButton>` on mobile only (`flex md:hidden`)
    - Render `<MobileDrawer>` passing all required props
    - Add `data-testid="navbar"` to the root element
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.7, 6.8_

- [x] 7. Build the Footer component and all sub-components
  - [x] 7.1 Create `src/components/footer/FooterBrand.jsx`
    - Render the "N A Pharma" logo/name and tagline
    - Add a brief description paragraph
    - Animate with `whileInView={{ opacity: 1, y: 0 }}` + `initial={{ opacity: 0, y: 20 }}` + `viewport={{ once: true }}`
    - _Requirements: 7.1, 7.2_

  - [x] 7.2 Create `src/components/footer/FooterLinks.jsx`
    - Accept a `sections` prop (array of `{ heading, links: [{ label, to }] }`)
    - Render each section with a heading and list of `<Link>` elements
    - Apply `text-neutral-400 hover:text-primary-400 transition-colors text-sm` to links
    - Animate with `whileInView` staggered by section index
    - _Requirements: 7.3_

  - [x] 7.3 Create `src/components/footer/FooterContact.jsx`
    - Render address, phone, and email with corresponding Lucide icons (`MapPin`, `Phone`, `Mail`)
    - Apply `text-neutral-300 text-sm` to contact items
    - _Requirements: 7.3_

  - [x] 7.4 Create `src/components/footer/FooterSocial.jsx`
    - Render social media icon links (Facebook, Twitter, Instagram, LinkedIn) using Lucide icons
    - Apply `text-neutral-400 hover:text-primary-400` with `whileHover={{ scale: 1.2 }}`
    - _Requirements: 7.5_

  - [x] 7.5 Create `src/components/footer/FooterNewsletter.jsx`
    - Use local state: `email` string and `subscribed` boolean
    - Render email `<Input>` component and a Subscribe `<Button>`
    - Disable the button when `email` is empty
    - On submit (stub): set `subscribed = true` and replace form with confirmation message
    - _Requirements: 7.3_

  - [x] 7.6 Create `src/components/footer/Footer.jsx`
    - Compose all footer sub-components in a responsive grid
    - Mobile: single column; tablet: 2-column; desktop: 4-column (`lg:grid-cols-4`)
    - Apply `bg-neutral-900` background, `text-neutral-300` body text
    - Add `border-t border-neutral-800` divider above copyright row
    - Render copyright: `© {new Date().getFullYear()} N A Pharma. All rights reserved.`
    - Add `data-testid="footer"` to the root element
    - Add `data-testid="footer-copyright"` to the copyright paragraph
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

- [x] 8. Build the Layout component with page transitions
  - Create `src/layouts/Layout.jsx`
  - Import and render `<Navbar />` at the top
  - Import `useLocation` from React Router DOM; use `location.pathname` as the `key` for `AnimatePresence`
  - Wrap `<Outlet />` in `<AnimatePresence mode="wait">` with a `motion.div` using `pageVariants` (initial: `opacity 0, y 12`; animate: `opacity 1, y 0`; exit: `opacity 0, y -8`)
  - Import and render `<Footer />` at the bottom
  - Apply `min-h-screen flex flex-col` to the root element; add `flex-1` to the content wrapper so footer is pushed down
  - Add `pt-16` to the content area to offset the fixed navbar height
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 9. Set up the router and wire everything together
  - [x] 9.1 Create `src/routes/index.jsx` with centralized route definitions
    - Define `NAV_LINKS` array: `[{ label: 'Home', to: '/' }, { label: 'Shop', to: '/shop' }, { label: 'About', to: '/about' }, { label: 'Contact', to: '/contact' }]`
    - Import all page components (lazy imports are fine)
    - Define routes using `<Routes>` and `<Route>` from React Router DOM
    - Nest all page routes under `<Route element={<Layout />}>` so Layout wraps every page
    - Add `<Route path="*" element={<NotFoundPage />}>` as the catch-all
    - Export `NAV_LINKS` for use in `NavLinks` and `MobileDrawer`
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 4.10_

  - [x] 9.2 Update `src/main.jsx` to mount the router
    - Wrap `<AppRouter />` in `<BrowserRouter>` from React Router DOM
    - Ensure `index.css` is imported
    - _Requirements: 4.1_

- [x] 10. Create all placeholder page components
  - [x] 10.1 Create `src/pages/HomePage.jsx`
    - Render page title "Home" and an "under construction" message
    - Wrap content in `<SectionContainer py="lg">`
    - Apply hero gradient: `bg-gradient-to-br from-primary-50 to-secondary-50`
    - Add `data-testid="home-page"`
    - _Requirements: 8.1, 8.2_

  - [x] 10.2 Create `src/pages/ShopPage.jsx`
    - Render page title "Shop" and an "under construction" message
    - Wrap content in `<SectionContainer py="lg">`
    - Add `data-testid="shop-page"`
    - _Requirements: 8.1, 8.2_

  - [x] 10.3 Create `src/pages/AboutPage.jsx`
    - Render page title "About" and an "under construction" message
    - Wrap content in `<SectionContainer py="lg">`
    - Add `data-testid="about-page"`
    - _Requirements: 8.1, 8.2_

  - [x] 10.4 Create `src/pages/ContactPage.jsx`
    - Render page title "Contact" and an "under construction" message
    - Wrap content in `<SectionContainer py="lg">`
    - Add `data-testid="contact-page"`
    - _Requirements: 8.1, 8.2_

  - [x] 10.5 Create `src/pages/LoginPage.jsx`
    - Render page title "Login" and an "under construction" message
    - Wrap content in `<SectionContainer py="lg">`
    - Add `data-testid="login-page"`
    - _Requirements: 8.1, 8.2_

  - [x] 10.6 Create `src/pages/RegisterPage.jsx`
    - Render page title "Register" and an "under construction" message
    - Wrap content in `<SectionContainer py="lg">`
    - Add `data-testid="register-page"`
    - _Requirements: 8.1, 8.2_

  - [x] 10.7 Create `src/pages/DashboardPage.jsx`
    - Render page title "Dashboard" and an "under construction" message
    - Wrap content in `<SectionContainer py="lg">`
    - Add `data-testid="dashboard-page"`
    - _Requirements: 8.1, 8.2_

  - [x] 10.8 Create `src/pages/AdminPage.jsx`
    - Render page title "Admin" and an "under construction" message
    - Wrap content in `<SectionContainer py="lg">`
    - Add `data-testid="admin-page"`
    - _Requirements: 8.1, 8.2_

  - [x] 10.9 Create `src/pages/NotFoundPage.jsx`
    - Render a "404 — Page Not Found" heading and a friendly message
    - Render a `<Link to="/">` back to the Home page using the `Button` component (`variant="primary"`)
    - Wrap content in `<SectionContainer py="xl">`
    - Add `data-testid="not-found-page"`
    - _Requirements: 8.3, 8.4_

- [x] 11. Checkpoint — verify the application runs
  - Ensure all tests pass, ask the user if questions arise.
  - Run `npm run dev` manually and confirm all 9 routes render without console errors
  - Confirm Navbar and Footer appear on every page
  - Confirm page transitions animate on route change

- [x] 12. Create the `MedicineCard` shop component
  - Create `src/components/shop/MedicineCard.jsx`
  - Accept all props: `name`, `brand`, `price`, `originalPrice`, `image`, `category`, `inStock`, `rating`, `onAddToCart`, `onAddToWishlist`
  - Render discount badge (`bg-red-500 text-white text-xs rounded-full`) when `originalPrice > price`; calculate and display percentage off
  - Render out-of-stock overlay (`bg-neutral-900/50` with "Out of Stock" text) when `inStock === false`
  - Implement wishlist heart toggle: use local `isWishlisted` state; fill the `Heart` icon when true; call `onAddToWishlist` on click
  - Render Add to Cart `<Button variant="primary" size="sm">` disabled when `inStock === false`; call `onAddToCart` on click
  - Render star rating display using the `rating` prop
  - _Requirements: 2.1_

- [x] 13. Create the `DataTable` admin component
  - Create `src/components/admin/DataTable.jsx`
  - Accept `columns`, `data`, `isLoading`, `emptyMessage` props
  - Implement sort state: `{ key: null, direction: 'asc' }` using `useState`
  - Clicking a column header cycles: `asc → desc → null (unsorted)`
  - When `isLoading` is true, render 5 `<LoadingSkeleton variant="table-row" />` rows in the tbody
  - When `data.length === 0` and not loading, render `emptyMessage` centered in a full-width `<td>`
  - Apply `role="table"` to `<table>`, `scope="col"` to `<th>` elements
  - Add `aria-sort="ascending"` / `aria-sort="descending"` to the active sort column header
  - Add sort button `aria-label`: `"Sort by {label} ascending"` or `"Sort by {label} descending"`
  - Wrap the table in `overflow-x-auto` for mobile horizontal scroll
  - _Requirements: 2.1_

- [x] 14. Write smoke and unit tests
  - [x] 14.1 Create `src/__tests__/smoke/project-structure.test.js`
  - [x] 14.2 Write unit tests for `Navbar` (`src/__tests__/unit/Navbar.test.jsx`)
  - [x] 14.3 Write unit tests for `MobileDrawer` (`src/__tests__/unit/MobileDrawer.test.jsx`)
  - [x] 14.4 Write unit tests for `Footer` (`src/__tests__/unit/Footer.test.jsx`)
  - [x] 14.5 Write unit tests for all placeholder pages (`src/__tests__/unit/pages.test.jsx`)

- [x] 15. Write property-based tests
  - [x] 15.1 Property 1: Layout wraps every defined route
  - [x] 15.2 Property 2: Unknown paths always render the 404 page
  - [x] 15.3 Property 3: Active navigation link reflects current route
  - [x] 15.4 Property 4: Mobile menu toggle is a round-trip
  - [x] 15.5 Property 5: Footer copyright year is always current

- [x] 16. Final checkpoint — ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
  - Run `npx vitest --run` and confirm all tests pass with zero failures
  - Confirm the build succeeds: `npm run build` exits with code 0

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- Checkpoints (tasks 11 and 16) ensure incremental validation before moving forward
- Property tests validate universal correctness properties using `fast-check` (minimum 100 iterations each)
- Unit tests validate specific examples and edge cases
- The `cn()` utility (task 3.1) is a prerequisite for all UI components — complete it before task 5
- Custom hooks (task 4) are prerequisites for the Navbar — complete them before task 6
- The `Button` and `Input` components (tasks 5.1, 5.2) are used by `NavActions`, `FooterNewsletter`, and `MedicineCard` — complete them before tasks 6, 7, and 12
- `LoadingSkeleton` (task 5.4) is used by `DataTable` — complete it before task 13
- `SectionContainer` (task 5.5) is used by all page components — complete it before task 10
