import { DataSource } from 'typeorm';
import { Asset } from 'src/entities/asset.entity';
export const ShareProviders = [
    {
        provide: 'ASSET_REPOSITORY',
        useFactory: (dataSource: DataSource) => dataSource.getRepository(Asset),
        inject: ['DATA_SOURCE'],
    },
];
