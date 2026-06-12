# Auth Mental Model

This document explains the current auth slice in Renta Admin.

It covers the first Phase 3 implementation:

```text
POST /auth/login
```

## Login Flow

Current flow:

```text
POST /auth/login
  -> AuthController.login()
  -> AuthService.login()
  -> UsersService.findByEmail()
  -> Prisma user lookup
  -> argon2 password verification
  -> JWT signing
  -> safe JSON response
```

In plain words:

1. The client sends email and password.
2. The controller receives the request body.
3. The auth service looks up the user by email.
4. The auth service verifies the password against the stored hash.
5. If valid, the auth service signs a JWT.
6. The API returns the token and a safe user object.

## Auth Controller

```ts
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(200)
  login(@Body() body: LoginDto) {
    return this.authService.login(body.email, body.password);
  }
}
```

What this means:

- `@Controller('auth')` makes routes start with `/auth`.
- `@Post('login')` creates `POST /auth/login`.
- `@HttpCode(200)` makes successful login return `200 OK`.
- `@Body()` reads the JSON request body.
- `LoginDto` describes the expected body shape.
- The controller delegates the real work to `AuthService`.

## Login DTO

Current DTO:

```ts
export class LoginDto {
  email!: string;
  password!: string;
}
```

What it does now:

- Gives TypeScript a shape for `body.email` and `body.password`.
- Helps the controller code compile cleanly.

What it does not do yet:

- It does not validate runtime input.
- It does not reject empty email/password automatically.
- It does not check email format yet.

Later improvement:

```ts
@IsEmail()
email: string;

@IsString()
@MinLength(1)
password: string;
```

That requires validation libraries and a global `ValidationPipe`.

## Auth Service

```ts
async login(email: string, password: string) {
  const user = await this.usersService.findByEmail(email);

  if (!user) {
    throw new UnauthorizedException('Invalid email or password');
  }

  const passwordValid = await argon2.verify(user.passwordHash, password);

  if (!passwordValid) {
    throw new UnauthorizedException('Invalid email or password');
  }

  const payload = {
    sub: user.id,
    email: user.email,
  };

  const accessToken = this.jwtService.sign(payload);

  return {
    accessToken,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
  };
}
```

What this does:

1. Finds the user by email.
2. If the user does not exist, returns `401`.
3. Verifies the submitted password against the stored password hash.
4. If the password is wrong, returns `401`.
5. Creates a small JWT payload.
6. Signs the token.
7. Returns the token and safe user fields.

Important detail:

The API uses the same error for missing user and wrong password:

```text
Invalid email or password
```

Reason:

- Do not reveal whether an email exists in the system.

## Password Hashing

The seed password is:

```text
password123
```

But the database does not store `password123`.

It stores:

```text
passwordHash
```

The seed script uses:

```ts
const passwordHash = await argon2.hash(seedUserPassword);
```

Login uses:

```ts
const passwordValid = await argon2.verify(user.passwordHash, password);
```

In plain words:

- `hash()` turns a password into a one-way stored hash.
- `verify()` checks if a typed password matches the stored hash.
- The original password should not be recoverable from the hash.

## JWT

JWT means JSON Web Token.

The API signs this payload:

```ts
{
  sub: user.id,
  email: user.email
}
```

What this means:

- `sub` means subject, commonly the user id.
- `email` is included for convenience.
- The token is signed using `JWT_SECRET`.
- A signed token can be trusted if the signature is valid.

Important:

- JWT is signed, not automatically private.
- Do not put sensitive information in the payload.
- Do not put `passwordHash`, secrets, or large permission data in the token.

## Auth Module

```ts
@Module({
  imports: [
    UsersModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const jwtSecret = configService.get<string>('JWT_SECRET');

        if (!jwtSecret) {
          throw new Error('JWT_SECRET is required to initialize AuthModule.');
        }

        return {
          secret: jwtSecret,
          signOptions: { expiresIn: '1d' },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
```

What this means:

- `UsersModule` is imported because `AuthService` needs `UsersService`.
- `JwtModule` provides `JwtService`.
- `ConfigService` reads `JWT_SECRET` from environment variables.
- If `JWT_SECRET` is missing, the app fails early with a clear error.
- Tokens currently expire in `1d`.

## Users Service

```ts
async findByEmail(email: string) {
  return this.prisma.user.findUnique({
    where: { email },
  });
}
```

What this means:

- `email` is unique in the Prisma schema.
- `findUnique` is the right query for unique fields.
- `AuthService` needs this method to find the login user.

## Safe User Response

Bad response:

```json
{
  "id": "user-id",
  "email": "daniel@example.com",
  "passwordHash": "$argon2id$..."
}
```

Good response:

```json
{
  "accessToken": "...",
  "user": {
    "id": "user-id",
    "email": "daniel@example.com",
    "name": "Daniel Alvarez"
  }
}
```

Rule:

- `passwordHash` can be used internally by `AuthService`.
- `passwordHash` must never be returned to the client.

## Current Tests

Auth e2e tests check:

- Login succeeds with seeded credentials.
- Login returns an access token.
- Login returns a safe user object.
- Login response does not include `passwordHash`.
- Login fails with wrong password and returns `401`.

Why this matters:

- It proves the route, module wiring, Prisma lookup, argon2 verification, and JWT signing work together.

## What Comes Next

The login endpoint creates a token, but existing routes do not require it yet.

Next auth steps:

1. Add request validation for `LoginDto`.
2. Add JWT guard.
3. Add a way to read the current user from the request.
4. Protect API routes.
5. Replace hardcoded workspace lookup with authenticated workspace context.

## Interview Answers

### Why hash passwords?

Passwords should never be stored as plain text. Hashing stores a one-way representation of the password. During login, the submitted password is verified against the hash.

### Why return the same error for wrong email and wrong password?

Returning the same error avoids revealing which emails exist in the system.

### What is JWT used for?

The JWT proves that a user already logged in. The client sends it on future requests, and the backend validates it before allowing protected operations.

### Why keep JWT payload small?

Tokens are sent with requests and can be decoded by clients. They should contain only small non-sensitive claims, like user id and email.

### What does `JwtModule` do?

It gives NestJS a configured `JwtService` that can sign and later verify tokens using `JWT_SECRET`.

