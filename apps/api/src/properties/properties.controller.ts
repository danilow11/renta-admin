import { Controller, Get, Param, Request, UseGuards } from '@nestjs/common';
import type { Request as ExpressRequest } from 'express';
import { JwtGuard } from '../auth/jwt.guard';
import { PropertiesService } from './properties.service';

@Controller('properties')
@UseGuards(JwtGuard)
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Get()
  findAll(@Request() request: ExpressRequest) {
    return this.propertiesService.findAll(request.user);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() request: ExpressRequest) {
    return this.propertiesService.findOne(id, request.user);
  }
}
