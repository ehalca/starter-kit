import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  HttpStatus,
  Post,
  Response,
  UseInterceptors
} from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import ForgotPasswordDto from '../dto/forgot-password.dto';
import ResetPasswordDto from '../dto/reset-password.dto';
import CheckPasswordRequestDto from '../dto/check-password-request.dto';

@Controller('auth')
export class PasswordController {
  constructor(private readonly authService: AuthService) {}

  @Post('forgot-password')
  @UseInterceptors(ClassSerializerInterceptor)
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Post('check-password-request')
  @UseInterceptors(ClassSerializerInterceptor)
  checkRequest(@Body() dto: CheckPasswordRequestDto) {
    return this.authService.checkPasswordRequest(dto);
  }

  @Post('reset-password')
  @UseInterceptors(ClassSerializerInterceptor)
  async resetPassword(@Body() dto: ResetPasswordDto, @Response() res) {
    await this.authService.resetPassword(dto);
    res.sendStatus(HttpStatus.OK);
  }
}
