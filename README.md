# 🏠 HouseHelp Platform

**A comprehensive digital platform revolutionizing domestic services in Rwanda**

[![Platform Status](https://img.shields.io/badge/Platform-100%25%20Complete-brightgreen)](https://final-year-projects-ponz52g8y-ciairadukunda-gmailcoms-projects.vercel.app)
[![Deployment](https://img.shields.io/badge/Deployment-Production%20Ready-blue)](https://vercel.com)
[![Features](https://img.shields.io/badge/Features-13%2F13%20Operational-success)](#features)
[![Database](https://img.shields.io/badge/Database-825%2B%20Documents-orange)](#database-status)

> **🚀 Production Status**: Fully deployed and operational with comprehensive data across all modules

## 🎯 Platform Overview

HouseHelp is a complete ecosystem connecting households with verified domestic service workers in Rwanda. The platform provides end-to-end service management from job posting to payment processing, enhanced with AI-powered matching and comprehensive safety features.

## ✨ Core Features (13/13 Operational)

### 👥 **User Management System**
- Multi-role authentication (Households, Workers, Administrators)
- Comprehensive profile management with verification
- Role-based access control and permissions
- **Status**: ✅ 5 admins, 9 households, 11 workers registered

### 💼 **Job Management System** 
- Advanced job posting with detailed requirements
- Smart categorization and filtering
- Automated matching algorithms
- **Status**: ✅ 18 active postings, 64 applications processed

### 📅 **Booking & Appointment System**
- Real-time availability management
- Automated scheduling and confirmations
- Calendar integration with notifications
- **Status**: ✅ Fully integrated with worker schedules

### 📊 **Analytics & Reporting System**
- Real-time dashboard analytics
- Performance metrics and insights  
- Revenue tracking and forecasting
- **Status**: ✅ Live dashboards with comprehensive metrics

### 🔔 **Notification System**
- Multi-channel notifications (in-app, email)
- Real-time status updates
- Customizable notification preferences
- **Status**: ✅ 31 active notifications across all channels

### ⭐ **Service Quality Tracking**
- Comprehensive rating and review system
- Quality assurance monitoring
- Worker performance analytics
- **Status**: ✅ 57 reviews and ratings collected

### 🎓 **Worker Training System**
- Certification management
- Training module tracking
- Skill assessment and verification
- **Status**: ✅ 62 training records maintained

### 🛡️ **Isange Reporting System**
- Safety incident reporting
- Emergency response protocols
- Community safety monitoring
- **Status**: ✅ 14 safety reports managed

### 🔧 **System Maintenance Tracking**
- Platform health monitoring
- Automated maintenance scheduling
- Performance optimization tracking
- **Status**: ✅ 38 maintenance reports processed

### 🚨 **Emergency Services**
- 24/7 emergency response system
- Priority service allocation
- Rapid deployment protocols
- **Status**: ✅ 27 urgent services handled

### 💳 **Payment Processing**
- Secure multi-gateway payments
- Automated billing and invoicing
- Financial transaction tracking
- **Status**: ✅ 82 payment transactions processed

### 💬 **Real-time Communication**
- Instant messaging system
- File sharing capabilities
- Communication history tracking
- **Status**: ✅ 28 conversations, 339 messages exchanged

### 📍 **Worker Location Tracking**
- Real-time GPS tracking
- Route optimization
- ETA predictions and updates  
- **Status**: ✅ 40 tracking records maintained

## 🛠️ Tech Stack

### **Frontend**
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript (ES2020)
- **Styling**: Tailwind CSS + shadcn/ui components
- **Form Handling**: React Hook Form + Zod validation
- **State Management**: React Hooks + Context API

### **Backend & Database**
- **Database**: Firebase Firestore (17 active collections)
- **Authentication**: Firebase Auth with multi-role support
- **Storage**: Firebase Storage for file management
- **Admin SDK**: Dual configuration (environment variables + service account)

### **AI & Intelligence**
- **AI Framework**: Google Genkit for intelligent matching
- **Matching Algorithm**: AI-powered worker-job compatibility
- **Recommendations**: Machine learning-based service suggestions

### **Payments & Integration**
- **Payment Gateway**: Paypack integration
- **Transaction Processing**: Secure payment handling
- **Billing System**: Automated invoicing and receipts

### **DevOps & Deployment**
- **Hosting**: Vercel with automated deployments
- **Version Control**: Git with GitHub integration
- **CI/CD**: Automated testing and deployment pipeline
- **Monitoring**: Real-time performance tracking

## 🌐 Deployment & Access

### **Production Environment**
- **Live URL**: [https://final-year-projects-ponz52g8y-ciairadukunda-gmailcoms-projects.vercel.app](https://final-year-projects-ponz52g8y-ciairadukunda-gmailcoms-projects.vercel.app)
- **Status**: ✅ Fully operational
- **Environment**: Production-ready with SSL/TLS
- **Performance**: Optimized for speed and reliability

### **Development Environment**
- **Local URL**: http://localhost:3000
- **Hot Reload**: Enabled for rapid development
- **Debug Mode**: Full error tracking and logging

## 🚀 Getting Started

### **Prerequisites**
- Node.js 18+ (LTS recommended)
- npm or yarn package manager
- Firebase project with Firestore enabled
- Paypack merchant account (for payments)
- Git for version control

### **Quick Start**

1. **Clone the repository**:
```bash
git clone https://github.com/divinecia/Final-Year-Projects.git
cd Final-Year-Projects
```

2. **Install dependencies**:
```bash
npm install
# or
yarn install
```

3. **Environment Setup**:
Create `.env.local` file with your credentials:
```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin (for server-side operations)
FIREBASE_ADMIN_PROJECT_ID=your_project_id
FIREBASE_ADMIN_CLIENT_EMAIL=your_service_account_email
FIREBASE_ADMIN_PRIVATE_KEY=your_private_key

# Paypack Integration
NEXT_PUBLIC_PAYPACK_APP_ID=your_paypack_app_id
PAYPACK_APP_SECRET=your_paypack_secret
```

4. **Database Setup**:
```bash
# Seed the database with comprehensive test data
npm run seed:all

# Or seed specific modules
npm run seed:users
npm run seed:jobs
npm run seed:payments
```

5. **Start Development Server**:
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

### **Production Deployment**

The platform is automatically deployed to Vercel with every push to the main branch:

```bash
# Deploy to production
git push origin main
```

## 📊 Database Status

**Total Documents**: 825+ across 17 collections

| Collection | Documents | Purpose |
|------------|-----------|---------|
| `adminUsers` | 5 | System administrators |
| `householdUsers` | 9 | Household accounts |
| `serviceWorkers` | 11 | Service worker profiles |
| `jobPostings` | 18 | Available job postings |
| `jobApplications` | 64 | Job applications |
| `notifications` | 31 | System notifications |
| `reviews` | 57 | Service reviews & ratings |
| `isangeReports` | 14 | Safety incident reports |
| `maintenanceReports` | 38 | System maintenance logs |
| `urgentServices` | 27 | Emergency service requests |
| `payments` | 39 | Payment transactions |
| `servicePayments` | 18 | Service-specific payments |
| `trainingPayments` | 25 | Training fee payments |
| `chatConversations` | 28 | Communication threads |
| `chatMessages` | 339 | Individual messages |
| `workerTracking` | 40 | Location tracking data |
| `trainingRecords` | 62 | Worker training history |

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
