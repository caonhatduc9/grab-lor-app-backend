import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Driver } from './driver.entity';
import { Asset } from './asset.entity';

@Index('driver_license_fk0', ['image'], {})
@Entity('driver_license', { schema: 'grab_lor' })
export class DriverLicense {
  @PrimaryGeneratedColumn({ type: 'int', name: 'driver_license_id' })
  driverLicenseId: number;

  @Column('bigint', { name: 'num_driver_license' })
  numDriverLicense: string;

  @Column('enum', { name: 'type', enum: ['A1', 'A2', 'B1', 'B2'] })
  type: 'A1' | 'A2' | 'B1' | 'B2';

  @Column('int', { name: 'image' })
  image: number;

  @OneToMany(() => Driver, (driver) => driver.driverLicense2)
  drivers: Driver[];

  @ManyToOne(() => Asset, (asset) => asset.driverLicenses, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn([{ name: 'image', referencedColumnName: 'assetId' }])
  image2: Asset;
}
