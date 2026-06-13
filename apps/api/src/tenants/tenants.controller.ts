import { Controller, Get, UseGuards } from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { JwtGuard } from '../auth/jwt.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthenticatedUserPayload } from '../types/auth-payload';

@Controller('tenants')
@UseGuards(JwtGuard)
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Get()
  findAll(@CurrentUser() user: AuthenticatedUserPayload) {
    return this.tenantsService.findAll(user);
  }
}
