# DressField E-Commerce

Modern embroidery e-commerce platform built with TypeScript and .NET.

This project is being built for an embroidery business and focuses on a clean, scalable, and production-sensible architecture. The goal is to create a modern online store with strong SEO, multilingual support, secure payment integration, and a polished shopping experience.

## Tech Stack

### Frontend
- TypeScript
- React or Next.js
- Modern responsive UI
- Configurable language files for multilingual support
- Meta Pixel integration
- SEO-first frontend architecture

### Backend
- ASP.NET Core Web API
- Entity Framework Core
- MySQL
- Modular monolith architecture
- Clean separation of concerns

### Infrastructure
- Frontend hosting: Hostinger
- Backend hosting: Azure App Service
- Database and mail: Hostinger
- Deployment: Git-based deployment on Azure

## Core Features

- Product catalog
- Categories
- Cart
- Checkout flow
- Bank of Georgia payment integration
- User authentication and authorization
- Admin product management
- Multilingual content support
- SEO-friendly page structure
- Analytics and conversion tracking

## Project Goals

- Keep the architecture solid but not overcomplicated
- Build a maintainable codebase with room to grow
- Prioritize SEO from day one
- Keep the UI modern, mobile-first, and conversion-focused
- Use practical patterns only where they add value

## Planned Architecture

The system is planned as a **modular monolith** with clearly separated layers:

- Frontend
- API
- Domain/Application logic
- Infrastructure
- Persistence

This approach keeps development fast and maintainable without introducing unnecessary microservice complexity too early.

## High-Level Phases

### 1. Frontend
- UI architecture
- Routing
- Localization
- SEO foundation
- Meta Pixel integration
- Product, category, cart, and checkout pages

### 2. API Design
- Backend structure
- Database design
- EF Core setup
- Authentication and authorization
- Product, cart, order, and admin endpoints

### 3. Payment Systems
- Bank of Georgia integration
- Payment initiation
- Callback/webhook handling
- Payment state management

### 4. Deployment
- Environment setup
- Hosting configuration
- CI/CD
- Migrations
- Monitoring and production hardening

## Repository Structure

This repository will contain:
- frontend application
- backend API
- architecture notes
- configuration examples
- deployment setup
