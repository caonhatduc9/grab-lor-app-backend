// shared.module.ts

import { Global, Module } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { User } from 'src/entities/user.entity';
import { Role } from 'src/entities/role.entity';
import { Asset } from 'src/entities/asset.entity';
import { ShareProviders } from './share.providers';
import { DatabaseModule } from 'src/database/database.module';
import { GoogleMapsService } from './googleMap.service';

@Global()
@Module({
  imports: [DatabaseModule],
  providers: [...ShareProviders, GoogleMapsService],
  exports: [...ShareProviders, GoogleMapsService], // Export provider để các module khác có thể sử dụng
})
export class SharedModule {}
