import { Test, TestingModule } from '@nestjs/testing';
import { GatewayBookingService } from './gateway-booking.service';

describe('GatewayBookingService', () => {
  let service: GatewayBookingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GatewayBookingService],
    }).compile();

    service = module.get<GatewayBookingService>(GatewayBookingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
