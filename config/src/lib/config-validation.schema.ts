import * as Joi from 'joi';
import { isZeitMs } from '@ehalca/common';

const DOMAINS_VARIABLES = {
  APP_URL: Joi.string().required(),
  NX_API_URL: Joi.string().required(),
};

const DB_VARIABLES = {
  DB_TYPE: Joi.string().required(),
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().required(),
  DB_USERNAME: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_DATABASE: Joi.string().required(),
  DB_SYNCHRONIZE: Joi.boolean().required(),
  DB_LOGGING: Joi.boolean().required(),
};

const AUTH_VARIABLES = {
  PASSWORD_SALT: Joi.string().required(),
  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRES_IN: Joi.string().required().custom(isZeitMs, 'ZeitMs validation'),
  REFRESH_TOKEN_SALT: Joi.string().required(),
  REGISTRATION_EXPIRATION_TIME: Joi.string()
    .required()
    .custom(isZeitMs, 'ZeitMs validation'),
  FORGOT_PASSWORD_EXPIRATION_TIME: Joi.string()
    .required()
    .custom(isZeitMs, 'ZeitMs validation'),
  EMAIL_AUTH_CODE_EXPIRATION_TIME: Joi.string()
    .required()
    .custom(isZeitMs, 'ZeitMs validation'),
};

export default Joi.object({
  PROPERTY: Joi.string().required(),
  NX_PROPERTY: Joi.string().required(),
  ...DOMAINS_VARIABLES,
  ...DB_VARIABLES,
  ...AUTH_VARIABLES,
});
