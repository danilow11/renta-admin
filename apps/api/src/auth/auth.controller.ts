import { Body, Controller, Get, HttpCode, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './login.dto';
import { JwtGuard } from './jwt.guard';
import { CurrentUser } from './current-user.decorator';
import type { AuthenticatedUserPayload } from '../types/auth-payload';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(200)
  login(@Body() body: LoginDto) {
    return this.authService.login(body.email, body.password);
  }

  @UseGuards(JwtGuard)
  @Get('me')
  me(@CurrentUser() user: AuthenticatedUserPayload) {
    return this.authService.me(user);
  }
}
