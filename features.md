# Project Features

## SCRUM-91 - E-Commerce Shopping Website with Activity Logging, Loyalty Rewards, and Wishlist / Save for Later

### Feature Summary
Allows users to browse and filter products, save items to a wishlist, move wishlist items to cart, earn loyalty rewards on checkout, view accumulated points on a rewards dashboard, and securely log user authentication and gateway activity.

### Key Features
- Product Catalog & Browsing with category filtering and keyword search
- Shopping Cart & Checkout with automatic loyalty rewards calculation (1 point per $1 spent)
- User Account, JWT authentication, and order history
- Rewards Dashboard and GET /api/v1/rewards/balance endpoint
- Interactive Wishlist toggling (heart button) on ProductCard and ProductDetailCard
- Wishlist Page (/wishlist) with stock availability, Move to Cart, and Remove options
- Navbar Wishlist Badge counter
- Wishlist REST API endpoints (GET, POST, DELETE, Move to Cart)
- Wishlist and Reward SQLAlchemy database models in server/models/models.py
- User Login Activity & Gateway Logging middleware
- Alembic database migration mandate
