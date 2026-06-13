import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { PrismaService } from './../src/prisma/prisma.service';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

interface UnitResponse {
  id: string;
  name: string;
  propertyId: string;
}

interface PropertyResponse {
  id: string;
  name: string;
  workspaceId: string;
  units: UnitResponse[];
}

describe('PropertiesController (e2e)', () => {
  let app: INestApplication<App>;
  let validToken: string;
  let prisma: PrismaService;
  const createdPropertyIds: string[] = [];

  jest.setTimeout(15000);

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    prisma = app.get(PrismaService);

    const server = app.getHttpServer();
    const res = await request(server)
      .post('/auth/login')
      .send({ email: 'daniel@example.com', password: 'password123' });
    validToken = (res.body as { accessToken: string }).accessToken;
  });

  it('GET /properties without token returns 401', () => {
    return request(app.getHttpServer()).get('/properties').expect(401);
  });

  it('GET /properties/:id without token returns 401', () => {
    return request(app.getHttpServer()).get('/properties/some-id').expect(401);
  });

  it('GET /properties with invalid token returns 401', () => {
    return request(app.getHttpServer())
      .get('/properties')
      .set('Authorization', 'Bearer invalid-token')
      .expect(401);
  });

  it('GET /properties with valid token returns seeded properties with units', () => {
    return request(app.getHttpServer())
      .get('/properties')
      .set('Authorization', `Bearer ${validToken}`)
      .expect(200)
      .expect((res) => {
        const body = res.body as PropertyResponse[];
        expect(Array.isArray(body)).toBe(true);
        expect(body.length).toBeGreaterThanOrEqual(1);

        const property = body[0];
        expect(property).toHaveProperty('id');
        expect(property).toHaveProperty('name');
        expect(property).toHaveProperty('workspaceId');
        expect(property).toHaveProperty('units');
        expect(Array.isArray(property.units)).toBe(true);

        const virreyes = body.find((p) => p.name === 'Casa Virreyes');
        expect(virreyes).toBeDefined();
        expect(virreyes!.units.length).toBeGreaterThanOrEqual(1);

        for (const unit of virreyes!.units) {
          expect(unit).toHaveProperty('id');
          expect(unit).toHaveProperty('name');
          expect(unit).toHaveProperty('propertyId');
        }
      });
  });

  it('GET /properties/:id with valid token returns the property matching a real list ID', async () => {
    const server = app.getHttpServer();

    const listRes = await request(server)
      .get('/properties')
      .set('Authorization', `Bearer ${validToken}`)
      .expect(200);
    const list = listRes.body as PropertyResponse[];
    const virreyes = list.find((p) => p.name === 'Casa Virreyes');
    expect(virreyes).toBeDefined();

    return request(server)
      .get(`/properties/${virreyes!.id}`)
      .set('Authorization', `Bearer ${validToken}`)
      .expect(200)
      .expect((res) => {
        const property = res.body as PropertyResponse;
        expect(property.name).toBe('Casa Virreyes');
        expect(property.workspaceId).toBe(virreyes!.workspaceId);
        expect(Array.isArray(property.units)).toBe(true);
        expect(property.units.length).toBeGreaterThanOrEqual(1);
      });
  });

  it('GET /properties/:id with valid token returns 404 for a non-existent id', () => {
    return request(app.getHttpServer())
      .get('/properties/nonexistent-id-12345')
      .set('Authorization', `Bearer ${validToken}`)
      .expect(404)
      .expect((res) => {
        expect(res.body).toHaveProperty('statusCode', 404);
        expect(res.body).toHaveProperty('message');
      });
  });

  it('POST /properties without token returns 401', () => {
    return request(app.getHttpServer()).post('/properties').expect(401);
  });

  it('POST /properties missing name returns 400', () => {
    return request(app.getHttpServer())
      .post('/properties')
      .set('Authorization', `Bearer ${validToken}`)
      .send({})
      .expect(400);
  });

  it('POST /properties empty name returns 400', () => {
    return request(app.getHttpServer())
      .post('/properties')
      .set('Authorization', `Bearer ${validToken}`)
      .send({ name: '' })
      .expect(400);
  });

  it('POST /properties invalid optional field type returns 400', () => {
    return request(app.getHttpServer())
      .post('/properties')
      .set('Authorization', `Bearer ${validToken}`)
      .send({ name: 'Bad Optional Field', city: 123 })
      .expect(400);
  });

  it('POST /properties with valid body returns 201', async () => {
    const server = app.getHttpServer();

    const res = await request(server)
      .post('/properties')
      .set('Authorization', `Bearer ${validToken}`)
      .send({ name: 'Test Property', city: 'Morelia' })
      .expect(201);

    const body = res.body as { id: string; name: string; workspaceId: string };
    createdPropertyIds.push(body.id);

    expect(typeof body.id).toBe('string');
    expect(body.name).toBe('Test Property');
    expect(typeof body.workspaceId).toBe('string');
  });

  it('POST /properties created property appears in GET /properties', async () => {
    const server = app.getHttpServer();

    const createRes = await request(server)
      .post('/properties')
      .set('Authorization', `Bearer ${validToken}`)
      .send({ name: 'Integration Test Property' })
      .expect(201);
    const created = createRes.body as { id: string; name: string };
    createdPropertyIds.push(created.id);

    const listRes = await request(server)
      .get('/properties')
      .set('Authorization', `Bearer ${validToken}`)
      .expect(200);
    const list = listRes.body as PropertyResponse[];

    const found = list.find((p) => p.id === created.id);
    expect(found).toBeDefined();
    expect(found!.name).toBe('Integration Test Property');
  });

  afterEach(async () => {
    if (createdPropertyIds.length > 0) {
      await prisma.property.deleteMany({ where: { id: { in: createdPropertyIds } } });
      createdPropertyIds.length = 0;
    }
    await app.close();
  });
});
