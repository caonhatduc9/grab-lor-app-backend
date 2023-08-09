import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { BookingService } from './booking.service';
import { PricingStrategyFactory } from 'src/pricing/pricing.factory';
import { GoogleMapsService } from 'src/shareModule/googleMap.service';

@Controller('booking')
export class BookingController {
  constructor(private readonly bookingService: BookingService,
   ) { }

  // @Post()
  @Get('getPrice')
  calculatePrice(
    @Query('distance') distanceInKm: number,
    @Query('vehicleType') vehicleType: string,
  ): Promise<number> {
    return this.bookingService.calculatePrice(distanceInKm, vehicleType);
  }


  @Post('request-ride')
  async requestRide(@Body() body: any): Promise<any> {
    const { customer, pickup, destination, vehicleType } = body;
    return this.bookingService.findNearestDriver(pickup);
    return {
      statusCode: 200,
      message: 'Request ride successfully',
    };
  }

}
