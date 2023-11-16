import * as Joi from 'joi';

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
}

export default Joi.object({
  PROPERTY: Joi.string().required(),
  NX_PROPERTY: Joi.string().required(),
  ...DOMAINS_VARIABLES,
  ...DB_VARIABLES,
});
