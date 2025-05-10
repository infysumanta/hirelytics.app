# Hirelytics - Role-Based Authentication System

A role-based authentication system built with Next.js, NextAuth v5, and MongoDB. This system supports three roles: admin, recruiter, and candidate, each with their own login, registration, and dashboard pages.

## Features

- **Role-Based Authentication**: Separate login and registration flows for admin, recruiter, and candidate roles
- **Protected Routes**: Role-specific dashboards and protected routes
- **MongoDB Integration**: User data stored in MongoDB
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

3. Set up environment variables:

   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` and add your MongoDB connection string and other required variables.

4. Run the development server:

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

## Dashboard Routes

- **Admin Dashboard**: `/admin/dashboard`
- **Recruiter Dashboard**: `/recruiter/dashboard`
- **Candidate Dashboard**: `/candidate/dashboard`

## Technologies Used

- Next.js 15
- NextAuth v5 (Auth.js)
- MongoDB & Mongoose
- Tailwind CSS
- shadcn/ui Components
- TypeScript
- Zod for validation
