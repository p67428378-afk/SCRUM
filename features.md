# Project Features

## SCRUM-40 — Product Real-Time Search with Autocomplete and Dynamic Category Filtering

### Feature Summary
Product Real-Time Search with Autocomplete and Dynamic Category Filtering

### User Stories
# Product Real-Time Search with Autocomplete and Dynamic Category Filtering

**Objective:**
Provide registered shoppers with an intuitive, header-based real-time search interface featuring instant query suggestions and dynamic category filtering.
This enhances item discoverability and shopping efficiency by retrieving relevant products in under 150ms without page reloads.

**Key Features:**
- Header-centered search bar with dark overlay, custom placeholder, skeleton loading, and empty/error states.
- 300ms client-side input debouncing and local caching of up to 5 recent search queries.
- Complete keyboard accessibility supporting Down/Up arrow navigation, Enter selection, and Esc dismissal.
- High-performance REST search endpoint (`GET /api/v1/products/search`) meeting p95 < 150ms SLA.
- Elasticsearch and vector search indexing across product title, tags, and category ID.

**Description:**
As a registered shopper,  
I want to search for products with real-time suggestions and dynamic category filtering,  
So that I can locate relevant items quickly without reloading the page.  

**Acceptance Criteria:**

- **Header Search Bar Layout & UX States:**
  - **Explanation:** The search bar is centered in the primary navigation header and displays placeholder text `"Search products, brands, or categories..."`. When focused, a dark background overlay dims the rest of the page. The search dropdown has a maximum height of `400px`, corner radius of `8px` (`var(--radius-md)`), and shadow token `var(--elevation-2)`. While fetching suggestions, skeleton loader items are shown inside the dropdown. If no results match, an empty state displays `"No products found for '[query]'"` with a `"Clear search"` CTA button. On network failure, a subtle inline alert displays `"Unable to load suggestions. Retrying..."`.
  - **Example:** A shopper clicks the search bar in the primary navigation header; the background dims, and placeholder `"Search products, brands, or categories..."` is displayed until typing begins. Skeleton items render while fetching results. If they search `"xyz123"`, the dropdown displays `"No products found for 'xyz123'"` along with the `"Clear search"` CTA.
  - **Edge Cases:** Rapid focus/blur actions toggle the dark overlay smoothly without leaving zombie overlay elements. If network connection fails mid-request, `"Unable to load suggestions. Retrying..."` appears inline.

- **Frontend Input Debouncing & Query Caching:**
  - **Explanation:** User input must be debounced by `300ms` before sending search requests to the API. When the search input is focused and empty, the client instantly presents up to `5` locally cached recent query strings from local state management.
  - **Example:** A shopper types `"shoe"` within 100ms; the system waits `300ms` after the last keystroke (`"e"`) before sending the search request. When the user returns later and focuses the empty input, their 5 most recent search queries (e.g., `"running shoes"`, `"jackets"`, `"denim"`, `"hats"`, `"socks"`) appear instantly.
  - **Edge Cases:** If a user types fewer than 3 characters, recent history queries are displayed without triggering the backend search API.

- **Keyboard Navigation & Accessibility:**
  - **Explanation:** Users must be able to seamlessly navigate suggestions using the keyboard. Down Arrow / Up Arrow keys move focus sequentially through suggestion items in the dropdown list. Pressing Enter selects the highlighted suggestion item or submits the raw query string. Pressing Esc closes the suggestion dropdown and resets focus back to the search input.
  - **Example:** A user types `"hoodie"`, presses Down Arrow twice to highlight the second suggestion `"Zip-up Hoodie"`, and hits Enter to navigate directly to that product page. Alternatively, pressing Esc closes the dropdown immediately.
  - **Edge Cases:** Pressing Down Arrow on the last item wraps focus back to the top item or input field. Pressing Esc when the input is empty closes the dropdown and resets focus.

- **Backend Search API & Elasticsearch Vector Indexing:**
  - **Explanation:** The backend must expose `GET /api/v1/products/search?q={query}&limit=10&page=1` (supporting dynamic category filtering via `category_id`). The endpoint must query an Elasticsearch / vector search index across product `title`, `tags`, and `category_id`. The API must achieve a p95 response time under `150ms` for query strings of length `≥ 3` characters.
  - **Example:** An HTTP GET request to `/api/v1/products/search?q=leather&limit=10&page=1` searches titles, tags, and categories in Elasticsearch and returns 10 matching JSON product suggestion objects in 85ms (well under the 150ms p95 SLA).
  - **Edge Cases:** When query parameters include `category_id`, Elasticsearch filters results strictly within that category before ranking by search relevance vector scores.

**Technical Requirements:**
- **Frontend Stack**: Built with React 18, Vite, and Tailwind CSS adhering to Constitution Section 4.2. Uses custom hooks for input debouncing (`300ms`) and `localStorage` for storing up to 5 recent queries.
- **Backend Stack**: Implemented in Python 3.11 with FastAPI (Constitution Section 4.1). REST endpoint `GET /api/v1/products/search` handles query validation (`q`, `limit`, `page`, `category_id`).
- **Database & Indexing**: Elasticsearch / dense vector search index mapping fields `title` (text/analyzed), `tags` (keyword/array), and `category_id` (keyword/filter).
- **Performance & SLA**: p95 response time < 150ms for queries `≥ 3` characters, optimized via Elasticsearch warm caches and vector KNN indices.
- **Design Tokens**: Token specifications `var(--radius-md)` (`8px`), `var(--elevation-2)`, and dropdown `max-height: 400px`.

### Acceptance Criteria
- Header Search Bar Layout & UX States: Centered search bar in primary nav header with dark overlay on focus, placeholder 'Search products, brands, or categories...', skeleton loading, empty state 'No products found for [query]' with Clear search CTA, and inline error alert 'Unable to load suggestions. Retrying...'. Token specs: max-height 400px, radius 8px (var(--radius-md)), shadow var(--elevation-2).
- Frontend Input Debouncing & Query Caching: 300ms input debounce before API calls. Local caching of up to 5 recent queries shown when input is focused empty.
- Keyboard Navigation & Accessibility: Down/Up Arrow for item focus, Enter to select highlighted item or raw query, Esc to close dropdown and reset focus.
- Backend Search API & Elasticsearch Vector Indexing: Endpoint GET /api/v1/products/search?q={query}&limit=10&page=1 with category_id filtering. Query against Elasticsearch / vector search index across title, tags, category_id with p95 < 150ms for query length >= 3.

### Backend Tasks
- None specified

### Frontend Tasks
- None specified

### Database Changes
Not yet authored.

### API Endpoints
- `GET /api/v1/products/search` — Retrieves product search suggestions and autocomplete results with optional category filtering

### UI Components
Not yet authored.

### Test Coverage
Not yet authored.

### Deployment Notes
Not yet authored.
