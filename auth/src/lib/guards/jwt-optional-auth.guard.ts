import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  // Override handleRequest so it never throws an error
  handleRequest(error, user, info, context) {
    if (info?.message === 'No auth token') {
      return user;
    }
    return super.handleRequest(error, user, info, context);
  }
}
