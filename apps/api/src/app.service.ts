import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}

  getHello(): string {
    return 'Hello World!';
  }

  async getHealth(): Promise<{ api: string; database: string }> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { api: 'ok', database: 'ok' };
    } catch {
      return { api: 'ok', database: 'error' };
    }
  }
}
