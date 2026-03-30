import {
  IsISO8601,
  IsString,
  IsEmail,
  IsUUID,
  IsOptional,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAppointmentDto {
  @ApiProperty({
    description: 'Appointment start time in ISO 8601 format',
    example: '2026-03-27T10:00:00Z',
  })
  @IsISO8601()
  start: string;

  @ApiProperty({
    description: 'Appointment end time in ISO 8601 format',
    example: '2026-03-27T11:00:00Z',
  })
  @IsISO8601()
  end: string;

  @ApiProperty({
    description: 'UUID of the clinician for this appointment',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @IsUUID()
  clinicianId: string;

  @IsOptional()
  @ApiProperty({
    description: 'UUID of the patient for this appointment',
    example: 'b2c3d4e5-f6g7-8901-bcde-f12345678901',
  })
  @IsUUID()
  patientId: string;

  @ApiPropertyOptional({
    description:
      'Patient name (used for auto-creation if patient does not exist)',
    example: 'John Doe',
  })
  @IsString()
  @IsOptional()
  patientName?: string;

  @ApiPropertyOptional({
    description:
      'Patient email (used for auto-creation if patient does not exist)',
    example: 'john@example.com',
  })
  @IsEmail()
  @IsOptional()
  patientEmail?: string;
}
