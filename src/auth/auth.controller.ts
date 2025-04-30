import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { LoginDto } from './dto/login.dto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RegisterUserDto } from './dto/register-user.dto';
import { ResetDto } from './dto/reset.dto';

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
  @Post('/restore-password')
  restorePassword(@Body() ResetPasswordDto: ResetDto) {
    // return this.authService.restorePassword(ResetPasswordDto);
  }
}
