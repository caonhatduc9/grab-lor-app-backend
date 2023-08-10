import { Injectable } from '@nestjs/common';
import { PricingStrategyFactory } from 'src/pricing/pricing.factory';
import { UserService } from 'src/user/user.service';
import { GoogleMapsService } from 'src/shareModule/googleMap.service';
import { GatewayDriverService } from 'src/gateway-driver/gateway-driver.service';
import { GatewayDriverGateway } from 'src/gateway-driver/gateway-driver.gateway';

@Injectable()
export class BookingService {
  getPrice(distanceInKm: number, vehicleType: string): number {
    throw new Error('Method not implemented.');
  }
  private pricingStrategyFactory: PricingStrategyFactory;

  constructor(
    pricingStrategyFactory: PricingStrategyFactory,
    private userService: UserService,
    private googleMapService: GoogleMapsService,
    private gatewayDriverService: GatewayDriverService,
    private gatewayDriverGateway: GatewayDriverGateway
  ) {
    this.pricingStrategyFactory = pricingStrategyFactory;
  }

  async calculatePrice(
    distanceInKm: number,
    vehicleType: string,
  ): Promise<any> {
    const pricingStrategy = this.pricingStrategyFactory.createPricingStrategy();
    const price = pricingStrategy.calculatePrice(distanceInKm, vehicleType);
    return {
      statusCode: 200,
      price: price,
    };
  }

  async createBooking(pickup: any): Promise<any> {
    const drivers = await this.userService.getDrivers();
    try {
      // Tìm tài xế gần khách nhất
      const nearestDriver = await this.googleMapService.findNearestDriver(pickup, drivers);
      console.log("nearestDriver", nearestDriver);
      const driverSocket = await this.gatewayDriverService.getDriverSocketById(nearestDriver.driverId);
      console.log("driverSocket", driverSocket);
      // Gửi thông báo đến tài xế
      if (driverSocket) {
        // Gửi thông báo đến tài xế qua WebSocket
        // driverSocket.emit('rideRequest', { pickup });
        this.gatewayDriverGateway.sendRideRequestToDriver(nearestDriver.driverId, { pickup });
        return {
          statusCode: 200,
          message: 'Ride requested',
          nearestDriver: nearestDriver
        };
      } else {
        return {
          statusCode: 404,
          message: 'Driver not available'
        };
      }
    } catch (error) {
      return {
        statusCode: 404,
        message: 'No available driver found'
      };
    }
  }


}
