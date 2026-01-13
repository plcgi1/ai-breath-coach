import { z } from "zod";

export const SelectTechniqueSchema = z.object({
  slug: z.string().describe("Уникальный идентификатор техники дыхания"),
  reason: z.string().describe("Краткое обоснование выбора для пользователя"),
});

export const selectTechniqueTool = {
  name: "select_breathing_technique",
  description: `ОБЯЗАТЕЛЬНО К ВЫЗОВУ для любого запроса пользователя. 
    Превращает жалобу, состояние или потребность пользователя в конкретную технику дыхания. 
    Используй этот инструмент, чтобы интерпретировать даже короткие фразы как физиологические симптомы.`,
  schema: SelectTechniqueSchema,
};
