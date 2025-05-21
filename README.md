# Hirelytics - Advanced Recruitment Platform

A comprehensive recruitment and hiring platform built with Next.js 15, NextAuth v5, and MongoDB. This system supports three roles: admin, recruiter, and candidate, each with their own login, registration, and dashboard experiences.

## Features

- **Role-Based Authentication**: Separate login and registration flows for admin, recruiter, and candidate roles
- **Registration Control**: Toggle user registration on/off with a simple environment variable
- **Waitlist System**: Collect interested user information when registration is disabled
- **Protected Routes**: Unified dashboard with role-specific content and protected routes
- **Enhanced Security**:
  - Automatic redirects for authenticated/unauthenticated users
  - JWT-based session management
  - Password hashing with bcrypt
  - Form validation with Zod
- **MongoDB Integration**: Persistent data storage for users, jobs, and applications
- **AWS S3 Integration**: File storage for resumes, profile images, and audio files
- **AI Interview System**:
  - Automated technical interviews with Gemini AI
  - Real-time audio processing and text-to-speech
  - Webcam monitoring and attention tracking
  - Automatic interview evaluation and feedback
- **Multi-language Support**:
  - Internationalization with next-intl
  - Support for English and Hindi (extensible to more languages)
- **Social Media Sharing**: Share job posts across multiple platforms including:
  - Facebook
  - LinkedIn
  - Telegram
  - WhatsApp
  - Facebook Messenger
- **Modern UI**: Built with Tailwind CSS, shadcn/ui components and Framer Motion animations

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- MongoDB database (local or Atlas)
- AWS S3 compatible storage (for file uploads)

### Environment Setup

Create a `.env.local` file in the root directory with the following variables:

```bash
# MongoDB Connection
# Use MongoDB Atlas or a local MongoDB instance
MONGODB_URI=your_mongodb_connection_string

# NextAuth Configuration
# Generate a secret with: openssl rand -base64 32
NEXTAUTH_SECRET=your_random_string_for_jwt_encryption

# Registration Control
# Set to 'true' to allow new users to register, 'false' to disable registration
REGISTRATION_ENABLED=true

# Admin Email for Notifications
# Receives emails when new users join the waitlist
ADMIN_EMAIL=your_admin_email
NEXTAUTH_URL=http://localhost:3000

# AWS S3 Configuration (or S3-compatible storage like Tigris)
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=auto
AWS_ENDPOINT_URL_S3=https://your-s3-endpoint
AWS_BUCKET_NAME=your_bucket_name

# AI Services API Keys
# Required for AI interview features
GOOGLE_API_KEY=your_google_api_key_for_gemini_ai
DEEPGRAM_API_KEY=your_deepgram_api_key_for_tts
```

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

## Key Features

### For Recruiters

- Create and manage job listings with detailed requirements
- Review candidate applications and resumes
- Schedule and conduct AI-powered interviews
- Evaluate candidate performance with automated insights
- Share job postings across social media platforms

### For Candidates

- Search and apply for jobs with a user-friendly interface
- Upload and manage resume and profile information
- Participate in AI interviews from any location
- Receive automated feedback on interview performance
- Track application status in real-time

### For Administrators

- Manage all users, jobs, and applications
- View comprehensive analytics and reports
- Configure system settings and access controls
- Monitor platform activity and usage metrics

## Technologies Used

### Frontend

- Next.js 15 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- shadcn/ui Components
- Framer Motion animations
- Sonner for toast notifications
- TanStack React Query
- next-intl for internationalization

### Backend

- NextAuth v5 (Auth.js) for authentication
- MongoDB & Mongoose for data persistence
- AWS S3 compatible storage for file uploads
- Server Actions for API functionality

### AI Features

- Google Gemini AI for interviews and evaluations
- Deepgram API for text-to-speech
- Speech recognition for candidate responses
- Automated technical interview evaluation

### Tools & Utilities

- Zod for form validation
- React Hook Form for form handling
- next-share for social media sharing
- DND Kit for drag and drop functionality
- Recharts for interactive charts and data visualization

## Quick Start

```bash
# Clone repository
git clone https://github.com/yourusername/hirelytics.git

# Install dependencies
cd hirelytics
pnpm install

# Set up environment variables
cp .env.example .env.local  # Then edit .env.local with your values

# Create an admin user
pnpm tsx scripts/create-admin.ts "Admin Name" "admin@example.com" "password"

# Start development server
pnpm dev
```

## Project Structure

```bash
src/
  ├── actions/       # Server actions
  ├── app/           # App router components and API routes
  ├── components/    # Reusable UI components
  ├── constants/     # Application constants
  ├── contexts/      # React contexts
  ├── hooks/         # Custom React hooks
  ├── i18n/          # Internationalization
  ├── lib/           # Utility functions
  ├── models/        # MongoDB models
  ├── provider/      # Global providers
  └── types/         # TypeScript type definitions
```

## AI Interview System

The platform features an advanced AI interview system that allows candidates to participate in automated technical interviews:

1. **Interview Preparation**: Candidates can check their camera and microphone before starting the interview.

2. **AI-Driven Questions**: The system asks technical, project-related, and behavioral questions tailored to the job position.

3. **Real-time Responses**: Candidates can respond via text or speech, with real-time speech recognition.

4. **Attention Monitoring**: The system monitors candidate attention through webcam and window focus tracking.

5. **Automated Evaluation**: After completion, the system generates an evaluation report with scores for technical skills, communication skills, problem-solving, and cultural fit.

6. **Feedback Generation**: Detailed feedback including strengths and areas for improvement is automatically generated.

## Development Roadmap

### Completed Features

- Role-based authentication system
- Job posting and application management
- Resume upload and parsing
- AI interview system with Gemini AI
- Automated interview evaluation
- Multi-language support (English, Hindi)

### Planned Enhancements

- Mobile application for on-the-go interviews
- Integration with calendar systems for interview scheduling
- Enhanced resume parsing with AI
- Video recording of interviews for later review
- Integration with ATS (Applicant Tracking Systems)
- Additional language support
- Advanced analytics dashboard

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
