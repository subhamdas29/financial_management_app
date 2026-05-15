# PayFlow — Financial Management App

<p align="center">
  <img src="frontend/src/assets/PayFlowLogo.png" alt="PayFlow Logo" width="300"/>
</p>

<p align="center">
  <strong>A full-stack financial management application built with Node.js, Express, TypeScript, Prisma, PostgreSQL, Socket.IO, and React.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-20+-339933?style=for-the-badge&logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/React-18+-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/PostgreSQL-16+-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" />
  <img src="https://img.shields.io/badge/Prisma-5+-2D3748?style=for-the-badge&logo=prisma&logoColor=white" />
</p>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Screenshots](#screenshots)
- [Deployment](#deployment)
- [Author](#author)

---

## 🧾 Overview

PayFlow is a personal financial management app that lets you manage multiple bank accounts, track income and expenses through a folder-based system, make real-time transfers, and send money to other users — all in a clean, modern dark-themed UI.

Built as a full-stack learning project to master **Node.js**, **Express**, **TypeScript**, **Prisma**, and **React** — covering everything from JWT authentication, atomic database transactions, real-time Socket.IO events, to production deployment.

---

## ✨ Features

### 💳 Account Management
- Create and manage multiple bank accounts (Savings, Current, Salary, Fixed Deposit)
- Real-time balance tracking across all accounts
- Account activation/deactivation with safe deletion

### 💸 Transactions
- Manual debit and credit transaction entry
- Assign transactions to folders for categorization
- Filter transactions by type, date range, account, or folder
- Paginated transaction history
- Real-time transaction updates via Socket.IO

### 📁 Folder System
- Create income and expense folders (e.g. Salary, Rent, Food, Shopping)
- Set monthly budget limits per folder
- Visual budget progress bar with over-budget alerts
- Monthly spending summary per folder
- All-time statistics per folder

### 🔄 Transfers
- Atomic account-to-account transfers (uses Prisma `$transaction`)
- Transfer history with full account details
- Monthly and all-time transfer statistics
- Prevents partial transfers — if either side fails, both roll back

### 🔍 User Search & Send Money
- Search other registered users by email
- View their linked accounts
- Send money directly from your account to theirs

### 🔔 Real-Time Updates
- Socket.IO integration for live transaction notifications
- Authenticated socket connections using JWT
- Per-user private rooms for secure event delivery

### 🔐 Authentication
- JWT-based authentication with access + refresh token strategy
- Bcrypt password hashing (12 rounds)
- Protected routes on both frontend and backend
- Auto token refresh on expiry

---

## 🛠 Tech Stack

### Backend
| Technology | Purpose |
|-----------|---------|
| Node.js 20+ | Runtime |
| Express.js | Web framework |
| TypeScript | Type safety |
| Prisma ORM | Database access |
| PostgreSQL | Primary database |
| Socket.IO | Real-time events |
| JWT | Authentication |
| Bcrypt | Password hashing |
| Zod | Input validation |
| Helmet | Security headers |
| Morgan | HTTP logging |
| CORS | Cross-origin requests |

### Frontend
| Technology | Purpose |
|-----------|---------|
| React 18 | UI framework |
| TypeScript | Type safety |
| Vite | Build tool |
| Tailwind CSS v3 | Styling |
| Zustand | State management |
| Axios | HTTP client |
| Socket.IO Client | Real-time connection |
| Recharts | Data visualization |
| React Router v6 | Client-side routing |
| Lucide React | Icons |
| React Hot Toast | Notifications |

---

## 📁 Project Structure

```
PayFlow/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.ts        # Prisma client singleton
│   │   │   ├── env.ts             # Zod env validation
│   │   │   └── socket.ts          # Socket.IO setup
│   │   ├── modules/
│   │   │   ├── auth/              # Register, login, refresh
│   │   │   ├── accounts/          # Bank account CRUD
│   │   │   ├── transactions/      # Transaction management
│   │   │   ├── folders/           # Folder system
│   │   │   ├── transfers/         # Account transfers
│   │   │   └── users/             # User search
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts # JWT protection
│   │   │   ├── error.middleware.ts# Global error handler
│   │   │   └── validate.middleware.ts # Zod validation
│   │   ├── shared/
│   │   │   ├── types/             # Shared TypeScript types
│   │   │   └── utils/             # ApiError, ApiResponse, asyncHandler
│   │   └── app.ts                 # Express entry point
│   ├── prisma/
│   │   └── schema.prisma          # Database schema
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
└── frontend/
    ├── src/
    │   ├── api/                   # Axios API modules
    │   ├── assets/                # Logo and images
    │   ├── components/
    │   │   ├── layout/            # Sidebar, Header, Layout
    │   │   └── ui/                # Button, Card, Input, Modal, Badge
    │   ├── hooks/                 # useSocket
    │   ├── pages/                 # All page components
    │   ├── store/                 # Zustand auth + socket stores
    │   ├── types/                 # TypeScript interfaces
    │   └── main.tsx               # App entry + router
    ├── .env.example
    ├── tailwind.config.js
    └── vite.config.ts
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- PostgreSQL 14+
- npm or yarn

### 1. Clone the repository
```bash
git clone https://github.com/subhamdas29/Financial_management_app.git
cd Financial_management_app
```

### 2. Set up the backend
```bash
cd backend
npm install
```

Copy the example env file and fill in your values:
```bash
cp .env.example .env
```

Run database migrations:
```bash
npx prisma migrate dev --name init
```

Start the backend dev server:
```bash
npm run dev
```

Backend runs at `http://localhost:3000`

### 3. Set up the frontend
```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`

---

## 🔐 Environment Variables

### Backend `.env`
```env
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/bankingapp"
JWT_SECRET="your_super_secret_jwt_key_minimum_32_characters_long"
JWT_REFRESH_SECRET="your_super_secret_refresh_key_minimum_32_characters"
JWT_ACCESS_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
PORT=3000
NODE_ENV=development
```

### Frontend `.env`
```env
VITE_API_URL=http://localhost:3000/api
VITE_SOCKET_URL=http://localhost:3000
```

---

## 📡 API Documentation

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login and get tokens |
| POST | `/api/auth/refresh` | Refresh access token |

### Accounts
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/accounts` | Get all accounts |
| GET | `/api/accounts/summary` | Get total balance summary |
| GET | `/api/accounts/:id` | Get single account |
| POST | `/api/accounts` | Create account |
| PATCH | `/api/accounts/:id` | Update account |
| DELETE | `/api/accounts/:id` | Delete/deactivate account |

### Transactions
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/transactions` | Get transactions (paginated, filterable) |
| GET | `/api/transactions/stats` | Get income/expense stats |
| GET | `/api/transactions/:id` | Get single transaction |
| POST | `/api/transactions` | Create transaction |
| PATCH | `/api/transactions/:id` | Update transaction (assign folder) |

### Folders
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/folders` | Get all folders |
| GET | `/api/folders/summary` | Get all folders with monthly spending |
| GET | `/api/folders/:id` | Get single folder |
| GET | `/api/folders/:id/summary` | Get folder detail with budget status |
| POST | `/api/folders` | Create folder |
| PATCH | `/api/folders/:id` | Update folder |
| DELETE | `/api/folders/:id` | Delete folder |

### Transfers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/transfers` | Get all transfers |
| GET | `/api/transfers/stats` | Get transfer statistics |
| GET | `/api/transfers/:id` | Get single transfer |
| POST | `/api/transfers` | Create transfer |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/search?email=` | Search users by email |

---

## 🗄 Database Schema

```
User
 ├── id, email, passwordHash, name
 ├── → Account[]
 └── → Folder[]

Account
 ├── id, userId, name, accountNumber
 ├── accountType (SAVINGS/CURRENT/SALARY/FIXED_DEPOSIT)
 ├── balance (Decimal 15,2), currency, isActive
 ├── → Transaction[]
 ├── → Transfer[] (sent)
 └── → Transfer[] (received)

Folder
 ├── id, userId, name
 ├── type (INCOME/EXPENSE)
 ├── color, icon, description, budgetLimit
 └── → Transaction[]

Transaction
 ├── id, accountId, folderId (nullable)
 ├── amount, type (CREDIT/DEBIT)
 ├── description, merchant, status
 ├── transactedAt, metadata (JSON)
 └── indexes on accountId, folderId, transactedAt

Transfer
 ├── id, fromAccountId, toAccountId
 ├── amount, description, status
 └── transferredAt
```

---

## ☁️ Deployment

### Backend — Railway
1. Push code to GitHub
2. Create new project on [railway.app](https://railway.app)
3. Add PostgreSQL database plugin
4. Set environment variables
5. Railway auto-deploys on push

### Frontend — Vercel
1. Import repo on [vercel.com](https://vercel.com)
2. Set root directory to `frontend`
3. Add `VITE_API_URL` and `VITE_SOCKET_URL` environment variables
4. Deploy

---

## 👨‍💻 Author

**Subham Das**
- GitHub: [@subhamdas29](https://github.com/subhamdas29)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<p align="center">Built with ❤️ to master Node.js, Express, TypeScript, Prisma, and React</p>