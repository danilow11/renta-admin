import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/jwt.guard';
import { PropertiesService } from './properties.service';

@Controller('properties')
@UseGuards(JwtGuard)
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Get()
  findAll() {
    return this.propertiesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.propertiesService.findOne(id);
  }
}
