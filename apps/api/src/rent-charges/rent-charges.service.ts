import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WorkspacesService } from '../workspaces/workspaces.service';

interface AuthenticatedUserPayload {
  sub: string;
  email: string;
}

@Injectable()
export class RentChargesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly workspacesService: WorkspacesService,
  ) {}

  private async getWorkspaceId(user?: AuthenticatedUserPayload) {
    if (!user?.sub) {
      throw new UnauthorizedException('Invalid authenticated user');
    }

    const membership = await this.workspacesService.getDefaultWorkspaceForUser(user.sub);

    return membership.workspaceId;
  }
  async findAll(user?: AuthenticatedUserPayload) {
    const workspaceId = await this.getWorkspaceId(user);

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
