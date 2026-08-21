# Project Features

## SCRUM-91 - E-Commerce Shopping Website with Activity Logging, Loyalty Rewards, and Wishlist / Save for Later

### Feature Summary
Enables online shoppers to save products to a personal Wishlist, view saved items on a dedicated Wishlist page, easily move wishlist items directly into their shopping cart, and track wishlist counts via a navbar badge.

### Key Features
- Product Catalog & Browsing with category filtering and search
- Shopping Cart & Checkout with loyalty reward points awarding (1 point per $1)
- User Account & Order History with JWT authentication
- Rewards Dashboard displaying accumulated points
- Add to Wishlist toggle on ProductCard and ProductDetailCard
- Dedicated Wishlist Page (/wishlist)
- Move to Cart transfer action from Wishlist
- Navbar Wishlist Badge counter
- Wishlist REST API endpoints (GET, POST, DELETE, move-to-cart)
- WishlistItem database model and Alembic migration
