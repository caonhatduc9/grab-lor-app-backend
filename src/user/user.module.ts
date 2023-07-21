import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { DatabaseModule } from 'src/database/database.module';
import { UserProviders } from './providers/user.providers';
import { SharedModule } from 'src/shareModule/share.module';

@Module({
  imports: [DatabaseModule, SharedModule],
  controllers: [UserController],
  providers: [UserService, ...UserProviders],
  exports: [UserService, ...UserProviders],
})
export class UserModule {}
