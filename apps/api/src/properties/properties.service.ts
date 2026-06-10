import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PropertiesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const workspace = await this.prisma.workspace.findFirst({
      where: { name: 'Propiedades Morelia' },
    });

    if (!workspace) {
      throw new NotFoundException('Workspace "Propiedades Morelia" not found');
    }

    return this.prisma.property.findMany({
      where: {
        workspaceId: workspace.id,
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

  async findOne(id: string) {
    const workspace = await this.prisma.workspace.findFirst({
      where: { name: 'Propiedades Morelia' },
    });

    if (!workspace) {
      throw new NotFoundException('Workspace "Propiedades Morelia" not found');
    }

    const singleProperty = await this.prisma.property.findFirst({
      where: {
        workspaceId: workspace.id,
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
}
