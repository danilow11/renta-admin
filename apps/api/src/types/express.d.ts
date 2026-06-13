import type { AuthenticatedUserPayload } from './auth-payload';

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUserPayload;
    }
  }
}
