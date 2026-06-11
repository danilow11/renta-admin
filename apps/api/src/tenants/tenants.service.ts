import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TenantsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const workspace = await this.prisma.workspace.findFirst({
      where: { name: 'Propiedades Morelia' },
    });

    if (!workspace) {
      throw new NotFoundException('Workspace "Propiedades Morelia" not found');
    }

    return this.prisma.tenant.findMany({
      where: {
        workspaceId: workspace.id,
        archivedAt: null,
      },
      orderBy: { createdAt: 'asc' },
    });
  }
}
