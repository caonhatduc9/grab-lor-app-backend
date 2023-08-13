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
import { Customer } from './customer.entity';
import { SocketDriverCustomer } from './socketDriverCustomer.entity';

// @Index("socket_customer_FK", ["customer_Id"], {})
@Entity('socket_customer', { schema: 'grab_lor' })
export class SocketCustomer {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column('varchar', { name: 'socket_id', nullable: true, length: 50 })
  socketId: string | null;

  @Column('int', { name: 'customer_id', nullable: true })
  customerId: number | null;

  @ManyToOne(() => Customer, (customer) => customer.socketCustomers, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn([{ name: 'customer_id', referencedColumnName: 'customerId' }])
  customer: Customer;
  @OneToMany(
    () => SocketDriverCustomer,
    (socketDriverCustomer) => socketDriverCustomer.socketDriver
  )
  socketDriverCustomers: SocketDriverCustomer[];
}
