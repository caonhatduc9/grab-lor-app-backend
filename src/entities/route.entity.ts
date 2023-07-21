import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Booking } from "./booking.entity";
import { Location } from "./location.entity";

@Index("route_fk0", ["startLocation"], {})
@Index("route_fk1", ["endLocation"], {})
@Entity("route", { schema: "grab_lor" })
export class Route {
  @PrimaryGeneratedColumn({ type: "int", name: "route_id" })
  routeId: number;

  @Column("int", { name: "start_location" })
  startLocation: number;

  @Column("int", { name: "end_location" })
  endLocation: number;

  @Column("datetime", { name: "time_pickup" })
  timePickup: Date;

  @Column("time", { name: "duration" })
  duration: string;

  @Column("float", { name: "distance", precision: 12 })
  distance: number;

  @OneToMany(() => Booking, (booking) => booking.route)
  bookings: Booking[];

  @ManyToOne(() => Location, (location) => location.routes, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "start_location", referencedColumnName: "locationId" }])
  startLocation2: Location;

  @ManyToOne(() => Location, (location) => location.routes2, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "end_location", referencedColumnName: "locationId" }])
  endLocation2: Location;
}
