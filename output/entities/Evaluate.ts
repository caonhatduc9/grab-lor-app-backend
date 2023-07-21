import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Booking } from "./Booking";

@Index("evaluate_fk0", ["bookingId"], {})
@Entity("evaluate", { schema: "grab_lor" })
export class Evaluate {
  @PrimaryGeneratedColumn({ type: "int", name: "evalute_id" })
  evaluteId: number;

  @Column("int", { name: "booking_id" })
  bookingId: number;

  @Column("text", { name: "content" })
  content: string;

  @Column("int", { name: "start" })
  start: number;

  @ManyToOne(() => Booking, (booking) => booking.evaluates, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "booking_id", referencedColumnName: "bookingId" }])
  booking: Booking;
}
