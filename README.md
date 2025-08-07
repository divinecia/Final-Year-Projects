# Househelp Platform

A modern platform connecting households with trusted home service workers in Rwanda.

## Features

- **Multi-user Platform**: Support for households, workers, and administrators
- **Service Management**: Comprehensive service packages and job posting system
- **Real-time Messaging**: Communication between households and workers
- **Payment Integration**: Secure payments through Paypack
- **AI-powered Matching**: Smart worker-job matching using Genkit AI
- **Admin Dashboard**: Complete administrative control panel
- **Training Management**: Worker certification and training system

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Storage**: Firebase Storage
- **AI**: Google Genkit for intelligent matching
- **Payments**: Paypack integration
- **Form Handling**: React Hook Form + Zod validation

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Firebase project
- Paypack account (for payments)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd househelp-platform
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example
```
Fill in your Firebase and Paypack credentials.

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Database Setup

Run the seed script to populate initial data:
```bash
npm run seed
```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── admin/             # Admin dashboard
│   ├── household/         # Household user pages
│   ├── worker/            # Worker user pages
│   └── api/               # API routes
├── components/            # Reusable UI components
│   └── ui/               # shadcn/ui components
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions and configurations
├── ai/                   # Genkit AI flows
└── scripts/              # Database seeding and utilities
```

## User Types

### Households
- Register and post jobs
- Browse and hire workers
- Manage bookings and payments
- Rate and review services

### Workers
- Register and create profiles
- Browse job opportunities
- Manage schedule and earnings
- Complete training certifications

### Administrators
- Manage users and services
- Monitor platform activity
- Handle payments and disputes
- Manage training programs

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking
- `npm run seed` - Seed database with initial data

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

This project is licensed under the MIT License.
# Final-Year-Project
