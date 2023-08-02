// pricing.factory.ts
import { Injectable } from '@nestjs/common';
import { PricingStrategy, FlexiblePricingStrategy } from '../pricing/strategy/pricing.strategy'; 
// import { PricingConfigService } from './pricing.config';

@Injectable()
export class PricingStrategyFactory {
//   constructor(private readonly configService: PricingConfigService) {}

  createPricingStrategy(): PricingStrategy {
    return new FlexiblePricingStrategy();
  }
}
