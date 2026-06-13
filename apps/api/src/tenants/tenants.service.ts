import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WorkspacesService } from '../workspaces/workspaces.service';
import type { AuthenticatedUserPayload } from '../types/auth-payload';

@Injectable()
export class TenantsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly workspacesService: WorkspacesService,
  ) {}

  async findAll(user?: AuthenticatedUserPayload) {
    const workspaceId = await this.workspacesService.getDefaultWorkspaceIdForUser(user?.sub ?? '');

    return this.prisma.tenant.findMany({
      where: {
        workspaceId,
        archivedAt: null,
      },
      orderBy: { createdAt: 'asc' },
    });
  }
}
