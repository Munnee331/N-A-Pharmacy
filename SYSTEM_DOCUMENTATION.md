# N A Pharma System Documentation

## 1. Project overview

This repository is a monorepo for a pharmacy e-commerce system.

- `backend/` — Express + MongoDB REST API
- `na-pharma/` — React + Vite frontend
- `package.json` at the root orchestrates both services

The app supports:
- user registration / login
- admin and pharmacist roles
- product browsing and cart checkout
- order history for customers
- invoice download
- SSLCommerz online payment gateway
- prescription upload and order validation

## 2. Architecture

### Backend

Implemented in `backend/`.

- `backend/src/server.js` — app entry point
- `backend/src/config/env.js` — env var loader and SSLCommerz config
- `backend/src/routes/` — route definitions
- `backend/src/controllers/` — business logic
- `backend/src/services/paymentService.js` — SSLCommerz session and validation
- `backend/src/models/Order.js` — order schema, payment fields, transaction tracking

### Frontend

Implemented in `na-pharma/`.

- `na-pharma/src/pages/CheckoutPage.jsx` — checkout form and payment submit
- `na-pharma/src/api/paymentApi.js` — backend payment endpoint client
- `na-pharma/src/pages/OrdersPage.jsx` — customer order history page
- `na-pharma/src/routes/index.jsx` — app routes and protected routes

## 3. Database design (MongoDB)

The current app uses MongoDB collections, not SQL tables. This is the correct approach for this project.

### Current collections

- `users`
  - stores customers, pharmacists, admins
  - fields: `name`, `email`, `phone`, `password`, `role`, `avatar`

- `medicines`
  - stores product catalog
  - fields: `name`, `slug`, `brand`, `category`, `price`, `stock`, `prescriptionRequired`, `description`, `image`, `ratings`

- `orders`
  - stores each order as one document
  - fields: `customer` (ref to `users`), `items` (array of embedded order items), `totalAmount`, `shippingAddress`, `status`, `paymentMethod`, `paymentStatus`, `transactionId`, `paymentDetails`, `prescription` (ref), `notes`

- `prescriptions`
  - stores uploaded prescription records
  - fields: `customer` (ref), `pharmacist` (ref), `imageUrl`, `status`, `recommendedMedicines`, `notes`, `rejectionReason`

- `wishlists` (new)
  - stores user wishlist entries
  - fields: `user` (ref to `users`), `medicine` (ref to `medicines`), `quantity`

### How this matches your ER diagram

Your ER diagram shows `USER`, `MEDICINE`, `ORDER`, `ORDER_ITEM`, `PRESCRIPTION`, and `Wishlist`.

The current MongoDB design is compatible, but it uses embedded documents for efficiency:

- `orders` contains an embedded `items` array instead of a separate `order_items` collection.
- `prescriptions` are stored in their own collection and may reference `orders` and `users`.
- `users` are stored in one collection with a `role` field.

### Should you change it?

Not necessary. The current structure is fine and actually better for MongoDB than a strict relational design.

### If you want an ER-style MongoDB schema

You can keep the current collections, or add:

- `wishlists` collection if you need a wishlist feature
  - fields: `userId` (ref to `users`), `medicineId` (ref to `medicines`), `quantity`

- `order_items` collection only if you want each item as a separate document
  - not required, because embedded `items` in `orders` is simpler and faster for this app.

### Recommended collection layout

1. `users`
   - `_id`, `name`, `email`, `password`, `role`, `phone`, `avatar`, `createdAt`, `updatedAt`

2. `medicines`
   - `_id`, `name`, `slug`, `category`, `price`, `discountPrice`, `stock`, `prescriptionRequired`, `description`, `image`, `createdAt`, `updatedAt`

3. `orders`
   - `_id`, `customer`, `items`, `totalAmount`, `shippingAddress`, `status`, `paymentMethod`, `paymentStatus`, `transactionId`, `paymentDetails`, `prescription`, `notes`, `createdAt`, `updatedAt`

4. `prescriptions`
   - `_id`, `customer`, `pharmacist`, `imageUrl`, `status`, `recommendedMedicines`, `notes`, `rejectionReason`, `createdAt`, `updatedAt`

5. `wishlists`
   - `_id`, `user`, `medicine`, `quantity`, `createdAt`, `updatedAt`

> MongoDB collections are created automatically by Mongoose when the first document is saved. You do not need to create a table manually like in SQL.

## 4. How to modify the system

If someone asks you to change the project, here is the usual flow:

### a) Database change

- new collection: create a Mongoose model file in `backend/src/models/`, for example `Wishlist.js`
- new field: add a field to the proper schema (`Order.js`, `Medicine.js`, etc.)
- validation: add required checks to the schema or controller

### b) Backend change

- update model schema or add a new model
- add route(s) in `backend/src/routes/`
- add controller logic in `backend/src/controllers/`
- if needed, add a service helper in `backend/src/services/`

### c) Frontend change

- add or update API call in `na-pharma/src/api/`
- update the relevant page/component in `na-pharma/src/pages/`
- if it is a shared UI component, update `na-pharma/src/components/`
- use the new API call from a button/form

