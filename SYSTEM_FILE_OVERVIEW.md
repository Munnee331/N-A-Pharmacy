# N A Pharmacy — File Overview

This document describes the main files and folders in the project, with a short explanation of each file's role.

## Root

- `package.json` — root workspace package manifest. Defines top-level scripts, dependencies, and concurrency between backend and frontend.
- `README.md` — project introduction, installation and run instructions.
- `SYSTEM_DOCUMENTATION.md` — higher-level system documentation, architecture, feature descriptions, and usage guidance.

## Backend (`backend/`)

### Configuration
- `backend/package.json` — backend-specific dependencies, scripts, and test configuration.
- `backend/vitest.config.js` — Vitest configuration for backend tests.
- `backend/src/config/env.js` — loads and validates environment variables for the backend.
- `backend/src/config/db.js` — MongoDB connection helper for connecting/disconnecting the database.

### Entry points
- `backend/src/app.js` — Express app setup, middleware registration, routes, error handling.
- `backend/src/server.js` — starts the Express server and connects to MongoDB.

### Authentication and authorization
- `backend/src/controllers/authController.js` — handles register, login, logout, refresh token, and current user endpoints.
- `backend/src/middleware/auth.js` — protects routes, checks JWT, and enforces role-based access (`admin`, `pharmacist`, `customer`).
- `backend/src/utils/generateToken.js` — creates JWT tokens for authenticated users.

### Models
- `backend/src/models/User.js` — user schema with roles (`customer`, `pharmacist`, `admin`), password hashing, and password comparison.
- `backend/src/models/Medicine.js` — medicine/product schema, including name, price, category, stock, and images.
- `backend/src/models/Order.js` — order schema for cart checkout, payment info, order status, delivery address, and items.
- `backend/src/models/Prescription.js` — prescription schema with customer/prescription file, status lifecycle, assigned pharmacist, and recommended medicines.
- `backend/src/models/Wishlist.js` — wishlist schema linking user and medicines.

### Controllers
- `backend/src/controllers/medicineController.js` — medicine listing, search, detail, create/update/delete operations for admin/users.
- `backend/src/controllers/orderController.js` — order creation, retrieval, pagination, and PDF invoice generation.
- `backend/src/controllers/paymentController.js` — SSLCommerz payment initialization and callbacks for success/fail/cancel.
- `backend/src/controllers/prescriptionController.js` — prescription upload, pharmacist review, approval, rejection, and prescription retrieval logic.

### Services
- `backend/src/services/paymentService.js` — payment gateway integration with SSLCommerz session initialization and transaction validation logic.
- `backend/src/services/invoiceService.js` — generates PDF invoices from order data and streams them to the client.
- `backend/src/services/emailService.js` — email templates and sending logic for order/prescription notifications.

### Middleware
- `backend/src/middleware/errorHandler.js` — centralized error response formatting.
- `backend/src/middleware/upload.js` — file upload handling for prescription images/documents.

### Routes
- `backend/src/routes/authRoutes.js` — public auth endpoints (`register`, `login`, `logout`, `refresh`, `me`).
- `backend/src/routes/medicineRoutes.js` — medicine-related endpoints.
- `backend/src/routes/orderRoutes.js` — order endpoints and invoice download endpoint.
- `backend/src/routes/paymentRoutes.js` — payment initialization and callback endpoints.
- `backend/src/routes/prescriptionRoutes.js` — prescription submission and pharmacist/admin review routes.

### Seeders
- `backend/src/seeder/createAdmin.js` — creates an initial admin user if missing.
- `backend/src/seeder/createPharmacist.js` — creates the initial pharmacist account.
- `backend/src/seeder/seedMedicines.js` — seeds initial medicine/product data into the database.

### Tests
- `backend/src/__tests__/setup.js` — backend test setup.
- `backend/src/__tests__/controllers/prescriptionController.test.js` — prescription controller tests.
- `backend/src/__tests__/models/Prescription.test.js` — prescription model tests.
- `backend/src/__tests__/middleware/upload.test.js` — upload middleware tests.
- `backend/src/__tests__/services/emailService.test.js` — email service tests.

## Frontend (`na-pharma/`)

### Configuration
- `na-pharma/package.json` — frontend dependencies, scripts, and Vite configuration.
- `na-pharma/vite.config.js` — Vite build configuration.
- `na-pharma/tailwind.config.js` — Tailwind CSS configuration.
- `na-pharma/postcss.config.js` — PostCSS config for frontend CSS processing.
- `na-pharma/eslint.config.js` — ESLint rules for the frontend.
- `na-pharma/README.md` — frontend-specific documentation.

### Entry point
- `na-pharma/src/main.jsx` — application bootstrap, router, and context providers.

