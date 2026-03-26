import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data (optional - comment out if you want to keep existing data)
  await prisma.appointment.deleteMany({});
  await prisma.patient.deleteMany({});
  await prisma.clinician.deleteMany({});
  console.log('✅ Cleared existing data');

  // Create Clinicians
  const clinician1 = await prisma.clinician.create({
    data: {
      name: 'Dr. Sarah Smith',
      email: 'sarah.smith@clinic.com',
      specialty: 'General Practice',
    },
  });

  const clinician2 = await prisma.clinician.create({
    data: {
      name: 'Dr. John Doe',
      email: 'john.doe@clinic.com',
      specialty: 'Cardiology',
    },
  });

  console.log('✅ Created 2 clinicians');

  // Create Patients
  const patient1 = await prisma.patient.create({
    data: {
      name: 'Alice Johnson',
      email: 'alice@example.com',
    },
  });

  const patient2 = await prisma.patient.create({
    data: {
      name: 'Bob Williams',
      email: 'bob@example.com',
    },
  });

  const patient3 = await prisma.patient.create({
    data: {
      name: 'Carol Martinez',
      email: 'carol@example.com',
    },
  });

  console.log('✅ Created 3 patients');

  // Create Appointments (future dates)
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  
  const dayAfter = new Date(today);
  dayAfter.setDate(today.getDate() + 2);
  
  const threeDays = new Date(today);
  threeDays.setDate(today.getDate() + 3);

  await prisma.appointment.create({
    data: {
      start: new Date(tomorrow.setHours(10, 0, 0, 0)),
      end: new Date(tomorrow.setHours(11, 0, 0, 0)),
      clinicianId: clinician1.id,
      patientId: patient1.id,
    },
  });

  await prisma.appointment.create({
    data: {
      start: new Date(dayAfter.setHours(14, 0, 0, 0)),
      end: new Date(dayAfter.setHours(15, 0, 0, 0)),
      clinicianId: clinician1.id,
      patientId: patient2.id,
    },
  });

  await prisma.appointment.create({
    data: {
      start: new Date(threeDays.setHours(9, 0, 0, 0)),
      end: new Date(threeDays.setHours(9, 30, 0, 0)),
      clinicianId: clinician2.id,
      patientId: patient3.id,
    },
  });

  console.log('✅ Created 3 appointments');
  console.log('');
  console.log('🎉 Database seeded successfully!');
  console.log('');
  console.log('📊 Summary:');
  console.log('   - Clinicians: 2');
  console.log('   - Patients: 3');
  console.log('   - Appointments: 3 (all in the future)');
  console.log('');
  console.log('🧪 Test the API:');
  console.log('   1. Start server: npm run start:dev');
  console.log('   2. Visit Swagger: http://localhost:3000/api');
  console.log('   3. Try endpoints with these IDs:');
  console.log(`      - Clinician 1 ID: ${clinician1.id}`);
  console.log(`      - Clinician 2 ID: ${clinician2.id}`);
  console.log(`      - Patient 1 ID: ${patient1.id}`);
  console.log(`      - Patient 2 ID: ${patient2.id}`);
  console.log(`      - Patient 3 ID: ${patient3.id}`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
