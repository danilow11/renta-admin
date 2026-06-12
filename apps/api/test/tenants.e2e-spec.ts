import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
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
  let jwtService: JwtService;
  let validToken: string;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    jwtService = app.get(JwtService);
    validToken = jwtService.sign({ sub: 'test-user-id', email: 'daniel@example.com' });
  });

  it('GET /tenants without token returns 401', () => {
    return request(app.getHttpServer()).get('/tenants').expect(401);
  });

  it('GET /tenants with invalid token returns 401', () => {
    return request(app.getHttpServer())
      .get('/tenants')
      .set('Authorization', 'Bearer invalid-token')
      .expect(401);
  });

  it('GET /tenants with valid token returns seeded tenants', () => {
    return request(app.getHttpServer())
      .get('/tenants')
      .set('Authorization', `Bearer ${validToken}`)
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
