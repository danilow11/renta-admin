import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RentChargesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const workspace = await this.prisma.workspace.findFirst({
      where: { name: 'Propiedades Morelia' },
    });

    if (!workspace) {
      throw new NotFoundException('Workspace "Propiedades Morelia" not found');
    }

    return this.prisma.rentCharge.findMany({
      where: {
        workspaceId: workspace.id,
        archivedAt: null,
      },
      include: {
        payments: true,
        contract: {
          include: { tenant: true, unit: true },
        },
      },
      orderBy: { dueDate: 'asc' },
    });
  }
}
