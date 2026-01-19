import { AppConfig } from "../interfaces/config.interface";

export const developmentConfig: Partial<AppConfig> = {
  logging: {
    level: "info",
    transport: undefined, // Отключаем pretty print (будет JSON)
    serializers: {
      req: (r) => {
        const copy = { ...r };
        delete copy.headers?.cookie;
        return copy;
      },
      res: (r) => {
        const copy = { ...r };
        delete copy.headers;
        return copy;
      },
    },
  },
  ollama: {
    baseUrl: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
    model: process.env.OLLAMA_MODEL || "llama2",
    options: { temperature: 0.1 },
  },
  authGuard: {
    source: "tg",
    apiKey: process.env.TELEGRAM_BOT_TOKEN,
    webhookSecret: process.env.TELEGRAM_WEBHOOK_SECRET,
    ttl: 3600 * 24 * 30
  },
};
