import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { validateDatesNotPast } from '../common/utils/date-validator.util';

@Injectable()
export class CliniciansService {
  constructor(private prisma: PrismaService) {}

  async getUpcomingAppointments(id: string, from?: string, to?: string) {
    const clinician = await this.prisma.clinician.findUnique({
      where: { id },
    });

    if (!clinician) {
      throw new NotFoundException(`Clinician with id ${id} not found`);
    }

    // Validate dates are not in the past
    validateDatesNotPast({ from, to });

    const startTime = from ? new Date(from) : new Date();

    // Note: There's a known issue with Prisma + SQLite when using both gte and lte
    // on datetime fields, so we handle this with a workaround
    const where: any = {
      clinicianId: id,
      start: {
        gte: startTime,
      },
    };

    // Fetch all appointments after startTime
    let appointments = await this.prisma.appointment.findMany({
      where,
      include: {
        patient: true,
      },
      orderBy: {
        start: 'asc',
      },
    });

    // Filter in memory if 'to' parameter is provided
    // This works around a Prisma + SQLite date comparison issue
    if (to) {
      const toTime = new Date(to);
      appointments = appointments.filter(
        (apt) => new Date(apt.start) <= toTime,
      );
    }

    return appointments;
  }
}
