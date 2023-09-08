import {
    Column,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from "typeorm";
import { Customer } from "./customer.entity";

@Index("booking_position_FK", ["customerId"], {})
@Entity("booking_position", { schema: "grab_lor" })
export class BookingPosition {
    @PrimaryGeneratedColumn({ type: "int", name: "booking_position_id" })
    bookingPositionId: number;

    @Column("varchar", { name: "phoneNumber", nullable: true, length: 12 })
    phoneNumber: string | null;

    @Column("varchar", { name: "pickup_address", nullable: true, length: 200 })
    pickupAddress: string | null;

    @Column("varchar", { name: "dest_address", nullable: true, length: 200 })
    destAddress: string | null;

    @Column("datetime", { name: "timeBooking", nullable: true })
    timeBooking: string | null;

    @Column("int", { name: "customerId", nullable: true })
    customerId: number | null;

    @Column('enum', { name: 'type_vehicle', enum: ['CAR', 'MOTORBIKE'] })
    typeVehicle: 'CAR' | 'MOTORBIKE';

    @ManyToOne(() => Customer, (customer) => customer.bookingPositions, {
        onDelete: "NO ACTION",
        onUpdate: "NO ACTION",
    })
    @JoinColumn([{ name: "customerId", referencedColumnName: "customerId" }])
    customer: Customer;
}
