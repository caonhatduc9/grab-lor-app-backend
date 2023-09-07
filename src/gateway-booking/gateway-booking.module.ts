import { Module, forwardRef } from '@nestjs/common';
import { GatewayBookingService } from './gateway-booking.service';
import { GatewayBookingGateway } from './gateway-booking.gateway';
import { GatewayBookingProviders } from './providers/gateway-booking.provider';
import { DatabaseModule } from 'src/database/database.module';
import { UserModule } from 'src/user/user.module';
import { BookingModule } from '../booking/booking.module';
import { SharedModule } from '../shareModule/share.module';
import { CreateBookingProcessor } from './processor/bookingGateway.processor';
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [DatabaseModule, UserModule, SharedModule, BullModule.registerQueue({
    name: 'createBooking',
  }),],
  providers: [
    GatewayBookingGateway,
    GatewayBookingService,
    CreateBookingProcessor,
    ...GatewayBookingProviders,
  ],
  exports: [GatewayBookingService, GatewayBookingGateway],
})
export class GatewayBookingModule { }
