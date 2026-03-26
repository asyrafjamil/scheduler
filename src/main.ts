import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for Swagger UI and API access
  app.enableCors({
    origin: true, // Allow all origins in development
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // Swagger/OpenAPI Configuration
  const config = new DocumentBuilder()
    .setTitle('Clinic Scheduler API')
    .setDescription(
      'RESTful API for managing clinic appointments with role-based access control.\n\n' +
        '**Authentication:** Use the "Authorize" button above to set your role.\n' +
        '- For header auth: Enter role value (patient/clinician/admin) in "x-role"\n' +
        '- For query auth: Enter role value in "role"\n' +
        '- Then try endpoints like GET /appointments (requires admin role)',
    )
    .setVersion('1.0')
    .addApiKey(
      {
        type: 'apiKey',
        name: 'x-role',
        in: 'header',
        description: 'Enter your role: patient, clinician, or admin',
      },
      'x-role',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  await app.listen(3000);
}
bootstrap();
