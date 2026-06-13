import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { JwtGuard } from '../auth/jwt.guard';
import type { Request as ExpressRequest } from 'express';

@Controller('tenants')
@UseGuards(JwtGuard)
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Get()
  findAll(@Request() request: ExpressRequest) {
    return this.tenantsService.findAll(request.user);
  }
}
