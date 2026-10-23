# HostelHub — Local Setup, Installation & Developer Guide

**Project Repository Directory**: `C:\Users\Arsh Mittal\.gemini\antigravity\scratch\hostelhub`  
**Prerequisites**:
- Node.js v20.x LTS or higher
- npm v10.x or higher
- PostgreSQL 16.x
- Git (optional for version control)

---

## 1. Quick Start (Ready-to-Run Environment)

Because the project is already installed, configured, migrated, and seeded in this environment, both servers can be controlled with simple commands:

### Backend Service (Port 5000)
```powershell
cd "C:\Users\Arsh Mittal\.gemini\antigravity\scratch\hostelhub\backend"
node dist/server.js
# Or for live development with tsx:
npx tsx src/server.ts
```

### Frontend Service (Port 5173)
```powershell
cd "C:\Users\Arsh Mittal\.gemini\antigravity\scratch\hostelhub\frontend"
npx vite --port 5173
```

Visit **`http://localhost:5173`** in your browser.

---

## 2. Full Setup from Scratch

Follow these instructions if cloning or initializing the project on a fresh workstation or CI server.

### A. Environment Configuration

Create `.env` inside `scratch/hostelhub/backend/`:

```env
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/hostelhub?schema=public"
JWT_SECRET="hostelhub-super-secure-production-jwt-secret-key-2026"
JWT_EXPIRES_IN="7d"
CORS_ORIGIN="http://localhost:5173,http://localhost:3000"
RATE_LIMIT_MAX=1000
RATE_LIMIT_WINDOW_MS=900000
```

### B. PostgreSQL Initialization

1. Install PostgreSQL 16:
   - On Windows: Extract PostgreSQL portable binaries to `C:\Users\<user>\dev_tools\pgsql` or install via installer.
2. Initialize and start PostgreSQL:
   ```powershell
   & "C:\Users\<user>\dev_tools\pgsql\bin\initdb.exe" -D "C:\Users\<user>\dev_tools\pgsql\data" -U postgres -E UTF8
   & "C:\Users\<user>\dev_tools\pgsql\bin\postgres.exe" -D "C:\Users\<user>\dev_tools\pgsql\data"
   ```
3. Create the database:
   ```powershell
   & "C:\Users\<user>\dev_tools\pgsql\bin\createdb.exe" -U postgres -h localhost -p 5432 hostelhub
   ```

### C. Backend Dependencies & Database Migrations

```powershell
cd backend
npm install --legacy-peer-deps

# Generate Prisma Client
npx prisma generate

# Push database schema to PostgreSQL
npx prisma db push

# Seed the database with colleges, hostels, users, and operational data
npx tsx prisma/seed.ts
```

### D. Frontend Dependencies & Build

```powershell
cd ../frontend
npm install --legacy-peer-deps

# Run type check
npx tsc --noEmit

# Compile production bundle
npm run build

# Start local development server with API proxying
npm run dev
```

---

## 3. Running Automated Tests

HostelHub includes comprehensive automated integration and security boundary tests covering authentication, RBAC, cross-college data isolation, duplicate bed allocation race conditions, and leave pass verification.

To run tests:
```powershell
cd backend
npx vitest run
```

Expected output:
```text
 ✓ src/tests/auth_and_isolation.test.ts (7 tests)
   ✓ Backend API Health › returns 200 and healthy status
   ✓ Public College Directory › lists approved colleges without authentication
   ✓ RBAC Enforcement › blocks student from viewing warden analytics (403)
   ✓ Multi-College Data Isolation › blocks Apex Warden from modifying NMU hostel data (403)
   ✓ Student Privacy Boundary › blocks student from inspecting other student fees (403)
   ✓ Digital Gate Pass QR Verification › validates active gate pass for security guard (200)
   ✓ Concurrency & Bed Allocation Integrity › rejects duplicate allocation of already occupied bed (400)

 Test Files  1 passed (1)
      Tests  7 passed (7)
   Start at  17:28:10
   Duration  4.12s
```

---

## 4. Default Seeded Evaluation Accounts

All accounts use the standard password: **`Password@123`**

| Role | Email | College | Key Jurisdictions & Features |
| :--- | :--- | :--- | :--- |
| **Platform Admin** | `admin@hostelhub.com` | Platform Scope | College Verification, Suspension, Global Audit Ledger |
| **Hostel Warden** | `warden.boys@apextech.edu` | Apex Institute of Tech | Cauvery Boys Hostel, Bed Allocations, Leave Approvals, Mess Menus, Fines |
| **Hostel Warden** | `warden.girls@apextech.edu` | Apex Institute of Tech | Ganga Girls Hostel, Attendance Sessions, Housekeeping, Complaints |
| **Hostel Warden** | `warden.nmu@nmu.edu` | National Metropolitan Univ | Shivaji Boys Hostel (Used to demonstrate cross-college 403 isolation) |
| **Student** | `student.aarav@apextech.edu` | Apex Institute of Tech | Cauvery Boys Room 101-A, Gate Pass QR, Fee Receipts, Ticket Messaging |
| **Student** | `student.diya@apextech.edu` | Apex Institute of Tech | Ganga Girls Room 201-A, Laundry Booking, Fine Appeals |
| **Student (Pending)** | `student.kavya@apextech.edu` | Apex Institute of Tech | Registered resident pending warden approval |

> **Pro Tip**: The `/login` page includes **1-Click Quick Demo Login buttons** that immediately pre-fill credentials for each role to facilitate competition presentations.
