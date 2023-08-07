import { Module } from '@nestjs/common';
import { GatewayDriverService } from './gateway-driver.service';
import { GatewayDriverGateway } from './gateway-driver.gateway';

@Module({
  providers: [GatewayDriverGateway, GatewayDriverService]
})
export class GatewayDriverModule {}
