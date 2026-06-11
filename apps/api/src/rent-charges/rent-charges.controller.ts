import { Controller, Get } from '@nestjs/common';
import { RentChargesService } from './rent-charges.service';

@Controller('rent-charges')
export class RentChargesController {
  constructor(private readonly rentChargesService: RentChargesService) {}

  @Get()
  findAll() {
    return this.rentChargesService.findAll();
  }
}
