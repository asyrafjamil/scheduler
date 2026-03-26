import {
  Controller,
  Get,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiSecurity,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('appointments')
@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new appointment',
    description:
      'Creates a new appointment with overlap detection. Auto-creates patient if patientName and patientEmail are provided.',
  })
  @ApiBody({ type: CreateAppointmentDto })
  @ApiResponse({
    status: 201,
    description: 'Appointment created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input (bad dates, missing clinician/patient)',
  })
  @ApiResponse({
    status: 409,
    description: 'Time slot overlaps with existing appointment',
  })
  create(@Body() dto: CreateAppointmentDto) {
    return this.appointmentsService.create(dto);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({
    summary: 'List all appointments',
    description:
      'Returns all appointments with optional date range filtering. Requires admin role.\n\n' +
      '**Authentication:** Click "Authorize" button and enter "admin" in the x-role field.',
  })
  @ApiSecurity('x-role')
  @ApiQuery({
    name: 'from',
    required: false,
    type: String,
    description: 'Filter appointments starting from this date (ISO 8601)',
    example: '2026-04-01T00:00:00Z',
  })
  @ApiQuery({
    name: 'to',
    required: false,
    type: String,
    description: 'Filter appointments up to this date (ISO 8601)',
    example: '2026-04-30T23:59:59Z',
  })
  @ApiResponse({
    status: 200,
    description: 'List of all appointments',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin role required',
  })
  findAll(
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.appointmentsService.findAll(from, to);
  }
}
