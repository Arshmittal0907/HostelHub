# HostelHub — REST API Specification & Endpoint Directory

**Base URL**: `http://localhost:5000/api/v1` (or via Vite proxy: `http://localhost:5173/api/v1`)  
**Data Format**: `application/json`  
**Authentication**: Bearer Token in `Authorization` header (`Bearer <JWT_TOKEN>`)  
**Standard Response Envelope**:
```json
{
  "success": true,
  "message": "Optional human-readable notification",
  "data": { ... }
}
```

---

## 1. Authentication & Onboarding (`/api/v1/auth`)

| Method | Endpoint | Access Tier | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/login` | Public | Authenticates user credentials and returns JWT bearer token and role. |
| `POST` | `/auth/register-student` | Public | Submits student onboarding request bound to an approved college and hostel. |
| `POST` | `/auth/register-warden` | Public | Submits warden application requiring Platform Admin activation. |
| `POST` | `/auth/register-college` | Public | Submits university institutional accreditation application (`PENDING_VERIFICATION`). |
| `GET` | `/auth/me` | Authenticated | Returns currently authenticated user context, college, role, and active bed. |
| `POST` | `/auth/logout` | Authenticated | Invalidates client session. |

### Sample Login Request & Response
```http
POST /api/v1/auth/login HTTP/1.1
Content-Type: application/json

{
  "email": "warden.boys@apextech.edu",
  "password": "Password@123"
}
```
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsIn...",
  "user": {
    "id": "22683a53-a168-4336-8320-18fb41bf4e3e",
    "email": "warden.boys@apextech.edu",
    "fullName": "Dr. Rajesh Sharma",
    "role": "WARDEN",
    "college": {
      "id": "0f50c963-0f76-46d1-b809-360ec56f913c",
      "name": "Apex Institute of Technology",
      "code": "AIT-TECH"
    },
    "wardenAssignments": [
      {
        "hostelId": "fe313c34-88cb-494b-82e1-45d6c2083e88",
        "hostelName": "Cauvery Boys Hostel",
        "hostelType": "BOYS"
      }
    ]
  }
}
```

---

## 2. Colleges & Governance (`/api/v1/colleges`)

| Method | Endpoint | Access Tier | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/colleges` | Public | Lists all verified and approved colleges with hostels for directory search. |
| `GET` | `/colleges/:id` | Public | Returns detailed college profile and contact metadata. |
| `GET` | `/colleges/admin/all` | Platform Admin | Returns all registered colleges including `PENDING_VERIFICATION` & `REJECTED`. |
| `POST` | `/colleges/admin/:id/verify`| Platform Admin | Approves, rejects, or suspends college with recorded administrative justification. |

---

## 3. Hostels & Infrastructure (`/api/v1/hostels`)

| Method | Endpoint | Access Tier | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/hostels` | Warden / Admin | Lists authorized hostels with live bed occupancy percentages and room tallies. |
| `POST` | `/hostels` | Platform Admin | Provisions a new residential hostel building. |
| `GET` | `/hostels/:id` | Warden / Admin | Fetches hostel architectural blocks, floors, and capacity breakdowns. |

---

## 4. Rooms, Beds & Atomic Allocations (`/api/v1/rooms`)

| Method | Endpoint | Access Tier | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/rooms` | Warden / Admin | Queries rooms and beds with occupancy filters (`hostelId`, `blockId`, `floor`). |
| `POST` | `/rooms` | Warden / Admin | Creates room records with auto-generated bed inventory (`101-A`, `101-B`). |
| `POST` | `/rooms/allocate` | Warden | **Atomic Transaction**: Assigns an available bed to an approved student resident. |
| `POST` | `/rooms/transfer` | Warden | Transfers a student from an existing bed to a target bed. |
| `POST` | `/rooms/checkout` | Warden | Vacates a resident, frees bed status to `AVAILABLE`, and closes allocation. |
| `PUT` | `/rooms/beds/:bedId/status`| Warden | Toggles bed operational state (`AVAILABLE` vs `MAINTENANCE`). |
| `GET` | `/rooms/my-room` | Student | Returns authenticated student's allocated room, bed, block, and verified roommates. |

---

## 5. Student Enrollment Management (`/api/v1/students`)

| Method | Endpoint | Access Tier | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/students` | Warden | Lists college student residents with enrollment status and bed assignment filters. |
| `POST` | `/students/:id/approve` | Warden | Reviews pending student application (`APPROVED` or `REJECTED`). |
| `PUT` | `/students/profile` | Student | Updates permitted profile fields (emergency contact, phone). |

---

## 6. Attendance & Daily Roll Call (`/api/v1/attendance`)

