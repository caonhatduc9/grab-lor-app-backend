import { DataSource } from 'typeorm';
import { SocketDriver } from 'src/entities/socketDriver.entity';
import { SocketCustomer } from 'src/entities/socketCustomer.entity';
import { DriverBooking } from 'src/entities/driverBooking.entity';
import { Booking } from 'src/entities/booking.entity';
export const GatewayBookingProviders = [
  {
    provide: 'SOCKET_DRIVER_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(SocketDriver),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'SOCKET_CUSTOMER_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(SocketCustomer),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'DRIVER_BOOKING_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(DriverBooking),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'DRIVER_BOOKING_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(DriverBooking),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'BOOKING_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(Booking),
    inject: ['DATA_SOURCE'],
  },
];
