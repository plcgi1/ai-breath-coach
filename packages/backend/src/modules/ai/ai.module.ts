// src/modules/ai/ai.module.ts
import { Module, Global } from "@nestjs/common";
import { ModelFactory } from "./ai.factory";

@Global() // 🌍 Делаем фабрику доступной во всем приложении
@Module({
  providers: [ModelFactory],
  exports: [ModelFactory], // Экспортируем только фабрику 🏭
})
export class AiModule {}
