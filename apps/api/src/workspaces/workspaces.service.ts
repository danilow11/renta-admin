import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WorkspacesService {
  constructor(private readonly prisma: PrismaService) {}

  async getDefaultWorkspaceForUser(userId: string) {
    if (!userId) {
      throw new UnauthorizedException('Invalid authenticated user');
    }

    const membership = await this.prisma.workspaceMember.findFirst({
      where: { userId },
      include: {
        workspace: true,
      },
    });

    if (!membership) {
      throw new ForbiddenException('User does not have access to a workspace');
    }

    return membership;
  }
}
