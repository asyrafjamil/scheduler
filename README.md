# Clinic Scheduler API

RESTful API for managing clinic appointments with overlap detection and concurrency-safe booking.

**Tech Stack:** NestJS • Prisma • SQLite • TypeScript • Docker



## 🚀 Quick Start

```bash
npm install
npm run prisma:generate && npm run prisma:push
npm run prisma:seed          # Seed with test data
npm run start:dev
```

- **API:** http://localhost:3000
- **Docs:** http://localhost:3000/api

## 📊 Architecture

```
┌─────────┐      ┌─────────┐      ┌────────┐      ┌──────────┐
│ Client  │─────▶│ NestJS  │─────▶│ Prisma │─────▶│  SQLite  │
│ Browser │◀─────│   API   │◀─────│  ORM   │◀─────│ Database │
└─────────┘      └─────────┘      └────────┘      └──────────┘
  HTTP/REST      Controllers      Type-safe        Relational
                 + Swagger        Queries          Storage
```

**[View detailed architecture diagram →](./ARCHITECTURE.txt)**

## ✨ Key Features

| Feature | Description |
|---------|-------------|
| 🚫 **Overlap Detection** | Prevents double-booking for both clinicians AND patients |
| 📅 **Date Validation** | Rejects past dates using reusable validators |
| 🔒 **Concurrency Safe** | Handles race conditions in simultaneous bookings |
| 👤 **Auto-create Patients** | Optional patient creation when booking appointments |
| 🔐 **Role-based Auth** | Simple `x-role` header authentication for admin |
| 📖 **OpenAPI/Swagger** | Interactive API documentation |

### 🎯 Bonus: Patient Overlap Validation

Beyond the assessment requirement of preventing **clinicians from being double-booked**, this implementation also prevents **patients from being double-booked**:

- ✅ **Clinician overlap** - A clinician can't have two appointments at the same time (required)
- ✅ **Patient overlap** - A patient can't book multiple appointments with different clinicians at the same time *(bonus feature - not required)*

**Example:** If Patient John books with Dr. Smith at 10am, he cannot book another appointment with Dr. Jones at 10am. This reflects real-world clinic logic where patients can't attend multiple appointments simultaneously.

## 📋 Core Endpoints

| Method | Endpoint | Description | Auth Required | Query Params |
|--------|----------|-------------|---------------|--------------|
| **POST** | `/appointments` | Create new appointment | No | - |
| **GET** | `/appointments` | List all appointments | **Yes** (`admin`) | `from`, `to` |
| **GET** | `/clinicians/:id/appointments` | List clinician appointments | No | `from`, `to` |

> **Note:** Only the admin list endpoint enforces authentication via `x-role: admin` header. Other endpoints are open for this assessment demo.


### Example Requests

**Create Appointment:**
```bash
curl -X POST http://localhost:3000/appointments \
  -H "Content-Type: application/json" \
  -d '{
    "start": "2026-04-15T10:00:00Z",
    "end": "2026-04-15T11:00:00Z",
    "clinicianId": "uuid",
    "patientId": "uuid"
  }'
# Returns: 201 Created | 409 Conflict | 400 Bad Request
```

**Get Clinician Appointments:**
```bash
curl "http://localhost:3000/clinicians/:id/appointments?from=2026-04-01T00:00:00Z"
```

**List All (Admin - Auth Required):**
```bash
curl http://localhost:3000/appointments \
  -H "x-role: admin"
```

## 🧪 Testing

```bash
npm run test:e2e      # 20 integration tests
npm run test:cov      # With coverage
```

**Coverage:** Overlap detection • Concurrency • Date filtering • Auth

## 🐋 Docker

```bash
docker-compose up     # Start with Docker
# or
docker build -t clinic-scheduler . && docker run -p 3000:3000 clinic-scheduler
```

## 🗄️ Database

**Schema:**
```
Clinician ──┐
            ├──▶ Appointment
Patient  ───┘
```

**Manage:**
```bash
npm run prisma:studio  # Visual editor at localhost:5555
npm run prisma:seed    # Reset with test data
```

## 📚 Documentation

- **[ARCHITECTURE.txt](./ARCHITECTURE.txt)** - Infrastructure diagram & request flow
- **[TEST_SUMMARY.md](./TEST_SUMMARY.md)** - Test results (20 tests)
- **[CONCURRENCY.md](./CONCURRENCY.md)** - Race condition handling
- **Swagger UI** - http://localhost:3000/api

## 🚀 Future Improvements

> **Note:** Patient overlap validation (preventing double-booking across clinicians) is already implemented as a bonus feature beyond requirements.

### Short-term (Easy wins)
- **Pagination** - Add `?page=1&limit=10` to appointment listings
- **Sorting** - Allow sorting by date, clinician name, etc
- **Search** - Filter appointments by patient name or clinician
- **Cancellation** - Add endpoint to cancel/update appointments
- **Appointment Types** - Support different consultation types (checkup, follow-up, emergency)

### Medium-term (Enhanced functionality)
- **Working Hours** - Validate appointments within clinic hours
- **Duration Limits** - Min/max appointment duration rules
- **Recurring Appointments** - Support weekly/monthly recurring bookings
- **Notifications** - Email/SMS reminders for upcoming appointments
- **Timezone Support** - Handle multiple timezone bookings
- **Waitlist** - Auto-book from waitlist when cancellation occurs

### Long-term (Production features)
- **JWT Authentication** - Replace x-role with proper JWT tokens
- **Rate Limiting** - Prevent API abuse
- **Audit Logging** - Track all changes for compliance
- **Analytics Dashboard** - Booking statistics and reports
- **Multi-clinic Support** - Manage multiple clinic locations
- **Integration APIs** - Connect with EMR/billing systems

## 🎯 Design Decisions & Tradeoffs

### ✅ What We Did Well
- **Transaction-based Overlap Detection** - Atomic checks prevent race conditions
- **Reusable Date Validators** - DRY principle for date validation across services
- **Type Safety** - TypeScript + Prisma for compile-time safety
- **Auto-seeding** - Easy setup for testing and demos
- **Touching Endpoints Allowed** - Back-to-back bookings (10:00-11:00 then 11:00-12:00) are valid

### ⚠️ Known Limitations
1. **SQLite Concurrency** - Limited transaction isolation; use PostgreSQL for production
2. **Simple Auth** - x-role header is demo-only; implement JWT for production
3. **No Pagination** - All results returned; add pagination for large datasets
4. **No Soft Deletes** - Appointments are hard-deleted; consider soft delete for audit trail
5. **Basic Validation** - No working hours, holiday, or duration limits yet

## 🛠️ Commands

```bash
npm run start:dev      # Dev mode with hot reload
npm run build          # Build for production
npm run start:prod     # Production mode
npm run lint           # Lint code
npm run prisma:studio  # Database UI
```

**Engineered by Asyraf**
