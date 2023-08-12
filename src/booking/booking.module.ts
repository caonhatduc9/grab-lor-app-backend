import { Module } from '@nestjs/common';
import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';
import { PricingStrategyFactory } from 'src/pricing/pricing.factory';
import { UserModule } from 'src/user/user.module';
import { GatewayBookingModule } from '../gateway-booking/gateway-booking.module';

@Module({
  imports: [UserModule],
  controllers: [BookingController],
  providers: [BookingService, PricingStrategyFactory],
  exports: [BookingService],
})
export class BookingModule {}
