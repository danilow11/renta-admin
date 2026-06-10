import { loadEnvFile } from 'node:process';
import { defineConfig } from 'prisma/config';

loadEnvFile('../../.env');

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'ts-node --project tsconfig.seed.json prisma/seed.ts',
  },
  datasource: {
    url: process.env['DATABASE_URL'],
  },
});
