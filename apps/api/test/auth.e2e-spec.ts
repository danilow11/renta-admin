import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

interface LoginUserResponse {
  id: string;
  email: string;
  name: string;
}

interface LoginResponse {
  accessToken: string;
  user: LoginUserResponse;
}

interface MeWorkspace {
  id: string;
  name: string;
}

interface MeMembership {
  id: string;
  role: string;
  workspaceId: string;
  userId: string;
  workspace: MeWorkspace;
}

interface MeResponse {
  user: LoginUserResponse;
  memberships: MeMembership[];
}

describe('AuthController (e2e)', () => {
  let app: INestApplication<App>;
  let validToken: string;

  jest.setTimeout(15000);

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    const server = app.getHttpServer();
    const res = await request(server)
      .post('/auth/login')
      .send({ email: 'daniel@example.com', password: 'password123' });
    validToken = (res.body as LoginResponse).accessToken;
  });

  it('POST /auth/login succeeds with seeded credentials', () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'daniel@example.com',
        password: 'password123',
      })
      .expect(200)
      .expect((res) => {
        const body = res.body as LoginResponse;
        expect(typeof body.accessToken).toBe('string');
        expect(body.accessToken.length).toBeGreaterThan(0);
        expect(body.user).toBeDefined();
        expect(typeof body.user.id).toBe('string');
        expect(body.user.email).toBe('daniel@example.com');
        expect(body.user.name).toBe('Daniel Alvarez');
      });
  });

  it('POST /auth/login response does not include passwordHash', () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'daniel@example.com',
        password: 'password123',
      })
      .expect(200)
      .expect((res) => {
        const body = res.body as LoginResponse & { passwordHash?: unknown };
        expect(body.passwordHash).toBeUndefined();
        expect((body.user as unknown as Record<string, unknown>).passwordHash).toBeUndefined();
      });
  });

  it('POST /auth/login fails with wrong password and returns 401', () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'daniel@example.com',
        password: 'wrong-password',
      })
      .expect(401);
  });

  it('POST /auth/login missing body returns 400', () => {
    return request(app.getHttpServer()).post('/auth/login').expect(400);
  });

  it('POST /auth/login invalid email returns 400', () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'not-an-email',
        password: 'password123',
      })
      .expect(400);
  });

  it('POST /auth/login empty password returns 400', () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'daniel@example.com',
        password: '',
      })
      .expect(400);
  });

  it('GET /auth/me without token returns 401', () => {
    return request(app.getHttpServer()).get('/auth/me').expect(401);
  });

  it('GET /auth/me with valid token returns current user and workspace', () => {
    return request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${validToken}`)
      .expect(200)
      .expect((res) => {
        const body = res.body as MeResponse;
        expect(body.user).toBeDefined();
        expect(body.user.email).toBe('daniel@example.com');
        expect(body.user.name).toBe('Daniel Alvarez');
        expect(typeof body.user.id).toBe('string');
        expect(Array.isArray(body.memberships)).toBe(true);
        expect(body.memberships.length).toBeGreaterThanOrEqual(1);
        expect(body.memberships[0].workspace.name).toBe('Propiedades Morelia');
      });
  });

  afterEach(async () => {
    await app.close();
  });
});
