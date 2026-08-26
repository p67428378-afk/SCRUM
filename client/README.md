# FurniCraft &mdash; Furniture Selling Portal (Client)

React 18 + Vite + Tailwind CSS frontend application for the FurniCraft E-Commerce Furniture Selling Portal.

## Features

- **Product Catalog & Search**: Real-time multi-facet filtering (categories, price range, materials, colors, minimum ratings), keyword search, and responsive grid layout.
- **Product Details & Customization**: Dynamic finish and dimension selection, price and stock availability updates, image showcases, and wishlist toggles.
- **Interactive Shopping Cart**: Quantity adjustments, line item removal, coupon/promo code discounts (e.g. `FURNITURE20`, `WELCOME15`), and shipping/tax calculations with free shipping progress indicators.
- **Multi-Step Checkout**: Shipping address selection with saved address support, shipping method selection, card/PayPal payment validation, and order confirmation.
- **User Account & Order Tracking**: Order history receipts, live shipment progress timelines with tracking IDs, wishlist management, and address book.

## Quick Start

### 1. Install Dependencies

```bash
cd client
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Default environment variables:

```env
VITE_API_BASE_URL=http://localhost:8000
```

### 3. Run Development Server

```bash
npm run dev
```

The application will be accessible at `http://localhost:5173`.

### 4. Run Tests & Production Build

```bash
npm test
npm run build
```

## Demo Credentials

- Customer Account: `test@example.com` / `testpassword`
- Admin Account: `admin@example.com` / `adminpassword`
