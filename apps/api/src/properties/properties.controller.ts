import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/jwt.guard';
import { PropertiesService } from './properties.service';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthenticatedUserPayload } from '../types/auth-payload';
import { CreatePropertyDto } from './dto/create-property.dto';

@Controller('properties')
@UseGuards(JwtGuard)
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Get()
  findAll(@CurrentUser() user: AuthenticatedUserPayload) {
    return this.propertiesService.findAll(user);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: AuthenticatedUserPayload) {
    return this.propertiesService.findOne(id, user);
  }

  @Post()
  create(@Body() body: CreatePropertyDto, @CurrentUser() user: AuthenticatedUserPayload) {
    return this.propertiesService.create(body, user);
  }
}
