import { DataSource } from 'typeorm';
import { Asset } from 'src/entities/asset.entity';
import { Customer } from 'src/entities/customer.entity';
import { Driver } from 'src/entities/driver.entity';
import { Location } from 'src/entities/location.entity';
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
  {
    provide: 'DRIVER_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Driver),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'LOCATION_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Location),
    inject: ['DATA_SOURCE'],
  },
];
