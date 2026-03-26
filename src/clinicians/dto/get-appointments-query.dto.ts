import { IsOptional, IsISO8601 } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetAppointmentsQueryDto {
  @ApiPropertyOptional({
    description:
      'Start date/time filter in ISO 8601 format (defaults to current time)',
    example: '2026-03-27T00:00:00Z',
  })
  @IsISO8601()
  @IsOptional()
  from?: string;

  @ApiPropertyOptional({
    description: 'End date/time filter in ISO 8601 format',
    example: '2026-03-28T00:00:00Z',
  })
  @IsISO8601()
  @IsOptional()
  to?: string;
}
