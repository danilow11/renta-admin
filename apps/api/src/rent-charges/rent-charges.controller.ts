import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { RentChargesService } from './rent-charges.service';
import { JwtGuard } from '../auth/jwt.guard';
import type { Request as ExpressRequest } from 'express';

@Controller('rent-charges')
@UseGuards(JwtGuard)
export class RentChargesController {
  constructor(private readonly rentChargesService: RentChargesService) {}

  @Get()
  findAll(@Request() request: ExpressRequest) {
    return this.rentChargesService.findAll(request.user);
  }
}
