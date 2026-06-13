import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import type { AuthenticatedUserPayload } from '../types/auth-payload';

export const CurrentUser = createParamDecorator(
  (_data, ctx: ExecutionContext): AuthenticatedUserPayload => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    return user;
  },
);
