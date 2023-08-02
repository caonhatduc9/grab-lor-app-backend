import { Module } from '@nestjs/common';
import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';
import { PricingStrategyFactory } from 'src/pricing/pricing.factory';

@Module({
  controllers: [BookingController],
  providers: [BookingService, PricingStrategyFactory]
})
export class BookingModule { }
