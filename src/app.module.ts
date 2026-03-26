import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppointmentsModule } from './appointments/appointments.module';
import { CliniciansModule } from './clinicians/clinicians.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [PrismaModule, AppointmentsModule, CliniciansModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
