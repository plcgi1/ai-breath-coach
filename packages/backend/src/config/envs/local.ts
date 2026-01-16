import { AppConfig } from "../interfaces/config.interface";

console.info("Working in local mode with fake guards");

export const localConfig: Partial<AppConfig> = {
  logging: {
    level: "info",
    transport: {
      target: "pino-pretty",
    },
    serializers: {
      req: (r) => {
        const copy = { ...r };
        delete copy.headers;
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
    skip: true,
    webhookSecret: process.env.TELEGRAM_WEBHOOK_SECRET,
  },
};