### Example: Add a wishlist feature

1. Add `backend/src/models/Wishlist.js`
2. Add backend route(s) to create/read/remove wishlist items
3. Add controller(s) for wishlist operations
4. Add API wrapper in `na-pharma/src/api/`
5. Add frontend page/button to show wishlist items

### Example: Add a new order field

1. Add the field to `backend/src/models/Order.js`
2. Update the backend controller that creates/updates orders
3. Update frontend `CheckoutPage.jsx` payload if users need to submit the value
4. Update order display in `OrdersPage.jsx` or dashboard views

### Example: Add a medicine expiry date

1. Add `expiryDate` to `backend/src/models/Medicine.js`
2. Update any seeder or admin medicine form
3. Update frontend product card and filters

## 5. Run the system locally

### Prerequisites

- Node.js 18+ recommended
- MongoDB available locally or via a cloud URI

### Install dependencies

From the repository root:

```bash
cd "d:\N A Pharmacy"
npm install
npm run install:all
```

This installs dependencies for both `backend/` and `na-pharma/`.

### Configure environment variables

Create `backend/.env` with:

```env
MONGODB_URI=<your MongoDB URI>
JWT_SECRET=<random secret>
COOKIE_SECRET=<random secret>
CLIENT_ORIGIN=http://localhost:5173
FRONTEND_URL=http://localhost:5173

# SSLCommerz sandbox credentials
SSLCOMMERZ_STORE_ID=<your store id>
SSLCOMMERZ_STORE_PASSWORD=<your store password>
SSLCOMMERZ_IS_LIVE=false
```

The backend uses these values for auth, cookies, frontend redirects, and SSLCommerz.

### Start development servers

From root:

```bash
npm run dev:all
```

This launches both:
- API server on `http://localhost:5000`
- frontend on `http://localhost:5173`

If one server crashes, `concurrently` is configured to stop the other as well.

### Run servers individually

From root:

```bash
npm run dev:backend
npm run dev:frontend
```

### Frontend production build

```bash
npm run build
```

## 4. User roles and login

### Admin

Use the admin seeder to create the first admin account.

From `backend/`:

```bash
npm run seed:admin
```

Default seeded admin credentials:
- email: `admin@napharma.com`
- password: `Admin123!`

Admin dashboard route: `/admin`

### Pharmacist

Create the first pharmacist account:

```bash
npm run seed:pharmacist
```

Default seeded pharmacist credentials:
- email: `pharmacist@napharma.com`
- password: `Pharma123!`

Pharmacist route: `/pharmacist`

### Customer / user

Customers register through the frontend at `/register`.
After login, customers can access:
- `/checkout` — place an order
- `/orders` — order history
- `/dashboard` — user dashboard
- `/upload-prescription` — prescription upload

## 5. Order and payment flow

### Customer checkout

The frontend checkout page sends order details to the backend on `POST /api/payments/initiate`.

- cash-on-delivery (`cod`) creates the order immediately and returns success
- online payment methods (`bkash`, `nagad`, `card`) initiate SSLCommerz

If the backend returns `gatewayUrl`, the frontend redirects the user to SSLCommerz.

### SSLCommerz integration

SSLCommerz is implemented in the backend.

Key files:
- `backend/src/services/paymentService.js`
- `backend/src/controllers/paymentController.js`
- `backend/src/routes/paymentRoutes.js`
- `backend/src/config/env.js`

Callback routes:
- `POST /api/payments/success`
- `POST /api/payments/fail`
- `POST /api/payments/cancel`
- `POST /api/payments/ipn`

SSLCommerz is therefore already integrated in this system.
To use it, supply valid store credentials in `backend/.env`.

### Payment validation

The backend validates SSLCommerz payloads, updates order status, and stores transaction details.

If payment is successful, the customer is redirected to:
- `/payment/success`

If payment fails or is cancelled, the customer is redirected to:
- `/payment/fail`
- `/payment/cancel`

## 6. Order history

Customer order history is available at `/orders` after login.
The frontend loads the current user’s orders from the backend and displays them with pagination.

## 7. Important notes

- The backend requires `MONGODB_URI`, `JWT_SECRET`, and `COOKIE_SECRET`.
- SSLCommerz sandbox mode is enabled via `SSLCOMMERZ_IS_LIVE=false`.
- The frontend route `/checkout` is protected and requires authentication.
- The current validated fix for the build was applied to `na-pharma/src/components/shop/ShopFilters.jsx`.

## 8. Quick start summary

```bash
cd "d:\N A Pharmacy"
npm install
npm run install:all
# create backend/.env
npm run dev:all
```

Open `http://localhost:5173` in a browser.

---

### Files to inspect for payment and checkout

- `na-pharma/src/pages/CheckoutPage.jsx`
- `na-pharma/src/api/paymentApi.js`
- `backend/src/controllers/paymentController.js`
- `backend/src/services/paymentService.js`
- `backend/src/routes/paymentRoutes.js`
- `backend/src/config/env.js`
