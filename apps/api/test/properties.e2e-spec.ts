import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
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

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('GET /properties returns seeded properties with units', () => {
    return request(app.getHttpServer())
      .get('/properties')
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

  it('GET /properties/:id returns the property matching a real list ID', async () => {
    const server = app.getHttpServer();

    const listRes = await request(server).get('/properties').expect(200);
    const list = listRes.body as PropertyResponse[];
    const virreyes = list.find((p) => p.name === 'Casa Virreyes');
    expect(virreyes).toBeDefined();

    return request(server)
      .get(`/properties/${virreyes!.id}`)
      .expect(200)
      .expect((res) => {
        const property = res.body as PropertyResponse;
        expect(property.name).toBe('Casa Virreyes');
        expect(property.workspaceId).toBe(virreyes!.workspaceId);
        expect(Array.isArray(property.units)).toBe(true);
        expect(property.units.length).toBeGreaterThanOrEqual(1);
      });
  });

  it('GET /properties/:id returns 404 for a non-existent id', () => {
    return request(app.getHttpServer())
      .get('/properties/nonexistent-id-12345')
      .expect(404)
      .expect((res) => {
        expect(res.body).toHaveProperty('statusCode', 404);
        expect(res.body).toHaveProperty('message');
      });
  });

  afterEach(async () => {
    await app.close();
  });
});
