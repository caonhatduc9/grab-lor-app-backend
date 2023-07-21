import { DataSource } from 'typeorm';
import { Asset } from 'src/entities/asset.entity';
import { Customer } from 'src/entities/customer.entity';
export const ShareProviders = [
    {
        provide: 'ASSET_REPOSITORY',
        useFactory: (dataSource: DataSource) => dataSource.getRepository(Asset),
        inject: ['DATA_SOURCE'],
    },
    {
        provide: 'CUSTOMER_REPOSITORY',
        useFactory: (dataSource: DataSource) => dataSource.getRepository(Customer),
        inject: ['DATA_SOURCE'],
    },
];
