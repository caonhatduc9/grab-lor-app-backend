import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Customer } from './customer.entity';
import { Driver } from './driver.entity';
import { Route } from './route.entity';
import { Evaluate } from './evaluate.entity';
import { DriverBooking } from './driverBooking.entity';

@Index('booking_fk0', ['customerId'], {})
@Index('booking_fk1', ['driverId'], {})
@Index('booking_fk2', ['routeId'], {})
@Entity('booking', { schema: 'grab_lor' })
export class Booking {
  @PrimaryGeneratedColumn({ type: 'int', name: 'booking_id' })
  bookingId: number;

  @Column('int', { name: 'customer_id' })
  customerId: number;

  @Column('int', { name: 'driver_id' })
  driverId: number;

  @Column('enum', { name: 'type_vehicle', enum: ['CAR', 'MOTORBIKE'] })
  typeVehicle: 'CAR' | 'MOTORBIKE';

  @Column('float', { name: 'charge', precision: 12 })
  charge: number;

  @Column('int', { name: 'route_id' })
  routeId: number;

  @Column('enum', {
    name: 'state',
    enum: ['CONFIRMED', 'PENDING', 'TRANSITING', 'COMPLETED', 'CANCEL'],
  })
  state: 'CONFIRMED' | 'PENDING' | 'TRANSITING' | 'COMPLETED' | 'CANCEL';
  @Column("enum", {
    name: "type_booking",
    nullable: true,
    enum: ["WEB", "APP"],
  })
  typeBooking: "WEB" | "APP" | null;
  @Column('int', { name: 'payment' })
  payment: number;

  @Column('text', { name: 'note' })
  note: string;

  @ManyToOne(() => Customer, (customer) => customer.bookings, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn([{ name: 'customer_id', referencedColumnName: 'customerId' }])
  customer: Customer;

  @ManyToOne(() => Driver, (driver) => driver.bookings, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn([{ name: 'driver_id', referencedColumnName: 'driverId' }])
  driver: Driver;

  @ManyToOne(() => Route, (route) => route.bookings, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn([{ name: 'route_id', referencedColumnName: 'routeId' }])
  route: Route;
  @OneToMany(() => DriverBooking, (driverBooking) => driverBooking.booking)
  driverBookings: DriverBooking[];
  @OneToMany(() => Evaluate, (evaluate) => evaluate.booking)
  evaluates: Evaluate[];
}
