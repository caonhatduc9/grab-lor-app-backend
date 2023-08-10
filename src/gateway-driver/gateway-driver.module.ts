import { Module } from '@nestjs/common';
import { GatewayDriverService } from './gateway-driver.service';
import { GatewayDriverGateway } from './gateway-driver.gateway';
import { GatewayDriverProviders } from './providers/gateway-driver.provider';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [GatewayDriverGateway, GatewayDriverService, ...GatewayDriverProviders],
  exports: [GatewayDriverService, GatewayDriverGateway]
})
export class GatewayDriverModule { }
