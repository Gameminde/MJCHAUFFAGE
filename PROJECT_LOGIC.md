# Project Logic & Architecture Documentation

## 1. Core Architecture & Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand (Global state), React Query (Server state - inferred from package.json)
- **Authentication**: Supabase Auth
- **UI Components**: Headless UI, Lucide React, Custom components

### Backend / Database
- **Platform**: Supabase (PostgreSQL)
- **ORM/Client**: `@supabase/supabase-js`
- **Schema**: Relational schema with UUIDs.
    - Core tables: `users`, `customers`, `products`, `orders`, `order_items`.
    - Support tables: `categories`, `manufacturers`, `wilayas`, `addresses`.

### Key Services (`frontend/src/services`)
- **`adminAnalyticsService.ts`**: Aggregates business metrics directly from DB.
- **`cartService.ts`**: Manages cart synchronization with the database.
- **`productService.ts`**: Fetches product data.
- **`ordersService.ts`**: Manages order creation and status updates.

---

## 2. Data Flow & State Management

### Client-Side State (Zustand)
- **`cartStore.ts`**:
    - Manages cart items locally with `localStorage` persistence.
    - Syncs with the server (`cart_items` table) when a user logs in.
    - **Actions**: `addItem`, `removeItem`, `updateQuantity`, `syncWithServer`.
    - **Computation**: Calculates totals and shipping costs on the client.

### Server-Side Data Fetching
- **Admin Dashboard**:
    - Uses `adminAnalyticsService` to fetch raw data from `orders`, `customers`, and `order_items`.
    - Performs heavy aggregation (revenue, growth, distribution) in the application layer (TypeScript) rather than SQL views (currently).
    - **Note**: This "fetch all and compute" strategy may become a bottleneck as data grows.

### Authentication Flow
- Supabase Auth handles user sessions.
- `users` table links to `auth.users`.
- `customers` table extends user profile with business-specific data (address, phone, etc.).

---

## 3. Current Analytics Logic (Audit)

### Existing Implementation
The current analytics (`adminAnalyticsService.ts`) are **transactional**, meaning they only track what has already happened in the database (orders, payments).

- **Metrics Tracked**:
    - Total Revenue, Orders, AOV.
    - Growth rates (vs previous period).
    - Top Products (by revenue/units).
    - Category Distribution.
    - Wilaya (Geographic) Distribution.
- **Data Source**: Direct queries to `orders`, `order_items`, `products`, `customers`.
- **Missing**:
    - **Behavioral Data**: Page views, session duration, bounce rates.
    - **Funnel Data**: Add to cart vs. Checkout started vs. Completed.
    - **Real-time Events**: Live active users, current cart contents.

---

## 4. Analytics Preparation & Roadmap

To build a **robust analytics dashboard**, we need to move beyond simple transaction reporting and start tracking user behavior.

### Phase 1: Database Schema Updates
We need new tables to store behavioral events.

```sql
-- 1. Sessions Table
CREATE TABLE analytics_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    visitor_id TEXT, -- Fingerprint for non-logged in users
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    device_type TEXT,
    browser TEXT,
    os TEXT,
    ip_address TEXT,
    country TEXT
);

-- 2. Events Table
CREATE TABLE analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES analytics_sessions(id),
    user_id UUID REFERENCES auth.users(id),
    event_type TEXT NOT NULL, -- 'page_view', 'add_to_cart', 'checkout_start', 'search'
    page_url TEXT,
    payload JSONB, -- Flexible data (product_id, cart_value, search_term)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Phase 2: Client-Side Tracking
Implement a centralized `AnalyticsService` on the frontend.

1.  **Page Views**: Create a client component (e.g., `AnalyticsProvider`) that listens to `usePathname` and logs `page_view` events.
2.  **Actions**:
    -   Wrap `cartStore` actions to log `add_to_cart` events.
    -   Log `search` events when users submit the search bar.
    -   Log `checkout_start` when entering the checkout flow.

### Phase 3: Enhanced Admin Dashboard
Update `adminAnalyticsService.ts` to query these new tables.

-   **Conversion Rate**: `(Unique Orders / Unique Sessions) * 100`
-   **Cart Abandonment**: `(Sessions with add_to_cart - Sessions with order) / Sessions with add_to_cart`
-   **Top Search Terms**: Aggregated from `search` events.
-   **Live View**: Count sessions active in the last 5 minutes.

### Immediate Action Items
1.  Create the `analytics_sessions` and `analytics_events` tables.
2.  Create a `useAnalytics` hook to simplify event logging.
3.  Integrate tracking into `layout.tsx` (for page views) and `cartStore.ts` (for cart actions).
