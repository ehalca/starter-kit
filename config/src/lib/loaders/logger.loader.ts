import { registerAs } from "@nestjs/config";

const KEY = 'logger';

const loader = () => ({
    type: process.env["LOGGER_TYPE"],
  
    winston: {
      level: process.env["LOGGER_WINSTON_LEVEL"] ?? 'info',
      isConsole: Boolean(process.env["LOGGER_WINSTON_TRANSPORTS_CONSOLE"]),
      fileName: process.env["LOGGER_WINSTON_TRANSPORTS_FILE"] ?? 'app.log',
    },
  });
  
  export type LoggerVariables = {
    [KEY]: ReturnType<typeof loader>;
  };
  
  export default registerAs(KEY, loader);