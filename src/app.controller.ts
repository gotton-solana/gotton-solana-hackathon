import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

/**
 * Root-level controller for authentication-related routes.
 * Currently serves as a placeholder and can be extended with endpoints like login, logout, or health check.
 */
@ApiTags('Auth') // Categorizes this controller under "Auth" in Swagger UI
@Controller()
export class AppController {
  constructor() {}
}
