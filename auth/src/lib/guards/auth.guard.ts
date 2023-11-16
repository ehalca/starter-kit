import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtSignatureAuthGuard extends AuthGuard(['jwt', 'signature']) {}
