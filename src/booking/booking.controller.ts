import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { BookingService } from './booking.service';
import { PricingStrategyFactory } from 'src/pricing/pricing.factory';
import { GoogleMapsService } from 'src/shareModule/googleMap.service';
import { GatewayBookingService } from '../gateway-booking/gateway-booking.service';
import { GatewayBookingGateway } from '../gateway-booking/gateway-booking.gateway';
import { CreateBookingPostitionDto } from './dto/booking.dto';

@Controller('booking')
export class BookingController {
  constructor(
    private readonly bookingService: BookingService,
    // private readonly gatewayBookingService: GatewayBookingService,
    // private gatewayBookingGateway: GatewayBookingGateway,
  ) { }

  // @Post()
  @Get('getPrice')
  calculatePrice(
    @Query('distance') distanceInKm: number,
    @Query('vehicleType') vehicleType: string,
  ): Promise<number> {
    return this.bookingService.calculatePrice(distanceInKm, vehicleType);
  }
  @Post('getLocations')
  getLocations(@Body('phoneNumber') phoneNumber: string): Promise<any> {
    return this.bookingService.getLocationByPhoneNumber(phoneNumber);
  }

  @Post('createPosition')
  async createPosition(
    @Body() createBookingPostitionDto: CreateBookingPostitionDto,
  ): Promise<any> {
    return this.bookingService.createBookingPostition(createBookingPostitionDto);
  }
  @Get('getBookingPositions')
  async getBookingPositions(): Promise<any> {
    return this.bookingService.getBookingPositions();
  }
  @Get('getBookingPositionByPhoneNumber')
  async getBookingPositionByPhoneNumber(@Query('phoneNumber') phoneNumber: string): Promise<any> {
    return this.bookingService.getBookingPositionByPhoneNumber(phoneNumber);
  }

  @Get('getBookingPositionById')
  async getBookingPositionById(@Query('bookingPositionId') bookingPositionId: number): Promise<any> {
    return this.bookingService.getBookingPositionById(+bookingPositionId);
  }

  @Post('createBooking')
  async createBooking(@Body() body: any): Promise<any> {
    return await this.bookingService.createBooking(body);
  }
  @Get('getBookings')
  async getBookings(): Promise<any> {
    return await this.bookingService.getBookings();
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
