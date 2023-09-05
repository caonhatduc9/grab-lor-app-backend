import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

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

    @Column("varchar", { name: "customer_name", nullable: true, length: 50 })
    customerName: string | null;
}
