// pricing.config.ts


const STEP_ONE_START: number = 1;
const STEP_ONE_END: number = 2;
const STEP_ONE_PRICE: number = 15000;

const STEP_TWO_START: number = 2;
const STEP_TWO_END: number = 10;
const STEP_TWO_PRICE: number = 10000;

const STEP_THREE_START: number = 11;
const STEP_THREE_END: number = Infinity;
const STEP_THREE_PRICE: number = 7000;


// pricing.config.ts
export interface PricingStep {
  kmStart: number;
  kmEnd: number;
  pricePerKmCar: number;
  pricePerKmBike: number;
}

export const pricingConfig: PricingStep[] = [
  { kmStart: 0, kmEnd: 1, pricePerKmCar: 15000, pricePerKmBike: 12000 },
  { kmStart: 2, kmEnd: 10, pricePerKmCar: 10000, pricePerKmBike: 8000 },
  { kmStart: 11, kmEnd: Infinity, pricePerKmCar: 7000, pricePerKmBike: 5000 }, // Thêm các loại xe và giá tiền tương ứng cho từng loại xe khác (nếu có).
];

