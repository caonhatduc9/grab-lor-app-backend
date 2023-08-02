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

@Index('customer_fk0', ['userId'], {})
@Entity('customer', { schema: 'grab_lor' })
export class Customer {
  @PrimaryGeneratedColumn({ type: 'int', name: 'customer_id' })
  customerId: number;

  @Column('int', { name: 'user_id' })
  userId: number;

  @Column('float', { name: 'point', precision: 12, default: () => "'0'" })
  point: number;

  @Column('tinyint', { name: 'is_vip', default: () => "'0'" })
  isVip: number;

  @OneToMany(() => Booking, (booking) => booking.customer)
  bookings: Booking[];

  @ManyToOne(() => User, (user) => user.customers, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn([{ name: 'user_id', referencedColumnName: 'userId' }])
  user: User;
}
