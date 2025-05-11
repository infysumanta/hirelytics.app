# Hirelytics - Role-Based Authentication System

A role-based authentication system built with Next.js, NextAuth v5, and MongoDB. This system supports three roles: admin, recruiter, and candidate, each with their own login, registration, and dashboard pages.

## Features

- **Role-Based Authentication**: Separate login and registration flows for admin, recruiter, and candidate roles
- **Protected Routes**: Unified dashboard with role-specific content and protected routes
- **Enhanced Security**:
  - Automatic redirects for authenticated/unauthenticated users
  - JWT-based session management
  - Password hashing with bcrypt
  - Form validation with Zod
- **MongoDB Integration**: User data stored in MongoDB
- **Social Media Sharing**: Share job posts across multiple platforms including:
  - Facebook
  - LinkedIn
  - Telegram
  - WhatsApp
  - Facebook Messenger
- **Modern UI**: Built with Tailwind CSS and shadcn/ui components

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- MongoDB database (local or Atlas)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/hirelytics.git
   cd hirelytics
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Run the development server:

   ```bash
   pnpm dev
   ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

### Creating an Admin User

Admin users cannot register through the UI and must be created using a script:

```bash
pnpm tsx scripts/create-admin.ts "Admin Name" "admin@example.com" "password"
```

## Authentication Routes

- **Main Login**: `/login`
- **Admin Login**: `/login/admin`
- **Recruiter Login**: `/login/recruiter`
- **Candidate Login**: `/login/candidate`
- **Recruiter Registration**: `/register/recruiter`
- **Candidate Registration**: `/register/candidate`

## Dashboard Route

- **Unified Dashboard**: `/dashboard` (content changes based on user role)

## Technologies Used

- Next.js 15
- NextAuth v5 (Auth.js)
- MongoDB & Mongoose
- Tailwind CSS
- shadcn/ui Components
- TypeScript
- Zod for validation
