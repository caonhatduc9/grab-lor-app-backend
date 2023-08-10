import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { BookingService } from './booking.service';
import { PricingStrategyFactory } from 'src/pricing/pricing.factory';
import { GoogleMapsService } from 'src/shareModule/googleMap.service';
import { GatewayDriverService } from 'src/gateway-driver/gateway-driver.service';
import { GatewayDriverGateway } from 'src/gateway-driver/gateway-driver.gateway';

@Controller('booking')
export class BookingController {
  constructor(private readonly bookingService: BookingService,
    private readonly gatewayDriverService: GatewayDriverService,
    private gatewayDriverGateway: GatewayDriverGateway,
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
    try {
      const result = await this.bookingService.createBooking(pickup);
  console.log("result", result);
      if (result.message === 'Ride requested') {
        // const customerSocket = await this.gatewayDriverService.getCustomerSocketById(result.nearestDriver.driverId);
        // if (customerSocket) {
        this.gatewayDriverGateway.sendDriverInfoToCustomer(result.nearestDriver);
      }
      return {
        statusCode: result.statusCode,
        message: result.message,
      }
    } catch (error) {
      return {
        statusCode: 500,
        message: 'Error requesting ride'
      };
    }
    // return this.bookingService.createBooking(pickup);
  }

}
