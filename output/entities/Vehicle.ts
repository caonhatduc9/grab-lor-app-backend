import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Driver } from "./Driver";
import { Asset } from "./Asset";

@Index("vehicle_fk0", ["image"], {})
@Entity("vehicle", { schema: "grab_lor" })
export class Vehicle {
  @PrimaryGeneratedColumn({ type: "int", name: "vehicle_id" })
  vehicleId: number;

  @Column("enum", { name: "type", enum: ["CAR", "MOTORBIKE"] })
  type: "CAR" | "MOTORBIKE";

  @Column("varchar", { name: "license_plates", length: 15 })
  licensePlates: string;

  @Column("int", { name: "displacement" })
  displacement: number;

  @Column("int", { name: "image" })
  image: number;

  @OneToMany(() => Driver, (driver) => driver.vehicle2)
  drivers: Driver[];

  @ManyToOne(() => Asset, (asset) => asset.vehicles, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "image", referencedColumnName: "assetId" }])
  image2: Asset;
}
