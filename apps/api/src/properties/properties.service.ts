import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WorkspacesService } from '../workspaces/workspaces.service';
import type { AuthenticatedUserPayload } from '../types/auth-payload';
import { CreatePropertyDto } from './dto/create-property.dto';

@Injectable()
export class PropertiesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly workspacesService: WorkspacesService,
  ) {}

  async findAll(user?: AuthenticatedUserPayload) {
    const workspaceId = await this.workspacesService.getDefaultWorkspaceIdForUser(user?.sub ?? '');

    return this.prisma.property.findMany({
      where: {
        workspaceId,
        archivedAt: null,
      },
      include: {
        units: {
          where: { archivedAt: null },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findOne(id: string, user?: AuthenticatedUserPayload) {
    const workspaceId = await this.workspacesService.getDefaultWorkspaceIdForUser(user?.sub ?? '');

    const singleProperty = await this.prisma.property.findFirst({
      where: {
        workspaceId,
        id,
        archivedAt: null,
      },
      include: {
        units: {
          where: { archivedAt: null },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!singleProperty) throw new NotFoundException('Property not found');

    return singleProperty;
  }

  async create(body: CreatePropertyDto, user?: AuthenticatedUserPayload) {
    const workspaceId = await this.workspacesService.getDefaultWorkspaceIdForUser(user?.sub ?? '');

    return this.prisma.property.create({
      data: {
        ...body,
        workspaceId,
        createdById: user?.sub,
      },
    });
  }
}
