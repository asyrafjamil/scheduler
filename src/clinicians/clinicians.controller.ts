import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { CliniciansService } from './clinicians.service';
import { GetAppointmentsQueryDto } from './dto/get-appointments-query.dto';

@ApiTags('clinicians')
@Controller('clinicians')
export class CliniciansController {
  constructor(private readonly cliniciansService: CliniciansService) {}

  @Get(':id/appointments')
  @ApiOperation({
    summary: "Get clinician's upcoming appointments",
    description:
      'Returns upcoming appointments for a specific clinician, filtered by date range',
  })
  @ApiParam({
    name: 'id',
    description: 'Clinician UUID',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'List of upcoming appointments',
  })
  @ApiResponse({
    status: 404,
    description: 'Clinician not found',
  })
  getUpcomingAppointments(
    @Param('id') id: string,
    @Query() query: GetAppointmentsQueryDto,
  ) {
    return this.cliniciansService.getUpcomingAppointments(
      id,
      query.from,
      query.to,
    );
  }
}
