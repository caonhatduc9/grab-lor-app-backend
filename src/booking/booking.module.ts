import { Module, forwardRef } from '@nestjs/common';
import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';
import { PricingStrategyFactory } from 'src/pricing/pricing.factory';
import { UserModule } from 'src/user/user.module';
import { GatewayBookingModule } from '../gateway-booking/gateway-booking.module';
import { BookingProviders } from './providers/booking.providers';
import { DatabaseModule } from 'src/database/database.module';
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [UserModule, DatabaseModule, GatewayBookingModule, BullModule.registerQueue({
    name: 'createBooking',
  })],
  controllers: [BookingController],
  providers: [BookingService, PricingStrategyFactory, ...BookingProviders],
  exports: [BookingService],
})
export class BookingModule { }
