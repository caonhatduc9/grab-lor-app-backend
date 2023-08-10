import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Driver } from "./Driver";
import { Route } from "./Route";
import { Stop } from "./Stop";

@Entity("location", { schema: "grab_lor" })
export class Location {
  @PrimaryGeneratedColumn({ type: "int", name: "location_id" })
  locationId: number;

  @Column("varchar", { name: "lat", length: 100 })
  lat: string;

  @Column("varchar", { name: "lon", length: 100 })
  lon: string;

  @OneToMany(() => Driver, (driver) => driver.location2)
  drivers: Driver[];

  @OneToMany(() => Route, (route) => route.startLocation2)
  routes: Route[];

  @OneToMany(() => Route, (route) => route.endLocation2)
  routes2: Route[];

  @OneToMany(() => Stop, (stop) => stop.location2)
  stops: Stop[];
}
