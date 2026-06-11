import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

interface Tenant {
  id: string;
  name: string;
}

interface Payment {
  id: string;
  amountCents: number;
}

interface Unit {
  id: string;
  name: string;
}

interface RentChargeResponse {
  id: string;
  amountCents: number;
  status: string;
  dueDate: string;
  workspaceId: string;
  contract: {
    tenant: Tenant;
    unit: Unit;
  };
  payments: Payment[];
}

describe('RentChargesController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('GET /rent-charges returns seeded June charges for Ana and Carlos', () => {
    return request(app.getHttpServer())
      .get('/rent-charges')
      .expect(200)
      .expect((res) => {
        const body = res.body as RentChargeResponse[];
        expect(Array.isArray(body)).toBe(true);
        expect(body.length).toBeGreaterThanOrEqual(2);

        const charge = body[0];
        expect(charge).toHaveProperty('id');
        expect(charge).toHaveProperty('amountCents');
        expect(charge).toHaveProperty('status');
        expect(charge).toHaveProperty('dueDate');
        expect(charge).toHaveProperty('workspaceId');
        expect(charge).toHaveProperty('contract');
        expect(charge.contract).toHaveProperty('tenant');
        expect(charge.contract).toHaveProperty('unit');
        expect(charge).toHaveProperty('payments');
        expect(Array.isArray(charge.payments)).toBe(true);

        const anaCharge = body.find((c) => c.contract.tenant.name === 'Ana Lopez Garcia');
        expect(anaCharge).toBeDefined();
        expect(anaCharge!.amountCents).toBe(350_000);
        expect(anaCharge!.status).toBe('PARTIAL');
        expect(anaCharge!.payments.length).toBe(1);
        expect(anaCharge!.payments[0].amountCents).toBe(200_000);

        const carlosCharge = body.find((c) => c.contract.tenant.name === 'Carlos Hernandez Ponce');
        expect(carlosCharge).toBeDefined();
        expect(carlosCharge!.amountCents).toBe(320_000);
        expect(carlosCharge!.status).toBe('PAID');
        expect(carlosCharge!.payments.length).toBe(1);
        expect(carlosCharge!.payments[0].amountCents).toBe(320_000);
      });
  });

  afterEach(async () => {
    await app.close();
  });
});
