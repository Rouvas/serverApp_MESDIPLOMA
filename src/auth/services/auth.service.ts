import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UsersService } from '../../users/services/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from '../dto/login.dto';
import { RegisterUserDto } from '../dto/register-user.dto';
import { ITokenPayload } from '../interfaces/token-payload';
import { User } from '../../users/schemas/user.schema';
import { SessionService } from '../../session/services/session.service';
import { MailerService } from '@nestjs-modules/mailer';
import { ResetDto } from '../dto/reset.dto';
import { passwordGenerator } from '../functions/passwordGenerator';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private sessionService: SessionService,
    private mailerService: MailerService,
  ) {}

  async login(dto: LoginDto) {
    if (!dto)
      throw new HttpException('Неправильные данные', HttpStatus.BAD_REQUEST); // No data set
    const user = await this.usersService.findOneByEmail(dto.email);
    if (!user)
      throw new HttpException('Пользователь не найден', HttpStatus.NOT_FOUND); // User Not Found

    // if (user.status == 'pending')
    //   throw new HttpException('Почта не подтверждена', HttpStatus.UNAUTHORIZED); // No confirm

    const passwordsIsEqual = await bcrypt.compare(
      dto.password,
      user.hashedPassword,
    );

    if (!passwordsIsEqual)
      throw new HttpException('Неверный пароль', HttpStatus.BAD_REQUEST); // Password not equals

    const accessToken = await this.generateToken(user);

    const session = {
      accessToken: accessToken,
      userId: user._id as string,
    };
    await this.sessionService.create(session);
    return { accessToken };
  }

  async resetPassword(dto: ResetDto) {
    if (!dto)
      throw new HttpException('Неправильные данные', HttpStatus.BAD_REQUEST);
    const user = await this.usersService.findOneByEmail(dto.email);
    if (!user)
      throw new HttpException('Пользователь не найден', HttpStatus.NOT_FOUND);

    const newPassword = passwordGenerator();
    user.hashedPassword = await bcrypt.hash(newPassword, 5);
    await user.save();

    await this.mailerService.sendMail({
      to: user.email,
      from: 'work@gaiduchik.com',
      subject: 'МЭС - Восстановление пароля',
      html: `Ваш новый пароль: ${newPassword}`,
    });
    return {
      message: 'Пароль успешно изменен, проверьте почту',
    };
  }

  async registration(dto: RegisterUserDto) {
    const candidate = await this.usersService.findOneByEmail(dto.email);
    if (candidate)
      throw new HttpException(
        'Пользователь с таким email уже существует',
        HttpStatus.BAD_REQUEST,
      ); // User already exists

    const hashedPassword = await bcrypt.hash(dto.password, 5);
    const user = await this.usersService.create({
      ...dto,
      hashedPassword: hashedPassword,
    });

    const accessToken = this.generateToken(user);

    // const link

    await this.mailerService.sendMail({
      to: user.email,
      from: 'work@gaiduchik.com',
      subject: 'МЭС - Подтверждение регистрации',
      html: `Ваш аккаунт был успешно зарегистрирован и активирован!`,
    });

    return { accessToken };
  }

  generateToken(user: User) {
    const payload: ITokenPayload = {
      email: user.email,
      role: user.role,
    };
    return this.jwtService.sign(payload);
  }

  async getUserByEmail(email: string) {
    return this.usersService.findOneByEmail(email);
  }

}
