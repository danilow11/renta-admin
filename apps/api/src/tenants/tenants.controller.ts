import { Controller, Get, UseGuards } from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { JwtGuard } from '../auth/jwt.guard';

@Controller('tenants')
@UseGuards(JwtGuard)
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Get()
  findAll() {
    return this.tenantsService.findAll();
  }
}
