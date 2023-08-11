import { Module } from '@nestjs/common';
import { GatewayBookingService } from './gateway-booking.service';
import { GatewayBookingGateway } from './gateway-booking.gateway';
import { GatewayBookingProviders } from './providers/gateway-booking.provider';
import { DatabaseModule } from 'src/database/database.module';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [DatabaseModule, UserModule],
  providers: [
    GatewayBookingGateway,
    GatewayBookingService,
    ...GatewayBookingProviders,
  ],
  exports: [GatewayBookingService, GatewayBookingGateway],
})
export class GatewayBookingModule {}
