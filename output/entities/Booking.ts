import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Route } from "./Route";
import { Customer } from "./Customer";
import { Driver } from "./Driver";
import { Evaluate } from "./Evaluate";

@Index("booking_fk0", ["customerId"], {})
@Index("booking_fk1", ["driverId"], {})
@Index("booking_fk2", ["routeId"], {})
@Entity("booking", { schema: "grab_lor" })
export class Booking {
  @PrimaryGeneratedColumn({ type: "int", name: "booking_id" })
  bookingId: number;

  @Column("int", { name: "customer_id" })
  customerId: number;

  @Column("int", { name: "driver_id" })
  driverId: number;

  @Column("enum", { name: "type_vehicle", enum: ["CAR", "MOTORBIKE"] })
  typeVehicle: "CAR" | "MOTORBIKE";

  @Column("float", { name: "charge", precision: 12 })
  charge: number;

  @Column("int", { name: "route_id" })
  routeId: number;

  @Column("enum", {
    name: "state",
    enum: ["CONFIRMED", "PENDING", "TRANSITING", "COMPLETED", "CANCEL"],
  })
  state: "CONFIRMED" | "PENDING" | "TRANSITING" | "COMPLETED" | "CANCEL";

  @Column("int", { name: "payment" })
  payment: number;

  @Column("text", { name: "note" })
  note: string;

  @ManyToOne(() => Route, (route) => route.bookings, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "route_id", referencedColumnName: "routeId" }])
  route: Route;

  @ManyToOne(() => Customer, (customer) => customer.bookings, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "customer_id", referencedColumnName: "customerId" }])
  customer: Customer;

  @ManyToOne(() => Driver, (driver) => driver.bookings, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "driver_id", referencedColumnName: "driverId" }])
  driver: Driver;

  @OneToMany(() => Evaluate, (evaluate) => evaluate.booking)
  evaluates: Evaluate[];
}
