// pricing.strategy.ts
import { pricingConfig } from '../../config/pricing.config';
// import { vehiclePricingConfig } from "../../config/pricing.config";

export interface PricingStrategy {
  calculatePrice(distanceInKm: number, vehicleType: string): number;
}

export class FlexiblePricingStrategy implements PricingStrategy {
  //   constructor(private readonly configService: PricingConfigService) {}

  calculatePrice(distanceInKm: number, vehicleType: string): number {
    // const pricingConfig = this.configService.getConfig();
    let totalCost = 0;

    for (const step of pricingConfig) {
      if (distanceInKm >= step.kmStart && distanceInKm <= step.kmEnd) {
        const pricePerKm =
          vehicleType === 'car' ? step.pricePerKmCar : step.pricePerKmBike;
        totalCost += pricePerKm * distanceInKm;
        break;
      } else if (distanceInKm > step.kmEnd) {
        const pricePerKm =
          vehicleType === 'car' ? step.pricePerKmCar : step.pricePerKmBike;
        totalCost += pricePerKm * (step.kmEnd - step.kmStart + 1);
        distanceInKm -= step.kmEnd - step.kmStart + 1;
      }
    }

    return totalCost;
  }
}

export class PremiumPricingStrategy implements PricingStrategy {
  calculatePrice(distanceInKm: number, vehicleType: string): number {
    throw new Error('Method not implemented.');
  }
}
