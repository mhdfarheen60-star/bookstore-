# Bookstore Application

A full-stack bookstore application with React (Vite) frontend and Node.js/Express/MongoDB backend.

## Project Structure

```
bookstore-app-upgraded/
├── backend/                 # Express.js backend API
│   ├── config/             # Database configuration
│   ├── controllers/        # Request handlers
│   ├── middleware/         # Auth, validation, error handling
│   ├── models/             # Mongoose models
│   ├── routes/             # API routes
│   ├── utils/              # Utility functions
│   ├── server.js           # Express app entry point
│   ├── seed.js             # Database seeding script
│   ├── package.json
│   └── .env                # Environment variables
├── src/                    # React frontend
│   ├── api/                # API client
│   ├── context/            # React contexts (Auth, Cart) + useAuth/useCart hooks
│   ├── components/         # Shared components (Footer, Preloader, RouteGuards)
│   ├── data/               # Local data & API transformers
│   ├── pages/              # Auth + 404 pages
│   ├── user/               # User-facing components/pages
│   ├── admin/              # Admin panel
│   │   ├── components/     # AdminLayout, AdminHeader, Sidebar, Ui primitives
│   │   ├── pages/          # Dashboard, Books, Categories, Orders, Users
│   │   ├── hooks/          # useAsync (fetch with loading/error state)
│   │   └── utils/          # Money / date / number formatting
│   ├── utils/              # Utility functions
│   ├── App.jsx             # Main app component
│   ├── main.jsx            # Entry point
│   └── index.css           # Global styles
├── public/                 # Static assets (favicon, icons)
├── package.json
├── vite.config.js
└── .env                    # Frontend environment variables
```

## Features

### Frontend (React + Vite + Tailwind CSS)
- **Home Page**: Hero section, trending books, featured spotlight, genre navigation
- **All Books Page**: Search, filter by genre, sort, pagination
- **Book Detail Page**: Full book info, related books
- **Authentication**: Login/Register with JWT, password visibility toggle, role-aware redirects
- **User Profile**: Profile management, order history, password change
- **Shopping Cart**: Persistent cart with quantity management
- **Checkout**: Shipping address form, COD payment, order summary
- **Route Guards**: `/profile`, `/cart` and every `/admin/*` route are protected
  (`ProtectedRoute`, `AdminRoute`, `GuestRoute` in `src/components/RouteGuards.jsx`)

### Admin Panel (`/admin/*`, admin role required)
- **Dashboard**: live totals, orders-per-day chart, revenue-per-month trend,
  books-per-category donut, best sellers, recent orders, low-stock alerts
- **Books**: full CRUD, search + category filter, pagination, stock and discount
  display, hide/activate toggle. Deactivated books are visible to admins via the
  `includeInactive` flag and are hidden from the storefront
- **Categories**: full CRUD with book counts, slug auto-generation, search
- **Orders**: list with search/status filter, order detail drawer, status and
  payment-status updates
- **Users**: list with search/role filter, promote/demote, activate/deactivate,
  delete (the API refuses to remove the last admin or your own account)

### Backend (Node.js + Express + MongoDB)
- **Authentication**: JWT-based auth with HttpOnly cookies, bcrypt password hashing
- **User Management**: Registration, login, profile update, password change, role-based access
- **Book Management**: CRUD operations, search, filtering, pagination, featured books
- **Category Management**: CRUD operations with book counts
- **Shopping Cart**: Add/update/remove items, stock validation, price snapshots
- **Order Management**: Create orders from cart, stock decrement, order history, cancellation
  - Stock decrements use a guarded `$inc` so concurrent checkouts cannot drive
    stock negative; MongoDB transactions are used automatically when the
    deployment is a replica set (Atlas), with a sequential fallback for standalone
- **Admin Dashboard**: Overview stats, revenue, best-sellers, low stock, sales trends
- **Security**: Helmet, CORS, rate limiting (auth / api / admin tiers), input
  validation, markup sanitisation, regex escaping on search, prototype-pollution guard

## Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

## Installation

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm run seed  # Optional: seed sample data
npm run dev   # Development server with auto-reload
# or
npm start     # Production server
```

### Frontend

```bash
# From project root
npm install
cp .env.example .env  # If exists, or create .env with VITE_API_URL
npm run dev
```

## Environment Variables

### Backend (.env)

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/bookstore
JWT_SECRET=your_super_secret_jwt_key_min_32_chars
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:5000/api
```

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login user |
| POST | /api/auth/logout | Logout user |
| GET | /api/auth/me | Get current user |
| PUT | /api/auth/profile | Update profile |
| PUT | /api/auth/change-password | Change password |

### Books
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/books | List books (with filters, pagination) |
| GET | /api/books/featured | Get featured books |
| GET | /api/books/search | Search books |
| GET | /api/books/:id | Get book by ID |
| POST | /api/books | Create book (admin) |
| PUT | /api/books/:id | Update book (admin) |
| DELETE | /api/books/:id | Delete book (admin) |
| PATCH | /api/books/:id/stock | Update stock (admin) |

### Categories
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/categories | List all categories |
| GET | /api/categories/:id | Get category by ID |
| POST | /api/categories | Create category (admin) |
| PUT | /api/categories/:id | Update category (admin) |
| DELETE | /api/categories/:id | Delete category (admin) |

