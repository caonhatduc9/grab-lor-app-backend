import { Controller, Get, Post, Query } from '@nestjs/common';
import { BookingService } from './booking.service';
import { PricingStrategyFactory } from 'src/pricing/pricing.factory';

@Controller('booking')
export class BookingController {

  constructor(private readonly bookingService: BookingService) { }


  // @Post()
  @Get('getPrice')
  calculatePrice(@Query('distance') distanceInKm: number, @Query('vehicleType') vehicleType: string): Promise<number> {
    return this.bookingService.calculatePrice(distanceInKm, vehicleType);
  }

}
