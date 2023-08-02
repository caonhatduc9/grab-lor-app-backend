import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CallCenterAgent } from './callCenterAgent.entity';
import { Customer } from './customer.entity';
import { Driver } from './driver.entity';
import { Role } from './role.entity';
import { Asset } from './asset.entity';

enum AuthProvider {
  LOCAL = 'local',
  GOOGLE = 'google',
  APPLE = 'apple',
  GITHUB = 'github',
}

@Index('user_FK', ['roleId'], {})
@Index('user_FK_2', ['avatar'], {})
@Entity('user', { schema: 'grab_lor' })
export class User {
  @PrimaryGeneratedColumn({ type: 'int', name: 'user_id' })
  userId: number;

  @Column('int', { name: 'role_id' })
  roleId: number;

  @Column('varchar', { name: 'username', nullable: true, length: 100 })
  username: string | null;

  @Column('varchar', { name: 'email', length: 100 })
  email: string;

  @Column('varchar', { name: 'password', length: 150 })
  password: string;

  @Column('varchar', { name: 'phone_number', nullable: true, length: 12 })
  phoneNumber: string | null;

  @Column('int', { name: 'avatar' })
  avatar: number;

  @Column('tinyint', { name: 'isActive', nullable: true })
  isActive: number | null;

  @Column({
    type: 'enum',
    name: 'auth_provider',
    enum: AuthProvider,
    default: AuthProvider.LOCAL,
  })
  authProvider: AuthProvider;

  @OneToMany(() => CallCenterAgent, (callCenterAgent) => callCenterAgent.user)
  callCenterAgents: CallCenterAgent[];

  @OneToMany(() => Customer, (customer) => customer.user)
  customers: Customer[];

  @OneToMany(() => Driver, (driver) => driver.user)
  drivers: Driver[];

  @ManyToOne(() => Role, (role) => role.users, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn([{ name: 'role_id', referencedColumnName: 'roleId' }])
  role: Role;

  @ManyToOne(() => Asset, (asset) => asset.users, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn([{ name: 'avatar', referencedColumnName: 'assetId' }])
  avatar2: Asset;
}
