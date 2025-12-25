# 🌍 HumanMap (working title)

**Locally** is a Google Maps–based mobile application that combines:

- a marketplace for goods
- a services & freelance platform
- a local social utility network

The core idea:

> **People are the primary entities**, not apartments, products, or companies.

The app helps you discover nearby people who:

- sell or want to buy goods
- offer or request services
- are ready to interact locally, directly, and efficiently

---

## 🧠 Product Philosophy

- Local-first — people nearby come first
- Trust-based — ratings, reviews, verification
- One app — for core needs of a social human
- No middlemen — direct peer-to-peer interaction
- Privacy-aware — exact location is never exposed

This is not just another marketplace.  
It’s a **map of real people and their capabilities**.

---

## ✨ Core Features

### 🗺️ Map

- Google Maps as the main screen
- User profile markers
- Marker clustering by zoom level
- Filters by category (goods / services / requests)

### 👤 User Profiles

- Avatar, name, rating
- Location radius (no exact address)
- Lists of:
  - items for sale
  - items wanted
  - services offered
  - services requested

### 🛒 Marketplace

- Buy & sell physical goods
- Wishlists
- Local discovery
- Categories and tags

### 🛠️ Services & Freelance

- Offer services (from dog walking to web development)
- Create service requests
- Fixed or hourly pricing
- Deal status tracking

### 💬 Chat & Deals

- Real-time chat (WebSockets)
- Negotiation and agreement flow
- Deal confirmation
- Completion and rating

---

## 🧱 Tech Stack

### 📱 Frontend

- React Native
- Expo
- TypeScript
- React Navigation
- Zustand / Redux Toolkit
- Google Maps SDK
- Axios

### 🧠 Backend

- NestJS
- PostgreSQL
- Prisma ORM
- JWT Authentication
- WebSockets (chat)
- REST API

### ☁️ Infrastructure

- Docker
- AWS (RDS, S3, ECS)
- Nginx (reverse proxy)

---

## 🗂️ Architecture (High-Level)

### Core Entities:

- `User`
- `Profile`
- `Listing` (goods)
- `Service`
- `Request`
- `Deal`
- `Message`
- `Review`

### Backend Modules:

- Auth
- Users
- Listings
- Services
- Deals
- Chat
- Reviews

---

## 📁 Repository Structure (planned)
