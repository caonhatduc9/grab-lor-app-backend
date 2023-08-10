import { Module } from '@nestjs/common';
import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';
import { PricingStrategyFactory } from 'src/pricing/pricing.factory';
import { UserModule } from 'src/user/user.module';
import { GatewayDriverModule } from 'src/gateway-driver/gateway-driver.module';

@Module({
  imports: [UserModule, GatewayDriverModule],
  controllers: [BookingController],
  providers: [BookingService, PricingStrategyFactory],
})
export class BookingModule { }
