# Concurrency Safety Notes

## Race Condition Handling in Appointment Creation

### Problem
When two requests attempt to book overlapping appointments simultaneously, a race condition can occur:
1. Request A checks for overlaps → finds none
2. Request B checks for overlaps → finds none (A hasn't committed yet)
3. Request A creates appointment
4. Request B creates appointment
5. **Result:** Two overlapping appointments exist!

### Solution Implemented

#### 1. Database Indexes
- Added composite index on `(clinicianId, start, end)` in Prisma schema
- Added composite index on `(patientId, start, end)` for patient overlap checks
- Improves overlap query performance
- Enables faster locking for concurrent transactions

#### 2. Dual Overlap Checks
The system now prevents **both** types of double-booking:

**a) Clinician Overlap** - A doctor cannot be in two places at once
- Checks if the clinician has any conflicting appointments
- Error: "The clinician is not available at the requested time slot"

**b) Patient Overlap** - A patient cannot have two appointments at the same time
- Checks if the patient already has an appointment at that time
- Prevents booking with different doctors at the same time
- Error: "The patient already has an appointment at the requested time slot"

#### 3. Prisma Interactive Transactions
- Wrapped both overlap checks and creation in `prisma.$transaction()`
- Uses serializable isolation level where supported
- Ensures atomic read-then-write operations
- Both checks happen within the same transaction for consistency

#### 4. SQLite Limitations
**Important:** SQLite has limited transaction isolation capabilities:
- Default isolation: SERIALIZABLE (but with caveats)
- Concurrent writes are serialized at the database level
- Read-committed behavior for long-running transactions
- No true row-level locking (uses database-level locks)

**For Production:** Consider PostgreSQL or MySQL which offer:
- True SERIALIZABLE isolation
- Row-level locking
- Better concurrent write performance
- Explicit `SELECT ... FOR UPDATE` support

### How It Works

1. **Transaction Start**: Begin a Prisma transaction
2. **Clinician Check**: Query overlapping appointments for the clinician
3. **Patient Check**: Query overlapping appointments for the patient
4. **Create**: If both checks pass, create the appointment
5. **Commit**: Transaction commits atomically
6. **Conflict**: If any overlap detected, rollback and return 409

### Examples

✅ **Allowed:**
- Patient books with Dr. Smith at 10:00 AM
- Same patient books with Dr. Jones at 2:00 PM (different time)
- Different patient books with Dr. Smith at 2:00 PM (different patient)

❌ **Prevented:**
- Dr. Smith has appointment 10:00-11:00
  - Cannot book Dr. Smith again 10:00-11:00 (clinician busy)
  - Cannot book Dr. Smith at 10:30-11:30 (clinician overlap)
- John Doe has appointment 10:00-11:00 with Dr. Smith
  - Cannot book John Doe with Dr. Jones 10:00-11:00 (patient busy)
  - Cannot book John Doe with Dr. Jones 10:30-11:30 (patient overlap)

### Testing
See `test/appointments.e2e-spec.ts` for concurrent booking tests that verify:
- Only one of multiple simultaneous requests succeeds
- Proper error handling for race conditions
- Correct overlap detection under concurrent load
- Patient cannot be double-booked
- Clinician cannot be double-booked

### Code Location
- Transaction logic: `src/appointments/appointments.service.ts`
- Schema indexes: `prisma/schema.prisma`
- Tests: `test/appointments.e2e-spec.ts` (concurrent tests)
