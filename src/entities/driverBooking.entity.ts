import {
    Column,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
  } from "typeorm";
  import { Booking } from "./booking.entity";
  import { Driver } from "./driver.entity";
  
  @Index("driver_booking_FK", ["bookingId"], {})
  @Index("driver_booking_FK_1", ["driverId"], {})
  @Entity("driver_booking", { schema: "grab_lor" })
  export class DriverBooking {
    @PrimaryGeneratedColumn({ type: "int", name: "driver_booking_id" })
    driverBookingId: number;
  
    @Column("int", { name: "driverId", nullable: true })
    driverId: number | null;
  
    @Column("int", { name: "bookingId", nullable: true })
    bookingId: number | null;
  
    @Column("enum", { name: "status", nullable: true, enum: ["accept", "deny"] })
    status: "accept" | "deny" | null;
  
    @ManyToOne(() => Booking, (booking) => booking.driverBookings, {
      onDelete: "NO ACTION",
      onUpdate: "NO ACTION",
    })
    @JoinColumn([{ name: "bookingId", referencedColumnName: "bookingId" }])
    booking: Booking;
  
    @ManyToOne(() => Driver, (driver) => driver.driverBookings, {
      onDelete: "NO ACTION",
      onUpdate: "NO ACTION",
    })
    @JoinColumn([{ name: "driverId", referencedColumnName: "driverId" }])
    driver: Driver;
  }
  