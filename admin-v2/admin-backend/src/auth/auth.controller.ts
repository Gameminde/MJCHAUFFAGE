import { Controller, Post, Body, HttpCode, HttpStatus, ValidationPipe, Get, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Public } from './decorators/public.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import type { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body(ValidationPipe) loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @HttpCode(HttpStatus.OK)
  async me(@Req() req: Request) {
    // JwtStrategy attache l'utilisateur validé à req.user
    // Retourne directement l'objet utilisateur
    return (req as any).user ?? null;
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout() {
    // Stateless JWT: rien à invalider côté serveur par défaut
    return { success: true };
  }
}
