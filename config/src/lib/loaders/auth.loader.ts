import { registerAs } from "@nestjs/config";

const KEY = 'auth';

const loader = ()=>({
    secret: process.env['JWT_SECRET'],
    expiresIn: process.env['JWT_EXPIRES_IN'],
    passwordSalt: process.env['PASSWORD_SALT'],
    refreshTokenSalt: process.env['REFRESH_TOKEN_SALT'],
    registrationExpirationTime: process.env['REGISTRATION_EXPIRATION_TIME'],
    forgotPasswordExpirationTime: process.env['FORGOT_PASSWORD_EXPIRATION_TIME'],
    emailAuthCodeExpirationTime: process.env['EMAIL_AUTH_CODE_EXPIRATION_TIME'],
})

export type AuthVariables = {
    [KEY]: ReturnType<typeof loader>
}

export default registerAs(KEY, loader);