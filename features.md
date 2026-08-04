# Project Features

## SCRUM-2 — Implement Inventory Management System

### Feature Summary
Implement Inventory Management System

### User Stories
# Implement Inventory Management System

**Objective:**
Provide a comprehensive inventory management system to track stock levels, manage item categories, and generate low-stock alerts across warehouse locations.
This system enables businesses to eliminate stockouts, maintain accurate stock records, and streamline warehouse fulfillment operations.

**Key Features:**
- Real-time stock level tracking across multiple warehouse locations
- Item catalog management with SKU, pricing, and reorder threshold configuration
- Automated low-stock notifications and reorder triggers
- Comprehensive audit logging for manual adjustments, stock transfers, and damages
- Full-stack RESTful API integration with a modern React dashboard

**Description:**
As an Inventory Manager,
I want an inventory management system to track stock levels, monitor item updates, and manage warehouse locations,
So that I can optimize stock availability, prevent stockouts, and streamline fulfillment operations.

**Acceptance Criteria:**
- **Stock Tracking and Real-Time Level Updates:** The system shall maintain real-time visibility into current stock quantities across all inventory items and warehouses.
  - Example: When a shipment of 50 units arrives at Warehouse A, the system immediately updates the stock count from 100 to 150 units.
  - Edge Cases: Out-of-order stock update events are reconciled using timestamped audit logs.
- **Item & Category Management:** The system shall allow creation, modification, and categorization of inventory items with SKU, unit price, threshold values, and reorder levels.
  - Example: An administrator adds a new item "SKU-9901" with a reorder threshold of 10 units.
- **Low Stock Alerts & Notifications:** Automatically generate alerts when stock levels fall below specified reorder thresholds.
  - Example: If SKU-9901 drops to 9 units, an automated low-stock notification is dispatched to the warehouse manager.
- **Audit Logging & Stock Adjustments:** Log all manual stock adjustments, transfers, and inventory reconciliations with timestamp, user ID, and reason codes.
  - Example: A manual adjustment of -2 units due to damage is logged with reason code "DAMAGED_GOODS".

**Technical Requirements:**
- RESTful APIs built with FastAPI (`/api/v1/inventory`, `/api/v1/items`, `/api/v1/stock-adjustments`).
- PostgreSQL database schema storing items, warehouses, stock levels, and audit logs with UUID primary keys.
- React/Vite/Tailwind frontend for inventory tracking dashboard.
- Input validation and role-based access control (RBAC).

### Acceptance Criteria
- Stock Tracking and Real-Time Level Updates: The system shall maintain real-time visibility into current stock quantities across all inventory items and warehouses.
- Item & Category Management: The system shall allow creation, modification, and categorization of inventory items with SKU, unit price, threshold values, and reorder levels.
- Low Stock Alerts & Notifications: Automatically generate alerts when stock levels fall below specified reorder thresholds.
- Audit Logging & Stock Adjustments: Log all manual stock adjustments, transfers, and inventory reconciliations with timestamp, user ID, and reason codes.

### Backend Tasks
- .env.example
- README.md
- server/__init__.py
- server/main.py
- server/database.py
- server/models.py
- server/schemas.py
- server/crud.py
- server/requirements.txt
- server/routers/__init__.py
- server/routers/items.py
- server/routers/inventory.py
- server/routers/adjustments.py
- server/routers/alerts.py
- server/routers/warehouses.py
- server/routers/categories.py
- server/tests/__init__.py
- server/tests/conftest.py
- server/tests/test_items.py
- server/tests/test_inventory.py
- server/tests/test_adjustments.py
- server/tests/test_alerts.py

### Frontend Tasks
- client/.env
- client/.env.example
- client/package.json
- client/index.html
- client/vite.config.js
- client/tailwind.config.js
- client/postcss.config.js
- client/src/index.css
- client/src/main.jsx
- client/src/setup.js
- client/src/services/api.js
- client/src/components/layout/Sidebar.jsx
- client/src/components/layout/Header.jsx
- client/src/components/layout/AppLayout.jsx
- client/src/components/dashboard/StatCardGrid.jsx
- client/src/components/dashboard/StockLevelChart.jsx
- client/src/components/dashboard/WarehouseDonutChart.jsx
- client/src/components/inventory/InventoryTable.jsx
- client/src/components/catalog/ItemCatalogTable.jsx
- client/src/components/catalog/ItemEditDrawer.jsx
- client/src/components/adjustments/StockAdjustmentTable.jsx
- client/src/components/adjustments/StockAdjustmentModal.jsx
- client/src/components/alerts/LowStockAlertTable.jsx
- client/src/pages/DashboardPage.jsx
- client/src/pages/ItemCatalogPage.jsx
- client/src/pages/StockAdjustmentsPage.jsx
- client/src/pages/LowStockAlertsPage.jsx
- client/src/tests/DashboardPage.test.jsx

### Database Changes
- **categories**
  - `id` (UUID)
  - `name` (VARCHAR(100))
  - `description` (TEXT)
  - `created_at` (TIMESTAMPTZ)
- **items**
  - `id` (UUID)
  - `category_id` (UUID)
  - `sku` (VARCHAR(50))
  - `name` (VARCHAR(255))
  - `unit_price` (NUMERIC(10,2))
  - `reorder_threshold` (INTEGER)
  - `reorder_quantity` (INTEGER)
  - `created_at` (TIMESTAMPTZ)
  - `updated_at` (TIMESTAMPTZ)
- **warehouses**
  - `id` (UUID)
  - `code` (VARCHAR(20))
  - `name` (VARCHAR(100))
  - `location` (VARCHAR(255))
  - `created_at` (TIMESTAMPTZ)
- **stock_levels**
  - `id` (UUID)
  - `item_id` (UUID)
  - `warehouse_id` (UUID)
  - `quantity_on_hand` (INTEGER)
  - `updated_at` (TIMESTAMPTZ)
- **stock_adjustments**
  - `id` (UUID)
  - `item_id` (UUID)
  - `warehouse_id` (UUID)
  - `user_id` (UUID)
  - `quantity_change` (INTEGER)
  - `previous_quantity` (INTEGER)
  - `new_quantity` (INTEGER)
  - `reason_code` (VARCHAR(50))
  - `notes` (TEXT)
  - `created_at` (TIMESTAMPTZ)
- **stock_alerts**
  - `id` (UUID)
  - `item_id` (UUID)
  - `warehouse_id` (UUID)
  - `current_quantity` (INTEGER)
  - `reorder_threshold` (INTEGER)
  - `status` (VARCHAR(20))
  - `created_at` (TIMESTAMPTZ)
**Relationships**:
  - categories.id 1 -> N items.category_id
  - items.id 1 -> N stock_levels.item_id
  - warehouses.id 1 -> N stock_levels.warehouse_id
  - items.id + warehouses.id -> N stock_adjustments
  - items.id + warehouses.id -> N stock_alerts

### API Endpoints
- `POST /api/v1/items` — Create a new inventory item with SKU and reorder thresholds.
- `GET /api/v1/items` — List all items in the catalog.
- `GET /api/v1/inventory` — Fetch stock levels across items and warehouses with pagination.
- `POST /api/v1/stock-adjustments` — Adjust stock levels manually with mandatory reason codes.
- `GET /api/v1/alerts` — Retrieve active low-stock alerts.

### UI Components
Not yet authored.

### Test Coverage
Not yet authored.

### Deployment Notes
Not yet authored.
