import { Injectable } from '@nestjs/common';
import { PricingStrategyFactory } from 'src/pricing/pricing.factory';
import { UserService } from 'src/user/user.service';
import { GoogleMapsService } from 'src/shareModule/googleMap.service';

@Injectable()
export class BookingService {
  getPrice(distanceInKm: number, vehicleType: string): number {
    throw new Error('Method not implemented.');
  }
  private pricingStrategyFactory: PricingStrategyFactory;

  constructor(pricingStrategyFactory: PricingStrategyFactory, private userService: UserService, private googleMapService: GoogleMapsService) {
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

  async findNearestDriver(pickup: any): Promise<any> {
    const drivers = await this.userService.getDrivers();
  
    try {
      // Tìm tài xế gần khách nhất
      const nearestDriver = await this.googleMapService.findNearestDriver(pickup, drivers);

      // Gửi thông báo đến tài xế
      // ...

      return { message: 'Ride requested' };
    } catch (error) {
      return { message: 'No available driver found' };
    }
    return drivers;
    return {
      statusCode: 200,
      drivers: [],
    };
  }
}
