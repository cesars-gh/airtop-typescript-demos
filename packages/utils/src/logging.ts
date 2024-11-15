import { LogLayer, LoggerType } from "loglayer";

const logger = new LogLayer({
  logger: {
    instance: console,
    type: LoggerType.CONSOLE,
  },
});

export function getLogger(): LogLayer {
  return logger;
}
