import { Controller, Get, UseGuards } from '@nestjs/common';
import { RentChargesService } from './rent-charges.service';
import { JwtGuard } from '../auth/jwt.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthenticatedUserPayload } from '../types/auth-payload';

@Controller('rent-charges')
@UseGuards(JwtGuard)
export class RentChargesController {
  constructor(private readonly rentChargesService: RentChargesService) {}

  @Get()
  findAll(@CurrentUser() user: AuthenticatedUserPayload) {
    return this.rentChargesService.findAll(user);
  }
}