### Routing and layout
- `na-pharma/src/routes/index.jsx` — application routes, including public pages, protected routes, admin routes, and pharmacist route.
- `na-pharma/src/layouts/Layout.jsx` — main public layout with navbar and footer.
- `na-pharma/src/layouts/AdminLayout.jsx` — admin dashboard layout.
- `na-pharma/src/components/routing/ProtectedRoute.jsx` — protects authenticated routes and handles role-based access.
- `na-pharma/src/components/routing/ScrollToTop.jsx` — scroll behavior on route change.

### Context
- `na-pharma/src/context/AuthContext.jsx` — authentication state, login/logout, and current user data.
- `na-pharma/src/context/CartContext.jsx` — cart state management and update helpers.

### API clients
- `na-pharma/src/api/client.js` — Axios instance with base URL and auth token support.
- `na-pharma/src/api/authApi.js` — auth endpoints for login, register, profile, and logout.
- `na-pharma/src/api/medicineApi.js` — medicine listing and detail API calls.
- `na-pharma/src/api/orderApi.js` — order retrieval and invoice download.
- `na-pharma/src/api/paymentApi.js` — payment initialization API.
- `na-pharma/src/api/prescriptionApi.js` — prescription upload and pharmacist review API.

### Pages
- `na-pharma/src/pages/HomePage.jsx` — homepage with featured medicines, hero section, and prescription CTA.
- `na-pharma/src/pages/ShopPage.jsx` — shop page with filters, pagination, product cards, and add-to-cart.
- `na-pharma/src/pages/AboutPage.jsx` — about page.
- `na-pharma/src/pages/ContactPage.jsx` — contact page.
- `na-pharma/src/pages/LoginPage.jsx` — login form.
- `na-pharma/src/pages/RegisterPage.jsx` — registration form.
- `na-pharma/src/pages/CartPage.jsx` — shopping cart review and checkout link.
- `na-pharma/src/pages/CheckoutPage.jsx` — checkout form and payment option handling.
- `na-pharma/src/pages/OrdersPage.jsx` — user order history and order details.
- `na-pharma/src/pages/PaymentSuccessPage.jsx` — payment success handling and redirect.
- `na-pharma/src/pages/PaymentFailPage.jsx` — payment failure handling.
- `na-pharma/src/pages/PaymentCancelPage.jsx` — payment cancel handling.
- `na-pharma/src/pages/DashboardPage.jsx` — user dashboard page.
- `na-pharma/src/pages/AdminPage.jsx` — admin dashboard overview.
- `na-pharma/src/pages/AdminMedicinesPage.jsx` — admin medicine management view.
- `na-pharma/src/pages/PrescriptionUploadPage.jsx` — prescription submission page.
- `na-pharma/src/pages/PrescriptionHistoryPage.jsx` — user prescription history page.
- `na-pharma/src/pages/PharmacistPage.jsx` — pharmacist review dashboard.
- `na-pharma/src/pages/NotFoundPage.jsx` — 404 page.

### UI components
- `na-pharma/src/components/navbar/*` — navigation UI, user menu, mobile drawer, navbar links, and responsive header.
- `na-pharma/src/components/footer/*` — footer sections and brand/contact layout.
- `na-pharma/src/components/ui/*` — reusable UI building blocks: button, input, modal, loading spinner, loader, skeleton, dashboard card, section container, and error boundary.
- `na-pharma/src/components/shop/*` — shop-specific UI including search filters, hero section, pagination, and medicine cards.
- `na-pharma/src/components/home/*` — homepage sections like hero, featured medicines, categories, newsletter, testimonials, and prescription upload CTA.
- `na-pharma/src/components/admin/*` — admin dashboard widgets, stats, sales overview, top selling products, prescription panels, sidebar, and tables.

### Hooks
- `na-pharma/src/hooks/useMedicines.js` — medicine fetch and filter state management.
- `na-pharma/src/hooks/useCartCount.js` — cart count derived state.
- `na-pharma/src/hooks/useWishlistCount.js` — wishlist count helper.
- `na-pharma/src/hooks/usePageMeta.js` — dynamic page title/description updates.
- `na-pharma/src/hooks/useMobileMenu.js` — mobile menu open/close state.
- `na-pharma/src/hooks/useScrolled.js` — scroll position tracking.

### Data fixtures
- `na-pharma/src/data/medicines.js` — local medicine sample data.
- `na-pharma/src/data/cartData.js` — sample cart item data.
- `na-pharma/src/data/adminData.js` — admin dashboard demo data.

### Frontend tests
- `na-pharma/src/__tests__/setup.js` — frontend test environment setup.
- `na-pharma/src/__tests__/unit/*` — unit tests for components and pages.
- `na-pharma/src/__tests__/properties/*` — property-based/rendering tests.
- `na-pharma/src/__tests__/smoke/project-structure.test.js` — smoke test verifying project structure.

## Notes
- The system uses a monorepo layout with separate `backend/` and `na-pharma/` apps.
- Backend stores all users in one `users` collection; user roles are distinguished by `role`.
- Prescription, order, payment, and invoice logic are handled in backend controllers/services.
- Frontend routes protect authenticated and role-based pages such as `/dashboard`, `/admin`, and `/pharmacist`.
