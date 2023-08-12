import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { BookingService } from './booking.service';
import { PricingStrategyFactory } from 'src/pricing/pricing.factory';
import { GoogleMapsService } from 'src/shareModule/googleMap.service';
import { GatewayBookingService } from '../gateway-booking/gateway-booking.service';
import { GatewayBookingGateway } from '../gateway-booking/gateway-booking.gateway';

@Controller('booking')
export class BookingController {
  constructor(
    private readonly bookingService: BookingService,
    // private readonly gatewayBookingService: GatewayBookingService,
    // private gatewayBookingGateway: GatewayBookingGateway,
  ) {}

  // @Post()
  @Get('getPrice')
  calculatePrice(
    @Query('distance') distanceInKm: number,
    @Query('vehicleType') vehicleType: string,
  ): Promise<number> {
    return this.bookingService.calculatePrice(distanceInKm, vehicleType);
  }

  // @Post('request-ride')
  // async requestRide(@Body() body: any): Promise<any> {
  //   const { customer, pickup, destination, vehicleType } = body;
  //   try {
  //     const result = await this.bookingService.createBooking(body);
  //     console.log('result', result);
  //     if (result.message === 'Ride requested') {
  //       this.gatewayBookingGateway.sendDriverInfoToCustomer(
  //         result.nearestDriver,
  //       );
  //     }
  //     return {
  //       statusCode: result.statusCode,
  //       message: result.message,
  //     };
  //   } catch (error) {
  //     return {
  //       statusCode: 500,
  //       message: 'Error requesting ride',
  //     };
  //   }
  // }
}