### Cart (Auth Required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/cart | Get user's cart |
| POST | /api/cart/items | Add item to cart |
| PUT | /api/cart/items/:bookId | Update item quantity |
| DELETE | /api/cart/items/:bookId | Remove item from cart |
| DELETE | /api/cart | Clear cart |

### Orders (Auth Required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/orders | Create order from cart |
| GET | /api/orders/my-orders | Get user's orders |
| GET | /api/orders/:id | Get order details |
| PATCH | /api/orders/:id/cancel | Cancel order |

### Admin (Admin Only)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/admin/dashboard | Dashboard statistics |
| GET | /api/admin/users | List all users |
| GET | /api/admin/users/:id | Get user details |
| GET | /api/admin/users/:id/orders | Get a user's orders |
| PUT | /api/admin/users/:id | Update user (name, phone, address, role, isActive) |
| DELETE | /api/admin/users/:id | Delete user |
| GET | /api/admin/orders | List all orders |
| GET | /api/admin/orders/:id | Get order details |
| PATCH | /api/admin/orders/:id/status | Update order/payment status |

Book and category mutations also require the admin role – see the Books and
Categories tables above. `GET /api/books?includeInactive=true` additionally
returns deactivated books, but only for admins (403 otherwise).

### Admin Frontend Routes
| Route | Module |
|-------|--------|
| /admin/dashboard | Live statistics and charts |
| /admin/books | Book CRUD |
| /admin/categories | Category CRUD |
| /admin/orders | Order list + status updates |
| /admin/users | User management |
| /admin/settings, /admin/resource | Placeholder pages inside the admin shell |

The older `/admin-dashboard`, `/admin-resource` and `/admin-settings` paths
still work and redirect to the equivalents above.

## Database Models

### User
- name, email (unique), password (hashed), role (customer/admin), isActive, address, phone

### Book
- title, author, description, price, originalPrice, coverImage, category (ref), isbn, publisher, publishedYear, stock, language, rating, reviewCount, featured, isActive, colors, glyph

### Category
- name, slug (unique), description, image, isActive

### Cart
- user (ref, unique), items[{ book (ref), quantity, priceAtAdd }]

### Order
- user (ref), orderNumber (unique), items[{ book (ref), title, author, coverImage, price, quantity }], shippingAddress, subtotal, shippingFee, tax, total, status, paymentStatus, paymentMethod, notes

## Seeding Database

```bash
cd backend
npm run seed
```

Creates:
- 11 categories
- 18 books with images
- Admin user: admin@bookstore.com / Admin@123
- Test customer: customer@test.com / Customer@123

**⚠️ Change default passwords in production!**

## Development

### Running Both Servers

1. Start MongoDB (local or use Atlas)
2. Start backend: `cd backend && npm run dev`
3. Start frontend: `npm run dev` (from project root)

Frontend runs on http://localhost:5173 (or 5174)
Backend runs on http://localhost:5000

### Health Check

```bash
curl http://localhost:5000/api/health
```

## Production Deployment

### Backend
1. Set NODE_ENV=production
2. Use strong JWT_SECRET
3. Use MongoDB Atlas or replica set for transactions
4. Set up proper CORS origins
5. Use PM2 or similar process manager
6. Configure reverse proxy (nginx)

### Frontend
1. Build: `npm run build`
2. Serve dist/ folder with nginx or static hosting
3. Set VITE_API_URL to production API URL

## Security Notes

- Passwords hashed with bcrypt (12 rounds)
- JWT tokens in HttpOnly cookies, plus a Bearer-token fallback
- Frontend requests send `credentials: 'include'` so the cookie is usable cross-origin
- Helmet for security headers
- Input sanitization on all requests – markup, event handlers and `javascript:`
  URLs are stripped, while ordinary prose (`x < y`) is left untouched
- Prototype-pollution guard on `__proto__` / `constructor` / `prototype` keys
- Regex escaping on admin search fields, so input like `(` or `[` cannot 500 the query
- Rate limiting: `/api/auth` 20 req/15 min, `/api` 600 req/15 min,
  `/api/admin/dashboard` 60 req/min (limits are relaxed automatically when
  `NODE_ENV` is not `production`)
- Express-validator for request validation
- Role-based access control (customer/admin), enforced on every admin route and
  mirrored in the UI by `AdminRoute`
- MongoDB injection protection via Mongoose
- No sensitive data in frontend env variables

### Before deploying

1. **Rotate `JWT_SECRET`** if `backend/.env` was ever committed, and use a long
   random value (32+ characters).
2. **Change the seeded passwords** (`admin@bookstore.com` / `Admin@123`,
   `customer@test.com` / `Customer@123`) or delete those accounts.
3. Set `NODE_ENV=production` so cookies are `Secure`/`SameSite=None` and the
   rate limits tighten.
4. Use MongoDB Atlas or a replica set so order creation and cancellation run
   inside a transaction.

### Known trade-off

The JWT is still mirrored in `localStorage` for the `Authorization` header, which
is XSS-exposed. Moving to cookie-only auth (dropping the token from the response
body and reading it solely from the httpOnly cookie) would close that gap; it was
left as-is because it touches every auth flow.

## Tech Stack

**Frontend:**
- React 19
- Vite 8
- React Router 7
- Tailwind CSS 4
- FontAwesome Icons
- Lucide React

**Backend:**
- Node.js
- Express 4
- MongoDB/Mongoose 8
- JWT (jsonwebtoken)
- bcryptjs
- express-validator
- Helmet
- Morgan
- cookie-parser

## License

MIT