import { registerAs } from '@nestjs/config';

const KEY = 'db';

const loader = () => ({
  type: process.env['DB_TYPE'],
  host: process.env['DB_HOST'],
  port: parseInt(process.env['DB_PORT'] ?? '5432'),
  username: process.env['DB_USERNAME'],
  password: process.env['DB_PASSWORD'],
  database: process.env['DB_DATABASE'],
  entities: [],
  synchronize: process.env['DB_SYNCHRONIZE'] === 'true',
  logging: process.env['DB_LOGGING'] === 'true',
});

export type DBVariables = {
  [KEY]: ReturnType<typeof loader>;
};

export default registerAs(KEY, loader);
