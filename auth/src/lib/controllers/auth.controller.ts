import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpStatus,
  NotFoundException,
  Post,
  Req,
  Res,
  UseGuards,
  UseInterceptors
} from '@nestjs/common';
import { ApiBody } from '@nestjs/swagger';
import { Response } from 'express';
import { ActivationDto } from '../dtos/activation.dto';
import { InitiateLoginDto } from '../dtos/initiate-auth.dto';
import { LoginDto } from '../dtos/login.dto';
import { RegistrationDto } from '../dtos/registration.dto';
import { ResendActivationDto } from '../dtos/resend-activation.dto';
import { JwtSignatureAuthGuard } from '../guards/auth.guard';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { JwtRefreshAuthGuard } from '../guards/jwt-refresh-auth.guard';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { AuthService } from '../services/auth.service';
import { UsersService } from '../services/users.service';
import { AuthRequest } from '../types/express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService, private readonly userService: UsersService) {}

  @Post('register')
  @UseInterceptors(ClassSerializerInterceptor)
  async register(@Res() response: Response, @Body() dto: RegistrationDto) {
    await this.authService.register(dto);
    response.status(HttpStatus.CREATED).send();
  }

  @Post('resend-activation')
  @UseInterceptors(ClassSerializerInterceptor)
  async resendActivation(@Body() dto: ResendActivationDto) {
    return this.authService.resendActivation(dto);
  }

  @Post('activate')
  @UseInterceptors(ClassSerializerInterceptor)
  async activate(@Body() dto: ActivationDto) {
    return this.authService.activate(dto);
  }

  @Post('initiate-login')
  @UseInterceptors(ClassSerializerInterceptor)
  async initiateLogin(@Body() initiateLogin: InitiateLoginDto) {
    const user = await this.userService.getByEmail(initiateLogin.email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const authMode = await this.authService.getUserAuthenticationMode(user);
    if (!authMode.password) {
      // if user has no password send email with code to user
      await this.authService.sendLoginCode(initiateLogin.email);
    }

    return authMode;
  }

  @UseGuards(LocalAuthGuard)
  @ApiBody({
    type: LoginDto
  })
  @Post('login')
  async login(@Req() req: AuthRequest) {
    return this.authService.getJwtTokens(req.user);
  }

  @UseGuards(JwtRefreshAuthGuard)
  @Get('refresh-token')
  async refreshToken(@Req() { user }: AuthRequest) {
    return this.authService.getJwtTokens(user, true);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Req() { user }: AuthRequest, @Res() res: Response) {
    await this.authService.revokeTokens(user);
    res.status(HttpStatus.OK).send();
  }

  @UseGuards(JwtSignatureAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Get('profile')
  getProfile(@Req() req: AuthRequest) {
    return this.authService.getProfile(req.user);
  }
}
