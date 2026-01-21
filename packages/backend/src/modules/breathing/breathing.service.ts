import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Transaction, Op, WhereOptions } from "sequelize";
import {
  ETechniqueType,
  Technique,
} from "../../database/models/technique.model";
import { AiResponse } from "../ai/interfaces/ai-provider.interface";
import { ModelFactory } from "../ai/ai.factory";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import { selectTechniqueTool } from "./breathing.tools";
import { Sequelize } from "sequelize-typescript";
import { StatisticsService } from "../statistic/statistics.service";
import { InjectPinoLogger, PinoLogger } from "nestjs-pino";
import {
  EOrderStatus,
  UserSubscriptions,
} from "../../database/models/user-subscriptions.model";
import { calculateUpgradePrice } from "src/utils/price";

type TGetTchBySlug = {
  score;
  description;
};

export enum ETechniqueStatus {
  locked = "locked",
  unlocked = "unlocked",
}
export type TTechniqueWithPurchase = Technique & {
  purchase: UserSubscriptions;
};
export interface ITechniqueListResponse extends TTechniqueWithPurchase {
  status: ETechniqueStatus;
}

interface IIncludeInputOptions {
  userId: string
  checkExpiresAt: boolean
  checkRequiredSubscriptions?: boolean
  type?: ETechniqueType[]
}

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

  async getTechniqueById(id: string): Promise<Technique> {
    const technique = await this.techniqueModel.findByPk(id);
    return technique;
  }

  getInclude(query: IIncludeInputOptions) {
    query.checkRequiredSubscriptions = query.checkRequiredSubscriptions 
      ? query.checkRequiredSubscriptions 
      : false
    const where: WhereOptions = {
      userId: query.userId,
    };
    if (query.checkExpiresAt) {
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      where.expiredAt = {
        [Op.gte]: now,
        [Op.lte]: thirtyDaysAgo,
      };
    }
    return [
      {
        model: UserSubscriptions,
        where,
        required: query.checkRequiredSubscriptions,
      },
    ];
  }

  getCalculatedPrices(techniques: Technique[]) {
    let totalAmount = 0;
    let purchasedAmount = 0;
    let purchasedCount = 0;
    let nonfreeCount = 0;
    let firstNonfreeTech
    techniques.forEach((item) => {
      if (item.type === ETechniqueType.free) {
        return;
      }
      if (item.type === ETechniqueType.premium) {
        firstNonfreeTech = item
      }
      totalAmount = totalAmount + (Number(item.price) || 0);
      nonfreeCount++;
      if (item.purchase && item.purchase.status === EOrderStatus.paid) {
        purchasedAmount = purchasedAmount + (Number(item.price) || 0);
        purchasedCount++;
      }
    });

    const premiumAmount = calculateUpgradePrice({
      totalCount: nonfreeCount,
      purchasedCount: purchasedCount,
      baseUnitPrice: firstNonfreeTech.price,
      fullAllAccessPrice: totalAmount,
    });
    const economyAmount = totalAmount - premiumAmount;
    return {
      totalAmount,
      purchasedAmount,
      premiumAmount,
      economyAmount,
    };
  }

  async getList(
    userId: string,
    checkExpiresAt?: boolean,
  ): Promise<ITechniqueListResponse[]> {
    const include = this.getInclude({ userId, checkExpiresAt });
    const techniques = await this.techniqueModel.findAll({
      include,
      order: ["sortBy"],
    });

    return this.formatList(techniques);
  }

  formatList(techniques: Technique[]): ITechniqueListResponse[] {
    const techniquesWithStatus = techniques.map((tech) => {
      const techJson = tech.toJSON() as TTechniqueWithPurchase;
      const status = this.getTechStatus(techJson);
      return { ...techJson, status } as ITechniqueListResponse;
    });
    return techniquesWithStatus;
  }

  getTechStatus(tech: Technique): ETechniqueStatus {
    let status = ETechniqueStatus.locked;
    if (tech.type === ETechniqueType.free) {
      status = ETechniqueStatus.unlocked;
    } else if (tech.purchase && tech.purchase.status === EOrderStatus.paid) {
      status = ETechniqueStatus.unlocked;
    }
    return status;
  }

  private async getAvailableSlugsContext(userId: string): Promise<string> {
    // 1. Получаем все активные техники из базы
    const include = this.getInclude({ 
      userId,
      checkExpiresAt: true,
      type: [ETechniqueType.free,ETechniqueType.premium]
    })
    const techniques = await this.techniqueModel.findAll({
      attributes: ["slug", "tags", "symptoms", "description", 'type'],
      include
    })

    // 2. Превращаем массив в компактную строку JSON
    const response = techniques
      .filter((row) => {
        return row.type === ETechniqueType.free || (row.purchase?.status === EOrderStatus.paid)
      })
      .map((row) => {
        const json = row.toJSON();
        delete json.purchase
        return json
      });
    return JSON.stringify(response, null, 2);
  }

  private getSystemPrompt(techniquesContext: string): string {
    return `
Ты — экспертный AI-коуч по дыханию (AIBreath-Coach). Твоя задача: проанализировать состояние пользователя и составить рецепт дыхания.

### КОНТЕКСТ ДОСТУПНЫХ ТЕХНИК:
${techniquesContext}

### ПРАВИЛА ВЫБОРА SCORE:
- 1: Если пользователь в порядке, но хочет усилить ресурс, радость, драйв или просто размяться.
- 2: Если у пользователя усталость, суета, легкая тревога, расфокус или проблемы со сном.
- 3: Если у пользователя ярость, паника, сильный физический стресс или потеря контроля.

### АЛГОРИТМ:
1. Сопоставь описание пользователя с полями "symptoms" и "tags" в контексте техник.
2. Выбери наиболее подходящий "slug".
3. Определи "score" (1, 2 или 3) на основе интенсивности состояния.
4. Сгенерируй "description": это должна быть краткая, поддерживающая инструкция (2-3 предложения), основанная на описании техники, адаптированная под запрос пользователя.

### ФОРМАТ ОТВЕТА (СТРОГО):
slug:score:description

Не пиши ничего, кроме этой строки.
    `.trim()
  }

  async getTechniqueBySlug(
    inputSlug: string,
    userId: string,
    transaction?: Transaction,
  ) {
    const slug = inputSlug.replace(/_/g,'-')
    let technique = await this.techniqueModel.findOne({
      where: { slug },
      transaction,
    });
    // console.info('getTechniqueBySlug.technique', technique)
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
    const techniquesContext = await this.getAvailableSlugsContext(userId);
    const systemInstruction = this.getSystemPrompt(techniquesContext);
    const aiModel = this.modelFactory.getOllamaModel({ temperature: 0.2 });
    const tools = [selectTechniqueTool];
    const modelWithTools = aiModel.bindTools(tools);

    console.info('systemInstruction', systemInstruction)
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
