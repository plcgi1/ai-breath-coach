import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AiOptions } from "./interfaces/ai-provider.interface";
import { ChatOllama } from "@langchain/ollama";

@Injectable()
export class ModelFactory {
  private cache = new Map<string, any>();

  constructor(private config: ConfigService) {}

  getOllamaModel(options?: AiOptions) {
    const temp = options?.temperature ?? 0.2;
    const key = `ollama-${temp}`;

    if (!this.cache.has(key)) {
      this.cache.set(
        key,
        new ChatOllama({
          baseUrl: this.config.get("OLLAMA_BASE_URL"),
          model: this.config.get("OLLAMA_MODEL"),
          temperature: temp,
        }),
      );
    }
    return this.cache.get(key);
  }

  // TODO функции для получения других моделей
}
