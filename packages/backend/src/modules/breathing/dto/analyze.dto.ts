import { IsString, IsNotEmpty, MinLength, MaxLength } from "class-validator";

export class AnalyzeDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3, { message: "Опишите ваше состояние чуть подробнее" })
  @MaxLength(500, {
    message: "Описание слишком длинное, попробуйте быть лаконичнее",
  })
  request: string;
}
