import {
  Injectable,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AppointmentsService {
  constructor(private prisma: PrismaService) {}

  async create(createAppointmentDto: CreateAppointmentDto) {
    const { start, end, clinicianId, patientId, patientName, patientEmail } =
      createAppointmentDto;

    // Parse and validate datetimes
    const startDate = new Date(start);
    const endDate = new Date(end);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new BadRequestException('Invalid datetime format');
    }

    const now = new Date();

    // Validate start and end time are not in the past
    if (startDate < now || endDate < now) {
      throw new BadRequestException(
        'Appointment times cannot be in the past. Please provide future dates.',
      );
    }

    // Validate start < end
    if (startDate >= endDate) {
      throw new BadRequestException('Start time must be before end time');
    }

    const clinician = await this.prisma.clinician.findUnique({
      where: { id: clinicianId },
    });

    if (!clinician) {
      throw new BadRequestException(
        `Clinician with id ${clinicianId} does not exist`,
      );
    }

    // Check if patient exists, or auto-create if name/email provided
    let patient = await this.prisma.patient.findUnique({
      where: { id: patientId },
    });

    if (!patient && patientName && patientEmail) {
      // Auto-create patient
      patient = await this.prisma.patient.create({
        data: {
          name: patientName,
          email: patientEmail,
        },
      });
    } else if (!patient) {
      throw new BadRequestException(
        `Patient with id ${patientId} does not exist`,
      );
    }

    // Use Prisma transaction for concurrency-safe appointment creation
    return await this.prisma.$transaction(
      async (tx) => {
        // Check 1: Clinician overlap (doctor can't be in two places at once)
      const clinicianOverlap = await tx.appointment.findFirst({
        where: {
          clinicianId,
          OR: [
            // New appointment starts during existing appointment
            {
              AND: [{ start: { lte: startDate } }, { end: { gt: startDate } }],
            },
            // New appointment ends during existing appointment
            {
              AND: [{ start: { lt: endDate } }, { end: { gte: endDate } }],
            },
            // New appointment completely contains existing appointment
            {
              AND: [{ start: { gte: startDate } }, { end: { lte: endDate } }],
            },
          ],
        },
        include: {
          clinician: true,
          patient: true,
        },
      });

      // If overlap found, check if it's the same patient
      if (clinicianOverlap) {
        if (clinicianOverlap.patientId === patient.id) {
          // Same patient trying to book same clinician
          throw new ConflictException(
            `You already have an appointment with ${clinicianOverlap.clinician.name} at this time`,
          );
        } else {
          // Different patient - clinician is busy
          throw new ConflictException(
            'The clinician is not available at the requested time slot',
          );
        }
      }

      // Check 2: Patient overlap (patient can't have two appointments at once)
      const patientOverlap = await tx.appointment.findFirst({
        where: {
          patientId: patient.id,
          OR: [
            // New appointment starts during existing appointment
            {
              AND: [{ start: { lte: startDate } }, { end: { gt: startDate } }],
            },
            // New appointment ends during existing appointment
            {
              AND: [{ start: { lt: endDate } }, { end: { gte: endDate } }],
            },
            // New appointment completely contains existing appointment
            {
              AND: [{ start: { gte: startDate } }, { end: { lte: endDate } }],
            },
          ],
        },
        include: {
          clinician: true,
        },
      });

      if (patientOverlap) {
        const doctorName = patientOverlap.clinician.name;
        throw new ConflictException(
          `You already have an appointment with ${doctorName} at this time`,
        );
      }

      return tx.appointment.create({
        data: {
          start: startDate,
          end: endDate,
          clinicianId,
          patientId: patient.id,
        },
        include: {
          clinician: true,
          patient: true,
        },
      });
    },
      {
        timeout: 10000, // Allow transaction to run for 10s in CI
      },
    );
  }

  async findAll() {
    return this.prisma.appointment.findMany({
      include: {
        clinician: true,
        patient: true,
      },
    });
  }
}
