import { Test, TestingModule } from '@nestjs/testing';
import { GatewayDriverGateway } from './gateway-driver.gateway';
import { GatewayDriverService } from './gateway-driver.service';

describe('GatewayDriverGateway', () => {
  let gateway: GatewayDriverGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GatewayDriverGateway, GatewayDriverService],
    }).compile();

    gateway = module.get<GatewayDriverGateway>(GatewayDriverGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
