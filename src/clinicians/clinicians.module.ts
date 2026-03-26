import { Module } from '@nestjs/common';
import { CliniciansService } from './clinicians.service';
import { CliniciansController } from './clinicians.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CliniciansController],
  providers: [CliniciansService],
})
export class CliniciansModule {}
