import { Controller, Get, UseGuards } from '@nestjs/common';
import { RentChargesService } from './rent-charges.service';
import { JwtGuard } from '../auth/jwt.guard';

@Controller('rent-charges')
@UseGuards(JwtGuard)
export class RentChargesController {
  constructor(private readonly rentChargesService: RentChargesService) {}

  @Get()
  findAll() {
    return this.rentChargesService.findAll();
  }
}
