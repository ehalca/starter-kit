/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { registerAs } from '@nestjs/config';
import ms = require('ms');

const KEY = 'auth';

const loader = () => ({
  secret: process.env['JWT_SECRET'],
  passwordSalt: process.env['PASSWORD_SALT'],
  refreshTokenSalt: process.env['REFRESH_TOKEN_SALT'],
  expiresIn: ms(process.env['JWT_EXPIRES_IN']!),
  registrationExpirationTime: ms(process.env['REGISTRATION_EXPIRATION_TIME']!),
  forgotPasswordExpirationTime: ms(
    process.env['FORGOT_PASSWORD_EXPIRATION_TIME']!
  ),
  emailAuthCodeExpirationTime: ms(
    process.env['EMAIL_AUTH_CODE_EXPIRATION_TIME']!
  ),
});

export type AuthVariables = {
  [KEY]: ReturnType<typeof loader>;
};

export default registerAs(KEY, loader);
