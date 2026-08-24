# Project Features

## SCRUM-91 - E-Commerce Shopping Website with Activity Logging, Loyalty Rewards, and Wishlist / Save for Later

### Feature Summary
Online shoppers can browse/filter products, save items to a wishlist, move items to cart, earn loyalty rewards upon checkout, view reward balances, and have their activity securely logged.

### Key Features
- Product Catalog & Browsing with Filtering and Search
- Shopping Cart & Checkout with Automatic Loyalty Rewards Awarding (1 point per $1 spent)
- User Account, JWT Authentication & Order History
- Rewards Dashboard & Balance REST API (GET /api/v1/rewards/balance)
- Wishlist Functionality with Interactive Heart Buttons and Dedicated Wishlist Page (/wishlist)
- Move Wishlist Item to Cart Action
- Navbar Wishlist Real-time Badge Counter
- Wishlist REST API Router (server/routers/wishlist.py) & Database Models (WishlistItem, Reward)
- Alembic Database Migration (add_wishlist_items)
- User Login Activity & Gateway Logging Middleware
