import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WorkspacesService } from '../workspaces/workspaces.service';
import type { AuthenticatedUserPayload } from '../types/auth-payload';

@Injectable()
export class RentChargesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly workspacesService: WorkspacesService,
  ) {}

  async findAll(user?: AuthenticatedUserPayload) {
    const workspaceId = await this.workspacesService.getDefaultWorkspaceIdForUser(user?.sub ?? '');

    return this.prisma.rentCharge.findMany({
      where: {
        workspaceId,
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
