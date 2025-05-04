import { Controller, Post, Body, UseGuards, Req, Get } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { LoginDto } from './dto/login.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RegisterUserDto } from './dto/register-user.dto';
import { ResetDto } from './dto/reset.dto';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authSvc: AuthService) {}

  @ApiOperation({ summary: 'Авторизация' })
  @ApiResponse({ status: 200 })
  @Post('/login')
  login(@Body() LoginDto: LoginDto) {
    return this.authSvc.login(LoginDto);
  }

  @ApiOperation({ summary: 'Регистрация' })
  @ApiResponse({ status: 200 })
  @Post('/register')
  registration(@Body() RegistrationDto: RegisterUserDto) {
    return this.authSvc.registration(RegistrationDto);
  }

  @ApiOperation({ summary: 'Восстановление пароля' })
  @ApiResponse({ status: 200 })
  @Post('/restore')
  restorePassword(@Body() ResetPasswordDto: ResetDto) {
    return this.authSvc.resetPassword(ResetPasswordDto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Получение информации о себе' })
  @ApiResponse({ status: 200 })
  @Get('/about-me')
  whoAmI(@Req() req: any) {
    return req.user;
  }
}
