import { AppConfig } from "../interfaces/config.interface";
import * as dotenv from "dotenv";
import * as pack from "../../../package.json";

dotenv.config();

export const defaultConfig: AppConfig = {
  env: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT, 10) || 4848,
  appName: 'Ether AI',
  appURL: process.env.TELEGRAM_APP_URL,
  supportChannel: {
    en: process.env.SUPPORT_CHANNEL_en,
    ru: process.env.SUPPORT_CHANNEL_ru,
  },
  version: pack.version,

  ip: "0.0.0.0",
  // second minute hour day-of-month months day-of-week
  cron: '* * 00 * * *',
  logging: {
    level: "debug",
    transport: {
      target: "pino-pretty",
    },
    serializers: {
      req: (r) => {
        delete r.headers;
        return r;
      },
      res: (r) => {
        delete r.headers;
        return r;
      },
    },
  },

  ollama: {
    baseUrl: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
    model: process.env.OLLAMA_MODEL || "llama2",
    options: {
      temperature: 0,
    },
  },

  authGuard: {
    source: "tg",
    apiKey: process.env.TELEGRAM_BOT_TOKEN,
    webhookSecret: process.env.TELEGRAM_WEBHOOK_SECRET,
    ttl: 3600 * 24 * 30,
  },
};
