// pricing.strategy.ts
import { pricingConfig } from '../../config/pricing.config';
import { PricingRespone } from '../interfaces/pricing.interface';
// import { vehiclePricingConfig } from "../../config/pricing.config";

export interface PricingStrategy {
  calculatePrice(distanceInKm: number, vehicleType: string): PricingRespone;
}

export class FlexiblePricingStrategy implements PricingStrategy {
  //   constructor(private readonly configService: PricingConfigService) {}

  calculatePrice(distanceInKm: number, vehicleType?: string): PricingRespone {
    // const pricingConfig = this.configService.getConfig();
    const pricingResponse: PricingRespone = {
      motorbikeCost: 0,
      carCost: 0,
    };
    let remainingDistance = distanceInKm;

    for (const step of pricingConfig) {
      if (remainingDistance <= 0) break;

      const pricePerKm =
        vehicleType === 'car' ? step.pricePerKmCar : step.pricePerKmMotorbike;
      const stepDistance = Math.min(
        remainingDistance,
        step.kmEnd - step.kmStart + 1,
      );
      const stepCost = pricePerKm * stepDistance;

      if (vehicleType) {
        if (vehicleType === 'car') {
          pricingResponse.carCost += stepCost;
        } else if (vehicleType === 'motorbike') {
          pricingResponse.motorbikeCost += stepCost;
        }
      } else {
        pricingResponse.carCost += step.pricePerKmCar * stepDistance;
        pricingResponse.motorbikeCost +=
          step.pricePerKmMotorbike * stepDistance;
      }

      remainingDistance -= stepDistance;
    }

    return pricingResponse;
  }
}

export class PremiumPricingStrategy implements PricingStrategy {
  calculatePrice(distanceInKm: number, vehicleType: string): PricingRespone {
    throw new Error('Method not implemented.');
  }
}
