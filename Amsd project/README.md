# 🍔 Online Food App

A full-stack MERN (MongoDB, Express.js, React.js, Node.js) food ordering application with separate Admin and Customer modules.

## Features

### Customer Module
- Browse restaurants by city
- View restaurant menus with category filtering
- Add items to cart with quantity management
- Place orders with Cash on Delivery
- Track order status (Placed → Preparing → Ready → Delivered)
- View order history
- Submit ratings and feedback

### Admin Module
- Add/edit/delete restaurants with image upload
- Add/edit/delete dishes with categories and pricing
- Dashboard with charts (revenue, orders, status breakdown)
- Manage order statuses
- View customer feedback and ratings

### Authentication
- JWT-based authentication
- bcrypt password hashing
- Separate login/signup for Admin and Customer
- Protected routes for both roles

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router, Context API, Chart.js, Bootstrap 5 |
| Backend | Node.js, Express.js, JWT, bcrypt, Multer |
| Database | MongoDB with Mongoose |
| Extras | React Toastify, React Icons, Axios |

## Project Structure

```
├── backend/
│   ├── middleware/       # Auth & upload middleware
│   ├── models/           # Mongoose schemas (User, Restaurant, Dish, Order, Cart, Feedback)
│   ├── routes/           # Express API routes
│   ├── uploads/          # Uploaded images
│   ├── server.js         # Entry point
│   └── .env              # Environment variables
├── frontend/
│   ├── public/
│   └── src/
│       ├── components/   # Reusable components (Navbar, Spinner, OrderTracker, StarRating)
│       ├── context/      # AuthContext, CartContext (state management)
│       └── pages/        # All page components
│           ├── auth/     # Login/Register pages
│           ├── admin/    # Admin dashboard, restaurants, dishes, orders, feedback
│           └── customer/ # Home, menu, cart, orders, order detail
```

## Getting Started

### Prerequisites
- Node.js (v16+)
- MongoDB (running locally on port 27017)

### Installation & Running

1. **Start MongoDB** (make sure it's running on `localhost:27017`)

2. **Backend:**
   ```bash
   cd backend
   npm install
   npm run dev
   ```
   Server runs on `http://localhost:5000`

3. **Frontend:**
   ```bash
   cd frontend
   npm install
   npm start
   ```
   App runs on `http://localhost:3000`

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register user |
| POST | /api/auth/login | Login user |
| GET | /api/auth/me | Get current user |
| GET | /api/restaurants | List restaurants |
| GET | /api/restaurants/meta/cities | Get cities |
| POST | /api/restaurants | Add restaurant (admin) |
| GET | /api/dishes/restaurant/:id | Get dishes by restaurant |
| POST | /api/dishes | Add dish (admin) |
| GET | /api/cart | Get cart |
| POST | /api/cart/add | Add to cart |
| POST | /api/orders/place | Place order |
| GET | /api/orders/my | Customer orders |
| GET | /api/orders/admin | Admin orders |
| PUT | /api/orders/:id/status | Update order status |
| POST | /api/feedback | Submit feedback |
| GET | /api/stats/dashboard | Admin dashboard stats |