| Method | Endpoint | Access Tier | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/attendance/sessions` | Warden | Creates a scheduled roll-call session (e.g. Night Curfew Roll Call). |
| `GET` | `/attendance/sessions` | Warden | Lists attendance sessions with completion percentages. |
| `POST` | `/attendance/mark` | Warden | Bulk-records student statuses (`PRESENT`, `ABSENT`, `ON_LEAVE`, `LATE`). |
| `PUT` | `/attendance/records/:id/correct`| Warden | Corrects an erroneous roll-call entry with required justification note. |
| `GET` | `/attendance/my-attendance`| Student | Returns resident's historical attendance calendar and compliance rate. |

---

## 7. Mess Menu Scheduling (`/api/v1/mess`)

| Method | Endpoint | Access Tier | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/mess` | Authenticated | Returns 7-day breakfast, lunch, snacks, and dinner menus with meal timings. |
| `POST` | `/mess` | Warden | Upserts meal dishes, dietary tags (Veg/Non-Veg), and operational notices. |

---

## 8. Laundry Service & Slot Booking (`/api/v1/laundry`)

| Method | Endpoint | Access Tier | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/laundry/slots` | Authenticated | Lists available machine time slots and remaining capacity per window. |
| `POST` | `/laundry/book` | Student | **Atomic Quota Check**: Reserves a washing slot. Rejects when capacity is exhausted. |
| `GET` | `/laundry/my-bookings`| Student | Returns resident's active and historical laundry appointments. |
| `PUT` | `/laundry/bookings/:id/status`| Warden | Updates booking state (`COMPLETED`, `CANCELLED`). |

---

## 9. Housekeeping & Cleaning Operations (`/api/v1/cleaning`)

| Method | Endpoint | Access Tier | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/cleaning/schedule` | Authenticated | Returns housekeeping schedule for residential rooms and common corridors. |
| `POST` | `/cleaning/report-missed`| Student | Logs a missed cleaning event with location and timestamp. |
| `PUT` | `/cleaning/tasks/:id/complete`| Warden | Marks a cleaning task as inspected and resolved. |

---

## 10. Financials, Invoices, Payments & Fines (`/api/v1/finance`)

| Method | Endpoint | Access Tier | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/finance/categories`| Warden | Lists fee categories (`HOSTEL_FEE`, `MESS_FEE`, `SECURITY_DEPOSIT`). |
| `POST` | `/finance/charges` | Warden | Generates fee charges for a resident student with due dates. |
| `POST` | `/finance/payments` | Warden / Student | Records transaction settlement, increments `paidAmount`, and issues receipt. |
| `GET` | `/finance/my-fees` | Student | Returns student invoice statements, payment history, and pending balances. |
| `POST` | `/finance/fines` | Warden | Levies a disciplinary penalty against a resident. |
| `POST` | `/finance/fines/:fineId/appeal`| Student | Submits formal defense appeal contesting an issued fine. |
| `PUT` | `/finance/fines/appeals/:appealId/review`| Warden | Adjudicates fine appeal (`ACCEPTED` / `REJECTED`). |

---

## 11. Complaints & SLA Helpdesk (`/api/v1/complaints`)

| Method | Endpoint | Access Tier | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/complaints` | Student | Opens a service ticket (`ELECTRICAL`, `PLUMBING`, `CARPENTRY`, `INTERNET`, `HYGIENE`). |
| `GET` | `/complaints` | Authenticated | Lists tickets scoped to resident or warden jurisdiction. |
| `GET` | `/complaints/:id` | Authenticated | Returns ticket message timeline and resolution status. |
| `POST` | `/complaints/:id/messages`| Authenticated | Sends two-way conversational reply (supports internal notes masked from students). |
| `PUT` | `/complaints/:id/status`| Warden | Transitions ticket state (`IN_PROGRESS`, `RESOLVED`, `CLOSED`). |

---

## 12. Outstation Leave & Security Gate Passes (`/api/v1/leave`)

| Method | Endpoint | Access Tier | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/leave` | Student | Applies for travel absence with destination, dates, and guardian contact. |
| `GET` | `/leave` | Authenticated | Returns leave applications (includes generated Base64 QR code upon approval). |
| `PUT` | `/leave/:id/review` | Warden | Adjudicates leave (`APPROVED` / `REJECTED`), mints pass code and security token. |
| `GET` | `/leave/verify/:tokenOrCode`| Public | Security Gate Scanner verification endpoint displaying live gate pass validity. |

---

## 13. Facilities, Rules & Notices (`/api/v1/facilities`, `/api/v1/notices`)

| Method | Endpoint | Access Tier | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/facilities` | Authenticated | Lists cafeteria, gym trainers, and sports court operating hours. |
| `GET` | `/facilities/rules`| Authenticated | Returns official hostel code of conduct and curfew regulations. |
| `GET` | `/notices` | Authenticated | Fetches official bulletins filtered by target audience (`ALL`, `STUDENTS`, `WARDENS`). |
| `POST` | `/notices` | Warden / Admin | Broadcasts urgent maintenance alerts or academic notices. |

---

## 14. Analytics & Immutable Audit Trail (`/api/v1/analytics`, `/api/v1/audit`)

| Method | Endpoint | Access Tier | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/analytics/warden`| Warden | Aggregates occupancy rates, attendance compliance, open complaints, and fee dues. |
| `GET` | `/analytics/admin` | Platform Admin | Platform-level aggregates: verified universities, total beds, and active tenants. |
| `GET` | `/audit` | Warden / Admin | Streams immutable chronological event ledger (approvals, allocations, payments). |
