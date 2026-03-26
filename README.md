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
| 🚫 **Overlap Detection** | Prevents double-booking with transaction-based checks |
| 📅 **Date Validation** | Rejects past dates using reusable validators |
| 🔒 **Concurrency Safe** | Handles race conditions in simultaneous bookings |
| 👤 **Auto-create Patients** | Optional patient creation when booking appointments |
| 🔐 **Role-based Auth** | Simple `x-role` header authentication |
| 📖 **OpenAPI/Swagger** | Interactive API documentation |

## 📋 Core Endpoints

| Method | Endpoint | Description | Auth | Query Params |
|--------|----------|-------------|------|--------------|
| **POST** | `/appointments` | Create new appointment | `patient` | N/A |
| **GET** | `/appointments` | List all appointments (admin) | `admin` | `from`, `to` |
| **GET** | `/clinicians/:id/appointments` | List clinician appointments | `clinician` | `from`, `to` |


### Example Requests

**Create Appointment:**
```bash
curl -X POST http://localhost:3000/appointments \
  -H "Content-Type: application/json" \
  -H "x-role: patient" \
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
curl "http://localhost:3000/clinicians/:id/appointments?from=2026-04-01T00:00:00Z" \
  -H "x-role: clinician"
```

**List All (Admin):**
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

### 🔧 Why These Choices?

| Choice | Reason |
|--------|--------|
| **NestJS** | Structured, scalable, built-in DI and validation |
| **Prisma** | Type-safe ORM with migrations and great DX |
| **SQLite** | Zero-config for demo; easy to ship with Docker |
| **Swagger** | Auto-generated docs from decorators |
| **E2E Tests** | Test real HTTP flows, not mocked units |
| **Transactions** | Prevents race conditions in concurrent bookings |

### 📝 Overlap Logic Explained

**Definition:** Overlaps include any intersection EXCEPT touching at endpoints.

```typescript
// ✅ ALLOWED (touching at endpoints)
Appointment A: 10:00 - 11:00
Appointment B: 11:00 - 12:00  // start == previous end

// ❌ REJECTED (actual overlap)
Appointment A: 10:00 - 11:00
Appointment B: 10:30 - 11:30  // overlaps by 30 min
```

**Implementation:**
```typescript
// Overlap if: start < other.end && end > other.start
// This correctly excludes touching endpoints
```

## 🛠️ Commands

```bash
npm run start:dev      # Dev mode with hot reload
npm run build          # Build for production
npm run start:prod     # Production mode
npm run lint           # Lint code
npm run prisma:studio  # Database UI
```


**Engineered by Asyraf**
