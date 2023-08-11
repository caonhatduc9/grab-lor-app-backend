// pricing.config.ts

const STEP_ONE_START: number = 1;
const STEP_ONE_END: number = 2;
const STEP_ONE_PRICE_CAR: number = 15000;
const STEP_ONE_PRICE_MOTORBIKE: number = 12000;

const STEP_TWO_START: number = 2;
const STEP_TWO_END: number = 10;
const STEP_TWO_PRICE_CAR: number = 10000;
const STEP_TWO_PRICE_MOTORBIKE: number = 8000;

const STEP_THREE_START: number = 11;
const STEP_THREE_END: number = Infinity;
const STEP_THREE_PRICE_CAR: number = 7000;
const STEP_THREE_PRICE_MOTORBIKE: number = 5000;

// pricing.config.ts
export interface PricingStep {
  kmStart: number;
  kmEnd: number;
  pricePerKmCar: number;
  pricePerKmMotorbike: number;
}

export const pricingConfig: PricingStep[] = [
  {
    kmStart: STEP_ONE_START,
    kmEnd: STEP_ONE_END,
    pricePerKmCar: STEP_ONE_PRICE_CAR,
    pricePerKmMotorbike: STEP_ONE_PRICE_MOTORBIKE,
  },
  {
    kmStart: STEP_TWO_START,
    kmEnd: STEP_TWO_END,
    pricePerKmCar: STEP_TWO_PRICE_CAR,
    pricePerKmMotorbike: STEP_TWO_PRICE_MOTORBIKE,
  },
  {
    kmStart: STEP_THREE_START,
    kmEnd: STEP_THREE_END,
    pricePerKmCar: STEP_THREE_PRICE_CAR,
    pricePerKmMotorbike: STEP_THREE_PRICE_MOTORBIKE,
  },
];
