# SafeTrail - Tourist Safety Platform

## Overview

SafeTrail is a comprehensive safety-focused web application designed for travelers, specifically targeting tourists visiting North East India. The platform provides real-time safety information, digital identification, emergency services access, and community features to enhance traveler security and experience. Built as a full-stack web application with React frontend and serverless backend, it offers features like digital tourist IDs, scam awareness, emergency assistance, location-based services, and traveler community networking.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Library**: Shadcn/ui components built on Radix UI primitives for accessible, customizable interface components
- **Styling**: Tailwind CSS with custom CSS variables for theming and responsive design
- **State Management**: React Query (TanStack Query) for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Notifications**: React Hot Toast for user feedback and alerts

### Backend Architecture
- **Runtime**: Node.js with TypeScript
- **Deployment**: Vercel serverless functions for API endpoints
- **Storage**: Currently using in-memory storage (MemStorage) for development, with Drizzle ORM configured for PostgreSQL production database
- **API Design**: RESTful API with endpoints for authentication, profile management, and digital ID generation

### Data Storage Solutions
- **Development**: In-memory storage implementation for rapid prototyping
- **Production Ready**: Drizzle ORM configured with PostgreSQL schema for persistent data storage
- **Database Provider**: Neon Database integration configured for hosted PostgreSQL
- **Schema**: Defined entities for users, tourist profiles, and digital IDs with proper relationships and constraints

### Authentication and Authorization
- **Simple Login System**: Tourist ID and full name based authentication for easy access
- **Profile Management**: Comprehensive tourist profile creation with emergency contacts, accommodation details, and travel preferences
- **Session Management**: Local storage for user session persistence across browser sessions

### Core Features Architecture
- **Digital ID System**: Blockchain-inspired digital tourist identification with verification levels and status tracking
- **Safety Hub**: Emergency services directory with location-based contact information
- **Interactive Maps**: Location services for hotels, safety zones, and points of interest
- **Community Features**: Traveler networking, group formation, and experience sharing
- **Scam Awareness**: Real-time scam reporting and alert system with community verification
- **AI Assistant**: Intelligent travel guidance and information system

## External Dependencies

### UI and Styling
- **Radix UI**: Comprehensive component primitives for accessible UI components
- **Tailwind CSS**: Utility-first CSS framework for responsive design
- **Lucide React**: Icon library for consistent iconography
- **Class Variance Authority**: Type-safe component variant management

### Backend Services
- **Vercel**: Hosting platform and serverless functions runtime
- **Neon Database**: Hosted PostgreSQL database service
- **Drizzle ORM**: Type-safe database ORM with PostgreSQL adapter

### Development Tools
- **TypeScript**: Type safety across frontend and backend
- **Vite**: Fast build tool and development server
- **React Hook Form**: Form management and validation
- **Zod**: Schema validation for data integrity

### Maps and Location
- **Leaflet**: Open-source mapping library for interactive maps
- **React Leaflet**: React components for Leaflet integration

### Deployment Configuration
- **Vercel Deployment**: Static site generation with serverless API functions
- **Build Process**: Vite build system with TypeScript compilation
- **Environment Variables**: Database connection and API configuration management