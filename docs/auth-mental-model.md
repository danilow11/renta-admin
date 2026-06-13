# Auth Mental Model

This document explains the current auth slice in Renta Admin.

It covers the first Phase 3 implementation:

```text
POST /auth/login
GET /auth/me
protected read endpoints
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
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(1)
  password!: string;
}
```

What it does now:

- Gives TypeScript a shape for `body.email` and `body.password`.
- Helps the controller code compile cleanly.
- Uses `class-validator` decorators to validate runtime input.
- Rejects invalid email or empty password before `AuthService` runs.

The global `ValidationPipe` in `main.ts` makes these decorators run for incoming requests.

Test setup also adds the same pipe because e2e tests create the Nest app manually and do not run `main.ts`.

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

## Guard, Pipe, And Current User Flow

For protected routes, the current flow is:

```text
request with Authorization header
  -> JwtGuard verifies token
  -> JwtGuard sets request.user
  -> @CurrentUser() reads request.user
  -> controller receives user payload
  -> service uses user.sub to scope data
```

Key pieces:

| Piece | Job |
| --- | --- |
| `ValidationPipe` | Validates request body/query/params before controller logic. |
| `JwtGuard` | Allows or blocks a request before the controller method runs. |
| `@CurrentUser()` | Custom decorator that extracts the authenticated user payload from the request. |

Difference:

```text
pipe = validates/transforms input
guard = decides if request can continue
decorator = extracts or annotates data for a class/method/parameter
```

`JwtGuard` is not itself a decorator. It is a guard class. `@UseGuards(JwtGuard)` is the built-in Nest decorator that applies the guard.

`@CurrentUser()` is the project's first custom decorator. It was created with Nest's `createParamDecorator` helper.

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
  providers: [AuthService, JwtGuard],
  exports: [JwtGuard, JwtModule],
})
export class AuthModule {}
```

What this means:

- `UsersModule` is imported because `AuthService` needs `UsersService`.
- `JwtModule` provides `JwtService`.
- `ConfigService` reads `JWT_SECRET` from environment variables.
- If `JWT_SECRET` is missing, the app fails early with a clear error.
- Tokens currently expire in `1d`.
- `JwtGuard` is exported so other modules can protect their routes.

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

## Current User And Workspaces

`GET /auth/me` returns:

```text
safe user info + workspace memberships
```

In the database, the Prisma model is named:

```text
WorkspaceMember
```

In plain English, one `WorkspaceMember` record is a membership.

Example:

```text
Daniel belongs to Propiedades Morelia as OWNER.
```

That row tells the backend:

- which user belongs to which workspace
- what role the user has
- which workspace id should scope queries

Protected read services now use:

```text
authenticated user -> workspace membership -> workspaceId -> Prisma query
```

This replaced the temporary hardcoded workspace lookup by name.

## Current Tests

Auth e2e tests check:

- Login succeeds with seeded credentials.
- Login returns an access token.
- Login returns a safe user object.
- Login response does not include `passwordHash`.
- Login fails with wrong password and returns `401`.
- Invalid login bodies return `400`.
- `GET /auth/me` requires a valid token.
- Protected read endpoints require a valid token.

Why this matters:

- It proves the route, module wiring, Prisma lookup, argon2 verification, and JWT signing work together.

## What Comes Next

Core API auth is now in place. Later work can improve it with:

1. Role checks for owner-only actions.
2. Frontend login UI.
3. Better token storage decisions for the browser.
4. Refresh tokens or cookie-based sessions if needed.
5. Dedicated test helpers to reduce e2e repetition.

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

### What is a guard?

A guard runs before a controller method and decides whether the request can continue. In this project, `JwtGuard` checks the bearer token.

### What is `@CurrentUser()`?

It is a custom parameter decorator that reads the authenticated user payload from the request. It keeps controllers from manually importing Express `Request` and reading `request.user`.

### What is a workspace membership?

A workspace membership is one `WorkspaceMember` record. It links a user to a workspace and stores the user's role in that workspace.
