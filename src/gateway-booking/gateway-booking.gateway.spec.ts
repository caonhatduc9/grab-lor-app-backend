import { Test, TestingModule } from '@nestjs/testing';
import { GatewayBookingGateway } from './gateway-booking.gateway';
import { GatewayBookingService } from './gateway-booking.service';

describe('GatewayBookingGateway', () => {
  let gateway: GatewayBookingGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GatewayBookingGateway, GatewayBookingService],
    }).compile();

    gateway = module.get<GatewayBookingGateway>(GatewayBookingGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
