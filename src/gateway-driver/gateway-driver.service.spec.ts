import { Test, TestingModule } from '@nestjs/testing';
import { GatewayDriverService } from './gateway-driver.service';

describe('GatewayDriverService', () => {
  let service: GatewayDriverService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GatewayDriverService],
    }).compile();

    service = module.get<GatewayDriverService>(GatewayDriverService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
