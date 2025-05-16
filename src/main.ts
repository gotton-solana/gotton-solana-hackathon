import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { TransformResponseInterceptor } from './interceptor/transform-response.interceptor';
import { HttpExceptionFilter } from './exception-filter/all-exceptions.filter';
import { MainValidationPipe } from './pipes/validation.pipe';

async function bootstrap() {
  // Create the Nest application instance with a custom logger configuration
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'warn', 'error'], // Only log standard messages, warnings, and errors
  });

  // Prefix all routes with /api for consistency and versioning
  app.setGlobalPrefix('api');

  // Configure Swagger documentation options
  const options = new DocumentBuilder()
    .setTitle('Mini Game Blockchain Backend')
    .setDescription('API documentation for the Mini Game Blockchain Backend')
    .setVersion('1.0')
    // Define a global header parameter for API key authentication
    .addGlobalParameters({
      in: 'header',
      name: 'x-api-key',
      required: false,
      schema: {
        example: '2dda471b-9612-4e23-b6a1-9d509825c7f0',
      },
    })
    .build();

  // Generate the Swagger document and setup the /docs endpoint
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('docs', app, document);

  // Apply a global interceptor to transform all responses into a consistent structure
  app.useGlobalInterceptors(new TransformResponseInterceptor());

  // Apply a global exception filter to format all HTTP exceptions uniformly
  app.useGlobalFilters(new HttpExceptionFilter());

  // Apply a global validation pipe to sanitize and validate incoming requests
  app.useGlobalPipes(
    new MainValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Enable CORS for all origins to allow cross-domain requests
  app.enableCors({
    origin: '*',
    credentials: true,
  });

  // Start the HTTP server on the specified port (default 3000)
  await app.listen(process.env.PORT || 3000);
}

bootstrap();
