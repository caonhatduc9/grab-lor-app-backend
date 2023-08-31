import { DataSource } from 'typeorm';
import { Booking } from 'src/entities/booking.entity';
import { Route } from 'src/entities/route.entity';
export const BookingProviders = [
//   {
//     provide: 'SOCKET_DRIVER_REPOSITORY',
//     useFactory: (dataSource: DataSource) =>
//       dataSource.getRepository(SocketDriver),
//     inject: ['DATA_SOURCE'],
//   },
//   {
//     provide: 'SOCKET_CUSTOMER_REPOSITORY',
//     useFactory: (dataSource: DataSource) =>
//       dataSource.getRepository(SocketCustomer),
//     inject: ['DATA_SOURCE'],
//   },
  {
    provide: 'BOOKING_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(Booking),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'ROUTE_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(Route),
    inject: ['DATA_SOURCE'],
  },
];
