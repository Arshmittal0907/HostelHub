# HostelHub — Smart Multi-College Hostel Management System

[![Node.js](https://img.shields.io/badge/Node.js-v20.x_LTS-green.svg)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16.x-blue.svg)](https://www.postgresql.org/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-5.22-darkblue.svg)](https://www.prisma.io/)
[![React](https://img.shields.io/badge/React-18.x-61dafb.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8.svg)](https://tailwindcss.com/)
[![Tests](https://img.shields.io/badge/Vitest-7_Passed-brightgreen.svg)]()

> **B.Tech Capstone Project — Production-Grade Multi-Tenant Hostel ERP System**  
> Built by a 4-student development team for college competitions, hackathons, and enterprise deployment.

---

## 🌟 Executive Summary

**HostelHub** is a production-style, multi-college hostel management software platform that solves the chaotic, paper-heavy operations of modern university residential complexes. Unlike single-hostel toy scripts or static dashboard mockups, HostelHub provides an end-to-end multi-tenant system where independent colleges register, configure boys' and girls' hostels, allocate rooms atomically, conduct daily attendance roll calls, track mess menus, schedule laundry washing machines, manage fee invoices and payments with receipts, adjudicate fines and student appeals, manage service helpdesk tickets with two-way messaging, and issue **cryptographically verifiable Digital QR Gate Passes** for security checkpoints.

---

## 🚀 Key Feature Matrix

### 1. Platform Administration & College Governance
- **Institutional Accreditation**: University representatives submit official registration requests with document proofs.
- **Admin Verification Portal**: Platform Admins review, approve, reject, or suspend institutions with logged justifications.
- **Public College Directory**: Searchable directory showcasing accredited colleges, location pins, and residential hostels.
- **Global Tamper-Proof Audit Ledger**: Reverse-chronological event stream capturing administrative decisions, status shifts, and IP traces.

### 2. Multi-Tenant Role Isolation (Zero Cross-College Bleed)
- **Strict Tenant Boundaries**: Warden in College A can never read or mutate records belonging to College B (enforced server-side with `403 Forbidden`).
- **Jurisdiction-Scoped Wardens**: Wardens are assigned to specific boys' or girls' hostels; unauthorized requests are rejected at the middleware tier.
- **Student Privacy Walls**: Students can only access their own room allocation, fee invoices, fine appeals, and complaints.

### 3. Bed Allocation Engine (ACID Transactional Integrity)
- **Zero Double-Bookings**: Handled via `prisma.$transaction`; concurrent allocation attempts on the same bed are safely rejected with `400 Bad Request`.
- **Room & Bed Hierarchy**: Multi-floor blocks with Single, Double, Triple, and Dormitory rooms with unique bed inventory slots (e.g. `101-A`, `101-B`).
- **Room Transfers & Checkouts**: Wardens can transfer residents between rooms or checkout graduating seniors, automatically returning beds to `AVAILABLE`.

### 4. Digital QR Outstation Gate Pass & Security Gate Terminal
- **Student Leave Workflow**: Apply for Outstation, Day Outing, or Emergency leave with parent consent status and destination details.
- **Warden Adjudication**: One-click approval mints a cryptographically unique 8-character Pass Code and 256-bit Token.
- **Dynamic Base64 QR Generation**: High-density QR codes generated directly on the server.
- **Public Guard Terminal (`/verify-pass/:code`)**: Campus security guards scan passes without logging in, rendering real-time valid/expired gate clearances.

### 5. Attendance & Night Curfew Roll Call
- **Session Scheduling**: Wardens initiate daily morning and evening curfew roll-call sessions.
- **One-Click Marking**: Wardens bulk-mark residents as `PRESENT`, `ABSENT`, `ON_LEAVE`, or `LATE`.
- **Audit-Logged Corrections**: Mis-marked attendance records can be rectified with mandatory reason logs.
- **Compliance Tracking**: Students view their real-time percentage attendance and missed session calendar.

### 6. Financial Billing, Payments & Disciplinary Fines
- **Fee Invoices**: Wardens generate charges across Hostel Fee, Mess Fee, and Utility bills with fixed deadlines.
- **Payment Receipts**: Unique sequential receipts (`RCP-2026-AIT-TECH-XXXX`) issued upon settlement.
- **Disciplinary Fines & Appeals**: Wardens penalize curfew or noise violations; students can formally appeal citations through an in-app defense workflow.

### 7. Facilities, Mess & Living Operations
- **Weekly Mess Engine**: 7-day breakfast, lunch, snacks, and dinner meal scheduling with Veg/Non-Veg dietary tags.
- **Laundry Slot Quotas**: Students reserve 2-hour machine slots; backend enforces strict machine capacity caps.
- **Housekeeping & Missed Cleaning**: Daily corridor cleaning schedules with student missed-cleaning escalation reports.
- **Campus Facilities Directory**: Operating hours, trainer bios, and rules for Gymnasium, Sports Courts, and Cafeterias.
- **Helpdesk Ticket SLA**: Two-way student-warden support tickets with private internal staff notes.

---

## 🛠️ Technology Stack

| Layer | Technologies Used | Key Packages & Libraries |
| :--- | :--- | :--- |
| **Frontend** | React 18, TypeScript, Vite | Tailwind CSS v4, Lucide Icons, Recharts, React Router v7 |
| **Backend** | Node.js, Express.js, TypeScript | Prisma ORM v5.22, Zod, jsonwebtoken, bcryptjs, qrcode |
| **Database** | PostgreSQL 16 | 39 Relational Tables, Foreign Key Constraints, Compound Indexes |
| **Testing** | Vitest | Integration Tests for RBAC, Tenant Isolation & Concurrency |
| **Security** | Express Rate Limit, Helmet, CORS | Argon2id/Bcrypt salted hashing, JWT Auth, Audit Interceptors |

---

## 📂 System Architecture Overview

```
HostelHub Multi-Tenant Topology
=============================================================================
[ React 18 + TS Vite SPA ]  <---> [ Vite Reverse Proxy :5173 / Nginx Gateway ]
                                                |
                                                v
                              [ Express.js REST API Engine :5000 ]
                              ├── JWT Authentication & Session Middleware
                              ├── Multi-Tenant & Role Isolation Interceptor
                              ├── Atomic Business Controllers ($transaction)
                              └── Append-Only Audit Logging Subsystem
                                                |
                                                v
                              [ PostgreSQL 16 Enterprise Relational DB ]
                              ├── 39 Normalized Relational Tables
                              └── ACID Write-Ahead Log (WAL) Concurrency Guard
=============================================================================
```

---

## ⚡ Quick Start & Running Locally

### Prerequisites
- **Node.js**: v20.x LTS or higher
- **PostgreSQL**: 16.x running on `localhost:5432`

### 1. Database Setup
```powershell
# Create database
createdb -U postgres -h localhost -p 5432 hostelhub
```

### 2. Backend Server
```powershell
cd backend
npm install --legacy-peer-deps
npx prisma db push
npx tsx prisma/seed.ts
node dist/server.js
# Backend listening on http://localhost:5000
```

### 3. Frontend Web Client
```powershell
cd ../frontend
npm install --legacy-peer-deps
npm run build
npx vite --port 5173
# Frontend listening on http://localhost:5173
```

---

## 🔑 Demo Evaluation Credentials

All demo accounts share the password: **`Password@123`**

| Role | Email | College | Key Features to Test |
| :--- | :--- | :--- | :--- |
| **Platform Admin** | `admin@hostelhub.com` | Platform Scope | College Verification, Suspension, Global Audit Ledger |
| **Boys Warden** | `warden.boys@apextech.edu` | Apex Institute of Tech | Bed Allocations, Leave Approvals, Mess Menus, Fines |
| **Girls Warden** | `warden.girls@apextech.edu` | Apex Institute of Tech | Attendance Sessions, Housekeeping, Complaints |
| **Cross-College Warden** | `warden.nmu@nmu.edu` | National Metro Univ | Cross-college 403 Forbidden verification |
| **Resident Student** | `student.aarav@apextech.edu` | Apex Institute of Tech | Room Allocation, QR Gate Pass, Fee Receipts, Helpdesk |
| **Resident Student** | `student.diya@apextech.edu` | Apex Institute of Tech | Laundry Slot Booking, Fine Appeals, Meal Schedule |
| **Pending Student** | `student.kavya@apextech.edu` | Apex Institute of Tech | Pending approval onboarding flow |

> **Evaluation Shortcut**: On the `/login` screen, click any of the **Quick Demo Profile buttons** to immediately populate credentials and log in.

---

## 🧪 Automated Test Suite

HostelHub includes automated integration tests testing tenant isolation, RBAC, atomic double-booking rejection, and security gate QR pass verification.

To run tests:
```powershell
cd backend
npx vitest run
```

```
 ✓ src/tests/auth_and_isolation.test.ts (7 tests)
   ✓ Backend API Health › returns 200 and healthy status
   ✓ Public College Directory › lists approved colleges without authentication
   ✓ RBAC Enforcement › blocks student from viewing warden analytics (403)
   ✓ Multi-College Data Isolation › blocks Apex Warden from modifying NMU hostel data (403)
   ✓ Student Privacy Boundary › blocks student from inspecting other student fees (403)
   ✓ Digital Gate Pass QR Verification › validates active gate pass for security guard (200)
   ✓ Concurrency & Bed Allocation Integrity › rejects duplicate allocation of already occupied bed (400)
```

---

## 📚 Project Documentation

Deep-dive documentation is located in the [`docs/`](./docs/) directory:
- [**System Architecture & Security Models**](./docs/architecture.md): Topology, tenant boundary guarantees, concurrency mechanisms, and sequence flows.
- [**Database Schema & Data Models**](./docs/database.md): 39 entity schemas, ER diagrams, foreign key relationships, and compound indexes.
- [**REST API Specifications**](./docs/api.md): Detailed parameter inputs, request/response payloads, and HTTP status codes for all 14 modules.
- [**Installation & Developer Setup Guide**](./docs/setup.md): Complete guide for environment setup, database migrations, and deployment.

---

## 🏆 Project Team & Academic Credits

**B.Tech Final Year Capstone Project (Batch 2023–2027)**  
*Developed by 4-Student Engineering Team:*
1. **Full-Stack Architect & Lead Backend Engineer**: Node.js, Express, PostgreSQL, Prisma ORM, ACID Transactions.
2. **Frontend UI/UX & State Engineer**: React 18, TypeScript, Tailwind CSS, Component Library, Data Tables.
3. **Security & Database Engineer**: Multi-tenant isolation, JWT auth, RBAC middleware, Digital QR Gate Passes.
4. **QA, Operations & Test Engineer**: Vitest integration tests, seed generation, API specifications, and documentation.

*Developed with pride for university competitions, portfolio evaluations, and real-world institutional adoption.*
