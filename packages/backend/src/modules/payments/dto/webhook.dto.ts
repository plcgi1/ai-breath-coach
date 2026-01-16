import { ApiProperty } from "@nestjs/swagger";
import { IsUUID, IsNotEmpty } from "class-validator";

interface IMessageDto {
  readonly message_id: number;
  readonly from: { id: number };
  readonly chat: { id: number; type: string };
  readonly date: number;
  readonly successful_payment?: {
    readonly currency: string;
    readonly total_amount: number;
    readonly invoice_payload: string;
    readonly telegram_payment_charge_id: string;
    readonly provider_payment_charge_id: string;
  };
}

export interface IWebhookDto {
  readonly update_id: number;
  readonly message: IMessageDto;
}

export class WebhookDto implements IWebhookDto {
  @ApiProperty({
    description: "The update's unique identifier.",
    example: "123456789",
  })
  @IsNotEmpty()
  readonly update_id: number;

  @ApiProperty({
    description: "The message object containing payment information.",
  })
  readonly message: IMessageDto;

  @ApiProperty({
    description: "The message object containing payment information.",
  })
  pre_checkout_query?: {
    readonly id: string;
    readonly from: { id: number };
    readonly currency: string;
    readonly total_amount: number;
    readonly invoice_payload: string;
  };
}
