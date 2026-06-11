import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

interface TenantResponse {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  workspaceId: string;
}

describe('TenantsController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('GET /tenants returns seeded tenants', () => {
    return request(app.getHttpServer())
      .get('/tenants')
      .expect(200)
      .expect((res) => {
        const body = res.body as TenantResponse[];
        expect(Array.isArray(body)).toBe(true);
        expect(body.length).toBeGreaterThanOrEqual(1);

        const tenant = body[0];
        expect(tenant).toHaveProperty('id');
        expect(tenant).toHaveProperty('name');
        expect(tenant).toHaveProperty('phone');
        expect(tenant).toHaveProperty('workspaceId');

        const ana = body.find((t) => t.name === 'Ana Lopez Garcia');
        expect(ana).toBeDefined();
      });
  });

  afterEach(async () => {
    await app.close();
  });
});
