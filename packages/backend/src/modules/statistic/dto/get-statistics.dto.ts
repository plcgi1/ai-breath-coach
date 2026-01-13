import { IsOptional, IsDateString, IsNumber, Min, Max } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class GetStatisticsDto {
  @ApiPropertyOptional({
    description: "Начальная дата поиска (ISO 8601)",
    example: "2026-01-01T00:00:00Z",
  })
  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @ApiPropertyOptional({
    description: "Конечная дата поиска (ISO 8601)",
    example: "2026-12-31T23:59:59Z",
  })
  @IsOptional()
  @IsDateString()
  toDate?: string;

  @ApiPropertyOptional({
    description: "Начальная дата поиска (ISO 8601)",
    example: "2026-01-01T00:00:00Z",
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(1000)
  limit?: number;
}
