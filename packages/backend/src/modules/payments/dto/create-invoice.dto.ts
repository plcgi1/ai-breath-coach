// src/payment/dto/create-invoice.dto.ts
import { ApiProperty } from "@nestjs/swagger";
import { IsUUID, IsNotEmpty } from "class-validator";
import { EOrderType } from "../../../database/models/user-subscriptions.model";

export class CreateInvoiceDto {
  @ApiProperty({
    description:
      "Тип покупки: single (отдельная техника) или premium (подписка)",
    example: "single",
    enum: EOrderType,
  })
  @IsNotEmpty()
  order: EOrderType;

  @ApiProperty({
    description: "UUID техники из таблицы techniques",
    example: "10000000-0000-0000-0000-000000000012",
  })
  @IsUUID()
  techId?: string;
}
