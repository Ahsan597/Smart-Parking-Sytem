import { IsEnum, IsOptional } from 'class-validator';
import { PaymentMethod } from '../../payments/entities/payment.entity';

export class CheckoutDto {
  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;
}
