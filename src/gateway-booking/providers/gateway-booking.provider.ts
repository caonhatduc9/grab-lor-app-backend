import { DataSource } from 'typeorm';
import { SocketDriver } from 'src/entities/socketDriver.entity';
import { SocketCustomer } from 'src/entities/socketCustomer.entity';
export const GatewayBookingProviders = [
    {
        provide: 'SOCKET_DRIVER_REPOSITORY',
        useFactory: (dataSource: DataSource) => dataSource.getRepository(SocketDriver),
        inject: ['DATA_SOURCE'],
    },
    {
        provide: 'SOCKET_CUSTOMER_REPOSITORY',
        useFactory: (dataSource: DataSource) => dataSource.getRepository(SocketCustomer),
        inject: ['DATA_SOURCE'],
    },
];
