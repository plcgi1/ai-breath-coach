// src/payment/dto/create-invoice.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsNotEmpty } from 'class-validator';

export class CreateInvoiceDto {
  @ApiProperty({ 
    description: 'UUID тарифа из таблицы pricing', 
    example: '10000000-0000-0000-0000-000000000002' 
  })
  @IsUUID()
  @IsNotEmpty()
  pricingId: string;
}