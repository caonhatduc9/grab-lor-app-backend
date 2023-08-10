import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Booking } from './booking.entity';
import { User } from './user.entity';
import { Location } from './location.entity';
import { DriverLicense } from './driverLicense.entity';
import { Vehicle } from './vehicle.entity';
import { SocketDriver } from './socketDriver.entity';

@Index('driver_fk0', ['userId'], {})
@Index('driver_fk1', ['location'], {})
@Index('driver_fk2', ['driverLicense'], {})
@Index('driver_fk3', ['vehicle'], {})
@Entity('driver', { schema: 'grab_lor' })
export class Driver {
  @PrimaryGeneratedColumn({ type: 'int', name: 'driver_id' })
  driverId: number;

  @Column('int', { name: 'user_id' })
  userId: number;

  @Column('float', { name: 'point', precision: 12, default: () => "'0'" })
  point: number;

  @Column('varchar', { name: 'bank_account', length: 20 })
  bankAccount: string;

  @Column('int', { name: 'location' })
  location: number;

  @Column('int', { name: 'driver_license' })
  driverLicense: number;

  @Column('varchar', { name: 'address', length: 200 })
  address: string;

  @Column('int', { name: 'vehicle' })
  vehicle: number;

  @OneToMany(() => Booking, (booking) => booking.driver)
  bookings: Booking[];

  @ManyToOne(() => User, (user) => user.drivers, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn([{ name: 'user_id', referencedColumnName: 'userId' }])
  user: User;

  @ManyToOne(() => Location, (location) => location.drivers, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn([{ name: 'location', referencedColumnName: 'locationId' }])
  location2: Location;

  @ManyToOne(() => DriverLicense, (driverLicense) => driverLicense.drivers, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn([
    { name: 'driver_license', referencedColumnName: 'driverLicenseId' },
  ])
  driverLicense2: DriverLicense;

  @ManyToOne(() => Vehicle, (vehicle) => vehicle.drivers, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn([{ name: 'vehicle', referencedColumnName: 'vehicleId' }])
  vehicle2: Vehicle;
  @OneToMany(() => SocketDriver, (socketDriver) => socketDriver.driver)
  socketDrivers: SocketDriver[];
}
