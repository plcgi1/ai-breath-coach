import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Technique } from "../../database/models/technique.model";
import { AiResponse } from "../ai/interfaces/ai-provider.interface";
import { ModelFactory } from "../ai/ai.factory";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import { selectTechniqueTool } from "./breathing.tools";
import { Sequelize } from "sequelize-typescript";
import { Transaction } from "sequelize";
import { StatisticsService } from "../statistic/statistics.service";
import { InjectPinoLogger, PinoLogger } from "nestjs-pino";

type TGetTchBySlug = {
  score;
  description;
};

@Injectable()
export class BreathingService {
  private readonly FALLBACK_SLUG = "focus";

  constructor(
    private modelFactory: ModelFactory,
    @InjectModel(Technique)
    private techniqueModel: typeof Technique,
    private readonly sequelize: Sequelize,
    private readonly statisticsService: StatisticsService,
    @InjectPinoLogger(BreathingService.name)
    private readonly logger: PinoLogger,
  ) {}

  async getList(): Promise<Technique[]> {
    const techniques = await this.techniqueModel.findAll({
      where: { status: "active" },
    });

    return techniques;
  }

  async getBaseTechniques(): Promise<Technique[]> {
    const techniques = await this.techniqueModel.findAll({
      where: { status: "active" },
    });

    return techniques;
  }

  private async getAvailableSlugsContext(): Promise<string> {
    // 1. Получаем все активные техники из базы
    const techniques = await this.techniqueModel.findAll({
      attributes: ["slug", "tags", "symptoms", "description"],
    });

    // 2. Превращаем массив в компактную строку JSON
    const response = techniques.map((row) => {
      return row.toJSON();
    });
    return JSON.stringify(response, null, 2);
  }

  private getSystemPrompt(techniquesContext: string): string {
    return `
Ты — профессиональный эксперт по физиологии дыхания. Твоя задача: проанализировать состояние пользователя и выдать строго структурированный ответ.

### БАЗА ТЕХНИК (Контекст):
${techniquesContext}

### ШАГ 1: ОПРЕДЕЛЕНИЕ SCORE
Сверь запрос пользователя с полем 'symptoms' в базе:
- **Score 1:** Состояние радости, успеха, драйва или спокойствия.
- **Score 2:** Состояние суеты, расфокуса, мандража или легкой тревоги.
- **Score 3:** Состояние ярости, паники, сильного гнева или физического шока.

### ШАГ 2: ВЫБОР ТЕХНИКИ
Выбери ОДНУ технику из базы, используя логику инверсии (противовеса):
- Если Score 3 (Ярость/Паника) -> выбери технику с тегом "торможение" или "успокоение".
- Если Score 2 (Суета/Расфокус) -> выбери технику с тегом "баланс" или "фокус".
- Если Score 1 (Позитив) -> не выбирай технику, используй slug 'none'.

### ШАГ 3: ФОРМИРОВАНИЕ ОТВЕТА (СТРОГО ОДНА СТРОКА)
Выдай ответ в формате: \`slug:score:description\`

Где:
1. **slug** — это значение из поля 'slug' выбранной техники (например: focus, calm или energy). Если Score 1, пиши 'none'.
2. **score** — определенное тобой число 1, 2 или 3.
3. **description** — для Score 2 и 3: возьми инструкцию из базы. Для Score 1: напиши одну короткую одобряющую фразу с легким юмором.

### ВАЖНО:
- Вместо слова "slug" подставляй реальный slug из базы (calm, focus или energy).
- Не выдумывай посторонние истории (про бабу-ягу и т.д.). Будь лаконичен.
- Твой ответ должен содержать ТОЛЬКО одну строку.

ЗАПРОС ПОЛЬЗОВАТЕЛЯ: "{{userInput}}"
        `.trim();
  }

  async getTechniqueBySlug(
    slug: string,
    userId: string,
    transaction?: Transaction,
  ) {
    let technique = await this.techniqueModel.findOne({
      where: { slug },
      transaction,
    });

    if (!technique) {
      technique = await this.techniqueModel.findOne({
        where: { slug: this.FALLBACK_SLUG },
        transaction,
      });
    }
    await this.statisticsService.logActivity(
      userId,
      technique.id,
      { score: 1, description: "Ready breath" }, // metadata
      transaction,
    );
    return technique;
  }

  async getTechniqueByModel(
    userPrompt: string,
    userId: string,
  ): Promise<AiResponse> {
    const techniquesContext = await this.getAvailableSlugsContext();
    const systemInstruction = this.getSystemPrompt(techniquesContext);
    const aiModel = this.modelFactory.getOllamaModel({ temperature: 0.2 });
    const tools = [selectTechniqueTool];
    const modelWithTools = aiModel.bindTools(tools);

    // Здесь мы формируем запрос к модели
    const response = await modelWithTools.invoke([
      new SystemMessage(systemInstruction),
      new HumanMessage(userPrompt),
    ]);
    this.logger.info({ response }, "RESPONSE:", response);

    const predictedSlug = response.content
      .toString()
      .trim()
      .replace(/"/g, "")
      .trim();

    this.logger.info({ predictedSlug }, "predictedSlug:");
    const [slug, score, description] = predictedSlug.split(":");

    // Используем уже созданный метод для получения данных
    return await this.sequelize.transaction(async (t) => {
      const technique = await this.getTechniqueBySlug(slug, userId, t);

      return {
        text: "",
        userId,
        technique,
        slug,
        score,
        description,
      };
    });
  }
}
